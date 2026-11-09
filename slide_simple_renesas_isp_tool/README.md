# Simple Renesas ISP Tool 操作指南

Simple Renesas ISP Tool 提供 MCU 韌體更新與通訊測試功能。

- 網頁入口：<https://released.github.io/slide_simple_renesas_isp_tool/>
- 指南入口：`index.md`／`index.html`；完整章節位於各主題的 `.md`／`.html`。
- 共用版型：`/notices_can/assets/style.css`、`app.js`。

本站提供 Tool 連線、共用 BIN／metadata／log、Custom Transfer、CAN／串列 device App 更新、I2C 探索及 Misc Host App 更新。
公開導覽使用功能名稱；量測版本與雜湊由交付紀錄提供。
首頁 `ISP_MODE_NAV` 區分 Classical CAN（F13／F24／RH850）、CAN FD（F24／RH850）及 Custom Transfer 三種範例，僅提供操作跳轉。

## 主題頁

| 頁面 | 內容 |
| --- | --- |
| [下載與產物](downloads.html) | Tool、Host／Device 原始碼及適用的燒錄檔／更新 BIN |
| [連線與操作](operation.html) | COM、Host 識別、畫面、接線與更新政策 |
| [欄位與報告](status-and-reports.html) | 狀態、Metadata 判讀、更新確認、進度、取消與報告 |
| [CAN／CAN FD 更新](can-update.html) | Classical CAN F13／F24／RH850、CAN FD F24／RH850的App更新 |
| [CAN 逐層導讀](can-protocol.html) | Tool、MCU CAN host 與 MCU CAN device 的流程對照 |
| [串列 ISP 操作](serial-isp.html) | UART／Xmodem／I2C 與可調通訊設定 |
| [Custom Transfer](custom-transfer.html) | F13／F24／RH850 Classical CAN與F24／RH850 CAN FD的通訊測試 |
| [Host 韌體](host-firmware.html) | Misc 更新、Host 工程與向量設定 |
| [Device 工程入口](device-guides.html) | Boot／App、Metadata、IRQ 與移植的主題連結 |

每個主題頁保留自己的目錄，頁首可返回指南入口，頁尾提供上一／下一主題。
原首頁的章節網址由 `guide-map.json`／`guide-routes.js` 導向對應主題與錨點。

## 主題維護

編寫與驗收依據為 [公開文件編寫準則](PUBLIC_CONTENT_GUIDELINES_zh-TW.md)。
共用原稿位於 `/web` 根目錄，適用目前與未來各類 slide；此處為獨立 repository 的同步副本。
規範同步由 `/web/scripts/sync_public_content_guidelines.ps1` 維護，並可使用 `-CheckOnly` 檢查。

原稿位於 [Tool docs](https://github.com/released/simple_renesas_isp_tool/tree/main/docs)。
`scripts/web_guide_sections.json` 定義主題歸屬。
同步後，完整章節只保留在所屬頁面，其他頁面使用跳轉連結。

| 本站完整主題 | 原稿／同步腳本 |
| --- | --- |
| 四系列 UART／Xmodem／I2C 操作與 device 診斷 UART | ISP_UART_TOOL_GUIDE／sync_isp_uart_guide.ps1 |
| CAN FD 操作／64-byte資料幀 | CAN_FD_UPDATE 的 FD_UPDATE／sync_can_fd.ps1 |
| CAN FD Custom Transfer | CAN_FD_UPDATE 的 FD_TRANSFER／sync_can_fd.ps1 |
| 下載與操作入口 | MULTIBUS_TOOL_GUIDE 的 PUBLIC_RESOURCES／sync_public_resources.ps1 |
| Tool→MCU CAN host→MCU CAN device 逐層導讀 | CAN_UPDATE_WALKTHROUGH／sync_can_update_walkthrough.ps1 |
| Host App 工程與向量設定 | SHARED_CONSOLE_BRIDGE_GUIDE 的 F24_APP_IRQ／sync_f24_app_irq_guide.ps1 |
| COM／Device App／Host App 操作圖 | SHARED_CONSOLE_BRIDGE_GUIDE 的 TOOL_*_MEDIA／sync_tool_operation_media.ps1 |
| 更新政策與通訊速度 | COMMON_IMAGE_METADATA／sync_common_image_policy.ps1 |
| Custom Transfer 範例分類／操作入口／診斷 | MULTIBUS_TOOL_GUIDE 的 TRANSFER_EXAMPLES、TRANSFER_DIAGNOSTICS／sync_transfer_diagnostics.ps1 |
| F24 device Custom Transfer 操作圖 | MULTIBUS_TOOL_GUIDE 的 CUSTOM_TRANSFER_MEDIA／sync_custom_transfer_media.ps1 |

Device metadata／vector 編輯、各 device 工程、Boot decision、移植及逐 byte 參考集中於
[MCU CAN device 頁](https://released.github.io/slide_boot_loader_for_RL78/)。
App BIN 更新耗時參考也集中於該頁的 `#device-update-timing`，本頁保留跳轉入口，不複製量測表格。

修改原稿後執行同步及 `-CheckOnly`，同步相關 PDF。
操作圖原稿位於 Tool 的 `docs/images/tool_operation`；同步腳本同時核對三段說明與16張公開副本的 SHA-256。
F24 device 的更新報告與 UART counter 位於 `#f24-device-update-example`，正常 CAN App 更新流程已完成實板驗證。
頁面只使用遮蔽本機路徑的副本；圖片可點選開啟原尺寸。
Custom Transfer 的四張公開圖位於 Tool `docs/images/custom_transfer`，由專用同步腳本核對文字與圖片 SHA-256。
使用 `-WebRoot` 或 `FIRMWARE_WEB_ROOT` 指定網站 checkout 父目錄。

Tool 的 `scripts/web_guide_layout.json` 定義同步區塊的目的頁，原稿及區塊內容維持單一來源。
新增章節或穩定 anchor 後，維護對應頁面與配置，再執行
`node scripts/split_web_guides.mjs <WebRoot> --refresh` 更新書籤路由。
`--migrate` 僅用於首次移轉，不用於日常同步。
既有 PDF 原稿與首頁章節網址維持有效；分頁本身不改變技術契約。
分頁 renderer 位於共用 `notices_can/assets/app.js`，發佈時需與兩個指南一併同步。

## 預覽與檢查

以現有 HTTP server 預覽網站；renderer 使用 fetch，不採 file://。
執行 `scripts/verify_local.ps1 -PreviewBase <local URL> -ToolRoot <Tool checkout>`
檢查本機引用、章節連結、HTTP routes 與產品名稱，不綁定 build 版號。
瀏覽器／DPI 外觀及硬體測試分別記錄。

截圖與 log 先檢查個人路徑、序號及不必要資料，再依網站既有流程部署。
