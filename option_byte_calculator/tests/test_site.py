import unittest
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse


ROOT = Path(__file__).resolve().parents[1]


class AssetParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.assets = []
        self.ids = set()

    def handle_starttag(self, tag, attrs):
        attributes = dict(attrs)
        if "id" in attributes:
            self.ids.add(attributes["id"])
        for name in ("href", "src"):
            if name in attributes:
                self.assets.append(attributes[name])


class StaticSiteTests(unittest.TestCase):
    def test_html_assets_exist(self):
        for relative in ("index.html", "rl78/index.html", "rh850/index.html"):
            path = ROOT / relative
            parser = AssetParser()
            parser.feed(path.read_text(encoding="utf-8"))
            for asset in parser.assets:
                parsed = urlparse(asset)
                if parsed.scheme or asset.startswith("#"):
                    continue
                target = (path.parent / parsed.path).resolve()
                self.assertTrue(target.exists(), f"{relative}: {asset}")

    def test_calculator_pages_expose_required_mount_points(self):
        required = {
            "model-select",
            "model-reference",
            "hex-inputs",
            "input-status",
            "word-summary",
            "word-tabs",
            "word-panel",
            "warning-list",
            "model-notes",
        }
        for relative in ("rl78/index.html", "rh850/index.html"):
            parser = AssetParser()
            parser.feed((ROOT / relative).read_text(encoding="utf-8"))
            self.assertTrue(required.issubset(parser.ids), relative)


if __name__ == "__main__":
    unittest.main()
