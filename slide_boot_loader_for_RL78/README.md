# RL78 Bootloader 實作指南

[網頁指南](https://released.github.io/slide_boot_loader_for_RL78/)

依介面選擇主題；各介面都有獨立連結。MCU 配置與實板紀錄由介面頁的索引直接進入。

| 介面 | 直接入口 |
| --- | --- |
| CAN | [CAN Bootloader 與工程](can-device.html) |
| CAN FD | [CAN FD Bootloader 與工程](can-fd-device.html) |
| I2C | [I2C Bootloader 與協定格式](i2c-device.html) |
| UART | [UART Bootloader 與協定格式](uart-device.html) |
| Xmodem | [Xmodem Bootloader 與協定格式](xmodem-device.html) |

## 依閱讀目的查閱

- [整體架構、流程圖與 Boot／App 交接](architecture.html)
- [App Metadata 與 IRQ 設定](app-development.html)
- [Boot／App 移植與 Flash](porting.html)
- [逐 byte Metadata 與封包參考](reference.html)
- [實驗條件、耗時及報告](experiments.html)
- [ISP Tool 操作](../slide_simple_renesas_isp_tool/)

## 內容來源與維護

原稿與同步入口由 [Tool 專案](https://github.com/released/simple_renesas_isp_tool/tree/main/docs)維護。完整主題只保留一個位置，其他頁面提供連結。舊章節網址由 `guide-map.json`／`guide-routes.js` 導向對應內容。

三份指南共用網站根目錄的 `assets/app.js`／`assets/style.css`。章節配置由 Tool 的 `scripts/web_guide_layout.json` 管理，`sync_rh850_device.ps1` 與既有各主題同步入口更新內容，`-CheckOnly` 檢查來源一致性。發布檢查不會自動產生內容。

[公開文件編寫準則](PUBLIC_CONTENT_GUIDELINES_zh-TW.md)。工程存在、可用介面與實板驗證範圍分別判讀；本機文件檢查不代表硬體驗證。
