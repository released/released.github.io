[知識庫首頁](https://released.github.io/) · [RL78 Bootloader](index.html)

<a id="article_top"></a>

# 各介面實驗資料

依介面與 MCU 查閱實板紀錄、量測條件、報告與確認範圍。

<!-- BOOTLOADER_TOPICS_BEGIN -->
<details>
<summary>章節與另一平台對照</summary>

| 章節／規格 | 本頁 | 另一平台 |
| --- | --- | --- |
| 實驗資料與確認範圍 | [閱讀](#experiment-scope) | [RH850](../slide_boot_loader_for_RH850/experiments.html#experiment-scope) |
| App BIN 更新耗時參考 | [閱讀](#guide-app-development-8) | [RH850](../slide_boot_loader_for_RH850/experiments.html#guide-app-development-8) |

</details>
<!-- BOOTLOADER_TOPICS_END -->

<a id="experiment-scope"></a>

## 實驗資料與確認範圍

各表保留所選映像、傳輸條件、結果及限制；工程存在與實板確認是不同資訊。未列紀錄的組合不推定為未實作或已驗證。

| 介面 | MCU／資料 | 直接入口 |
| --- | --- | --- |
| CAN／CAN FD | F13／F24，按模式與 MCU 分列 | [映像大小與報告](#device-update-timing) |
| I2C | [F13](#f13-i2c-update-measurements)／[F24](#f24-i2c-update-measurements)／[G16](#g16-i2c-update-measurements) | [工程與機制](i2c-device.html) |
| UART | [F13](#f13-uart-update-measurements)／[F24](#f24-uart-update-measurements)／[G16](#g16-uart-update-measurements) | [工程與機制](uart-device.html) |
| Xmodem | [F13](#f13-xmodem-update-measurements)／[F24](#f24-xmodem-update-measurements)／[G16](#g16-xmodem-update-measurements) | [工程與機制](xmodem-device.html) |
| 其他工程組合 | 本指南未列實板更新紀錄 | [依介面選擇工程](index.html#boot-interfaces) |

<a id="device-update-timing"></a>

<a id="guide-app-development-8"></a>

### App BIN 更新耗時參考

以下為單次實板更新的粗略等待時間參考，以 Tool 報告的 `elapsed_ms` 換算為秒，顯示至小數一位。
總時間包含更新流程的檢查、傳輸與 Flash 擦寫、END CRC、App 啟動確認及收尾，不是純 Flash 寫入速度。
實際時間也會受 Host Link UART、電腦與通訊狀態影響。

Classical CAN 使用 **500 kbit/s**。
CAN FD 欄位使用 **nominal 500 kbit/s／data 2 Mbit/s／BRS 開啟**，不是全程以 500 kbit/s 傳輸。

| App BIN | F13 device：Classical CAN 500K | F24 device：Classical CAN 500K | F24 device：CAN FD 500K／2M、BRS |
| --- | --- | --- | --- |
| 原始 App（未填充） | 20,320 bytes／約 13.5 秒 | 4,252 bytes／約 5.3 秒 | 4,780 bytes／約 5.5 秒 |
| 8 KiB（8,192 bytes） | 不適用 | 約 7.2 秒 | 約 7.3 秒 |
| 24 KiB（24,576 bytes） | 約 15.6 秒 | 約 15.6 秒 | 約 15.6 秒 |
| 56 KiB（57,344 bytes） | 約 32.3 秒 | 約 32.2 秒 | 約 32.2 秒 |
| 119 KiB（121,856 bytes） | 約 65.8 秒 | — | — |
| 120 KiB（122,880 bytes） | 不適用 | 約 65.9 秒 | 約 65.9 秒 |
| 247 KiB（252,928 bytes） | 不適用 | 約 133.0 秒 | 約 133.1 秒 |

「—」表示沒有該欄對應的量測資料，不代表更新失敗；原始 App 列分別列出 BIN 大小與已有的量測時間。
「不適用」表示測試映像小於來源 App，或超過目前預設 App 容量。
各列均指實際 App BIN 長度，包含向量表、metadata、程式／填充與 CRC；1 KiB＝1024 bytes。

##### F13 量測條件與來源

| 項目 | 本表使用的實測條件 |
| --- | --- |
| 日期／MCU | 2026-11-02／RL78/F13 R5F10BMG |
| Host Link UART／CAN | 115200 baud／Classical CAN 500 kbit/s |
| Detailed trace | 四次更新的對應 Log 均無 `TRACE UART`／`TRACE CAN` 逐幀記錄 |
| Tool／Host firmware | 0.1.0.0114／Host 1.8.1、build 20261023 |
| Device Boot／App | Boot 1.7.2、build 20261022／App 1.6.1、build 20261017 |
| 測試映像內容 | 原始 App，以及由其延伸、以 `0xFF` 填充並更新長度與 CRC32 的測試 BIN |
| 更新完成條件 | 四次均 PASS，END CRC、APP_READY／live image 比對及 CAN_STOP 確認通過；Device UART 均有 App 啟動與持續遞增的 timer 記錄 |
| 重試／已記錄的 Host 錯誤 | 四份 `link_retries=0`；UART overflow、CAN lost／warning／passive／bus-off／recovery／TX failure 差值均為 0 |

來源為 Tool 的 JSON／HTML 更新報告，副檔名為 `.json`／`.html`。
下表識別碼前加 `update_20261102_`，即可對應報告檔名。
Tool Log 為 `firmware_upgrade_tool_20261102_165702_065_63508_2.log`；Device UART 為 `20261102_165055_1.log`。

| 報告識別 | App BIN | elapsed_ms | Image CRC32 |
| --- | --- | --- | --- |
| `085806_769_63508_425770703_1` | 原始 App，20,320 bytes | 13458 | `0xCD08B2B9` |
| `085928_650_63508_425852578_2` | 24 KiB | 15586 | `0x51F4F5C7` |
| `090021_234_63508_425905156_3` | 56 KiB | 32332 | `0xED614B1F` |
| `090148_942_63508_425992843_4` | 119 KiB | 65778 | `0xAC872843` |

##### F24 Classical CAN 量測條件與來源

| 項目 | 本表使用的實測條件 |
| --- | --- |
| 日期／MCU | 2026-11-02／RL78/F24 R7F124FPJ5xFB |
| Host Link UART／CAN | 115200 baud／Classical CAN 500 kbit/s |
| 逐幀記錄 | 對應 Log 未包含 `TRACE UART`／`TRACE CAN` 記錄 |
| Tool／Host firmware | 0.1.0.0114／Host 1.8.1、build 20261023 |
| Device Boot／App | Boot 1.1.1、build 20261022／App 1.0.3、build 20261019 |
| 測試映像內容 | 原始 App，以及由其延伸、以 `0xFF` 填充並更新長度與 CRC32 的測試 BIN |
| 更新完成條件 | 六次均 PASS，END CRC、APP_READY／live image 比對及 CAN_STOP 確認通過；Device UART 均有 App 啟動與持續遞增的 timer 記錄 |
| 重試／已記錄的 Host 錯誤 | 六份 `link_retries=0`；UART overflow、CAN lost／warning／passive／bus-off／recovery／TX failure 差值均為 0 |

來源為 Tool 的 JSON／HTML 更新報告；下表報告識別前加 `update_20261102_`，副檔名為 `.json`／`.html`。
Tool Log 為 `firmware_upgrade_tool_20261102_175402_275_63508_5.log`；Device UART 為 `20261102_175038_1.log`。
表格列出整次操作的實際耗時，診斷細節保留於原始報告。

| 報告識別 | App BIN | elapsed_ms | Image CRC32 |
| --- | --- | --- | --- |
| `095507_201_63508_429191234_5` | 原始 App，4,252 bytes | 5253 | `0xCB558EB5` |
| `095544_285_63508_429228312_6` | 8 KiB | 7240 | `0x1C3D3D65` |
| `095612_784_63508_429256812_7` | 24 KiB | 15551 | `0x53023D7D` |
| `095658_334_63508_429302359_8` | 56 KiB | 32211 | `0xAC393491` |
| `095820_776_63508_429384781_9` | 120 KiB | 65912 | `0xBD9980C1` |
| `100051_164_63508_429535156_10` | 247 KiB | 132962 | `0x2E5DCE5B` |

##### F24 CAN FD 量測條件與來源

2026-11-02，RL78/F24 R7F124FPJ5xFB；Host Link UART 115200 baud，CAN FD nominal 500 kbit/s、data 2 Mbit/s、BRS 開啟。
Tool 0.1.0.0114，Host firmware 1.8.1／build 20261023，Device Boot 1.2.1／build 20261022、App 1.0.4／build 20261020。

測試映像為原始 App，以及由其延伸、以 `0xFF` 填充並更新長度與 CRC32 的 BIN。
六次均 PASS，END CRC、APP_READY／live image 比對及 CAN_STOP 確認通過；Device UART 均有 App 啟動與持續遞增的 timer 記錄。
六份 `link_retries=0`；UART overflow、CAN lost／warning／passive／bus-off／recovery／TX failure 差值均為 0。
對應 Tool Log 未包含 `TRACE UART`／`TRACE CAN` 逐幀記錄。

來源為 Tool 的 JSON／HTML 更新報告；下表報告識別前加 `update_20261102_`，副檔名為 `.json`／`.html`。
Tool Log 為 `firmware_upgrade_tool_20261102_180627_598_63508_7.log`；Device UART 為 `20261102_180636_1.log`。
表格列出整次操作的實際耗時，診斷細節保留於原始報告。
量測條件以上述 Tool 與 firmware 為準；不同設定需各自量測。

| 報告識別 | App BIN | elapsed_ms | Image CRC32 |
| --- | --- | --- | --- |
| `100733_867_63508_429937812_11` | 原始 App，4,780 bytes | 5527 | `0x2089154D` |
| `100757_675_63508_429961609_12` | 8 KiB | 7266 | `0xD9EE0401` |
| `100837_509_63508_430001437_13` | 24 KiB | 15590 | `0x5DF8A8EB` |
| `100926_042_63508_430049968_14` | 56 KiB | 32232 | `0xB96554B0` |
| `101057_657_63508_430141562_15` | 120 KiB | 65894 | `0x8E554348` |
| `101328_375_63508_430292265_16` | 247 KiB | 133070 | `0x8AAD47CE` |

##### 相關說明

- [CAN 更新協定與逐 byte 封包格式](https://released.github.io/slide_boot_loader_for_RL78/#flash-metadata-can-reference)
- [Boot 完整 IRQ table 與 App software dispatch](https://released.github.io/slide_boot_loader_for_RL78/#device-irq-ownership)
- [Software dispatch 的時間與 stack 成本](https://released.github.io/slide_boot_loader_for_RL78/#device-irq-dispatch-cost)
- [Boot 燒錄方式與 Flash 尾端保護](https://released.github.io/slide_boot_loader_for_RL78/#device-debug-monitor)：CS+ 安裝 Boot 時，App 上限為 119／247 KiB，最後 1 KiB 保留給 debug monitor 所在的擦除區塊。需要完整 120／248 KiB 時，須調整配對工程，且 **Boot 只能由 RFP 安裝**。

<a id="experiment-i2c"></a>

## I2C

<!-- F13_I2C_MEASURED_BEGIN -->
<a id="f13-i2c-update-measurements"></a>

### F13 I2C 更新量測與範圍

條件為 R5F10BMG、F24 bridge、I2C 100 kHz／7-bit 0x20、Host Link 115200；Tool 0.1.0.138、Host FW 1.8.1／build 20261023。時間單位為秒。

| App BIN | bytes | WRITE | END CRC | App 確認 | 總耗時 | 結果與資料 |
| --- | --- | --- | --- | --- | --- | --- |
| 原始 App | 12316 | 21.071 | 0.188 | 1.990 | 24.127 | [PASS／摘要](https://released.github.io/slide_boot_loader_for_RL78/data/f13_i2c_12316b.html) |
| 24 KiB | 24576 | 42.026 | 0.324 | 2.007 | 45.238 | [PASS／摘要](https://released.github.io/slide_boot_loader_for_RL78/data/f13_i2c_24576b.html) |
| 56 KiB | 57344 | 98.240 | 0.650 | 2.150 | 101.918 | [PASS／摘要](https://released.github.io/slide_boot_loader_for_RL78/data/f13_i2c_57344b.html) |
| 119 KiB | 121856 | 208.912 | 1.183 | 3.385 | 214.357 | [PASS／摘要](https://released.github.io/slide_boot_loader_for_RL78/data/f13_i2c_121856b.html) |

- 四份映像均取得 START／END 成功回覆、APP_READY，並核對全部 256-byte installed metadata；UART0 有對應的 boot-validated 啟動與後續 counter。
- 119 KiB 在重啟後唯讀 App 確認期間有四次 I2C_NACK，之後確認成功；Host Link retries=0 不能解讀成每次 I2C 查詢都一次成功。
- Host counter assessment 為 UNAVAILABLE，與更新 PASS 分開判斷；總耗時來自本次 report elapsed_ms，不採載入下一個 BIN 時仍顯示的前次 Result／Elapsed。
- 結果限上述四份映像的一般更新與重啟後確認；冷啟動、斷電／故障恢復、其他速率或 MCU 另行確認。
<!-- F13_I2C_MEASURED_END -->

<!-- F24_I2C_MEASURED_BEGIN -->
<a id="f24-i2c-update-measurements"></a>

### F24 I2C App 更新量測

量測條件：F24 device R7F124FPJ5xFB，F24 bridge，I2C 100 kHz／7-bit 0x20，Host Link 115200。
Tool 0.1.0.138；Host FW 1.8.1／build 20261023。表格由六份選定更新報告的實際欄位整理，時間單位為秒。

| App BIN | bytes | WRITE | END CRC | App 確認 | 總耗時 | 結果與資料 |
| --- | --- | --- | --- | --- | --- | --- |
| 原始 App | 6960 | 12.566 | 0.203 | 1.990 | 15.666 | [PASS／摘要](https://released.github.io/slide_simple_renesas_isp_tool/data/f24_i2c_6960b.html) |
| 8 KiB | 8192 | 14.711 | 0.186 | 2.074 | 17.890 | [PASS／摘要](https://released.github.io/slide_simple_renesas_isp_tool/data/f24_i2c_8192b.html) |
| 24 KiB | 24576 | 44.282 | 0.325 | 1.994 | 47.493 | [PASS／摘要](https://released.github.io/slide_simple_renesas_isp_tool/data/f24_i2c_24576b.html) |
| 56 KiB | 57344 | 99.547 | 0.541 | 2.039 | 103.055 | [PASS／摘要](https://released.github.io/slide_simple_renesas_isp_tool/data/f24_i2c_57344b.html) |
| 120 KiB | 122880 | 215.953 | 0.998 | 2.806 | 220.635 | [PASS／摘要](https://released.github.io/slide_simple_renesas_isp_tool/data/f24_i2c_122880b.html) |
| 247 KiB | 252928 | 439.099 | 1.850 | 4.536 | 446.359 | [PASS／摘要](https://released.github.io/slide_simple_renesas_isp_tool/data/f24_i2c_252928b.html) |

- 六份映像均取得 START／END 成功回覆、APP_READY，並核對全部 256-byte installed metadata；獨立 UART0 Log 有對應的 boot-validated 啟動文字及後續 counter。
- 總耗時採報告 elapsed_ms，包含 Metadata、START、WRITE、END CRC、App 確認及流程開銷；不採載入 BIN 畫面保留的前次 Result／Elapsed。
- 120／247 KiB 在重啟後唯讀確認期間分別觀察到 2／7 次 I2C_NACK，之後均確認 App。報告 link_retries 為 0 不代表所有 I2C 查詢一次成功。
- Host counter assessment 為 UNAVAILABLE，無法據此宣稱 bus 無錯誤；這與映像／App 確認成功分開判斷。
- 最大測試 App 為 247 KiB，未進入尾端 1 KiB 保留區。結果限此映像與接線條件；冷啟動、斷電恢復、故障注入、其他 MCU 或速度另行驗證。
<!-- F24_I2C_MEASURED_END -->

<!-- G16_I2C_MEASURED_BEGIN -->
<a id="g16-i2c-update-measurements"></a>

### G16 I2C App 更新量測

配對接線、操作步驟與 Boot／App 流程見 [G16 × I2C](https://released.github.io/slide_boot_loader_for_RL78/i2c-device.html#upgrade-g16-i2c)。

- Device：R5F121BCAFP，HOCO／CPU 16 MHz；F24 bridge；I2C 100 kHz／7-bit 0x20；Host Link 115200。Tool 0.1.0.139，Host FW 1.8.1 build 20261023。
- 兩份報告與對應 BIN 的長度、CRC32 相符，映像及來源報告由 SHA256 識別。START／END 成功、完整接受 bytes、APP_READY 與全部 256-byte installed metadata 均已確認。
- 獨立 UART0 擷取有兩次 boot-validated／update completed 與後續 counter；唯讀 metadata 回覆與兩份 BIN 的 256 bytes 分別相符。

| 映像 | Bytes | Write 秒 | END CRC 秒 | App 確認秒 | 總秒數 | 報告 |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| 原始 App | 12116 | 20.736 | 0.356 | 1.992 | 23.959 | [PASS 摘要](https://released.github.io/slide_simple_renesas_isp_tool/data/g16_i2c_12116b.html) |
| 23 KiB | 23552 | 40.147 | 0.539 | 2.039 | 43.606 | [PASS 摘要](https://released.github.io/slide_simple_renesas_isp_tool/data/g16_i2c_23552b.html) |

- 最大完整 App BIN 為 23 KiB，範圍至 `0x07BFF`；Boot 8 KiB 與尾端 `0x07C00..0x07FFF` 保留區不在 App 更新範圍。
- 第二次更新從執行中的 App 經 ENTER 返回 Boot。UART0 擷取有 ENTER RX，沒有對應 TX trace；Tool 的 Boot 確認與後續更新成功分開記錄，不以此推定回覆遺失原因。
- Host counter assessment 為 **UNAVAILABLE**，Host Link retry 為 0；本段未觀察到 App 確認 I2C_NACK，仍不能推定所有 bus 計數全程零錯誤。
- 獨立 Transfer 的本批擷取涵蓋 Discover／INFO、一組 RX／TX、每列 8 bytes，沒有 Flash 命令；PING／ECHO／counters 尚未由此擷取證實。[Discover 摘要](https://released.github.io/slide_simple_renesas_isp_tool/data/g16_i2c_transfer.html)
- 結果限正常更新後 App 確認。UART0 z/Z 人工重置、冷啟動、斷電恢復、其他介面／型號與故障注入另行驗證。
<!-- G16_I2C_MEASURED_END -->

<a id="experiment-uart"></a>

## UART

<!-- F13_UART_MEASURED_BEGIN -->
<a id="f13-uart-update-measurements"></a>

### F13 UART ISP App 更新量測

- Device：R5F10BMG；F24 bridge；Device UART1 與 Host Link 各為 115200／8-N-1。Tool 0.1.0.139，Host FW 1.8.1 build 20261023。
- 四份報告與實際 BIN 的大小、CRC32、SHA256 相符。START、END／EOT、完整接受 bytes、APP_READY 及全部 256-byte installed metadata 均已確認。
- UART0 有四次 boot-validated／update completed、後續 counter 與完整 framed RX／TX；payload 每列 8 bytes。

| 映像 | Bytes | Write 秒 | END CRC 秒 | App 確認秒 | 總秒數 | 報告 |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| 原始 App | 10556 | 15.750 | 0.176 | 1.944 | 18.761 | [PASS 摘要](https://released.github.io/slide_simple_renesas_isp_tool/data/f13_uart_10556b.html) |
| 24 KiB | 24576 | 36.784 | 0.303 | 1.960 | 39.940 | [PASS 摘要](https://released.github.io/slide_simple_renesas_isp_tool/data/f13_uart_24576b.html) |
| 56 KiB | 57344 | 85.957 | 0.576 | 2.024 | 89.445 | [PASS 摘要](https://released.github.io/slide_simple_renesas_isp_tool/data/f13_uart_57344b.html) |
| 119 KiB | 121856 | 182.768 | 1.136 | 3.209 | 188.001 | [PASS 摘要](https://released.github.io/slide_simple_renesas_isp_tool/data/f13_uart_121856b.html) |

- 更新後 Device UART 快照的 RX errors／drops／TX timeouts 為 0；Bridge UART1 deltas 的 RX errors／drops 為 0，每次記有 backend aborts=1。abort 計數與 Device UART 錯誤為不同觀察項。
- Host counter assessment 為 **UNAVAILABLE**，Host Link retry 為 0；不能由此推定所有 Host 計數全程零錯誤。
- 獨立 Transfer 的 PING／ECHO／counters 通過，沒有 Flash 命令。8 組 UART0 RX／TX 的 sequence、command、payload 與八位元組分行相符。[Transfer 摘要](https://released.github.io/slide_simple_renesas_isp_tool/data/f13_uart_transfer.html)
- Transfer 成功段前後的累積 Device RX errors 均為 **1159**，drops／TX timeouts 為 0；不能與更新後 App 的 0 跨執行相減。較早曾有 Host command 0x61 INTERNAL_ERROR；其原因未由本批資料確立。
- 本批涵蓋正常更新後 App 確認；z/Z 人工重置、冷啟動、斷電及其他型號的結果另行驗證。
<!-- F13_UART_MEASURED_END -->

<!-- F24_UART_MEASURED_BEGIN -->
<a id="f24-uart-update-measurements"></a>

### F24 UART App 更新量測

- Device：R7F124FPJ5xFB；F24 bridge；UART1 115200／8-N-1，Host Link 115200。
- Tool 0.1.0.139；Host FW 1.8.1 build 20261023。六份獨立報告與實際 BIN 的 size／CRC32 相符。
- 六次 START、END 均已確認，接受 bytes 等於映像大小；APP_READY 與全部 256-byte installed metadata 相符，UART0 有 boot-validated、update completed 及後續 counter。

| 映像 | Bytes | Write 秒 | END CRC 秒 | App 確認秒 | 總秒數 | 報告 |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| 原始 App | 6724 | 10.573 | 0.128 | 1.930 | 13.615 | [PASS 摘要](https://released.github.io/slide_simple_renesas_isp_tool/data/f24_uart_6724b.html) |
| 8 KiB | 8192 | 12.208 | 0.144 | 1.946 | 15.187 | [PASS 摘要](https://released.github.io/slide_simple_renesas_isp_tool/data/f24_uart_8192b.html) |
| 24 KiB | 24576 | 36.835 | 0.256 | 1.961 | 39.942 | [PASS 摘要](https://released.github.io/slide_simple_renesas_isp_tool/data/f24_uart_24576b.html) |
| 56 KiB | 57344 | 86.038 | 0.480 | 1.962 | 89.369 | [PASS 摘要](https://released.github.io/slide_simple_renesas_isp_tool/data/f24_uart_57344b.html) |
| 120 KiB | 122880 | 184.479 | 0.945 | 2.635 | 188.949 | [PASS 摘要](https://released.github.io/slide_simple_renesas_isp_tool/data/f24_uart_122880b.html) |
| 247 KiB | 252928 | 380.445 | 1.842 | 9.557 | 392.734 | [PASS 摘要](https://released.github.io/slide_simple_renesas_isp_tool/data/f24_uart_252928b.html) |

- Device UART 的 RX errors、RX drops、TX timeouts 均為 0；這些欄位是 Device 當次執行快照。
- Host counter assessment 為 **UNAVAILABLE**，不能據此推定 Host 全程零錯誤；Host Link retry 為 0。
- 247 KiB 的唯讀 App 確認有 37 次 Host BUSY 觀察，最終確認成功；沒有重送 Flash START／END。
- UART Custom Transfer 及獨立 Xmodem Transfer 均有通過紀錄；Xmodem Boot／App 的更新與 UART0 trace 證據集中於 [F24 Xmodem 更新量測](https://released.github.io/slide_simple_renesas_isp_tool/serial-isp.html#f24-xmodem-update-measurements)。
- 本表涵蓋一般更新與軟體重啟後 App 確認；冷啟動、斷電及其他故障恢復不由本批資料推定。
<!-- F24_UART_MEASURED_END -->

<!-- G16_UART_MEASURED_BEGIN -->
<a id="g16-uart-update-measurements"></a>

### G16 UART ISP App 更新量測

配對工程、接線與 Boot／App 機制見 [G16 × UART ISP](uart-device.html#upgrade-g16-uart)。

- Device：R5F121BCAFP，HOCO／CPU 16 MHz；F24 bridge；Device UART1 與 Host Link 各為 115200／8-N-1。Tool 0.1.0.146，Host FW 1.8.1 build 20261023。
- 兩份報告與實際 BIN 的長度、CRC32 相符，來源報告及映像由 SHA256 識別。START、END／EOT、完整接受 bytes、APP_READY 與全部 256-byte installed metadata 均已確認。
- UART0 擷取各有兩次 boot-validated／update completed、後續 counter 與完整 RX／TX。payload 每列最多 8 bytes；四頁 metadata 組合分別與兩份 BIN 的 256 bytes 相同。

| 映像 | Bytes | Write 秒 | END CRC 秒 | App 確認秒 | 總秒數 | 報告 |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| 原始 App | 10240 | 15.271 | 0.256 | 1.944 | 18.359 | [PASS 摘要](https://released.github.io/slide_simple_renesas_isp_tool/data/g16_uart_10240b.html) |
| 23 KiB | 23552 | 35.247 | 0.496 | 1.945 | 38.577 | [PASS 摘要](https://released.github.io/slide_simple_renesas_isp_tool/data/g16_uart_23552b.html) |

- 最大完整 App BIN 為 23 KiB，範圍至 `0x07BFF`；Boot 8 KiB 與 `0x07C00..0x07FFF` 保留區不在 App 更新範圍。第二份映像從執行中的 App 經 ENTER 返回 Boot 更新。
- 更新後 Device UART 快照的 RX errors／drops／TX timeouts 為 0；Bridge RX errors／drops 為 0，backend aborts=1 仍保留。Host counter assessment 為 **UNAVAILABLE**、Host Link retry 為 0，不推定全程零錯誤。
- 獨立 UART Transfer 的 PING／ECHO／counters 與 final INFO 三次通過，沒有 Flash 命令。[Transfer 摘要](https://released.github.io/slide_simple_renesas_isp_tool/data/g16_uart_transfer.html)
- Transfer 成功段的累積 Device RX errors 保持 **119**，drops／TX timeouts 為 0；此批未提供 Transfer UART0 擷取，不能與 App 的 0 跨執行相減。
- 結果限正常更新後 App 確認；z/Z 人工重置、冷啟動、斷電恢復及其他介面／型號另行驗證。
<!-- G16_UART_MEASURED_END -->

<a id="experiment-xmodem"></a>

## Xmodem

<!-- F13_XMODEM_MEASURED_BEGIN -->
<a id="f13-xmodem-update-measurements"></a>

### F13 Xmodem App 更新量測

- Device：R5F10BMG；F24 bridge；Device UART1 與 Host Link 各為 115200／8-N-1。Tool 0.1.0.139，Host FW 1.8.1 build 20261023。
- 四份報告與實際 BIN 的大小、CRC32、SHA256 相符。START、END／EOT、完整接受 bytes、APP_READY 及全部 256-byte installed metadata 均已確認。
- UART0 有四次 boot-validated／update completed、後續 counter 與完整 framed RX／TX；payload 每列 8 bytes。

| 映像 | Bytes | Write 秒 | END CRC 秒 | App 確認秒 | 總秒數 | 報告 |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| 原始 App | 12636 | 11.108 | 0.192 | 1.944 | 15.143 | [PASS 摘要](https://released.github.io/slide_simple_renesas_isp_tool/data/f13_xmodem_12636b.html) |
| 24 KiB | 24576 | 21.721 | 0.287 | 1.958 | 25.862 | [PASS 摘要](https://released.github.io/slide_simple_renesas_isp_tool/data/f13_xmodem_24576b.html) |
| 56 KiB | 57344 | 51.094 | 0.576 | 2.022 | 55.588 | [PASS 摘要](https://released.github.io/slide_simple_renesas_isp_tool/data/f13_xmodem_57344b.html) |
| 119 KiB | 121856 | 108.767 | 1.136 | 3.208 | 115.010 | [PASS 摘要](https://released.github.io/slide_simple_renesas_isp_tool/data/f13_xmodem_121856b.html) |

- 更新後 Device UART 快照的 RX errors／drops／TX timeouts 為 0；Bridge UART1 deltas 的 RX errors／drops 為 0，每次記有 backend aborts=1。abort 計數與 Device UART 錯誤為不同觀察項。
- Host counter assessment 為 **UNAVAILABLE**，Host Link retry 為 0；不能由此推定所有 Host 計數全程零錯誤。
- 獨立 Transfer 的 PING／ECHO／counters 及 CRC128 streaming 通過，沒有 Flash 命令。11 組 UART0 RX／TX 的 sequence、command、payload 與八位元組分行相符。[Transfer 摘要](https://released.github.io/slide_simple_renesas_isp_tool/data/f13_xmodem_transfer.html)
- Transfer 成功段前後的累積 Device RX errors 均為 **658**，drops／TX timeouts 為 0；不能與更新後 App 的 0 跨執行相減。
- 本批涵蓋正常更新後 App 確認；z/Z 人工重置、冷啟動、斷電及其他型號的結果另行驗證。
<!-- F13_XMODEM_MEASURED_END -->

<!-- F24_XMODEM_MEASURED_BEGIN -->
<a id="f24-xmodem-update-measurements"></a>

### F24 Xmodem App 更新量測

- Device：R7F124FPJ5xFB；F24 bridge；UART1 115200／8-N-1，Host Link 115200。
- Tool 0.1.0.139；Host FW 1.8.1 build 20261023。六份獨立報告與實際 BIN 的 size／CRC32 相符。
- 六次 START、END 均已確認，接受 bytes 等於映像大小；APP_READY 與全部 256-byte installed metadata 相符，UART0 有 boot-validated、update completed 及後續 counter。

| 映像 | Bytes | Write 秒 | END CRC 秒 | App 確認秒 | 總秒數 | 報告 |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| 原始 App | 7856 | 6.883 | 0.127 | 1.944 | 10.851 | [PASS 摘要](https://released.github.io/slide_simple_renesas_isp_tool/data/f24_xmodem_7856b.html) |
| 8 KiB | 8192 | 7.155 | 0.127 | 1.956 | 11.138 | [PASS 摘要](https://released.github.io/slide_simple_renesas_isp_tool/data/f24_xmodem_8192b.html) |
| 24 KiB | 24576 | 21.464 | 0.240 | 1.943 | 25.544 | [PASS 摘要](https://released.github.io/slide_simple_renesas_isp_tool/data/f24_xmodem_24576b.html) |
| 56 KiB | 57344 | 50.549 | 0.480 | 1.958 | 54.884 | [PASS 摘要](https://released.github.io/slide_simple_renesas_isp_tool/data/f24_xmodem_57344b.html) |
| 120 KiB | 122880 | 108.125 | 0.928 | 2.648 | 113.598 | [PASS 摘要](https://released.github.io/slide_simple_renesas_isp_tool/data/f24_xmodem_122880b.html) |
| 247 KiB | 252928 | 222.702 | 1.841 | 9.531 | 235.969 | [PASS 摘要](https://released.github.io/slide_simple_renesas_isp_tool/data/f24_xmodem_252928b.html) |

- Device UART 的 RX errors、RX drops、TX timeouts 均為 0；這些欄位是 Device 當次執行快照。
- Host counter assessment 為 **UNAVAILABLE**，不能據此推定 Host 全程零錯誤；Host Link retry 為 0。
- 247 KiB 的唯讀 App 確認有 37 次 Host BUSY 觀察，最終確認成功；沒有重送 Flash START／END。
- 獨立 Xmodem Transfer 通過 PING、96-byte ECHO、389-byte CRC32 sink／CRC128 串流與 counters；UART0 的 9 組 framed RX／TX、sequence／command、完整 payload 及每列 8 bytes 可互相核對。[Transfer 摘要](https://released.github.io/slide_simple_renesas_isp_tool/data/f24_xmodem_transfer.html)
- Transfer 成功段前後的 Device UART RX errors 均為 **44**，RX drops／TX timeouts 為 0；這是同一次執行的累積快照，不能解讀成全程零錯誤，也不能與更新後 App 的 0 跨執行相減。
- 原始連線階段曾有 Host command 0x61 TIMEOUT 及讀取中斷 995；重新 Open + Probe 後才取得上述 Transfer 成功紀錄。錯誤原因沒有由本批資料確立。
- 六次 App 重啟均有 boot-validated、update completed、UART0 console 與後續 counter；提供的 log 沒有 z/Z 人工重置訊息，故不將功能宣告視為該操作的實板證據。
- 本表涵蓋一般更新與軟體重啟後 App 確認；冷啟動、斷電及其他故障恢復不由本批資料推定。
<!-- F24_XMODEM_MEASURED_END -->

<!-- G16_XMODEM_MEASURED_BEGIN -->
<a id="g16-xmodem-update-measurements"></a>

### G16 Xmodem App 更新量測

配對工程、接線與 Boot／App 機制見 [G16 × Xmodem](xmodem-device.html#upgrade-g16-xmodem)。

- Device：R5F121BCAFP，HOCO／CPU 16 MHz；F24 bridge；Device UART1 與 Host Link 各為 115200／8-N-1。Tool 0.1.0.146，Host FW 1.8.1 build 20261023。
- 三份報告與實際 BIN 的長度、CRC32 相符，來源報告及映像由 SHA256 識別。START、END／EOT、完整接受 bytes、APP_READY 與全部 256-byte installed metadata 均已確認。
- UART0 擷取各有兩次 boot-validated／update completed、後續 counter 與完整 RX／TX。payload 每列最多 8 bytes；四頁 metadata 組合分別與兩份 BIN 的 256 bytes 相同。

| 映像 | Bytes | Write 秒 | END CRC 秒 | App 確認秒 | 總秒數 | 報告 |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| 原始 App | 12304 | 10.773 | 0.287 | 1.945 | 14.917 | [PASS 摘要](https://released.github.io/slide_simple_renesas_isp_tool/data/g16_xmodem_12304b.html) |
| 23 KiB | 23552 | 20.616 | 0.480 | 1.944 | 24.952 | [PASS 摘要](https://released.github.io/slide_simple_renesas_isp_tool/data/g16_xmodem_23552b.html) |

- 原始 App 另有一次 14.949 秒的 PASS 報告；表列相同映像的另一次 14.917 秒紀錄。兩次均確認 APP_READY／installed metadata。
- 最大完整 App BIN 為 23 KiB，範圍至 `0x07BFF`；Boot 8 KiB 與 `0x07C00..0x07FFF` 保留區不在 App 更新範圍。第二份映像從執行中的 App 經 ENTER 返回 Boot 更新。
- 更新後 Device UART 快照的 RX errors／drops／TX timeouts 為 0；Bridge RX errors／drops 為 0，backend aborts=1 仍保留。Host counter assessment 為 **UNAVAILABLE**、Host Link retry 為 0，不推定全程零錯誤。
- 獨立 Xmodem Transfer 已通過實板驗證；Discover／INFO 三次成功，沒有 Flash 命令。[Transfer 摘要](https://released.github.io/slide_simple_renesas_isp_tool/data/g16_xmodem_transfer.html)
- Transfer 成功段的累積 Device RX errors 保持 **104**，drops／TX timeouts 為 0；此批未提供 Transfer UART0 擷取，不能與 App 的 0 跨執行相減。
- 結果限正常更新後 App 確認；z/Z 人工重置、冷啟動、斷電恢復及其他介面／型號另行驗證。
<!-- G16_XMODEM_MEASURED_END -->

---

[上一主題：Flash、Metadata 與 CAN 封包參考](reference.html) · [指南入口](index.html) · [下一主題：Tool 操作與通訊驗證入口](tool-guides.html)
