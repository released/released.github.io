[知識庫首頁](https://released.github.io/) · [Simple Renesas ISP Tool 與 MCU bridge 操作](index.html)

<a id="article_top"></a>

# UART／Xmodem／I2C 操作

接線、可調通訊設定、App 更新及串列通訊測試。

<!-- UART_TOOL_GUIDE_BEGIN -->
<a id="uart-device-operation"></a>
<a id="serial-device-operation"></a>

## UART／Xmodem／I2C device 操作

Tool 只開啟 bridge 的 Host Link COM，再由 bridge UART1 或 IICA0 與 MCU device 通訊。
Device UART0 獨立提供診斷文字，供 terminal 觀察。

RL78 F13／F24／G16／G22 與 RH850 各有獨立的 UART、Xmodem、I2C Boot／App／Transfer 工程。
這些串列工程已通過離線建置及程式模型測試；實際接線、中斷、Flash、重啟與斷電恢復另作實板驗證。

Boot 流程與協定格式可依介面直接查閱：

| 平台 | UART | I2C | Xmodem | 共用契約 |
| --- | --- | --- | --- | --- |
| RL78 | [Boot／Format](https://released.github.io/slide_boot_loader_for_RL78/uart-device.html) | [Boot／Format](https://released.github.io/slide_boot_loader_for_RL78/i2c-device.html) | [Boot／Format](https://released.github.io/slide_boot_loader_for_RL78/xmodem-device.html) | [Frame／INFO／Status](https://released.github.io/slide_boot_loader_for_RL78/serial-device.html#guide-serial-device-5) |
| RH850 | [Boot／Format](https://released.github.io/slide_boot_loader_for_RH850/uart-device.html) | [Boot／Format](https://released.github.io/slide_boot_loader_for_RH850/i2c-device.html) | [Boot／Format](https://released.github.io/slide_boot_loader_for_RH850/xmodem-device.html) | [Frame／INFO／Status](https://released.github.io/slide_boot_loader_for_RH850/serial-device.html#guide-serial-device-5) |

### 選擇介面與 Workflow

| Tool tab | Workflow | Device 使用的工程 | 用途 |
| --- | --- | --- | --- |
| UART / Xmodem | UART ISP | UART Boot／App | framed ISP 更新 |
| UART / Xmodem | Custom Transfer | UART Transfer | PING、96-byte ECHO、counters，不擦寫 Flash |
| UART / Xmodem | XMODEM-CRC | Xmodem Boot／App | ISP control 加 XMODEM-CRC128 資料傳輸 |
| UART / Xmodem | Xmodem Transfer | Xmodem Transfer | 上述診斷加389-byte CRC32 sink，不擦寫 Flash |
| I2C | I2C ISP | I2C Boot／App | STOP mailbox ISP 更新 |
| I2C | Custom Transfer | I2C Slave Transfer | mailbox 的 PING、ECHO、counters，不擦寫 Flash |
| I2C | G16 Reference (read-only) | 對應 reference sample | 唯讀探索；不開放 erase／write／jump |

Xmodem 位於 **UART / Xmodem → Workflow**，不是另一個 COM 或獨立 tab。
Device 每份 Boot 只支援其所屬的介面／協定；UART0 診斷輸出不屬於第二種更新介面。

### 接線與速度

| 通道 | 設定與接法 |
| --- | --- |
| PC ↔ bridge UART0 | Host Link binary，預設115200；Host Baud 與 device 速度獨立 |
| bridge UART1 ↔ device UART1 | Bridge TX P74 接 device RX；bridge RX P75 接 device TX；Device baud 可選或輸入，8-N-1，範例預設115200 |
| bridge IICA0 ↔ device I2C Slave | Bridge SCL P62／SDA P63 接 device SCL／SDA；設定未左移的7-bit address與host宣告的速度，範例預設0x20／100kHz |
| device UART0 ↔ terminal | 診斷文字與 V1／V2 counter；115200、8-N-1 |
| 所有連線 | 共地、核對 I/O 電壓；I2C 使用適當上拉，不將不相容電位直接相接 |

| Device board | UART1 TX／RX | UART0 Log TX／RX | IICA0 SCL／SDA |
| --- | --- | --- | --- |
| F13，R5F10BMG | P74／P75 | P15／P16 | P62／P63 |
| F24，R7F124FPJ5xFB | P74／P75 | P15／P16 | P62／P63 |
| G16，R5F121BCAFP | P11／P10 | P03／P04 | P60／P61 |
| G22，R7F102GGE2DFB | P00／P01 | P12／P11 | P60／P61 |

F13 UART1：CN1 pin35／34；F24 UART1：CN1 pin42／41。兩者 UART0 TX P15 為 CN2 pin5，地可接 TP2／VSS。
F13／F24 UART1 使用 PIOR42=1；G16 使用 SAU0 channels2／3 與對應 PIOR，G22 使用其工程的 SAU0 路由。

接線依據：F13 target board R20UT2272XJ0200 第2頁、F24 target board R12UZ0100XJ0101 第2頁、
G16 FPB schematic R12TU0180EJ、G22 FPB schematic R20UT5122EJ。
接頭方向與焊橋依各板原理圖核對；表內腳位與韌體 adapter 對照，不表示已量測實體波形。
RH850 的 RLIN31／RIIC1、獨立 Log 及 EVM 腳位集中於 [RH850 平台配置](https://released.github.io/slide_boot_loader_for_RH850/serial-device.html#guide-serial-device-1)。

### 工程與產物

下表為 RL78 工程命名，MCU 取 F13、F24、G16 或 G22；每格代表各 MCU 的獨立工程。
RH850 工程名稱與安裝檔集中於 [RH850 工程與建置](https://released.github.io/slide_boot_loader_for_RH850/serial-device.html#guide-serial-device-2)。

| 協定 | Boot | App | Custom Transfer |
| --- | --- | --- | --- |
| UART | RL78_＜MCU＞_ISP_Boot_loader_UART | Boot 名稱加 _app | RL78_＜MCU＞_UART_Transfer |
| Xmodem | RL78_＜MCU＞_ISP_Boot_loader_Xmodem | Boot 名稱加 _app | RL78_＜MCU＞_Xmodem_Transfer |
| I2C | RL78_＜MCU＞_ISP_Boot_loader_I2C | Boot 名稱加 _app | RL78_＜MCU＞_I2C_Slave_Transfer |

Boot／App／Transfer 各自包含來源碼、設定與建置工具，可獨立編譯。
板上配對的 Boot／App 需使用相容的 Metadata、IRQ、Flash 與通訊契約。
在所選工程根目錄執行：

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\build.ps1
```

使用既有 CS+ 與 Windows PowerShell；RL78 使用 CC-RL，RH850 使用 CC-RH。
App 設定由 app_image_config.h、app_irq_handlers.h 編輯，不需要 Python 或 JSON 編輯器。

| 產物 | 使用方式 |
| --- | --- |
| RL78 Boot DefaultBuild/boot0000_1FFF.hex | 燒錄器安裝8-KiB Boot；RH850 安裝檔見上述平台建置章節 |
| App DefaultBuild/＜App工程名＞_update.bin | Tool 載入；包括向量、metadata、程式／padding、末端CRC32 |
| App DefaultBuild/app_build_report.html | 瀏覽器核對實際 BIN 的 metadata／IRQ／CRC／雜湊 |
| Transfer DefaultBuild/＜Transfer工程名＞.hex | 燒錄器安裝獨立通訊測試程式；不放入 App 更新欄 |

分區、容量、metadata 與 ISR 編輯集中於 [串列 device 工程配置](https://released.github.io/slide_boot_loader_for_RL78/#serial-device-engineering)。
初次 Boot 安裝及 Flash 尾端保留區另見 [Boot 安裝與 App 容量](https://released.github.io/slide_boot_loader_for_RL78/#device-debug-monitor)。

### App 更新操作

| 步驟 | 操作與核對 |
| --- | --- |
| 1 | 燒錄器安裝配對 Boot；接妥資料介面，另以 UART0 觀察 Log |
| 2 | 選 bridge COM，按 **Open + Probe Host**；核對該介面的 port 與能力 |
| 3 | 選對 tab／Workflow／port，依Boot／App通訊契約設定Device baud或I2C位址／速度；見[更新必要條件](#serial-update-requirements) |
| 4 | 載入配對 App 的 _update.bin；核對離線 MCU、介面／協定、CRC與版本政策 |
| 5 | **Discover Target** 讀即時 INFO；有效 App 會回讀全部256-byte installed metadata |
| 6 | 回報 App 時按 **Enter Boot**；已在 Boot 則直接進下一步 |
| 7 | **Compare Metadata／Preflight** 核對後，按 **Start Device Update** 並確認 |
| 8 | 完整映像 CRC與 App 確認通過後顯示完成；**Open Last Report** 可開啟 HTML，UART0 可觀察 counter |

有效 App 進入 Boot 後，若30秒沒有完整 ISP request、且更新尚未開始，會回到 App。
此時重新 Discover Target → Enter Boot；active 更新期間不套用這個閒置跳轉。

<a id="serial-update-requirements"></a>

#### 通訊設定與更新必要條件

UART／Xmodem 的 **Device baud** 可輸入十進位300..2000000，或選用常見值。
Bridge須宣告numeric-rate能力並接受該值；F24 host會拒絕分頻誤差超過2%的設定。
I2C位址使用0x08..0x77，保留位址不開放；速度依port能力提供100／400kHz。
這些值保存於INI；修改port、baud、位址或速度後，重新Discover Target。
Tool設定的是bridge端，不會自動改寫device的周邊設定，也不作slave address掃描。

| 核對項目 | 需要對應的內容 |
| --- | --- |
| 資料介面與協定 | Workflow、Boot、App及BIN的protocol／transport一致；Xmodem使用CRC／128-byte block，I2C使用STOP mailbox |
| UART baud／格式 | Tool Device baud、Boot／App UART分頻、live INFO rate與BIN metadata+0x70一致；8-N-1，與Host Baud／診斷Log獨立 |
| I2C位址 | Tool選取的7-bit address、Boot／App slave設定與BIN metadata+0x34一致；例如device為0x20時，Tool填0x20而非0x40 |
| I2C速度 | 所選100／400kHz、Boot／App編譯rate、live INFO與BIN metadata+0x30一致；同時核對上拉、負載與slave時序 |
| MCU與Flash配置 | BIN與live INFO的family／part／target、App起點／容量、Boot保留區、擦除單位一致 |
| 映像與IRQ契約 | metadata格式、CRC32、向量／IRQ ABI有效；App要求的minimum Boot不高於已安裝Boot |
| App版本政策 | 依有效installed App的policy判斷；啟用時一般更新允許同版／新版，維護降版使用獨立確認操作 |

I2C INFO不回報slave address；Tool以實際選取的交易位址綁定session，再核對讀回的metadata，並非從INFO推測位址。
移植時，在配對Boot的 `isp_transport_config.h` 設定 `ISP_UART_BAUD`／`ISP_POLICY_UART_BAUD`，
或 `ISP_BUS_RATE`／`ISP_I2C_ADDRESS`／`ISP_LINK_PARAMETER_0`／`ISP_LINK_PARAMETER_1`；
同步調整board adapter的分頻、slave位址與時序，再重建Boot／App並安裝配對Boot。
產物與建置位置見[串列工程配置](https://released.github.io/slide_boot_loader_for_RL78/#serial-device-engineering)。
範例目前維持115200與0x20／100kHz；其他設定的電氣／實板驗證依實際專案進行。

```mermaid
flowchart TD
    A["Open + Probe Host"] --> B["選介面 / Workflow / 配對 App BIN"]
    B --> C["Discover Target / 即時 INFO"]
    C --> D{"Device 模式"}
    D -- App --> E["Enter Boot / 確認 Boot / 30秒閒置窗口"]
    D -- Boot --> F["比對 MCU / metadata / IRQ / 版本 / 介面"]
    E --> F
    F -- 不符合 --> X["顯示差異 / 不擦寫"]
    F -- 符合 --> G["START / 資料傳輸 / 完整 CRC"]
    G --> H["重啟 / APP_READY / live identity"]
    H --> I["完成提示 / HTML與JSON報告 / 診斷 Log"]
```

### Custom Transfer 與 Xmodem

安裝所選 standalone Transfer HEX 後，選表中的 Transfer workflow，依序 **Discover Test Target → Transfer Test**。
這些測試不使用 App BIN、不擦寫 Flash，也不回報 installed Boot／App metadata。

Xmodem Transfer 先以 command0x24 宣告389 useful bytes及 CRC32，再進行128-byte block接收；
最後不足128 bytes以1A padding，完成後回到 framed control，讀取 counters。
CRC16驗證每個區塊，CRC32驗證 useful bytes；診斷用 RAM sink不啟動 Flash或reset。

<a id="serial-device-diagnostics"></a>

### Device 串列診斷

支援診斷能力的 UART／Xmodem App 或 Transfer，在 Discover、Transfer Test及更新後確認 App時，
Tool會顯示 `Device UART observations`。這是 Device本次執行的快照，不是每次更新的差值。
`Bridge UART1 observations` 則來自 bridge；兩者分開記錄，不互相代替。

| 欄位 | 意義與核對方向 |
| --- | --- |
| RX errors | Device UART接收硬體錯誤；核對baud、電壓、共地與訊號 |
| RX drops | Device接收queue已滿而丟棄的新資料；核對主迴圈處理、長時間關閉IRQ與傳送節奏 |
| TX timeouts | Device本機傳送未在界限內完成；與對端未收到ACK是不同觀察點 |
| RX peak／pending | 本次執行的queue最高使用量／讀取快照當下的待處理bytes |

未宣告診斷能力時，Tool不送出診斷命令，也不以零值代替未提供的資訊。
Boot更新與I2C mailbox維持各自能力；不因缺少UART診斷而拒絕更新。
封包欄位集中於[串列診斷格式](https://released.github.io/slide_boot_loader_for_RL78/serial-device.html#serial-uart-diagnostics)。

### 判讀、取消與報告

| 訊息／情況 | 核對方向 |
| --- | --- |
| 看不到可用 port | 重新 Probe；核對 bridge 是否宣告 UART forwarding／I2C能力及選取 port |
| Check BIN update interface / protocol | 選擇配對 BIN與 Workflow；不直接改副檔名或metadata bytes |
| MCU／Flash／IRQ ABI／minimum Boot mismatch | 查看 Compare Metadata；重建配對工程 |
| I2C busy／reply未完成 | 核對位址、上拉與完整111-byte read；Tool只讀取等待，不重送寫入指令 |
| XMODEM handshake／block／EOT未確認 | 保存 Log；分別核對 C、ACK／NAK與完整CRC；EOT只送一次 |
| END通過但 APP_READY未確認 | 保留報告並核對 App初始化、電源與Log；不自動重寫或重送END |
| Cancel | Worker清理 device／bridge交易；UI不自行關閉另一條COM |

成功、失敗、取消都產生 JSON／HTML report；Tool不自動開啟瀏覽器。
報告欄位與開啟方式見 [Firmware update report](https://released.github.io/slide_simple_renesas_isp_tool/#update-html-report)；
<!-- UART_TOOL_GUIDE_END -->

<a id="4-i2c-master"></a>

## I2C：G16 Reference 探索

選擇 G16 Reference workflow 時，可依指定 port／address 讀取參考裝置資訊。
UART／Xmodem／I2C App 更新與 Custom Transfer 見本頁的[串列 device 操作](#serial-device-operation)。

1. Probe Host → I2C Master → IICA0／100kHz。
2. Slave 使用7-bit位址 `0x09`。
3. `Probe G16 Reference` 讀取 inquiry／signature／area。
4. Port、rate 或 address 調整後重新 Probe。

探索回覆用於核對連線與參考資訊。
此模式提供探索及 BIN CRC16 檢查，Start Firmware Update 顯示 BLOCKED。

---

[上一主題：CAN 更新逐層導讀](can-protocol.html) · [指南入口](index.html) · [下一主題：Custom Transfer 通訊驗證](custom-transfer.html)
