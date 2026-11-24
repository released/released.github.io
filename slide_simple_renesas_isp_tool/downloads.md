[知識庫首頁](https://released.github.io/) · [Simple Renesas ISP Tool 與 MCU bridge 操作](index.html)

<a id="article_top"></a>

# 下載與韌體產物

Tool、Host 與 Device 原始碼、安裝檔及更新 BIN。

<!-- PUBLIC_RESOURCES_BEGIN -->
<a id="downloads"></a>

## 下載與操作總覽

Host 透過 Host Link 連接 PC，再經選定的 CAN、UART 或 I2C 連接 device。
F13／F24 (MCU CAN device) 與 RH850 各自具有獨立的 Transfer／Boot／App 工程。
F24 (MCU CAN host) 使用獨立的 Bridge Boot／App，透過 Misc／UART 更新自身 App。

以下連結提供 Tool、MCU host 與 MCU device 的下載及工程說明。
首次安裝Boot使用燒錄器，之後更新App才使用對應的Tool流程；不可把Host與Device映像互換。

| 項目 | 下載／原始碼／說明 | 適用方式 |
| --- | --- | --- |
| PC Tool | [Windows EXE](https://raw.githubusercontent.com/released/simple_renesas_isp_tool/main/build/FirmwareUpgradeTool.exe)／[完整原始碼](https://github.com/released/simple_renesas_isp_tool) | Windows x64；先安裝實際VCOM所需driver，再選COM並Probe Host |
| F24 (MCU CAN host) Boot | [Boot專案](https://github.com/released/simple_renesas_isp_tool/tree/main/firmware/RL78_F24_Bridge_boot)／[Boot MOT](https://raw.githubusercontent.com/released/simple_renesas_isp_tool/main/firmware/RL78_F24_Bridge_boot/DefaultBuild/RL78_F24_Bridge_boot.mot) | 首次以燒錄器安裝；Misc不更新Boot |
| F24 (MCU CAN host) App | [App專案](https://github.com/released/simple_renesas_isp_tool/tree/main/firmware/RL78_F24_Bridge_app)／[Misc 更新 BIN](https://raw.githubusercontent.com/released/simple_renesas_isp_tool/main/firmware/RL78_F24_Bridge_app/DefaultBuild/RL78_F24_Bridge_app_bridge_update.bin)／[燒錄器初裝 App MOT](https://raw.githubusercontent.com/released/simple_renesas_isp_tool/main/firmware/RL78_F24_Bridge_app/DefaultBuild/RL78_F24_Bridge_app_flash.mot) | Misc 載入 `_bridge_update.bin`，使用 UART115200；`_flash.mot` 搭配 Boot MOT 供燒錄器初裝 |
| F13 (MCU CAN device) Boot | [Boot專案](https://github.com/released/RL78_F13_Boot_loader_CAN)／[Boot 專用 HEX](https://raw.githubusercontent.com/released/RL78_F13_Boot_loader_CAN/main/DefaultBuild/boot0000_1FFF.hex) | 燒錄器安裝／重燒 Boot；範圍為 `0x0000..0x1FFF`，不包含 App |
| F13 (MCU CAN device) App | [App專案](https://github.com/released/RL78_F13_Boot_loader_CAN_app)／[初裝合併HEX](https://raw.githubusercontent.com/released/RL78_F13_Boot_loader_CAN_app/main/boot_app.hex)／[CAN更新BIN](https://raw.githubusercontent.com/released/RL78_F13_Boot_loader_CAN_app/main/DefaultBuild/RL78_F13_Boot_loader_CAN_app_update.bin) | 合併HEX供燒錄器初裝；CAN TAB載入_update.bin更新Device App |
| F13 (MCU CAN device) 通訊測試 | [Transfer範例](https://github.com/released/RL78_F13_CAN_Transfer) | Custom Transfer，不擦寫Flash；不是Boot/App更新映像 |
| F24 (MCU CAN device) Classical CAN Boot／App | [工程配置與建置說明](https://released.github.io/slide_boot_loader_for_RL78/#f24-can-device) | 燒錄器初裝 Boot HEX／App flash HEX；CAN 更新使用 App update BIN |
| F24 (MCU CAN device) Classical CAN 通訊測試 | [Transfer 原始碼](https://github.com/released/RL78_F24_CAN_Transfer)／[操作與截圖](https://released.github.io/slide_simple_renesas_isp_tool/#f24-custom-transfer-example) | `RL78_F24_CAN_Transfer` 獨立工程；Custom Transfer 不擦寫 Flash |
| F24 (MCU CAN device) CAN FD Boot／App | [工程配置與建置說明](https://released.github.io/slide_boot_loader_for_RL78/#can-fd-device-engineering) | 燒錄器初裝 FD Boot；Tool 使用配對的 FD App update BIN。連結為工程說明 |
| F24 (MCU CAN device) CAN FD 通訊測試 | [Transfer 原始碼](https://github.com/released/RL78_F24_CAN_FD_Transfer)／[CAN FD 操作](https://released.github.io/slide_simple_renesas_isp_tool/#can-fd-custom-transfer) | `RL78_F24_CAN_FD_Transfer` 獨立工程；不使用更新 BIN、不擦寫 Flash |
| RH850 Classical CAN／CAN FD | [工程、EVM CAN port 與建置產物](https://released.github.io/slide_boot_loader_for_RH850/can-device.html) | Boot／App／Transfer 各自建置；App 更新與 Transfer 使用不同工程及產物 |
| UART／Xmodem／I2C device | [RL78 工程與周邊](https://released.github.io/slide_boot_loader_for_RL78/serial-device.html)／[RH850 工程與周邊](https://released.github.io/slide_boot_loader_for_RH850/serial-device.html) | 選擇單一更新介面的 Boot／App；另保留獨立 Log UART |

F24 host firmware 使用完整 Tool repository，包含 firmware 共用來源與 scripts。
Device 的 Boot、App 與 Transfer 各自持有來源、設定與工具，可分開建置。
App-only 建置不需要 Boot checkout；實際搭配安裝的 Boot／App 仍須符合 metadata、IRQ ABI、通訊與分區契約。
App 根目錄的 `build.ps1` 會執行本工程的產生、編譯、封裝及驗證。

### 交付檔與安裝範圍

Boot 使用燒錄器安裝；日常 App 更新才在 Tool 載入 BIN。
F24 host 的 `_bridge_update.bin` 用於 Misc；F13 device 的 `_update.bin` 用於 CAN。
F24 host 更新寫入完成後，按 `Run Validated Bridge App` 啟動並重新確認 Host App。

HEX（Intel HEX）與 MOT（Motorola S-record）含位址記錄；BIN 為連續映像資料，Tool 依 metadata 與 live Boot 契約核對目的地。
副檔名不能互換，檔案的文字大小也不等於 Flash 程式大小。

F13 App 根目錄 `boot_app.hex` 包含 Boot、App 與剩餘區域的 `0xFF`，供燒錄器整體初裝。
同目錄 `boot_app.bin` 內容相同，僅供需要 raw binary 的燒錄方式使用，起點為 `0x0000`；它不是 CAN 更新 BIN。
僅更新 App 時使用上表的更新 BIN，不使用合併映像。

F24 App 原始 `.mot` 與 F13 原始專案 `.hex` 是編譯／封裝輸入。
正式安裝使用已加入 metadata／CRC 的 `_flash.mot`、`flash_app_variable_CRC.hex` 或配套合併 HEX；日常更新使用對應的更新 BIN。
以燒錄器重燒 Boot／App 前，核對實際 MCU、檔案位址及 erase 設定；分區映像不代表燒錄器一定採分區擦除。

### 操作與工程入口

| 想了解的動作 | 網站操作／流程圖 | Tool docs中的詳細說明 |
| --- | --- | --- |
| Tool／F24 (MCU CAN host) 流程與責任 | [Tool與bridge動作圖](https://released.github.io/slide_simple_renesas_isp_tool/#tool-bridge-flow) | [多介面架構與流程](https://github.com/released/simple_renesas_isp_tool/blob/main/docs/MULTIBUS_TOOL_GUIDE_zh-TW.md) |
| MCU CAN device Boot啟動、ENTER與逾時 | [Boot→App完整條件圖](https://released.github.io/slide_boot_loader_for_RL78/#f13-boot-decision) | [Boot decision與更新流程](https://github.com/released/simple_renesas_isp_tool/blob/main/docs/F13_BOOT_UPDATE_FLOW_zh-TW.md) |
| Tool operation | [COM／Host識別與操作起點](https://released.github.io/slide_simple_renesas_isp_tool/#tool-operation) | [共用畫面與操作指南](https://github.com/released/simple_renesas_isp_tool/blob/main/docs/SHARED_CONSOLE_BRIDGE_GUIDE_zh-TW.md) |
| 更新確認／診斷／報告 | [App 確認、差異與驗證表](https://released.github.io/slide_simple_renesas_isp_tool/#update-confirmation) | [更新確認與驗證紀錄](https://github.com/released/simple_renesas_isp_tool/blob/main/docs/UPDATE_VALIDATION_zh-TW.md) |
| 更新F24 (MCU CAN host) App | [Misc：Host App更新圖與RUN](https://released.github.io/slide_simple_renesas_isp_tool/#host-bridge-firmware) | [F24 UART自更新協定](https://github.com/released/simple_renesas_isp_tool/blob/main/docs/BRIDGE_SELF_UPDATE_PROTOCOL.md) |
| Classical CAN device App 更新 | [CAN：驗證、Enter Boot、更新與確認](https://released.github.io/slide_simple_renesas_isp_tool/#f13-device-update) | [CAN區塊更新及保護](https://github.com/released/simple_renesas_isp_tool/blob/main/docs/CAN_BLOCK_TRANSFER_V5_zh-TW.md) |
| Classical CAN Custom Transfer 通訊驗證 | [Custom Transfer 操作](https://released.github.io/slide_simple_renesas_isp_tool/#custom-transfer) | [通訊測試協定](https://github.com/released/simple_renesas_isp_tool/blob/main/docs/F13_TRANSFER_PROTOCOL.md) |
| CAN FD device App 更新 | [CAN FD：設定、更新與 App 確認](https://released.github.io/slide_simple_renesas_isp_tool/#can-fd-update) | [CAN FD 更新說明](https://github.com/released/simple_renesas_isp_tool/blob/main/docs/CAN_FD_UPDATE_zh-TW.md#can-fd-update) |
| CAN FD Custom Transfer 通訊驗證 | [Discover／Transfer Test 操作](https://released.github.io/slide_simple_renesas_isp_tool/#can-fd-custom-transfer) | [CAN FD 通訊測試說明](https://github.com/released/simple_renesas_isp_tool/blob/main/docs/CAN_FD_UPDATE_zh-TW.md#can-fd-custom-transfer) |
| Boot code如何移植 | [Boot/App移植與向量工程](https://released.github.io/slide_boot_loader_for_RL78/#boot-app-porting) | [完整移植指南](https://github.com/released/simple_renesas_isp_tool/blob/main/docs/RL78_BOOT_APP_PORTING_GUIDE_zh-TW.md) |

<a id="tool-bridge-flow"></a>

[CAN 更新逐層導讀](https://released.github.io/slide_simple_renesas_isp_tool/#can-update-walkthrough)
對照 Tool 操作／BIN 驗證、MCU CAN host 轉送、MCU CAN device metadata／receive／Flash；
[MD](https://github.com/released/simple_renesas_isp_tool/blob/main/docs/CAN_UPDATE_WALKTHROUGH_zh-TW.md)／[PDF](https://github.com/released/simple_renesas_isp_tool/blob/main/docs/CAN_UPDATE_WALKTHROUGH_zh-TW.pdf)提供相同內容的離線版本。

Flash mapping、metadata全部256個byte的address／範例值、產生與解析程式，以及CAN逐byte格式，
集中於[Flash／Metadata／CAN移植對照](https://released.github.io/slide_boot_loader_for_RL78/#flash-metadata-can-reference)。

<!-- PUBLIC_RESOURCES_END -->

---

[指南入口](index.html) · [下一主題：Tool 連線與操作](operation.html)
