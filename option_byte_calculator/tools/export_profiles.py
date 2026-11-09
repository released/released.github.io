"""Export desktop Option Byte profiles to deterministic browser JSON files."""

import argparse
import importlib.util
import json
from pathlib import Path


REPOSITORY_ROOT = Path(__file__).resolve().parents[1]
# Locate the existing sibling Python sources after website consolidation.
SOURCE_CODE_ROOT = next(
    (parent for parent in REPOSITORY_ROOT.parents if (parent / "python").is_dir()),
    REPOSITORY_ROOT.parent,
)


def load_profile_module(source_dir, module_name):
    module_path = source_dir / "option_profiles.py"
    if not module_path.is_file():
        raise FileNotFoundError(f"Profile module not found: {module_path}")

    spec = importlib.util.spec_from_file_location(module_name, module_path)
    if spec is None or spec.loader is None:
        raise ImportError(f"Unable to load profile module: {module_path}")

    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def export_family(family, source_dir, output_path):
    module = load_profile_module(source_dir, f"{family.lower()}_option_profiles")
    payload = {
        "schema_version": 1,
        "family": family,
        "model_order": module.MODEL_ORDER,
        "profiles": module.PROFILES,
    }

    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    return output_path


def parse_args():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--rl78-source",
        type=Path,
        default=SOURCE_CODE_ROOT / "python" / "__RL78_Option_Byte",
    )
    parser.add_argument(
        "--rh850-source",
        type=Path,
        default=SOURCE_CODE_ROOT / "python" / "__RH850_Option_Byte",
    )
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=REPOSITORY_ROOT / "data",
    )
    return parser.parse_args()


def main():
    args = parse_args()
    outputs = [
        export_family("RL78", args.rl78_source.resolve(), args.output_dir / "rl78-profiles.json"),
        export_family("RH850", args.rh850_source.resolve(), args.output_dir / "rh850-profiles.json"),
    ]
    for output in outputs:
        print(output)


if __name__ == "__main__":
    main()
