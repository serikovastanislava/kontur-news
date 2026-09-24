"""News parser with resilient, contextual image handling.

The important rule here is: article images are downloaded to Django MEDIA_ROOT.
The browser never depends on Telegram/Unsplash/Wikimedia being reachable at render time.

Image priority:
1. image attached to the Telegram post / RSS enclosure;
2. og:image / twitter:image from the original article;
3. Wikimedia Commons image selected from the article title/context;
4. local category fallback shipped with the project.

All remote images are validated with Pillow and converted to JPEG locally.
"""

import hashlib
import html
import io
import os
import re
from datetime import datetime, timezone as dt_timezone
from urllib.parse import quote_plus, urljoin, urlparse

import feedparser
from bs4 import BeautifulSoup
from PIL import Image, UnidentifiedImageError

try:
    import pytesseract
    HAS_TESSERACT = True
except Exception:
    pytesseract = None
    HAS_TESSERACT = False

try:
    from curl_cffi import requests as cffi_requests

    HAS_CURL_CFFI = True
except ImportError:
    import requests as cffi_requests

    HAS_CURL_CFFI = False

import requests
from django.conf import settings
from django.core.cache import cache
from django.db import IntegrityError
from django.utils import timezone

from .category import classify_news
from .models import NewsItem


TELEGRAM_CHANNELS = {
    "ТАСС": "tass_agency",
    "Коммерсантъ": "kommersant",
    "АиФ": "aifru",
    "ИА «Панорама»": "panorama_ras",
    "РИА Новости": "ria_novosti",
    "РБК": "rbc_news",
    "Известия": "izvestiya",
}

RSS_FEEDS = {
    "ТАСС": "https://tass.ru/rss/v2.xml",
    "РИА Новости": "https://ria.ru/export/rss2/archive/index.xml",
    "РБК": "https://rssexport.rbc.ru/rbcnews/news/30/full.rss",
    "Коммерсантъ": "https://www.kommersant.ru/RSS/news.xml",
    "АиФ": "https://aif.ru/rss/news.php",
}

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/128.0 Safari/537.36 KonturNews/2.0"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
}

IMAGE_HEADERS = {
    **HEADERS,
    "Accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
}

CATEGORY_FALLBACK_FILES = {
    "Экономика": "economy.jpg",
    "Технологии": "technology.jpg",
    "Политика": "politics.jpg",
    "Спорт": "sport.jpg",
    "Культура": "culture.jpg",
    "Общество": "society.jpg",
    "Мир": "world.jpg",
    "Наука": "science.jpg",
    "Здоровье": "health.jpg",
    "Происшествия": "accidents.jpg",
    "Бизнес": "business.jpg",
}
DEFAULT_FALLBACK_FILE = "society.jpg"

STOP_WORDS = {
    "и", "в", "во", "на", "по", "из", "к", "ко", "с", "со", "о", "об", "от",
    "до", "за", "для", "что", "как", "это", "при", "после", "над", "под",
    "или", "а", "но", "не", "ни", "же", "ли", "the", "and", "for", "with",
    "from", "this", "that", "about", "into", "over",
}


def http_get(url: str, timeout=8, *, image=False):
    headers = IMAGE_HEADERS if image else HEADERS
    if HAS_CURL_CFFI:
        kwargs = {"headers": headers, "timeout": timeout, "impersonate": "chrome120"}
        return cffi_requests.get(url, **kwargs)
    return requests.get(url, headers=headers, timeout=timeout)


def _safe_filename(prefix: str) -> str:
    return re.sub(r"[^a-zA-Z0-9_-]+", "_", prefix)[:90] or "news"


def _media_paths(filename: str):
    media_dir = os.path.join(settings.MEDIA_ROOT, "telegram")
    os.makedirs(media_dir, exist_ok=True)
    return media_dir, os.path.join(media_dir, filename), f"{settings.MEDIA_URL}telegram/{filename}"


def _save_bytes_as_jpeg(content: bytes, filepath: str) -> bool:
    try:
        with Image.open(io.BytesIO(content)) as img:
            if getattr(img, "width", 0) < 240 or getattr(img, "height", 0) < 160:
                return False
            if img.width * img.height > 20_000_000:
                return False
            img.load()
            # Text-heavy article media is intentionally replaced by the neutral frontend placeholder.
            if _image_contains_text(content):
                return False
            if img.mode in ("RGBA", "LA", "P"):
                background = Image.new("RGB", img.size, "white")
                if img.mode != "RGBA":
                    img = img.convert("RGBA")
                background.paste(img, mask=img.getchannel("A"))
                img = background
            else:
                img = img.convert("RGB")
            img.thumbnail((1800, 1200), Image.Resampling.LANCZOS)
            img.save(filepath, "JPEG", quality=86, optimize=True, progressive=True)
            return True
    except (UnidentifiedImageError, OSError, ValueError):
        return False


def download_and_process_image(url: str, filename_prefix: str, category: str, *, fallback=True) -> str:
    """Download/validate an image and return a local /media URL."""
    clean_url = html.unescape((url or "").strip(" '\""))
    if clean_url.startswith("//"):
        clean_url = "https:" + clean_url

    filename = f"{_safe_filename(filename_prefix)}.jpg"
    _, filepath, relative_url = _media_paths(filename)

    if os.path.exists(filepath) and os.path.getsize(filepath) > 1500:
        return relative_url

    if clean_url:
        try:
            response = http_get(clean_url, timeout=10, image=True)
            content_type = (response.headers.get("content-type") or "").lower()
            if response.status_code == 200 and (
                content_type.startswith("image/") or response.content[:4] in (b"\xff\xd8\xff\xe0", b"\x89PNG")
            ):
                if len(response.content) <= 12_000_000 and _save_bytes_as_jpeg(response.content, filepath):
                    return relative_url
        except Exception:
            pass

    if fallback:
        return copy_category_fallback(category, filename_prefix)
    return ""


def copy_category_fallback(category: str, filename_prefix: str = "fallback") -> str:
    """Copy a bundled fallback image into MEDIA_ROOT, so it is always browser-safe."""
    filename = f"{_safe_filename(filename_prefix)}_fallback.jpg"
    _, filepath, relative_url = _media_paths(filename)
    if os.path.exists(filepath) and os.path.getsize(filepath) > 1500:
        return relative_url

    source_name = CATEGORY_FALLBACK_FILES.get(category, DEFAULT_FALLBACK_FILE)
    source = os.path.join(
        settings.BASE_DIR, "news_app", "static", "news_fallback", source_name
    )
    try:
        with open(source, "rb") as src:
            content = src.read()
        if _save_bytes_as_jpeg(content, filepath):
            return relative_url
    except OSError:
        pass
    return ""


def extract_first_sentence(text: str) -> str:
    if not text:
        return ""
    clean_text = re.sub(r"\s+", " ", BeautifulSoup(str(text), "html.parser").get_text(" ", strip=True)).strip()
    sentences = re.split(r"(?<=[.!?])\s+", clean_text)
    return re.sub(r"^[^\w«\"'#]+", "", sentences[0] if sentences else clean_text).strip()[:200]


def make_excerpt(text: str, title: str = "") -> str:
    clean = BeautifulSoup(str(text or ""), "html.parser").get_text(" ", strip=True)
    clean = re.sub(r"\s+", " ", clean).strip()
    if title and clean.lower().startswith(title.lower()):
        clean = clean[len(title):].lstrip(" —:-")
    return clean[:900]


def is_duplicate(title: str, url: str) -> bool:
    return NewsItem.objects.filter(url=url).exists() or NewsItem.objects.filter(title__iexact=title).exists()


def _absolute_image_url(value: str, base_url: str) -> str:
    if not value:
        return ""
    value = html.unescape(str(value)).strip(" '\"")
    if value.startswith("data:"):
        return ""
    return urljoin(base_url, value)



def _normalize_video_url(value: str, base_url: str = "") -> tuple[str, str]:
    value = html.unescape(str(value or "")).strip(" '\"")
    if not value or value.startswith("data:"):
        return "", ""
    value = urljoin(base_url, value)
    # Normalize common YouTube URLs to embeddable form.
    m = re.search(r"(?:youtube\.com/(?:watch\?v=|embed/|shorts/)|youtu\.be/)([A-Za-z0-9_-]{6,})", value)
    if m:
        return f"https://www.youtube.com/embed/{m.group(1)}", "youtube"
    if "vimeo.com/" in value:
        vm = re.search(r"vimeo\.com/(?:video/)?(\d+)", value)
        if vm:
            return f"https://player.vimeo.com/video/{vm.group(1)}", "vimeo"
    if re.search(r"\.(mp4|webm|ogg)(?:\?|$)", value, re.I):
        return value, "file"
    return value, "iframe"


def extract_video_from_soup(soup, base_url: str = "") -> tuple[str, str]:
    selectors = [
        'meta[property="og:video:secure_url"]',
        'meta[property="og:video:url"]',
        'meta[property="og:video"]',
        'meta[name="twitter:player"]',
    ]
    for selector in selectors:
        tag = soup.select_one(selector)
        if tag:
            url = tag.get("content") or ""
            normalized = _normalize_video_url(url, base_url)
            if normalized[0]:
                return normalized
    for iframe in soup.select("iframe[src]"):
        normalized = _normalize_video_url(iframe.get("src"), base_url)
        if normalized[0] and normalized[1] in {"youtube", "vimeo", "iframe"}:
            return normalized
    for video in soup.select("video[src], video source[src]"):
        normalized = _normalize_video_url(video.get("src"), base_url)
        if normalized[0]:
            return normalized
    return "", ""


def make_short_summary(text: str, title: str = "", max_chars: int = 260) -> str:
    """Extract a concise essence rather than copying a long RSS description."""
    clean = BeautifulSoup(str(text or ""), "html.parser").get_text(" ", strip=True)
    clean = re.sub(r"\s+", " ", clean).strip()
    if title and clean.lower().startswith(title.lower()):
        clean = clean[len(title):].lstrip(" —:-")
    if not clean:
        return ""
    sentences = re.split(r"(?<=[.!?])\s+(?=[A-ZА-ЯЁ0-9«])", clean)
    picked = []
    for sentence in sentences:
        sentence = sentence.strip()
        if len(sentence) < 35:
            continue
        picked.append(sentence)
        joined = " ".join(picked)
        if len(joined) >= max_chars * 0.72:
            break
    result = " ".join(picked) if picked else clean
    if len(result) > max_chars:
        result = result[:max_chars].rsplit(" ", 1)[0].rstrip(" ,;:-") + "…"
    return result


def search_context_video(title: str, content: str, category: str) -> tuple[str, str, str]:
    """Find a real, publicly accessible context video on Wikimedia Commons.

    We deliberately prefer Commons files because they expose a stable media URL
    and license metadata, avoiding fake/demo video placeholders.
    """
    terms = _context_terms(title, content, category)
    if not terms:
        return "", "", ""
    query = " ".join(terms[:6])
    cache_key = "context_video:" + hashlib.sha1(query.encode("utf-8")).hexdigest()
    cached = cache.get(cache_key)
    if cached:
        return cached

    try:
        params = {
            "action": "query",
            "generator": "search",
            "gsrsearch": query,
            "gsrnamespace": 6,
            "gsrlimit": 12,
            "prop": "imageinfo",
            "iiprop": "url|mime|size|extmetadata",
            "format": "json",
            "origin": "*",
        }
        response = requests.get(
            "https://commons.wikimedia.org/w/api.php",
            params=params,
            headers={"User-Agent": HEADERS["User-Agent"]},
            timeout=8,
        )
        response.raise_for_status()
        pages = response.json().get("query", {}).get("pages", {}).values()
        candidates = []
        for page in pages:
            info = (page.get("imageinfo") or [{}])[0]
            mime = str(info.get("mime") or "").lower()
            url = info.get("url") or ""
            if mime not in {"video/mp4", "video/webm", "video/ogg"}:
                continue
            title_words = set(_context_terms(page.get("title", ""), "", ""))
            overlap = len(set(terms) & title_words)
            score = overlap * 10
            if category.lower() in page.get("title", "").lower():
                score += 2
            candidates.append((score, page.get("title", ""), url, info))
        candidates.sort(key=lambda x: x[0], reverse=True)
        if candidates:
            _, page_title, url, info = candidates[0]
            ext = info.get("extmetadata") or {}
            license_name = (ext.get("LicenseShortName") or {}).get("value", "")
            credit = f"Wikimedia Commons: {BeautifulSoup(page_title, 'html.parser').get_text(strip=True)}"
            if license_name:
                credit += f" · {license_name}"
            result = (url, "file", credit)
            cache.set(cache_key, result, 6 * 60 * 60)
            return result
    except Exception:
        pass
    cache.set(cache_key, ("", "", ""), 60 * 60)
    return "", "", ""


def resolve_article_video(title: str, content: str, category: str, source_url: str = "") -> tuple[str, str, str]:
    if source_url:
        try:
            response = http_get(source_url, timeout=10)
            response.raise_for_status()
            soup = BeautifulSoup(response.content, "html.parser")
            video_url, video_type = extract_video_from_soup(soup, source_url)
            if video_url:
                return video_url, video_type, "Видео из оригинальной публикации"
        except Exception:
            pass
    return search_context_video(title, content, category)


def extract_article_metadata(url: str, source_name: str = "", author: str = "") -> dict:
    """Read source-page metadata without making the parser depend on page layout."""
    if not url:
        return {}
    try:
        response = http_get(url, timeout=10)
        response.raise_for_status()
        soup = BeautifulSoup(response.content, "html.parser")

        def meta(*selectors):
            for selector in selectors:
                tag = soup.select_one(selector)
                if tag:
                    value = tag.get("content") or tag.get_text(" ", strip=True)
                    if value:
                        return value.strip()
            return ""

        title = meta(
            'meta[property="og:title"]',
            'meta[name="twitter:title"]',
            "h1",
            "title",
        )
        description = meta(
            'meta[property="og:description"]',
            'meta[name="twitter:description"]',
            'meta[name="description"]',
        )
        image = meta(
            'meta[property="og:image:secure_url"]',
            'meta[property="og:image"]',
            'meta[name="twitter:image"]',
            'meta[name="twitter:image:src"]',
        )
        video_url, video_type = extract_video_from_soup(soup, url)
        author_value = meta(
            'meta[name="author"]',
            'meta[property="article:author"]',
        ) or author

        published = meta(
            'meta[property="article:published_time"]',
            'meta[name="date"]',
            'time[datetime]',
        )
        published_at = None
        if published:
            try:
                published_at = datetime.fromisoformat(published.replace("Z", "+00:00"))
            except ValueError:
                pass

        return {
            "title": re.sub(r"\s+", " ", title).strip()[:500],
            "excerpt": make_excerpt(description),
            "image_url": _absolute_image_url(image, url),
            "video_url": video_url,
            "video_type": video_type,
            "author": author_value[:160],
            "published_at": published_at,
        }
    except Exception:
        return {}


def _context_terms(title: str, content: str, category: str) -> list[str]:
    text = BeautifulSoup(f"{title} {content}", "html.parser").get_text(" ", strip=True).lower()
    words = re.findall(r"[a-zа-яё][a-zа-яё0-9-]{3,}", text, re.I)
    result = []
    for word in words:
        if word in STOP_WORDS or word in result:
            continue
        result.append(word)
        if len(result) >= 8:
            break
    if category and category.lower() not in result:
        result.append(category.lower())
    return result



def search_openverse_image(title: str, content: str, category: str, filename_prefix: str) -> tuple[str, str]:
    """Search Openverse for an openly licensed image matching the article context."""
    terms = _context_terms(title, content, category)
    if not terms:
        return "", ""
    query = " ".join(terms[:6])
    cache_key = "openverse_image:" + hashlib.sha1(query.encode("utf-8")).hexdigest()
    cached = cache.get(cache_key)
    if cached:
        return cached
    try:
        response = requests.get(
            "https://api.openverse.org/v1/images/",
            params={"q": query, "page_size": 12, "mature": "false"},
            headers={"User-Agent": HEADERS["User-Agent"]},
            timeout=8,
        )
        response.raise_for_status()
        results = response.json().get("results", [])
        ranked = []
        wanted = set(terms)
        for item in results:
            image_url = item.get("url") or item.get("thumbnail")
            if not image_url:
                continue
            title_words = set(_context_terms(item.get("title", ""), "", ""))
            overlap = len(wanted & title_words)
            ranked.append((overlap, item))
        ranked.sort(key=lambda x: x[0], reverse=True)
        for _, item in ranked[:8]:
            local = download_and_process_image(
                item.get("url") or item.get("thumbnail"),
                filename_prefix + "_openverse",
                category,
                fallback=False,
            )
            if not local:
                continue
            creator = item.get("creator") or ""
            license_name = item.get("license") or ""
            source_name = item.get("source") or "Openverse"
            credit = f"{source_name}: {item.get('title') or 'тематическая иллюстрация'}"
            if creator:
                credit += f" · {creator}"
            if license_name:
                credit += f" · {license_name}"
            result = (local, credit[:200])
            cache.set(cache_key, result, 6 * 60 * 60)
            return result
    except Exception:
        pass
    cache.set(cache_key, ("", ""), 60 * 60)
    return "", ""


def search_context_image(title: str, content: str, category: str, filename_prefix: str) -> tuple[str, str]:
    """Find a semantically related Commons image, download it locally and return (url, credit)."""
    terms = _context_terms(title, content, category)
    if not terms:
        return "", ""

    openverse_image, openverse_credit = search_openverse_image(
        title, content, category, filename_prefix
    )
    if openverse_image:
        return openverse_image, openverse_credit

    queries = [" ".join(terms[:6]), " ".join(terms[:4] + [category])]
    cache_key = "context_image:" + hashlib.sha1(
        "|".join(queries).encode("utf-8")
    ).hexdigest()
    cached = cache.get(cache_key)
    if cached:
        return cached

    candidates = []

    for query in queries:
        try:
            params = {
                "action": "query",
                "generator": "search",
                "gsrsearch": query,
                "gsrnamespace": 6,
                "gsrlimit": 10,
                "prop": "imageinfo",
                "iiprop": "url|mime|size|extmetadata",
                "iiurlwidth": 1400,
                "format": "json",
                "origin": "*",
            }
            response = requests.get(
                "https://commons.wikimedia.org/w/api.php",
                params=params,
                headers={"User-Agent": HEADERS["User-Agent"]},
                timeout=8,
            )
            response.raise_for_status()
            pages = response.json().get("query", {}).get("pages", {}).values()
            for page in pages:
                info = (page.get("imageinfo") or [{}])[0]
                image_url = info.get("thumburl") or info.get("url")
                if not image_url or not str(info.get("mime", "")).startswith("image/"):
                    continue
                page_title = page.get("title", "")
                context_words = set(terms)
                candidate_words = set(_context_terms(page_title, "", ""))
                overlap = len(context_words & candidate_words)
                score = overlap * 10
                if category.lower() in page_title.lower():
                    score += 2
                candidates.append((score, page_title, image_url, info))
        except Exception:
            continue

    if not candidates:
        return "", ""

    candidates.sort(key=lambda x: x[0], reverse=True)
    for _, page_title, image_url, info in candidates[:8]:
        local = download_and_process_image(image_url, filename_prefix + "_context", category, fallback=False)
        if local:
            ext = info.get("extmetadata") or {}
            artist = (ext.get("Artist") or {}).get("value", "")
            license_name = (ext.get("LicenseShortName") or {}).get("value", "")
            credit = f"Wikimedia Commons: {BeautifulSoup(page_title, 'html.parser').get_text(strip=True)}"
            if artist:
                credit += f" · {BeautifulSoup(artist, 'html.parser').get_text(' ', strip=True)[:120]}"
            if license_name:
                credit += f" · {license_name}"
            result = (local, credit)
            cache.set(cache_key, result, 6 * 60 * 60)
            return result
    cache.set(cache_key, ("", ""), 60 * 60)
    return "", ""


def resolve_article_image(
    *,
    image_url: str,
    title: str,
    content: str,
    category: str,
    filename_prefix: str,
    source_url: str = "",
) -> tuple[str, str]:
    """Return a local image and its credit, trying source and contextual search."""
    if image_url:
        local = download_and_process_image(image_url, filename_prefix, category, fallback=False)
        if local:
            return local, "Источник: оригинальная публикация"

    context_image, context_credit = search_context_image(
        title, content, category, filename_prefix
    )
    if context_image:
        return context_image, context_credit

    # Never fall back to the old bundled assets. If no open image is found,
    # leave the field empty and let the frontend render its generated placeholder.
    return "", ""


def _image_contains_text(image_bytes: bytes) -> bool:
    """Detect text-heavy media so article cards use the neutral placeholder instead."""
    try:
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        image.thumbnail((1400, 900))
        if HAS_TESSERACT:
            text = pytesseract.image_to_string(image, lang="rus+eng", config="--psm 11").strip()
            if len(re.sub(r"\s+", "", text)) >= 3:
                return True

        # Conservative fallback when the tesseract binary is unavailable:
        # detect many small high-contrast components typical of overlaid text.
        gray = image.convert("L")
        from PIL import ImageFilter
        edges = gray.filter(ImageFilter.FIND_EDGES)
        hist = edges.histogram()
        strong = sum(hist[170:])
        pixels = gray.width * gray.height
        return pixels > 0 and strong / pixels > 0.075 and gray.width >= 500
    except Exception:
        return False


def _entry_image(entry, base_url="") -> str:
    for key in ("media_content", "media_thumbnail", "links"):
        values = entry.get(key) or []
        if isinstance(values, dict):
            values = [values]
        for value in values:
            if isinstance(value, dict):
                href = value.get("url") or value.get("href")
                mime = (value.get("type") or "").lower()
                if href and (not mime or mime.startswith("image/")):
                    return _absolute_image_url(href, base_url)
    return ""


def parse_rss_feed(source_name: str, feed_url: str) -> int:
    try:
        response = http_get(feed_url, timeout=12)
        response.raise_for_status()
        parsed = feedparser.parse(response.content)
    except Exception as exc:
        print(f"[RSS ERROR] {source_name}: {exc}")
        return 0

    added = 0
    for entry in reversed(parsed.entries[:80]):
        try:
            url = entry.get("link", "").strip()
            title = BeautifulSoup(entry.get("title", ""), "html.parser").get_text(" ", strip=True)
            content = entry.get("summary") or entry.get("description") or ""
            content = make_excerpt(content, title)
            summary = make_short_summary(content, title)
            if not url or len(title) < 15 or is_duplicate(title, url):
                continue

            category, importance = classify_news(title, content)
            published_at = None
            if entry.get("published_parsed"):
                published_at = datetime(*entry.published_parsed[:6], tzinfo=dt_timezone.utc)
            source_image = _entry_image(entry, url)
            metadata = {}

            if not source_image:
                metadata = extract_article_metadata(url, source_name, entry.get("author", ""))
                source_image = metadata.get("image_url") or ""
                if metadata.get("excerpt"):
                    content = metadata["excerpt"]
                    summary = make_short_summary(content, title)
                if metadata.get("published_at"):
                    published_at = metadata["published_at"]

            prefix = f"rss_{hashlib.sha1(url.encode()).hexdigest()[:16]}"
            local_image, credit = resolve_article_image(
                image_url=source_image,
                title=title,
                content=content,
                category=category,
                filename_prefix=prefix,
                source_url=url,
            )
            if source_name.lower() in {"риа новости", "рбк"}:
                local_image, credit = "", ""
            video_url = metadata.get("video_url", "")
            video_type = metadata.get("video_type", "")
            video_credit = "Видео из оригинальной публикации" if video_url else ""
            if not video_url:
                video_url, video_type, video_credit = resolve_article_video(title, content, category, url)

            NewsItem.objects.create(
                title=title[:500],
                url=url,
                content=content,
                summary=summary or make_short_summary(content, title),
                source=source_name,
                image_url=local_image,
                image_credit=credit,
                video_url=video_url,
                video_type=video_type,
                video_credit=video_credit,
                author=(entry.get("author") or source_name)[:160],
                category=category,
                importance_score=importance,
                published_at=published_at,
            )
            added += 1
            print(f"[NEW RSS] {source_name}: {title[:70]}")
        except IntegrityError:
            continue
        except Exception as exc:
            print(f"[RSS ITEM ERROR] {source_name}: {exc}")

    return added


def start_parsing() -> int:
    total = 0
    for source_name, feed_url in RSS_FEEDS.items():
        total += parse_rss_feed(source_name, feed_url)
    print(f"[RSS COMPLETE] Добавлено новостей: {total}")
    return total



def repair_existing_images(limit: int = 200) -> int:
    """Repair old DB records whose image URL points to a missing/non-local file."""
    qs = NewsItem.objects.all().order_by("-updated_at", "-created_at")
    repaired = 0
    checked = 0

    for item in qs.iterator():
        if limit and checked >= limit:
            break
        checked += 1
        current = item.image_url or ""
        needs_repair = True

        if current.startswith("/media/"):
            path = os.path.join(settings.MEDIA_ROOT, current[len("/media/"):])
            needs_repair = not (os.path.isfile(path) and os.path.getsize(path) > 1500)

        if not needs_repair:
            continue

        metadata = extract_article_metadata(
            item.url,
            item.source or "Источник",
            item.author or "Редакция",
        )
        source_image = metadata.get("image_url") or (
            current if current.startswith(("http://", "https://")) else ""
        )
        content = metadata.get("excerpt") or item.summary or item.content or ""
        local_image, credit = resolve_article_image(
            image_url=source_image,
            title=metadata.get("title") or item.title,
            content=content,
            category=item.category,
            filename_prefix=f"repair_{item.pk}",
            source_url=item.url,
        )
        if (item.source or "").lower() in {"риа новости", "рбк"}:
            local_image, credit = "", ""
        video_url = metadata.get("video_url", "")
        video_type = metadata.get("video_type", "")
        video_credit = "Видео из оригинальной публикации" if video_url else ""
        if not video_url:
            video_url, video_type, video_credit = resolve_article_video(
                metadata.get("title") or item.title, content, item.category, item.url
            )
        if local_image:
            item.image_url = local_image
            item.image_credit = credit
            if video_url:
                item.video_url = video_url
                item.video_type = video_type
                item.video_credit = video_credit
            item.summary = make_short_summary(content, item.title)
            item.save(update_fields=["image_url", "image_credit", "video_url", "video_type", "video_credit", "summary", "updated_at"])
            repaired += 1

    print(f"[IMAGE REPAIR] Проверено: {checked}, восстановлено: {repaired}")
    return repaired


def parse_tg_web_channel(source_name: str, channel_username: str) -> int:
    url = f"https://t.me/s/{channel_username}"
    try:
        response = http_get(url, timeout=12)
        response.raise_for_status()
    except Exception as exc:
        print(f"[TG WEB ERROR] {source_name}: {exc}")
        return 0

    soup = BeautifulSoup(response.content, "html.parser")
    posts = soup.select(".tgme_widget_message")
    added = 0

    for post in reversed(posts):
        try:
            link_tag = post.select_one(".tgme_widget_message_date")
            if not link_tag or not link_tag.get("href"):
                continue
            post_url = link_tag["href"]

            text_tag = post.select_one(".tgme_widget_message_text")
            raw_text = text_tag.get_text("\n", strip=True) if text_tag else ""
            title = extract_first_sentence(raw_text)
            if len(title) < 15 or is_duplicate(title, post_url):
                continue

            excerpt = make_excerpt(raw_text)[:900]
            summary = make_short_summary(excerpt, title)
            category, importance = classify_news(title, excerpt)
            msg_id = post_url.rstrip("/").split("/")[-1]
            prefix = f"tg_{channel_username}_{msg_id}"

            image_url = ""
            photo_wrap = post.select_one(".tgme_widget_message_photo_wrap")
            if photo_wrap:
                style = photo_wrap.get("style", "")
                match = re.search(r"url\((['\"]?)(.*?)\1\)", style)
                if match:
                    image_url = match.group(2)
                if not image_url:
                    image_tag = photo_wrap.select_one("img[src]")
                    if image_tag:
                        image_url = image_tag.get("src", "")

            local_image, credit = resolve_article_image(
                image_url=image_url,
                title=title,
                content=excerpt,
                category=category,
                filename_prefix=prefix,
                source_url=post_url,
            )
            video_url, video_type, video_credit = resolve_article_video(title, excerpt, category, post_url)

            published_at = None
            time_tag = post.select_one("time[datetime]")
            if time_tag and time_tag.get("datetime"):
                try:
                    published_at = datetime.fromisoformat(
                        time_tag["datetime"].replace("Z", "+00:00")
                    )
                except ValueError:
                    pass

            NewsItem.objects.create(
                title=title,
                url=post_url,
                content=excerpt,
                summary=summary or make_short_summary(excerpt, title),
                source=f"Telegram: {source_name}",
                image_url=local_image,
                image_credit=credit,
                video_url=video_url,
                video_type=video_type,
                video_credit=video_credit,
                author=source_name,
                category=category,
                importance_score=importance,
                published_at=published_at,
            )
            print(f"[NEW TG] {source_name}: {title[:70]}")
            added += 1

        except IntegrityError:
            continue
        except Exception as exc:
            print(f"[TG ITEM ERROR] {source_name}: {exc}")

    return added


def start_telegram_web_parsing() -> int:
    total = 0
    for source_name, channel_username in TELEGRAM_CHANNELS.items():
        total += parse_tg_web_channel(source_name, channel_username)
    print(f"[TG COMPLETE] Добавлено новостей: {total}")
    return total
