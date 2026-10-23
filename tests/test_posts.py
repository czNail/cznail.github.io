import importlib.util
import json
import tempfile
import unittest
from pathlib import Path

spec = importlib.util.spec_from_file_location("refresh_posts", Path(__file__).resolve().parents[1] / "scripts/refresh-posts.py")
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


def item(title="最新文章", path="new", date="Sun, 18 Oct 2026 16:00:00 GMT", description="文章 &amp; 简介"):
    return f"<item><title>{title}</title><link>https://cznail.github.io/my-blog/posts/{path}/</link><pubDate>{date}</pubDate><description>{description}</description></item>"


def feed(*items):
    return ("<rss><channel>" + "".join(items) + "</channel></rss>").encode()


class PostsTests(unittest.TestCase):
    def test_publication_order_wins_over_modification_date(self):
        posts = module.parse_posts(feed(item(), item("旧文章修订", "old", "Wed, 21 Oct 2026 16:00:00 GMT")))
        self.assertEqual(posts[0]["title"], "最新文章")
        self.assertEqual(posts[0]["date"], "2026-10-19")
        self.assertEqual(posts[0]["description"], "文章 & 简介")

    def test_duplicates_invalid_dates_and_external_links_are_excluded(self):
        xml = feed(item(), item(), item(path="bad", date="invalid"), item(path="external").replace("cznail.github.io", "example.com"), item(path="two"), item(path="three"), item(path="four"))
        posts = module.parse_posts(xml)
        self.assertEqual([post["url"].split("/")[-2] for post in posts], ["new", "two", "three"])

    def test_plain_text_and_cdata(self):
        post = module.parse_posts(feed(item(description="<![CDATA[<p>SQL &amp; 系统设计</p>]]>")))[0]
        self.assertEqual(post["description"], "SQL & 系统设计")

    def test_failures_preserve_last_verified_snapshot_and_new_feed_replaces_it(self):
        with tempfile.TemporaryDirectory() as directory:
            target = Path(directory) / "posts.json"
            old = [{"title": "上次文章"}]
            target.write_text(json.dumps(old), encoding="utf-8")
            original = target.read_bytes()
            for xml in (b"broken", feed(), b'<!DOCTYPE rss [<!ENTITY x "bad">]><rss/>'):
                self.assertFalse(module.refresh(target, lambda: xml))
                self.assertEqual(target.read_bytes(), original)
            self.assertTrue(module.refresh(target, lambda: feed(item())))
            self.assertEqual(json.loads(target.read_text())[0]["title"], "最新文章")
            self.assertFalse(module.refresh(target, lambda: feed(item())))


if __name__ == "__main__":
    unittest.main()
