<!-- GUIDE_OVERVIEW -->
[知識庫首頁](https://released.github.io/)

<a id="article_top"></a>

# Simple Renesas ISP Tool 與 MCU bridge 操作

Simple Renesas ISP Tool 提供 MCU 韌體更新與通訊測試功能。
透過 MCU bridge 連接 device，依需求選擇下載、操作、更新或通訊驗證。
Device Boot／App 開發見 [RL78 Bootloader](../slide_boot_loader_for_RL78/)／[RH850 Bootloader](../slide_boot_loader_for_RH850/)。

## 依操作目的查閱

| 目的 | 直接入口 |
| --- | --- |
| 連接Host及核對BIN | [連線與畫面](operation.html#tool-operation)／[BIN欄位](status-and-reports.html#tool-ui-fields) |
| 更新Device App | [CAN／CAN FD](can-update.html)／[UART／Xmodem／I2C](serial-isp.html#serial-device-operation) |
| 檢查完成結果與報告 | [完成提示與下一步](status-and-reports.html#update-completion)／[Firmware update report](status-and-reports.html#update-html-report) |
| 驗證資料傳輸 | [CAN Custom Transfer](custom-transfer.html#custom-transfer)／[串列Transfer](serial-isp.html#serial-device-operation) |
| 更新Host App | [Misc操作](host-firmware.html#host-bridge-firmware) |

## 主題指南

| 主題 | 內容 |
| --- | --- |
| [下載與韌體產物](downloads.html) | Tool、Host 與 Device 原始碼、安裝檔及更新 BIN。 |
| [Tool 連線與操作](operation.html) | COM／Host 識別、畫面、接線、更新政策與錯誤資訊。 |
| [欄位、更新確認與報告](status-and-reports.html) | BIN／live 資料、狀態訊息、進度、取消及 HTML 更新報告。 |
| [CAN／CAN FD App 更新](can-update.html) | Classical CAN：F13／F24／RH850；CAN FD：F24／RH850。 |
| [CAN 更新逐層導讀](can-protocol.html) | 對照 Tool、MCU CAN host 與 MCU CAN device 的資料流。 |
| [UART／Xmodem／I2C 操作](serial-isp.html) | 接線、可調通訊設定、App 更新及串列通訊測試。 |
| [Custom Transfer 通訊驗證](custom-transfer.html) | F13／F24／RH850 Classical CAN，以及F24／RH850 CAN FD的獨立通訊測試。 |
| [MCU host 韌體與自身更新](host-firmware.html) | Misc／UART 更新 Host App，以及 Host 工程與向量設定。 |
| [MCU device 工程入口](device-guides.html) | Boot／App、Metadata、IRQ 與移植的主題連結。 |

## CAN 範例分類

<!-- ISP_MODE_NAV_BEGIN -->
| 分類 | MCU device 範例 | 操作入口 |
| --- | --- | --- |
| Classical CAN | F13／F24／RH850 | [App 更新與確認](can-update.html#f13-device-update) |
| CAN FD | F24／RH850 | [App 更新與確認](can-update.html#can-fd-update) |
| Custom Transfer | F13／F24／RH850 Classical CAN；F24／RH850 CAN FD | [範例分類與通訊測試](custom-transfer.html#custom-transfer) |
<!-- ISP_MODE_NAV_END -->

<!-- RH850_DEVICE_BEGIN -->
<a id="rh850-can-device"></a>

## 其他 MCU 指南

RH850 的 CAN／CAN FD、App Metadata／IRQ、串列介面與 Flash 移植集中於獨立 Bootloader 指南。
[其他 MCU 指南](https://released.github.io/slide_boot_loader_for_RH850/can-device.html#rh850-can-device)
<!-- RH850_DEVICE_END -->
