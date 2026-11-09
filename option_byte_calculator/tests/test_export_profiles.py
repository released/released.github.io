import importlib.util
import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
EXPORTER = ROOT / "tools" / "export_profiles.py"


class ProfileExportTests(unittest.TestCase):
    def test_export_is_deterministic_and_current(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            subprocess.run(
                [sys.executable, str(EXPORTER), "--output-dir", temp_dir],
                check=True,
                capture_output=True,
                text=True,
            )
            for name in ("rl78-profiles.json", "rh850-profiles.json"):
                expected = (ROOT / "data" / name).read_text(encoding="utf-8")
                actual = (Path(temp_dir) / name).read_text(encoding="utf-8")
                self.assertEqual(actual, expected, name)

    def test_exporter_has_no_runtime_web_dependency(self):
        spec = importlib.util.spec_from_file_location("profile_exporter", EXPORTER)
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        self.assertTrue(callable(module.export_family))

    def test_catalog_schema(self):
        for family in ("rl78", "rh850"):
            path = ROOT / "data" / f"{family}-profiles.json"
            catalog = json.loads(path.read_text(encoding="utf-8"))
            self.assertEqual(catalog["schema_version"], 1)
            self.assertEqual(set(catalog["model_order"]), set(catalog["profiles"]))


if __name__ == "__main__":
    unittest.main()
