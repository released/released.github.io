# RL78 MCU device Boot/App 指南

- 網頁入口：<https://released.github.io/slide_boot_loader_for_RL78/>
- 指南入口：`index.md`／`index.html`；完整章節位於各主題的 `.md`／`.html`。
- 共用版型：`notices_can/assets/style.css`、`app.js`。
- [App BIN 更新耗時比較](app-development.html#device-update-timing)：F13／F24 Classical CAN、F24 CAN FD。

本頁提供 MCU device 的 Boot/App 工程、metadata、vector、startup、Flash 與通訊協定說明。
F13 與 F24 各有獨立工程，概念流程使用 MCU CAN device 名稱；型號、位址與驅動差異列於工程表格。
Basic UART／I2C 範例的設定與來源集中於 [獨立範例頁](basic_uart_i2c/)；`basic_uart_i2c/index.md` 為索引，Flash／Startup、CRC、Driver、I²C、XMODEM 與 Boot／App 建置分為獨立主題頁。
該範例目錄內的 `legacy-routes.json` 保留原始章節網址。
`uart_i2c/` 保留轉址並延續章節錨點。
原首頁的章節網址由 `guide-map.json`／`guide-routes.js` 導向對應主題與錨點。
首頁模式導覽分為 Classical CAN（F13／F24）、CAN FD（F24）及 Custom Transfer 三種範例；僅提供工程及操作跳轉。

## 主題頁

| 頁面 | 內容 |
| --- | --- |
| [CAN device 工程](can-device.html) | F13／F24 Classical CAN、F24 CAN FD 與 Boot 啟動流程 |
| [App Metadata、IRQ 與更新耗時](app-development.html) | Metadata／IRQ C header、產表、建置、驗證、更新耗時與 CAN 速率 |
| [串列 ISP 共用契約](serial-device.html) | 平台配置、建置、Metadata、SC 與共用 Frame／命令／INFO／Status |
| [UART Bootloader 與協定格式](uart-device.html) | UART 接收、更新流程、封包範例與診斷 |
| [I2C Bootloader 與協定格式](i2c-device.html) | Slave mailbox、交易 bytes、STOP／NACK 與完成條件 |
| [Xmodem Bootloader 與協定格式](xmodem-device.html) | Framed control、CRC128 block、重送與最終 ACK |
| [移植與 Flash](porting.html) | 分區、Boot 安裝、debug monitor、Flash RAM 執行與 CRC |
| [格式參考](reference.html) | Flash address、全部 Metadata bytes 與 CAN payload |
| [Tool 主題入口](tool-guides.html) | 操作、更新、報告、Host 與 Custom Transfer 的連結 |

每個主題頁保留自己的目錄，頁首可返回指南入口，頁尾提供上一／下一主題。
圖片沿用本站相對路徑，完整技術內容只保留於所屬主題。
每頁的「本頁主題」提供相同章節的RH850跳轉；欄位與位址由各平台工程的規格說明。

## 主題維護

編寫與驗收依據為 [公開文件編寫準則](PUBLIC_CONTENT_GUIDELINES_zh-TW.md)。
共用原稿位於 `/web` 根目錄，適用目前與未來各類 slide；此處為獨立 repository 的同步副本。
規範同步由 `/web/scripts/sync_public_content_guidelines.ps1` 維護，並可使用 `-CheckOnly` 檢查。

原稿位於 [Tool docs](https://github.com/released/simple_renesas_isp_tool/tree/main/docs)。
同步腳本的主題歸屬由 `scripts/web_guide_sections.json` 定義：完整內容只保留在所屬頁面，其他頁面產生簡短跳轉連結。
`index.md` 的 `DEVICE_MODE_NAV` 為本站首頁導覽，連到上述原稿所屬章節，不另放完整教學。

| 本站完整主題 | 原稿／同步腳本 |
| --- | --- |
| 四系列串列共用工程、Metadata 與封包 | ISP_UART_DEVICE_DESIGN／sync_isp_uart_guide.ps1 |
| UART／I2C／Xmodem 各自 Boot／Protocol Format | ISP_SERIAL_TRANSPORT_GUIDE／serial_guide_content.mjs／sync_rh850_device.ps1；兩平台共用章節定義 |
| CAN FD device timing／工程／產物 | CAN_FD_UPDATE 的 FD_DEVICE／sync_can_fd.ps1 |
| Device Metadata／App IRQ C header 編輯與建置 | DEVICE_METADATA_VECTOR_WORKSHOP／sync_device_workshop.ps1 |
| Device CAN 速率／Boot-App ISR 所有權／App counter | 同一 workshop 的 device-can-bitrate／device-irq-ownership／device-app-runtime-log |
| App BIN 大小與更新耗時實測 | 同一 workshop 的 device-update-timing；ISP 頁僅放跳轉連結 |
| F13 Boot decision／ENTER／逾時 | F13_BOOT_UPDATE_FLOW／sync_f13_boot_decision.ps1 |
| F24 device 工程 | F24_CAN_DEVICE_DESIGN／sync_f24_device_design.ps1 |
| Boot/App 移植 | RL78_BOOT_APP_PORTING_GUIDE／sync_rl78_porting_guide.ps1 |
| Basic／golden sample 對照、Flash RAM 執行、CRC 後端 | 同一 porting guide 的 basic-vs-golden／flash-ram-execution／crc-backends |
| Boot 安裝／debug monitor／119、247 KiB 與滿容量限制 | 同一 porting guide 的 device-debug-monitor；Tool operation 僅放提醒與跳轉 |
| Flash／metadata 全部 byte／CAN frame | FLASH_METADATA_CAN_FRAME_GUIDE／sync_flash_reference.ps1 |

Tool 操作、Custom Transfer、CAN 更新逐層導讀、Host App 工程、下載及更新政策集中於
[ISP Tool 頁](https://released.github.io/slide_simple_renesas_isp_tool/)。

修改原稿後執行同步及 `-CheckOnly`，同步相關 PDF。
使用 `-WebRoot` 或 `FIRMWARE_WEB_ROOT` 指定網站 checkout 父目錄。
ISP Tool 的 `scripts/verify_local.ps1` 檢查本機引用與章節連結。

Tool 的 `scripts/web_guide_layout.json` 定義每個同步區塊的目的頁；同步腳本不再寫回首頁。
新增章節或穩定 anchor 後，維護對應頁面與配置，再執行
`node scripts/split_web_guides.mjs <WebRoot> --refresh` 更新書籤路由。
`--migrate` 僅用於未拆頁來源的首次移轉，不用於日常同步。
`verify_web_guide_layout.mjs` 檢查區塊歸屬、入口長度、路由與資源；瀏覽器檢查另核對實際目的錨點。

共用 renderer 位於 `notices_can/assets/app.js`；`data-markdown` 指定主題原稿，未設定時仍讀 `index.md`。
發佈此分頁結構時，共用 renderer 與兩個指南 repository 需一併同步。
既有 PDF 仍由原稿產生，沿用的首頁章節網址可經書籤路由到達完整內容。
