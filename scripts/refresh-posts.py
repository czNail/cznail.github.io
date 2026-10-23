"""Refresh static article cards from the published RSS feed, using only the stdlib."""
import json
import os
import sys
import xml.etree.ElementTree as ET
from datetime import timedelta, timezone
from email.utils import parsedate_to_datetime
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit
from urllib.request import Request, urlopen

FEED = "https://cznail.github.io/my-blog/rss.xml"
TARGET = Path(__file__).resolve().parents[1] / "src/data/posts.json"
MAX_BYTES = 2 * 1024 * 1024
SITE_TIMEZONE = timezone(timedelta(hours=8))


class PlainText(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.parts = []

    def handle_data(self, data):
        self.parts.append(data)


def text(value):
    parser = PlainText()
    parser.feed(value or "")
    return " ".join(" ".join(parser.parts).split())


def parse_posts(xml, limit=3):
    if len(xml) > MAX_BYTES or b"<!DOCTYPE" in xml.upper() or b"<!ENTITY" in xml.upper():
        raise ValueError("Invalid feed")
    root = ET.fromstring(xml)
    if root.tag != "rss" or root.find("channel") is None:
        raise ValueError("Expected RSS channel")
    posts, seen = [], set()
    # The blog already orders its RSS by publication date. pubDate can be a
    # modification time, so sorting by it could promote an old edited article.
    for item in root.findall("./channel/item"):
        title = text(item.findtext("title"))
        url = (item.findtext("link") or "").strip()
        parsed = urlsplit(url)
        if not title or parsed.scheme != "https" or parsed.netloc != "cznail.github.io" or not parsed.path.startswith("/my-blog/posts/") or url in seen:
            continue
        try:
            date = parsedate_to_datetime(item.findtext("pubDate") or "")
            date = (date if date.tzinfo else date.replace(tzinfo=timezone.utc)).astimezone(SITE_TIMEZONE)
        except (TypeError, ValueError, OverflowError):
            continue
        seen.add(url)
        posts.append({"title": title, "description": text(item.findtext("description")),
                      "url": url, "date": date.date().isoformat(),
                      "category": text(item.findtext("category")) or "技术写作"})
        if len(posts) == limit:
            break
    if not posts:
        raise ValueError("No valid published articles")
    return posts


def refresh(target=TARGET, fetch=None):
    previous = json.loads(target.read_text(encoding="utf-8"))
    try:
        if fetch is None:
            with urlopen(Request(FEED, headers={"User-Agent": "cznail-homepage"}), timeout=20) as response:
                xml = response.read(MAX_BYTES + 1)
        else:
            xml = fetch()
        posts = parse_posts(xml)
    except Exception as error:
        if not previous:
            raise
        print(f"Blog feed unavailable ({type(error).__name__}); keeping the verified article snapshot.", file=sys.stderr)
        return False
    if posts == previous:
        print("Published article snapshot is up to date.")
        return False
    temporary = target.with_suffix(".json.tmp")
    temporary.write_text(json.dumps(posts, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    temporary.replace(target)
    print(f"Updated latest article: {posts[0]['title']}")
    return True


if __name__ == "__main__":
    changed = refresh()
    if os.environ.get("GITHUB_OUTPUT"):
        with open(os.environ["GITHUB_OUTPUT"], "a", encoding="utf-8") as output:
            output.write(f"changed={'true' if changed else 'false'}\n")
