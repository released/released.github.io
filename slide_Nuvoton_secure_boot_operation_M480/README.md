# M480 Secure Boot ISP 更新指南

說明 M480 Secure Boot／Secure ISP 的金鑰配置、範例程式與韌體更新流程。

- 可編輯原稿：`index.md`。
- 網頁入口：`index.html`。
- 網站路徑：`/slide_Nuvoton_secure_boot_operation_M480/`；知識庫首頁的 Nuvoton 平台專題提供入口。
- 共用版型：`../notices_can/assets/style.css`、`../notices_can/assets/app.js`。
- 網站圖片：`assets/screenshots/`；來源與處理方式見 `assets/screenshots/manifest.json`。
- 完整尺寸流程圖：`assets/diagrams/`；由原稿的三張 Mermaid 圖同步輸出。
- 範例支援範圍與限制：[驗證範圍](index.md#verification)。

## 內容範圍

- Secure Boot 開機驗證，以及更新時 SecureBootTool／MCU 的分工。
- ICP 的 Boot Loader／Security Lock、Secure Boot key 與 KPROM 配置。
- SecureBootTool 的 Waiting／Loading、認證及 Key Options。
- 專用 LDROM 與 APROM／SRAM 兩份範例的建置與更新流程。
- SW2／KEY1（UART0 數字 `1`）觸發方式。

- 專用 LDROM 的 SW2 更新循環與 APROM／SRAM 範例均有實機測試回報。
- 兩份範例均提供 SW2／KEY1 入口；個別入口、版本往返、映像保留與故障恢復的覆蓋範圍見[驗證範圍](index.md#verification)。

範例的頁內說明分別位於 `index.md#ldrom-example` 與 `index.md#sram-example`；共用按鍵／terminal 設定在 `#entry-triggers`，SRAM 完整操作在 `#sram-operation`。

## 本機預覽

在 `/web` 根目錄執行：

```powershell
python -m http.server 8768 --bind 127.0.0.1 --directory .
```

瀏覽 `http://127.0.0.1:8768/slide_Nuvoton_secure_boot_operation_M480/`。
由於入口會 fetch Markdown 並載入根路徑的共用資源，使用 HTTP 預覽，不以檔案總管直接開啟 HTML。
Markdown 與 Mermaid 使用與既有站點相同的固定版本 CDN，預覽需要能連線取得這些資源。

## 素材與資料範圍

- `img/` 保留原始素材，可能含個人路徑；`.gitignore` 排除此資料夾。
- 頁面只引用 `assets/screenshots/` 的審閱版本；個人路徑與識別資料需遮蔽。
- 公開範例金鑰用於對照兩套工具輸入；實際產品金鑰不收錄於一般診斷資料。

圖片內的檔案大小、配置與 retry 參數為畫面示意，正式產品以其建置／部署紀錄為準。
