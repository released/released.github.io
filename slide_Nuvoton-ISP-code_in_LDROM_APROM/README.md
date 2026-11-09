# Nuvoton LDROM / APROM ISP 指南

本頁整理 Nuvoton M2A23 的 UART ISP 自訂流程；boot code 分布於 LDROM 與 APROM 尾端，application 使用其餘 APROM 空間。

- 發布頁面：<https://released.github.io/slide_Nuvoton-ISP-code_in_LDROM_APROM/>
- 可編輯內容：`index.md`
- 網頁入口：`index.html`
- 共用版型：`notices_can/assets/style.css` 與 `notices_can/assets/app.js`

## 內容範圍

- LDROM、APROM application 與 APROM boot extension 的 Flash layout。
- boot decision、UART image transfer、erase、program、verify 與 reset 流程。
- 分段 boot image、application image、scatter file 與 Keil build target。
- SRecord 的 binary merge、填值與 CRC32 產生方式。
- ICP 初始燒錄、ISP application 更新與雙 UART 分流。

## 參考工程

- [M2A23BSP_ISP_UART_APROM](https://github.com/released/M2A23BSP_ISP_UART_APROM)

正文保留工程中的位址、checksum 範圍、工具畫面與輸出檔案關係。`0x1E000` 等數值屬於參考工程配置，不是所有 M2A23 專案的固定邊界；實際配置需與目標型號、CONFIG、scatter file、map file 及輸出映像一致。
