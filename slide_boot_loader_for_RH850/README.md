# RH850 Bootloader 實作指南

[App BIN 更新耗時比較](app-development.html#rh850-update-timing) 提供 Classical CAN／CAN FD 各 BIN 大小的實測時間。

網頁入口為 `index.html`；每個主題有自己的 Markdown、網頁與目錄。
內容以 R7F701684 EVM 的獨立 Boot／App／Custom Transfer 工程為例，涵蓋 Classical CAN、CAN FD 與串列 ISP。
工程使用 C header、CS+／CC-RH 與 Windows PowerShell；文件產生工具不屬於 MCU 工程的建置需求。

| 主題 | 內容 |
| --- | --- |
| [CAN device 工程](can-device.html) | EVM、CAN1／CAN4、CAN RAM、更新 owner 與啟動流程 |
| [App Metadata、IRQ 與更新耗時](app-development.html) | App 發行設定、Metadata、512-entry IRQ table、建置及實測更新時間 |
| [串列 ISP 共用契約](serial-device.html) | 平台配置、建置、Metadata、SC 與共用 Frame／命令／INFO／Status |
| [UART Bootloader 與協定格式](uart-device.html) | UART 接收、更新流程、封包範例與診斷 |
| [I2C Bootloader 與協定格式](i2c-device.html) | Slave mailbox、交易 bytes、STOP／NACK 與完成條件 |
| [Xmodem Bootloader 與協定格式](xmodem-device.html) | Framed control、CRC128 block、重送與最終 ACK |
| [移植與 Flash](porting.html) | Flash／RAM mapping、HAL／custom_func、FCL RAM 執行與交接 |
| [格式參考](reference.html) | Metadata 全部256 bytes、位址換算與 CAN frame |
| [Tool 操作入口](tool-guides.html) | 共用 ISP 操作、Custom Transfer、完成確認與更新報告 |

[RL78 Bootloader](../slide_boot_loader_for_RL78/) 保留 RL78 工程的獨立說明。
每頁的「本頁主題」提供同一章節的 RL78 跳轉；章節與對照主題使用共用導覽定義，數值與程式以本平台為準。
跨平台的 Tool 連線、操作與報告集中於 [ISP Tool 指南](../slide_simple_renesas_isp_tool/)。

## 來源與維護

編寫依據為 [共用公開文件準則](PUBLIC_CONTENT_GUIDELINES_zh-TW.md)。
章節原稿位於 Tool 的 `docs/RH850_*`；`scripts/sync_rh850_device.ps1` 同步完整章節及其他指南的短連結。
`-WebRoot` 指定網站 checkout 的父目錄，`-CheckOnly` 為唯讀核對。
維護者的網頁產生流程沿用 Node 與既有 renderer，不影響 MCU 的建置環境。

UART／I2C／Xmodem 的傳輸原稿為 Tool `docs/ISP_SERIAL_TRANSPORT_GUIDE_zh-TW.md`。
`serial_guide_content.mjs` 將它投影到兩平台的獨立頁，平台腳位、分區與 IRQ 留在各自共用工程章節。
`prepare_serial_guide_pdf.mjs` 組合相同原稿與平台資料，再沿用既有 PDF renderer 產生完整串列指南。

量測摘要保留來源報告檔名、SHA256、實際輸入大小、分階段與總耗時，以及完成／診斷結果。
Metadata bytes 範例與更新耗時的輸入分別標示來源；工程 BIN 範例不作為其他容量的量測結果。
維護來源為 `docs/data/rh850_update_timing` 與 `docs/data/rh850_image_example.json`，網站副本位於 `data`。
一般同步使用已保存的量測摘要；加入已核對的新報告時，對 `sync_rh850_device.ps1` 指定
`-ReportName 'update_YYYYMMDD_HHMMSS_example.json'`（檔名須存在於 Tool 的 `build/reports`）。
可傳入多個檔名；`-CheckOnly` 只核對、不寫檔。測試期間產生的其他報告不會自動匯入。
需要更新 bytes 範例時，維護者以 `FIRMWARE_RH850_FD_APP_PROJECT` 指向既有 FD App 工程；未指定時使用保存的範例快照。

共用樣式與 Markdown／Mermaid renderer 使用 `/notices_can/assets/`。
`guide-map.json`／`guide-routes.js` 維護穩定章節網址；標題調整時保留既有 anchor。
`scripts/verify_local.ps1` 執行網站檔案、連結與主題檢查；瀏覽器與 PDF 的視覺檢查另行記錄。
