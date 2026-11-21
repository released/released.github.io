[知識庫首頁](https://released.github.io/) · [RH850 Bootloader](index.html)

<a id="article_top"></a>

# 串列 ISP 共用工程與協定契約

平台配置、C header、建置、Metadata、SC 與共用 Frame／命令／INFO／Status。

<!-- BOOTLOADER_TOPICS_BEGIN -->
<details>
<summary>章節與另一平台對照</summary>

| 章節／規格 | 本頁 | 另一平台 |
| --- | --- | --- |
| 配置與資料來源 | [閱讀](#guide-serial-device-1) | [RL78](../slide_boot_loader_for_RL78/serial-device.html#guide-serial-device-1) |
| 編輯、產生與建置 | [閱讀](#guide-serial-device-2) | [RL78](../slide_boot_loader_for_RL78/serial-device.html#guide-serial-device-2) |
| Metadata offset與協定配置 | [閱讀](#guide-serial-device-3) | [RL78](../slide_boot_loader_for_RL78/serial-device.html#guide-serial-device-3) |
| SC設定與重新產生 | [閱讀](#guide-serial-device-4) | [RL78](../slide_boot_loader_for_RL78/serial-device.html#guide-serial-device-4) |
| Framed control與INFO | [閱讀](#guide-serial-device-5) | [RL78](../slide_boot_loader_for_RL78/serial-device.html#guide-serial-device-5) |
| 驗證範圍 | [閱讀](#guide-serial-device-9) | [RL78](../slide_boot_loader_for_RL78/serial-device.html#guide-serial-device-9) |

</details>
<!-- BOOTLOADER_TOPICS_END -->

<!-- RH850_SERIAL_CHAPTER_BEGIN -->
## MCU 串列 ISP 工程配置

本章的UART／Xmodem／I2C各使用獨立Boot／App／Transfer工程，並保留獨立文字Log。
Flash、IRQ與RAM執行細節集中於 [移植與Flash](porting.html)。

#### RH850 文件入口

| 目的 | 說明位置 |
| --- | --- |
| Classical CAN／CAN FD、CAN port 與接收資源 | [CAN device 工程](can-device.html) |
| UART／Xmodem／I2C、獨立 Log 與串列主迴圈 | 本文件 |
| Tool 操作、完成提示與更新報告 | [串列操作](https://released.github.io/slide_simple_renesas_isp_tool/serial-isp.html)、[共用操作](../slide_simple_renesas_isp_tool/operation.html) |
| 格式欄位與通訊封包 | [串列工程配置](#guide-serial-device-3)；實際地址與 IRQ 使用本文件配置 |

各介面都有獨立 Boot／App／Transfer 工程。
共用格式與操作透過上方連結查閱，平台地址、腳位與中斷配置集中在各自工程章節。

<a id="guide-serial-device-1"></a>

### 配置與資料來源

#### 專案與目錄

下列 Boot／App／Transfer 各自包含來源碼、設定與建置工具，可獨立編譯。
每個介面使用自己的工程與映像契約；搭配安裝的 Boot／App 保持相容設定。
目錄與使用者入口見 [工程目錄與程式入口](porting.html#rh850-project-entry)。

| 介面 | Boot | App | Custom Transfer |
| --- | --- | --- | --- |
| UART ISP | Sample_Project_RH850_S1_ISP_Boot_loader_UART | Boot 名稱加 `_app` | Sample_Project_RH850_S1_UART_Transfer |
| XMODEM-CRC128 | Sample_Project_RH850_S1_ISP_Boot_loader_Xmodem | Boot 名稱加 `_app` | Sample_Project_RH850_S1_Xmodem_Transfer |
| I2C ISP | Sample_Project_RH850_S1_ISP_Boot_loader_I2C | Boot 名稱加 `_app` | Sample_Project_RH850_S1_I2C_Slave_Transfer |

Transfer 是以燒錄器安裝的獨立診斷程式，不是 App 更新 BIN。
診斷路徑不擦寫 Flash；Xmodem Transfer 使用 command24 接收串流並核對 CRC32。

#### 接線與時脈

| 用途 | MCU 周邊／腳位 | 設定 | EIINT channel |
| --- | --- | --- | --- |
| UART／Xmodem 資料 | RLIN31 TX P0_5、RX P0_4 | 115200、8-N-1 | RX122、Error123 |
| I2C 資料 | RIIC1 SCL P8_1、SDA P8_0 | 7-bit address0x20、100kHz | TX240、Event241、RX242；TEI243 保持遮罩 |
| 獨立文字 Log | RLIN30 TX P10_10、RX P10_9 | 115200、8-N-1；接收 IRQ 遮罩 | 不使用資料介面接收 |
| 系統 tick | OSTM0 | 1ms | 84 |
| 系統時脈 | 外部16MHz／PLL | CPU120MHz | App 檢查 Boot 交接時脈 |

UART 與 I2C 腳位依選定 SDK 範例的初始化程式配置。
連到 bridge 前仍需核對 EVM 接頭、電壓、共地與 I2C 上拉。
診斷 UART 不接到二進位 ISP 資料鏈路。

文字 Log 使用專案內 `retarget.c`／`retarget.h` 的 `tiny_printf()`，由 `SendChar()` 輸出至 UART0。
格式與使用位置見 [App 執行標記與 counter](app-development.html#rh850-runtime-log)。

UART建置以 `validate_serial_settings.ps1` 比對INFO／metadata baud與該工程SC產生的採樣、prescaler及LBRP。
執行時另核對實際UART暫存器計算的baud誤差，EVM的RLIN source為40MHz。
變更速率時同步調整配對Boot／App的SC與 `isp_transport_config.h`；不變更獨立文字Log設定。

<a id="guide-serial-device-2"></a>

### 編輯、產生與建置

#### 建置與檔案使用

在任一工程目錄以 PowerShell 執行：

```powershell
.\build.ps1
```

在所選工程根目錄執行 `build.ps1`，只建置該工程並執行本機 pre/post-build 檢查。
使用已安裝的 CS+／CC-RH 與 PowerShell，不需額外的 Python 或 JSON 編輯環境。

工程保留所選 UART／RIIC 的 Smart Configurator component；建置使用受控的 clock、system／IRQ projection。
重新產生 SC 原始碼後，核對獨立 Log、資料腳位與時脈設定，再執行同一份建置檢查。

#### 建置訊息

| 訊息 | 來源與處理 |
| --- | --- |
| `W0561322` `.text` alignment mismatch | 專案輸入採4-byte 對齊，原廠預編譯 C library 採2-byte。最終 `.text` 仍以4-byte 連結；保留診斷，未修改 library 或關閉警告 |
| `W0561017` CC-RH 授權 | 由目前編譯環境的授權狀態產生；依正式 CC-RH 授權配置處理。不是 firmware 功能警告，也不表示零警告建置 |

| 產物 | 用途 |
| --- | --- |
| Boot DefaultBuild/boot0000_FFFF.hex | 燒錄器安裝 Boot |
| App DefaultBuild/專案名稱_update.bin | Tool 對 device 更新 App |
| App DefaultBuild/app_build_report.html | 實際 BIN、CRC、metadata／IRQ 的建置結果 |
| Transfer DefaultBuild/專案名稱.hex | 燒錄器安裝獨立 Transfer 測試程式 |

Tool 使用 UART／Xmodem 或 I2C 的對應 Workflow。
操作步驟及訊息說明見[串列 ISP 操作](https://released.github.io/slide_simple_renesas_isp_tool/serial-isp.html)，欄位定義見[串列工程配置](#guide-serial-device-3)。
本頁的MCU、地址、EIINT與腳位表作為RH850工程配置來源。

<a id="guide-serial-device-3"></a>

### Metadata offset與協定配置

位址以App起點10000h、Metadata起點10100h計算；欄位offset的基準為Metadata，不是BIN起點。
CAN與串列工程分別使用其介面契約；此表為串列ISP。

| Offset | Bytes | 此RH850串列工程的內容／來源 |
| --- | --- | --- |
| 00 | 4 | ISP加NUL，49 53 50 00 |
| 04..07 | 4 | format6、core128、工程flags |
| 08..0B | 4 | UART protocol55h、I2C49h、Xmodem58h；版本／checksum宣告 |
| 0C | 2 | target8501h；另有介面配置bytes |
| 10／14／18 | 各4 | App version／build／實際image_size |
| 1C／20／24／28／2C | 各4 | App10000h／capacityF0000h／Flash100000h／Boot10000h／erase8000h |
| 30／34／38／3C | 各4 | I2C編譯Hz／7-bit address／0／0；UART、Xmodem為0 |
| 40..4F／50..5B | 16／12 | part與family ASCII、NUL padding |
| 5C | 4 | 最小格式長度，實際向量／code範圍另由映像驗證器檢查 |
| 60..67 | 8 | UPD1、policy3、32bytes、DEVICE_APP；UART／Xmodem允許UART04，I2C允許02 |
| 68／6C | 各4 | R8V1 IRQ ABI31563852h／最低Boot版本 |
| 70／74 | 各4 | UART／Xmodem編譯baud（I2C為0）／version control |
| 78..7F／80..FF | 8／128 | zero／FF |

編輯位置為`app_image_config.h`、`image_metadata_config.h`及`isp_transport_config.h`；size與CRC由post-build產生。
例如version control位於Flash10174h；其餘位址依本表offset加10100h換算。


<a id="guide-serial-device-4"></a>

### SC設定與重新產生

<a id="rh850-serial-sc-roundtrip"></a>

#### Smart Configurator 重新產生與建置

1. 保存工程設定及 App 的兩份 C header；由本工程 `.scfg` 開啟 Smart Configurator。
2. 核對 device 為 R7F701684、外部晶振16MHz。資料介面選用 Config_UART1 或 Config_RIIC1，另保留 Config_UART0、Config_OSTM0 與 Config_TAUJ0_0。
3. 執行 Generate Code，保存 SC 產生結果。既有 user-code 區保留對應 callback；資料 ISP adapter 不置於產生檔中。
4. 在該工程執行 `build.ps1`，或在已設定 hooks 的 CS+ 工程執行 Rebuild。建置會由最新 SC 來源產生受控 clock、timer／system 與完整 IRQ table，不自動重設使用者 `.scfg`。
5. 核對建置後檢查成功；App 另開啟 `app_build_report.html`，確認 metadata、CRC、512項 IRQ 與實際 BIN。App-only 變更不重建 Boot。
6. 上板時確認資料傳輸、診斷 Log、tick、中斷及重啟；離線建置通過不代表這些硬體動作已驗證。

| 可編輯來源 | 建置衍生結果 | 核對重點 |
| --- | --- | --- |
| `.scfg`／SC user-code 區 | `src/smc_gen` | 選定周邊與 pin 設定 |
| SC clock／system／timer 來源 | `generated_projection` 的受控 C 檔 | Boot 時脈設定、App 繼承檢查、timer ISR 無重複 channel 所有權 |
| `app_irq_handlers.h` | 完整512-entry IRQ table | 使用 EIINT channel；編譯後目的地與 C header 相符 |
| `app_image_config.h`／共用工程契約 | identity、metadata、更新 BIN、HTML | 編輯值與實際連結映像一致 |

<!-- RH850_SERIAL_WIRE_BEGIN -->
<a id="guide-serial-device-5"></a>

### Framed control與INFO

[共用 Frame、命令、INFO 與 Status](../slide_boot_loader_for_RL78/serial-device.html#guide-serial-device-5)由 RL78 共用契約章節維護。RH850 的 RLIN31／RIIC1、IRQ、位址與計數上限以本頁平台設定及各介面工程為準。
<!-- RH850_SERIAL_WIRE_END -->

<a id="rh850-serial-runtime"></a>

#### UART／I2C 中斷與完成邊界

| 平台實作 | 中斷與資料處理 | 完成條件與說明 |
| --- | --- | --- |
| RLIN31 UART | RX IRQ 只放入512-slot RAM ring（511 bytes可用）；滿時丟棄新資料並計數。Error IRQ 清除並記錄錯誤 | 主迴圈處理 protocol／CRC／Flash／Log；TX 完整送完才執行 pending action。見[UART流程](uart-device.html#uart-boot-flow) |
| RIIC1 I2C | Event IRQ 優先於 byte IRQ；STOP 與最後 RX 同時待處理時先收該 byte。NACK 保留至 STOP，期間遮罩 NACK IRQ | 完成計數扣除 DRT 預載；未完成 ready read 不 reset。見[I2C格式](i2c-device.html#i2c-protocol) |
| Xmodem | 與資料 UART 共用接收 queue，framed／raw parser 分階段使用 | 最終 ACK 完整送完才可 reset；App／Transfer使用RAM sink。見[Xmodem流程](xmodem-device.html#xmodem-boot-flow) |

App 的 ready 回覆須已觀察到系統 tick；Transfer 不宣告已安裝 App 或 Flash 分區。
串列診斷欄位集中於[UART診斷格式](uart-device.html#serial-uart-diagnostics)。
RIIC 暫存器與交易順序依 [RH850/F1KH、F1KM 硬體手冊](https://in.element14.com/wcsstore/ExtendedSitesCatalogAssetStore/cms/asset/pdf/common/renesas-automotive/rh850-users-manual.pdf) 第23章核對，特別是23.3.15、23.4、23.5.5。

<a id="guide-serial-device-9"></a>

### 驗證範圍

#### 離線檢查與實板範圍

`test_rh850_isp.ps1` 使用實際 App BIN、C 引擎／Flash page adapter／映像驗證器及 Tool client，核對完整960KiB、512-entry table、CRC／replay／失敗後不得 reset 等條件。
`test_rh850_isp_runtime.ps1` 直接編譯實際 `RuntimePoll`、角色設定與 Flash／串流 adapter，分別測試三介面的 Boot／App／Transfer。
測試包含分段／損壞封包、精確重送、ready、角色權限、最終回覆完成及傳送失敗；Xmodem 診斷另涵蓋短尾、block wrap、CRC16 重試、完整 CRC32、取消與 timeout。
`test_rh850_isp_hal.ps1` 使用實際 ISR adapter 與模擬暫存器，核對 queue／NACK／STOP／短讀；它不模擬電氣波形與硬體時序。

`test_rh850_scfg_roundtrip.ps1` 在隔離副本呼叫已安裝的 Smart Configurator 重新產生原始碼，再建置及核對映像／RAM／IRQ；不以手工複製來源取代 SC 產生動作。
完成後比較原工程來源與 App-only Boot 交付檔雜湊，將設定檢查、實際產生、連結結果及硬體結果分開記錄。

實板後續核對 UART、Xmodem、I2C 的 Discover、Transfer、Enter Boot、App 更新與重連。
另外確認 FCL RAM 執行、獨立 Log、IRQ 持續運作、中斷／斷電與復原行為。
<!-- RH850_SERIAL_CHAPTER_END -->

---

[上一主題：App Metadata 與 IRQ](app-development.html) · [指南入口](index.html) · [下一主題：Boot／App 移植與 Flash](porting.html)
