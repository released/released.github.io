# Secure Boot 原理、金鑰與安全更新

圖解內容涵蓋信任根、映像驗證、金鑰、打包、安全更新與恢復，並以 Nuvoton M480、Renesas RA／RX 作案例。

- 入口：`index.html`；可編輯原稿：`index.md`。
- 網站路徑：`/slide_secure_boot_fundamentals/`。
- 12 章、24 個閱讀單元；關鍵原理就近附官方公開來源。
- 流程圖：原稿內 Mermaid；完整尺寸 SVG 位於 `assets/diagrams/`。
- 互動：以瀏覽器 Web Crypto 執行 SHA-256／ECDSA P-256 示範，對照合法映像、修改內容及錯誤簽署金鑰。
- 工具實作：[M480 Secure Boot ISP 操作指南](https://released.github.io/slide_Nuvoton_secure_boot_operation_M480/)。

## 預覽與維護

在 `/web` 根目錄執行：

```powershell
python -m http.server 8768 --bind 127.0.0.1 --directory .
```

瀏覽 `http://127.0.0.1:8768/slide_secure_boot_fundamentals/`。

- 頁面沿用 `/notices_can/assets/` 共用版型與固定版本的 Markdown／Mermaid CDN。
- 互動示範需要 HTTPS 或 localhost 安全環境及支援 Web Crypto 的瀏覽器。

圖表維護流程：

1. 更新 Mermaid 原稿後，同步輸出 SVG 與 `assets/diagrams/manifest.json`。
2. 執行 `scripts/verify_publish.ps1` 檢查對應關係；該檢查不產生檔案。

## 資料來源

- 正文使用官方公開文件，並標示型號／版本適用範圍。
- 所有機制圖均自行繪製；公開內容不收錄內部訓練 PDF、個人路徑或實際產品金鑰。
- 互動產生的示範金鑰只存在本次頁面記憶體中。
