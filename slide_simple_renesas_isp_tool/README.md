# Simple Renesas ISP Tool 與 MCU bridge 操作

[網頁指南](https://released.github.io/slide_simple_renesas_isp_tool/)

依介面選擇主題；各介面都有獨立連結。Tool 操作與 MCU 工程資料分開維護。

| 介面 | 直接入口 |
| --- | --- |
| CAN | [CAN 操作](can-update.html) |
| CAN FD | [CAN FD 操作](can-fd.html) |
| I2C | [I2C 操作](i2c.html) |
| UART | [UART 操作](uart.html) |
| Xmodem | [Xmodem 操作](xmodem.html) |

## 依閱讀目的查閱

- [下載與韌體產物](downloads.html)
- [連接及識別 Host](operation.html)
- [串列共用接線與更新流程](serial-isp.html)
- [完成、取消、錯誤與報告](status-and-reports.html)
- [RL78 工程與實驗資料](../slide_boot_loader_for_RL78/)
- [RH850 工程與實驗資料](../slide_boot_loader_for_RH850/)

## 內容來源與維護

原稿與同步入口由 [Tool 專案](https://github.com/released/simple_renesas_isp_tool/tree/main/docs)維護。完整主題只保留一個位置，其他頁面提供連結。舊章節網址由 `guide-map.json`／`guide-routes.js` 導向對應內容。

三份指南共用網站根目錄的 `assets/app.js`／`assets/style.css`。章節配置由 Tool 的 `scripts/web_guide_layout.json` 管理，`sync_rh850_device.ps1` 與既有各主題同步入口更新內容，`-CheckOnly` 檢查來源一致性。發布檢查不會自動產生內容。

[公開文件編寫準則](PUBLIC_CONTENT_GUIDELINES_zh-TW.md)。工程存在、可用介面與實板驗證範圍分別判讀；本機文件檢查不代表硬體驗證。
