import html
import json
import random
import re
from datetime import datetime, timezone
from urllib.parse import quote, urljoin

import requests
from bs4 import BeautifulSoup
from django.db import IntegrityError
from django.utils.dateparse import parse_datetime
from feedparser import parse as parse_feed

from .category import classify_news
from .models import NewsItem

USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 (KHTML, like Gecko) "
    "Chrome/131.0 Safari/537.36"
)
HEADERS = {
    "User-Agent": USER_AGENT,
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
}
RSS_FEEDS = {
    "РИА Новости": "https://ria.ru/export/rss2/archive/index.xml",
    "Российская Газета": "https://rg.ru/xml/index.xml",
}
BNK_URL = "https://www.bnkomi.ru/news/news/index/"
PANORAMA_URL = "https://panorama.pub/news"
OPENVERSE_API = "https://api.openverse.org/v1/images/"

RATING_PREFIX_RE = re.compile(r"\bрейтинг\s*:\s*\d+(?:[.,]\d+)?\s*[—–-]?\s*", re.I)


def absolute_url(url, base):
    if not url:
        return ""
    return urljoin(base, url.strip())


def clean_html(value):
    if not value:
        return ""
    return BeautifulSoup(html.unescape(str(value)), "html.parser").get_text(" ", strip=True)


def clean_title(title, panorama=False):
    title = clean_html(title)
    if panorama:
        title = RATING_PREFIX_RE.sub("", title).strip()
    return re.sub(r"\s+", " ", title).strip()[:500]


def make_summary(content, title):
    text = clean_html(content)
    if not text:
        return title[:220]
    text = re.sub(r"\s+", " ", text).strip()
    sentences = re.split(r"(?<=[.!?])\s+", text)
    summary = sentences[0] if sentences else text
    if len(summary) < 90 and len(sentences) > 1:
        summary = f"{summary} {sentences[1]}"
    return summary[:260].rstrip() + ("…" if len(summary) > 260 else "")


def extract_author(soup, fallback="Редакция"):
    for attrs in (
        {"name": "author"},
        {"property": "article:author"},
        {"name": "byl"},
    ):
        tag = soup.find("meta", attrs=attrs)
        if tag and tag.get("content"):
            return clean_html(tag["content"])[:160]
    for selector in ("[rel='author']", ".author", ".article-author", ".byline", "[class*='author']"):
        tag = soup.select_one(selector)
        if tag:
            text = clean_html(tag.get_text(" ", strip=True))
            if text and len(text) < 160:
                return text
    return fallback


def extract_article_text(soup):
    # Prefer JSON-LD articleBody when the site exposes it.
    for script in soup.find_all("script", type="application/ld+json"):
        try:
            data = json.loads(script.string or script.get_text())
            nodes = data if isinstance(data, list) else [data]
            for node in nodes:
                if isinstance(node, dict) and node.get("articleBody"):
                    body = clean_html(node["articleBody"])
                    if len(body) > 250:
                        return body
        except Exception:
            continue

    candidates = []
    for selector in (
        "article",
        "main article",
        "[itemprop='articleBody']",
        ".article-body",
        ".article__body",
        ".article-content",
        ".article__content",
        ".post-content",
        ".entry-content",
        "main",
    ):
        for node in soup.select(selector):
            paragraphs = [clean_html(p.get_text(" ", strip=True)) for p in node.find_all("p")]
            paragraphs = [p for p in paragraphs if len(p) >= 35]
            if paragraphs:
                text = "\n\n".join(paragraphs)
                candidates.append(text)

    if candidates:
        return max(candidates, key=len)

    paragraphs = [clean_html(p.get_text(" ", strip=True)) for p in soup.find_all("p")]
    paragraphs = [p for p in paragraphs if len(p) >= 35]
    return "\n\n".join(paragraphs)


def extract_article_page(url, source_name, fallback_author="Редакция"):
    try:
        response = requests.get(url, headers=HEADERS, timeout=15)
        response.raise_for_status()
        soup = BeautifulSoup(response.content, "html.parser")
        content = extract_article_text(soup)
        author = extract_author(soup, fallback_author)
        published_at = None
        for attrs in ({"property": "article:published_time"}, {"name": "date"}, {"itemprop": "datePublished"}):
            tag = soup.find("meta", attrs=attrs)
            if tag and tag.get("content"):
                published_at = parse_datetime(tag["content"])
                if published_at:
                    break
        return content, author, published_at
    except Exception as exc:
        print(f"[ARTICLE ERROR] {source_name}: {url}: {exc}")
        return "", fallback_author, None


def image_has_obvious_text(url):
    # Conservative metadata filter. Full OCR is intentionally optional: it would
    # make every parse much slower and require a system OCR binary.
    lowered = url.lower()
    return any(word in lowered for word in ("logo", "screenshot", "poster", "infographic", "map", "chart", "text"))


def _json_response(response):
    """Safely decode JSON from an external image service.

    Some public APIs return HTML/plain text on rate limits or temporary
    protection pages. Calling response.json() directly then raises a JSON
    decode error and hides the useful fallback path.
    """
    content_type = (response.headers.get("Content-Type") or "").lower()
    if "json" not in content_type:
        return None
    try:
        return response.json()
    except (ValueError, json.JSONDecodeError):
        return None


def _openverse_image(title, category, used_urls=None):
    """Return one Openverse image or an empty result."""
    query = f"{category} {title}".strip()
    try:
        response = requests.get(
            OPENVERSE_API,
            params={
                "q": query,
                "page_size": 20,
                "license_type": "commercial,modification",
            },
            headers={
                **HEADERS,
                "Accept": "application/json",
            },
            timeout=12,
        )
        response.raise_for_status()
        payload = _json_response(response)
        if not isinstance(payload, dict):
            return {"url": "", "credit": ""}

        results = payload.get("results") or []
        candidates = []
        for item in results:
            if not isinstance(item, dict):
                continue
            url = item.get("thumbnail") or item.get("url")
            if not url or image_has_obvious_text(url) or item.get("watermarked"):
                continue
            if used_urls and url in used_urls:
                continue
            candidates.append({
                "url": url,
                "credit": " · ".join(filter(None, [
                    item.get("creator"),
                    item.get("license"),
                    item.get("provider"),
                ])),
            })
        return random.choice(candidates) if candidates else {"url": "", "credit": ""}
    except requests.RequestException:
        return {"url": "", "credit": ""}
    except Exception:
        return {"url": "", "credit": ""}


def _wikimedia_image(title, category, used_urls=None):
    """Fallback: search Wikimedia Commons for an openly licensed image."""
    query = f"{category} {title}".strip()
    endpoint = "https://commons.wikimedia.org/w/api.php"
    try:
        response = requests.get(
            endpoint,
            params={
                "action": "query",
                "format": "json",
                "generator": "search",
                "gsrsearch": query,
                "gsrnamespace": 6,
                "gsrlimit": 20,
                "prop": "imageinfo|info",
                "iiprop": "url|mime|size|extmetadata",
            },
            headers={
                **HEADERS,
                "Accept": "application/json",
            },
            timeout=12,
        )
        response.raise_for_status()
        payload = _json_response(response)
        if not isinstance(payload, dict):
            return {"url": "", "credit": ""}

        pages = list((payload.get("query") or {}).get("pages", {}).values())
        candidates = []
        for page in pages:
            info = (page.get("imageinfo") or [{}])[0]
            url = info.get("thumburl") or info.get("url")
            mime = (info.get("mime") or "").lower()
            if not url or not mime.startswith("image/"):
                continue
            if used_urls and url in used_urls:
                continue
            if image_has_obvious_text(url):
                continue

            meta = info.get("extmetadata") or {}
            creator = clean_html((meta.get("Artist") or {}).get("value", ""))
            license_name = clean_html((meta.get("LicenseShortName") or {}).get("value", ""))
            page_url = absolute_url(
                page.get("fullurl") or page.get("canonicaltitle") or "",
                "https://commons.wikimedia.org/wiki/",
            )
            credit = " · ".join(filter(None, [creator, license_name, "Wikimedia Commons"]))
            candidates.append({"url": url, "credit": credit, "page_url": page_url})

        return random.choice(candidates) if candidates else {"url": "", "credit": ""}
    except requests.RequestException:
        return {"url": "", "credit": ""}
    except Exception:
        return {"url": "", "credit": ""}


def find_free_image(title, category, used_urls=None):
    """Pick a random openly licensed image, avoiding images already used by Kontur."""
    used_urls = used_urls or set()
    picked = _openverse_image(title, category, used_urls)
    if picked.get("url"):
        return picked

    picked = _wikimedia_image(title, category, used_urls)
    if picked.get("url"):
        return picked

    # Do not make image lookup failure break news parsing. The caller can
    # still use the source image or the frontend fallback.
    return {"url": "", "credit": ""}


def extract_media_from_html(url):
    try:
        response = requests.get(url, headers=HEADERS, timeout=10)
        response.raise_for_status()
        soup = BeautifulSoup(response.content, "html.parser")
        for attrs in (
            {"property": "og:image"},
            {"name": "twitter:image"},
            {"property": "og:image:url"},
        ):
            tag = soup.find("meta", attrs=attrs)
            if tag and tag.get("content"):
                image = absolute_url(tag["content"], url)
                if not image_has_obvious_text(image):
                    return image
    except Exception:
        pass
    return ""


def parse_published(entry):
    for key in ("published", "updated", "created"):
        value = entry.get(key)
        if not value:
            continue
        parsed = parse_datetime(value)
        if parsed:
            return parsed
    struct = entry.get("published_parsed") or entry.get("updated_parsed")
    if struct:
        return datetime(*struct[:6], tzinfo=timezone.utc)
    return None


def save_news(title, url, content="", source="", image_url="", author="Редакция", published_at=None, panorama=False):
    title = clean_title(title, panorama=panorama)
    url = (url or "").strip()
    content = clean_html(content)
    if not title or not url:
        return False
    if NewsItem.objects.filter(url=url).exists():
        return False

    # RSS often contains only an excerpt. Fetch the article page so the reader
    # can open the full text when the source exposes it.
    page_content, page_author, page_date = extract_article_page(url, source, author)
    if len(page_content) > len(content):
        content = page_content
    author = page_author or author
    published_at = published_at or page_date

    category, importance = classify_news(title, content)
    # Transparent ranking signals: editorial keyword score + freshness is computed
    # at query time, while this score records only content-level signals.
    used_urls = set(NewsItem.objects.exclude(image_url="").values_list("image_url", flat=True))
    free_image = find_free_image(title, category, used_urls)
    image = free_image["url"] or image_url or extract_media_from_html(url)
    if image and image in used_urls:
        image = ""
    image_credit = free_image["credit"] if free_image["url"] else ""

    try:
        NewsItem.objects.create(
            title=title,
            url=url,
            content=content,
            summary=make_summary(content, title),
            source=source[:160],
            image_url=image or None,
            image_credit=image_credit,
            author=(author or "Редакция")[:160],
            category=category,
            importance_score=importance,
            published_at=published_at,
        )
        return True
    except IntegrityError:
        return False


def parse_rss(source_name, rss_url):
    try:
        response = requests.get(rss_url, headers=HEADERS, timeout=15)
        response.raise_for_status()
        feed = parse_feed(response.content)
        added = 0
        for entry in feed.entries[:40]:
            url = entry.get("link", "")
            content = entry.get("summary") or entry.get("description") or ""
            image_url = ""
            for enclosure in entry.get("enclosures", []):
                image_url = enclosure.get("href") or enclosure.get("url") or ""
                if image_url:
                    break
            if not image_url:
                for media in entry.get("media_content", []) + entry.get("media_thumbnail", []):
                    image_url = media.get("url", "")
                    if image_url:
                        break
            image_url = absolute_url(image_url, url)
            author = clean_html(entry.get("author") or "Редакция")
            if save_news(entry.get("title", ""), url, content, source_name, image_url, author, parse_published(entry)):
                added += 1
        return added
    except Exception as exc:
        print(f"[RSS ERROR] {source_name}: {exc}")
        return 0


def parse_html_listing(list_url, source_name, base_url, limit=30, panorama=False):
    try:
        response = requests.get(list_url, headers=HEADERS, timeout=15)
        response.raise_for_status()
        soup = BeautifulSoup(response.content, "html.parser")
        added = 0
        processed = set()
        for link in soup.find_all("a", href=True):
            url = absolute_url(link.get("href"), base_url)
            title = clean_title(link.get_text(" ", strip=True), panorama=panorama)
            if url in processed or not title or len(title) < 15 or len(title) > 500:
                continue
            if base_url not in url or "/news/" not in url:
                continue
            if panorama and ("/news?page=" in url or url.rstrip("/") == PANORAMA_URL.rstrip("/")):
                continue
            processed.add(url)
            image_url = ""
            container = link.find_parent("article") or link.find_parent(class_=lambda value: value and any(x in str(value).lower() for x in ("news", "article", "item", "card")))
            if container:
                image = container.find("img")
                if image:
                    image_url = absolute_url(image.get("src") or image.get("data-src") or image.get("data-lazy-src"), base_url)
            if save_news(title, url, "", source_name, image_url, "Редакция", None, panorama=panorama):
                added += 1
            if added >= limit:
                break
        return added
    except Exception as exc:
        print(f"[HTML ERROR] {source_name}: {exc}")
        return 0


def parse_bnk():
    return parse_html_listing(BNK_URL, "БНК Коми", "https://www.bnkomi.ru", 30)


def parse_panorama():
    # The site is a satire publication; keep its own author/byline, but do not
    # append an editorial label to the source name shown in Kontur.
    return parse_html_listing(PANORAMA_URL, "ИА «Панорама»", "https://panorama.pub", 10, panorama=True)


def start_parsing():
    total = parse_bnk()
    for source_name, rss_url in RSS_FEEDS.items():
        total += parse_rss(source_name, rss_url)
    total += parse_panorama()
    print(f"[PARSER] Всего новых новостей: {total}")
    return total
