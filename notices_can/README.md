# notices_can

CAN / CAN FD knowledge base for GitHub Pages.

- Published page: <https://released.github.io/notices_can/>
- Related protocol: <https://released.github.io/notices_can_uds/>
- Editable source: `index.md`
- Entry page: `index.html`

UDS, ISO-TP, diagnostic services, and ECU bootloader material are maintained in
the separate `notices_can_uds` knowledge base.

The shared `assets/app.js` renderer also serves the RL78 Bootloader/ISP guides.
An optional body `data-markdown` attribute selects a chapter file;the default
remains `index.md`. After rendering,it emits `guide:ready` so guide-owned
navigation can resolve cross-chapter links without copying technical content.

The canonical runtime contract is `2.0`. Explicit workspace synchronization
projects the same JavaScript and CSS into the hub and UDS repositories.
`web-site.json` records reader routes and required asset hashes; publication
checks are read-only and do not regenerate content. The runtime includes
viewport-aware navigation, lazy image loading, full-size image viewing and
independent Mermaid error recovery.
