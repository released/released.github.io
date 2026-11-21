<!-- GUIDE_OVERVIEW -->
[知識庫首頁](https://released.github.io/) · [RL78 Bootloader](../slide_boot_loader_for_RL78/) · [RH850 Bootloader](../slide_boot_loader_for_RH850/)

<a id="article_top"></a>

# Simple Renesas ISP Tool 操作指南

透過 MCU bridge 使用 CAN、CAN FD、I2C、UART 或 Xmodem 更新 Device App，並執行各介面的通訊測試。

[第一次使用：下載](downloads.html) → [連接並識別 Host](operation.html#tool-operation) → 選擇下列介面。

<a id="tool-interfaces"></a>

## 依介面選擇操作

<!-- ISP_MODE_NAV_BEGIN -->
| 介面 | Tool 操作 | MCU 工程與實驗資料 |
| --- | --- | --- |
| CAN | [設定、更新與通訊測試](can-update.html) | [RL78](../slide_boot_loader_for_RL78/can-device.html)／[RH850](../slide_boot_loader_for_RH850/can-device.html) |
| CAN FD | [設定、更新與通訊測試](can-fd.html) | [RL78](../slide_boot_loader_for_RL78/can-fd-device.html)／[RH850](../slide_boot_loader_for_RH850/can-fd-device.html) |
| I2C | [設定、更新與通訊測試](i2c.html) | [RL78](../slide_boot_loader_for_RL78/i2c-device.html)／[RH850](../slide_boot_loader_for_RH850/i2c-device.html) |
| UART | [設定、更新與通訊測試](uart.html) | [RL78](../slide_boot_loader_for_RL78/uart-device.html)／[RH850](../slide_boot_loader_for_RH850/uart-device.html) |
| Xmodem | [設定、更新與通訊測試](xmodem.html) | [RL78](../slide_boot_loader_for_RL78/xmodem-device.html)／[RH850](../slide_boot_loader_for_RH850/xmodem-device.html) |
<!-- ISP_MODE_NAV_END -->

## 共用功能

| 主題 | 直接入口 |
| --- | --- |
| BIN／live 欄位、完成與錯誤判讀 | [欄位與報告](status-and-reports.html) |
| I2C／UART／Xmodem 接線與共用更新流程 | [串列共用操作](serial-isp.html) |
| CAN 通訊測試 | [Custom Transfer](custom-transfer.html) |
| Tool、Host、Device 的資料流 | [CAN 協定逐層導讀](can-protocol.html) |
| 更新 bridge 自己的 Host App | [Misc／Host 自身更新](host-firmware.html) |
| Bootloader 架構、Metadata、IRQ 與移植 | [RL78](../slide_boot_loader_for_RL78/)／[RH850](../slide_boot_loader_for_RH850/) |

工程存在、支援的更新介面與實板驗證範圍分開判讀；各型號的配置與紀錄由 MCU 指南集中說明。

<!-- RH850_DEVICE_BEGIN -->
<a id="rh850-can-device"></a>

## 其他 MCU 指南

[其他 MCU 指南](https://released.github.io/slide_boot_loader_for_RH850/index.html#boot-interfaces)
<!-- RH850_DEVICE_END -->
