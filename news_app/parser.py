import requests

from bs4 import BeautifulSoup
from django.db import IntegrityError
from feedparser import parse as parse_feed

from .models import NewsItem


USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 (KHTML, like Gecko) "
    "Chrome/131.0 Safari/537.36"
)

HEADERS = {
    "User-Agent": USER_AGENT,
    "Accept": (
        "text/html,application/xhtml+xml,"
        "application/xml;q=0.9,*/*;q=0.8"
    ),
}


RSS_FEEDS = {
    "РИА Новости": "https://ria.ru/export/rss2/archive/index.xml",
    "Российская Газета": "https://rg.ru/xml/index.xml",
}

BNK_URL = "https://www.bnkomi.ru/news/news/index/"
PANORAMA_URL = "https://panorama.pub/news"


def absolute_url(url, base):
    if not url:
        return ""

    if url.startswith("http://"):
        return url

    if url.startswith("https://"):
        return url

    if url.startswith("//"):
        return "https:" + url

    if url.startswith("/"):
        return base.rstrip("/") + url

    return base.rstrip("/") + "/" + url


def save_news(
    title,
    url,
    content="",
    source="",
    image_url="",
    author="Редакция",
):
    title = (title or "").strip()
    url = (url or "").strip()

    if not title or not url:
        return False

    if len(title) > 500:
        title = title[:500]

    if NewsItem.objects.filter(url=url).exists():
        return False

    try:
        NewsItem.objects.create(
            title=title,
            url=url,
            content=content or "",
            source=source or "",
            image_url=image_url or "",
            author=author or "Редакция",
        )

        return True

    except IntegrityError:
        return False


def parse_rss(source_name, rss_url):
    print(f"[RSS] {source_name}: {rss_url}")

    try:
        response = requests.get(
            rss_url,
            headers=HEADERS,
            timeout=15,
        )

        response.raise_for_status()

        feed = parse_feed(response.content)

        if not feed.entries:
            print(f"[RSS] {source_name}: записей нет")
            return 0

        added = 0

        for entry in feed.entries[:30]:

            title = entry.get("title", "")
            url = entry.get("link", "")

            content = (
                entry.get("summary")
                or entry.get("description")
                or ""
            )

            image_url = ""

            for enclosure in entry.get("enclosures", []):
                image_url = (
                    enclosure.get("href")
                    or enclosure.get("url")
                    or ""
                )

                if image_url:
                    break

            if save_news(
                title=title,
                url=url,
                content=content,
                source=source_name,
                image_url=image_url,
            ):
                added += 1

        print(
            f"[RSS] {source_name}: "
            f"добавлено {added}"
        )

        return added

    except requests.RequestException as exc:
        print(
            f"[RSS ERROR] {source_name}: {exc}"
        )
        return 0

    except Exception as exc:
        print(
            f"[RSS ERROR] {source_name}: {exc}"
        )
        return 0


def parse_bnk():
    print(f"[HTML] БНК: {BNK_URL}")

    try:
        response = requests.get(
            BNK_URL,
            headers=HEADERS,
            timeout=15,
        )

        response.raise_for_status()

        soup = BeautifulSoup(
            response.content,
            "html.parser",
        )

        added = 0
        processed = set()

        for link in soup.find_all("a", href=True):

            url = absolute_url(
                link.get("href"),
                "https://www.bnkomi.ru",
            )

            title = link.get_text(
                " ",
                strip=True,
            )

            if not title:
                continue

            if len(title) < 15 or len(title) > 500:
                continue

            if url in processed:
                continue

            processed.add(url)

            if "/news/" not in url:
                continue

            image_url = ""

            container = (
                link.find_parent("article")
                or link.find_parent(
                    class_=lambda value: value
                    and any(
                        word in str(value).lower()
                        for word in (
                            "news",
                            "article",
                            "item",
                            "card",
                        )
                    )
                )
            )

            if container:
                image = container.find("img")

                if image:
                    image_url = (
                        image.get("src")
                        or image.get("data-src")
                        or image.get("data-lazy-src")
                        or ""
                    )

                    image_url = absolute_url(
                        image_url,
                        "https://www.bnkomi.ru",
                    )

            if save_news(
                title=title,
                url=url,
                source="БНК Коми",
                image_url=image_url,
            ):
                added += 1

            if added >= 30:
                break

        print(
            f"[HTML] БНК: добавлено {added}"
        )

        return added

    except requests.RequestException as exc:
        print(f"[BNK ERROR] {exc}")
        return 0

    except Exception as exc:
        print(f"[BNK ERROR] {exc}")
        return 0


def parse_panorama():
    """
    Панорама — HTML-парсинг.

    Сайт является сатирическим изданием,
    поэтому источник явно помечается.
    """

    print(
        f"[PANORAMA] {PANORAMA_URL}"
    )

    try:
        response = requests.get(
            PANORAMA_URL,
            headers=HEADERS,
            timeout=15,
        )

        response.raise_for_status()

        soup = BeautifulSoup(
            response.content,
            "html.parser",
        )

        added = 0
        processed = set()

        for link in soup.find_all("a", href=True):

            href = link.get("href", "").strip()

            if not href:
                continue

            url = absolute_url(
                href,
                "https://panorama.pub",
            )

            if "panorama.pub" not in url:
                continue

            # Новости Панорамы имеют /news/
            if "/news/" not in url:
                continue

            # Пропускаем страницы списка.
            if "page=" in url:
                continue

            if url in processed:
                continue

            processed.add(url)

            title = link.get_text(
                " ",
                strip=True,
            )

            if not title:
                continue

            if len(title) < 15:
                continue

            if len(title) > 500:
                continue

            image_url = ""

            container = (
                link.find_parent("article")
                or link.find_parent(
                    class_=lambda value: value
                    and any(
                        word in str(value).lower()
                        for word in (
                            "news",
                            "article",
                            "item",
                            "card",
                        )
                    )
                )
            )

            if container:
                image = container.find("img")

                if image:
                    image_url = (
                        image.get("src")
                        or image.get("data-src")
                        or image.get("data-lazy-src")
                        or ""
                    )

                    image_url = absolute_url(
                        image_url,
                        "https://panorama.pub",
                    )

            if save_news(
                title=title,
                url=url,
                content="",
                source="ИА «Панорама» — сатира",
                image_url=image_url,
                author="ИА «Панорама»",
            ):
                added += 1

            if added >= 10:
                break

        print(
            f"[PANORAMA] добавлено {added}"
        )

        return added

    except requests.RequestException as exc:
        print(
            f"[PANORAMA ERROR] {exc}"
        )
        return 0

    except Exception as exc:
        print(
            f"[PANORAMA ERROR] {exc}"
        )
        return 0


def start_parsing():
    """
    Запускает все источники.
    """

    total = 0

    total += parse_bnk()

    for source_name, rss_url in RSS_FEEDS.items():
        total += parse_rss(
            source_name,
            rss_url,
        )

    total += parse_panorama()

    print(
        f"[PARSER] Всего новых новостей: {total}"
    )

    return total