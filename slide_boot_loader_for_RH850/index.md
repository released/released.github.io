<!-- GUIDE_OVERVIEW -->
[知識庫首頁](https://released.github.io/) · [RL78 Bootloader](../slide_boot_loader_for_RL78/)

<a id="article_top"></a>

# RH850 Bootloader 實作指南

本指南說明 Device Boot／App 的架構、通訊機制、映像與移植。使用 Tool 更新 App 見 [ISP Tool 操作](../slide_simple_renesas_isp_tool/)。

<a id="boot-interfaces"></a>

## 依介面進入主題

各介面頁頂端提供 MCU 工程與實驗索引；可直接前往指定 MCU 的配置及對應紀錄。

<!-- RH850_MODE_NAV_BEGIN -->
| 介面 | Bootloader、MCU 與實驗入口 | Tool 操作 |
| --- | --- | --- |
| CAN | [機制與 MCU 索引](can-device.html) | [操作步驟](../slide_simple_renesas_isp_tool/can-update.html) |
| CAN FD | [機制與 MCU 索引](can-fd-device.html) | [操作步驟](../slide_simple_renesas_isp_tool/can-fd.html) |
| I2C | [機制與 MCU 索引](i2c-device.html)／[流程](i2c-device.html#i2c-boot-flow)／[格式](i2c-device.html#i2c-protocol) | [操作步驟](../slide_simple_renesas_isp_tool/i2c.html) |
| UART | [機制與 MCU 索引](uart-device.html)／[流程](uart-device.html#uart-boot-flow)／[格式](uart-device.html#uart-protocol) | [操作步驟](../slide_simple_renesas_isp_tool/uart.html) |
| Xmodem | [機制與 MCU 索引](xmodem-device.html)／[流程](xmodem-device.html#xmodem-boot-flow)／[格式](xmodem-device.html#xmodem-protocol) | [操作步驟](../slide_simple_renesas_isp_tool/xmodem.html) |
<!-- RH850_MODE_NAV_END -->

## 依開發目的查閱

| 目的 | 直接入口 |
| --- | --- |
| 理解整體規劃與 Boot／App 交接 | [整體架構與流程圖](architecture.html) |
| 編輯映像資訊或增加 IRQ | [Metadata 與 IRQ](app-development.html) |
| 解讀 Metadata bytes／封包欄位 | [逐 byte 格式與範例](reference.html)／[串列共用契約](serial-device.html) |
| 移植到其他板子、修改 Flash backend | [Boot／App 移植與 Flash](porting.html) |
| 查看實驗條件、耗時與報告 | [各介面實驗資料](experiments.html) |
| 使用 Tool、安裝映像或確認結果 | [Tool 操作入口](tool-guides.html) |
