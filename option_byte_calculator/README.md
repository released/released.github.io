# Renesas Option Byte Calculator

Static GitHub Pages application for decoding and generating audited RL78 and RH850 option-byte values.

## Published Pages

- RL78: <https://released.github.io/option_byte_calculator/rl78/>
- RH850: <https://released.github.io/option_byte_calculator/rh850/>

## Features

- Model-specific profiles generated from the desktop calculator sources.
- Bidirectional HEX and bit-checkbox editing.
- Current field decode and complete combination tables.
- Fixed/reserved bit enforcement and prohibited-combination warnings.
- RL78 `C0C1C2` MSB order and optional C4 handling.
- RL78 catalog coverage: 37 selectable profiles covering all 40 audited products, including a separate I1C 512 KB profile.
- RH850 32-bit OPBT numeric order without implicit byte swapping.
- Responsive, dependency-free browser UI suitable for GitHub Pages.

## Source of Truth

Profile definitions are not maintained by hand in this repository:

- RL78: desktop authoring folder `__RL78_Option_Byte/option_profiles.py`.
- RH850: desktop authoring folder `__RH850_Option_Byte/option_profiles.py`.

Regenerate committed browser data after changing either desktop profile:

```powershell
py .\tools\export_profiles.py --rl78-source ..\__RL78_Option_Byte --rh850-source ..\__RH850_Option_Byte
```

This example places both desktop authoring folders beside this checkout. The
exporter accepts `--rl78-source`, `--rh850-source`, and `--output-dir` for other
locations. Published data in `data/` is sufficient for browser operation; the
authoring folders are needed only when regenerating profiles.

## Local Preview

ES modules and JSON fetches require HTTP rather than opening the HTML through `file://`:

```powershell
py -m http.server 8000
```

Then open <http://localhost:8000/>.

## Verification

```powershell
py .\tools\export_profiles.py
py -m unittest discover -s tests -p "test_*.py" -v
npm test
npm run check
npm run smoke
```

`npm run smoke` uses an installed Chrome or Edge browser and verifies both calculators at a real 390 px viewport.

The RL78 checks select all 37 profiles, verify every exported initial value, and confirm that C4 appears only on F22/F25 and F23/F24.

## Deployment

GitHub Pages serves the `gh-pages` branch. The root `github_push.bat --check`
previews this repository; `github_push.bat` confirms and publishes it through
the shared web publisher. `WEB_PUBLISH_ROOT` can select another shared-publisher
location.
