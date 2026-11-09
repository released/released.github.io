<!-- GUIDE_OVERVIEW -->
[知識庫首頁](https://released.github.io/) · [RL78 Bootloader](../slide_boot_loader_for_RL78/)

<a id="article_top"></a>

# RH850 Bootloader 實作指南

依閱讀目的選擇 MCU device 工程、App 設定、移植或格式參考。
日常更新與通訊驗證見 [Simple Renesas ISP Tool](../slide_simple_renesas_isp_tool/)。

## 依閱讀目的查閱

| 目的 | 直接入口 |
| --- | --- |
| 使用Tool更新App | [CAN／CAN FD操作](../slide_simple_renesas_isp_tool/can-update.html)／[UART／Xmodem／I2C操作](../slide_simple_renesas_isp_tool/serial-isp.html) |
| 修改App或增加IRQ | [Metadata設定](app-development.html#guide-app-development-2)／[IRQ範例](app-development.html#guide-app-development-3)／[本地建置](app-development.html#guide-app-development-4) |
| 移植到其他板子或MCU | [修改範圍與工程配置](porting.html#guide-porting-2) |
| 查協定與欄位 | [CAN格式](reference.html#guide-reference-10)／[串列共用契約](serial-device.html#guide-serial-device-5) |

## 快速查閱

| 資料 | 適用內容 | 直接連結 |
| --- | --- | --- |
| **App BIN 更新耗時比較** | RH850 Classical CAN／CAN FD 各 App BIN 大小的實測時間 | [查看更新耗時表](app-development.html#rh850-update-timing) |
| Metadata 每個byte與address | 欄位、範例值、來源及修改位置 | [查看格式表](reference.html#rh850-metadata-bytes) |
| App 新增IRQ與執行路徑 | ISR、mapping、產表、交接與成本 | [查看IRQ教學](app-development.html#rh850-app-editing) |
| Boot安裝與debug monitor配置 | Flash／RAM、保護範圍及燒錄檔 | [查看安裝條件](porting.html#guide-porting-4) |

## 主題指南

| 主題 | 內容 |
| --- | --- |
| [Classical CAN／CAN FD device 工程](can-device.html) | EVM、CAN port、接收資源、更新 owner 與 Boot 啟動流程。 |
| [App Metadata、IRQ 與更新耗時](app-development.html) | C header 編輯、512-entry IRQ table、建置產物及 CAN／CAN FD 實測時間。 |
| [串列 ISP 共用工程與協定契約](serial-device.html) | 平台配置、C header、建置、Metadata、SC 與共用 Frame／命令／INFO／Status。 |
| [UART Bootloader 與協定格式](uart-device.html) | 資料 UART、接收中斷、framed ISP 更新、封包範例與診斷。 |
| [I2C Bootloader 與協定格式](i2c-device.html) | I2C Slave、STOP mailbox、111-byte reply window 與更新完成條件。 |
| [Xmodem Bootloader 與協定格式](xmodem-device.html) | Framed control、XMODEM-CRC128、串流寫入、重送與最終 ACK。 |
| [Boot／App 移植與 Flash](porting.html) | 位址、HAL 入口、FCL RAM 執行、startup 與映像交接。 |
| [Flash、Metadata 與 CAN 封包參考](reference.html) | RH850 位址、256-byte Metadata 範例、8-byte control 與 raw data。 |
| [Tool 操作與通訊驗證入口](tool-guides.html) | 共用 ISP Tool、更新報告、Custom Transfer 與操作章節的連結。 |

## CAN 範例分類

| 分類 | 工程／範例 | 操作入口 |
| --- | --- | --- |
| Classical CAN | [Boot／App與CAN1／CAN4](can-device.html#rh850-can-device) | [App更新](../slide_simple_renesas_isp_tool/can-update.html) |
| CAN FD | [Boot／App、FD+BRS與raw64](can-device.html#guide-can-device-5) | [CAN FD更新](../slide_simple_renesas_isp_tool/can-update.html#can-fd-update) |
| Custom Transfer | [CAN／CAN FD獨立Transfer工程](can-device.html#rh850-can-device) | [通訊測試](../slide_simple_renesas_isp_tool/custom-transfer.html) |

## 串列 Bootloader 與協定格式

| 介面 | Bootloader | Protocol Format |
| --- | --- | --- |
| UART | [初始化與更新流程](uart-device.html#uart-boot-flow) | [封包、範例與完成條件](uart-device.html#uart-protocol) |
| I2C | [初始化與更新流程](i2c-device.html#i2c-boot-flow) | [封包、範例與完成條件](i2c-device.html#i2c-protocol) |
| Xmodem | [初始化與更新流程](xmodem-device.html#xmodem-boot-flow) | [封包、範例與完成條件](xmodem-device.html#xmodem-protocol) |

共用工程、Metadata、建置與 Frame／INFO／Status 見[串列 ISP 共用契約](serial-device.html)。

## Basic 參考工程

[工程基準與選擇](porting.html#guide-porting-1)說明簡易Boot導入ISP格式時的映像、IRQ、CRC與Flash核對條件。

## 其他 MCU 指南

[RL78 Bootloader](../slide_boot_loader_for_RL78/)使用相同章節順序，提供RL78各工程的設定與規格。
