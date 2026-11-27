[知識庫首頁](https://released.github.io/) · [RH850 Bootloader](index.html)

<a id="article_top"></a>

# 各介面實驗資料

依介面與 MCU 查閱實板紀錄、量測條件、報告與確認範圍。

<!-- BOOTLOADER_TOPICS_BEGIN -->
<details>
<summary>章節與另一平台對照</summary>

| 章節／規格 | 本頁 | 另一平台 |
| --- | --- | --- |
| 實驗資料與確認範圍 | [閱讀](#experiment-scope) | [RL78](../slide_boot_loader_for_RL78/experiments.html#experiment-scope) |
| App BIN 更新耗時參考 | [閱讀](#guide-app-development-8) | [RL78](../slide_boot_loader_for_RL78/experiments.html#guide-app-development-8) |

</details>
<!-- BOOTLOADER_TOPICS_END -->

<a id="experiment-scope"></a>

## 實驗資料與確認範圍

各表保留所選映像、傳輸條件、結果及限制；工程存在與實板確認是不同資訊。未列紀錄的組合不推定為未實作或已驗證。

| 介面 | MCU／資料 | 直接入口 |
| --- | --- | --- |
| CAN | RH850；按報告條件分列 | [映像大小與報告](#rh850-can-update-measurements) |
| CAN FD | RH850；FD+BRS | [映像大小與報告](#rh850-can-fd-update-measurements) |
| I2C | RH850；Transfer 與 App 更新 | [實板量測](#rh850-i2c-update-measurements) |
| UART／Xmodem | 共用協定參考 | [介面索引](index.html#boot-interfaces) |

<!-- RH850_TIMING_BEGIN -->
<a id="rh850-update-timing"></a>

<a id="guide-app-development-8"></a>

### App BIN 更新耗時參考

下表採用 Firmware update report 的實際紀錄，作為估算更新時間的參考。
映像大小使用 `input_bytes`；總耗時使用 `elapsed_ms`，包含 Metadata、START、傳送、END CRC、App 啟動確認與 Tool 流程開銷。
同大小及相同映像／通訊條件採首次完成 CRC／App 確認的紀錄；其餘測次保留在來源摘要。
App BIN 包含 entry、Metadata、IRQ table、程式、填充與 CRC；64 KiB Boot 不在更新 BIN 內，此 EVM 的 App 容量為960 KiB。
Classical CAN 與 CAN FD 依 Host Baud／bus 條件分組，各自保留量測日期、Tool 與來源報告。
分階段表以報告日期／時間作為連結標籤；完整來源檔名與 SHA256 保留於量測摘要。

Classical CAN 量測條件為 R7F701684 EVM、X1 16 MHz／CPU 120 MHz／CAN 40 MHz、500 kbit/s，Host Link 115200 baud。
Host firmware 1.8.1／build 20261023；Device Boot 1.0.0／build 20261022、App 1.0.0／build 20261021。
原始 App 為35,768 bytes；填充測試 BIN 為64／192／448／960 KiB。
五次均通過 END CRC、App 啟動／映像比對及 CAN_STOP；UART timer 持續遞增，重試與已記錄的 Host 錯誤差值均為 0。

CAN FD的完成紀錄另包含35,768 bytes原始App、64／192／448 KiB與944／956／959／960 KiB填充映像。
944／956／959／960 KiB的報告依序確認前一個已安裝映像及更新後live INFO；四次均完成END CRC、
App啟動確認及CAN_STOP，記錄的Host錯誤差值與重試為0。這些結果涵蓋最後32 KiB Flash block，
其中960 KiB包含完整尾端；不代表每種電源、debugger連線或故障條件皆已驗證。

相同960 KiB映像亦曾發生END CRC通過、App未確認的結果；失敗紀錄與成功測次分別保留，
原因尚未確定。960 KiB映像另經使用者實板操作確認，冷啟動可正常動作；
這項人工觀察結果與下表報告中的更新後App確認分別記錄，未另附冷啟動UART紀錄。Flash／Work RAM範圍見
[Boot安裝與尾端配置](porting.html#guide-porting-4)。

<!-- RH850_TIMING_DATA_BEGIN -->
<a id="rh850-can-update-measurements"></a>

#### Classical CAN／Host 115200 baud

量測日期：2026-11-02；Tool：0.1.0.0114。
Host Baud：115200 bit/s；報告記錄的 bus 條件：Classical CAN 500K, standard data RX filter 0x00000701 / 0x000007FF。

| App BIN | bytes | 寫入相關階段 | App 確認 | 總耗時 | 報告 |
| --- | --- | --- | --- | --- | --- |
| 34.93 KiB | 35,768 | 19.3 s | 1.5 s | 21.3 s | [量測摘要](data/update_20261102_104340_302_63508_432104234_17.html) |
| 64.00 KiB | 65,536 | 34.2 s | 1.5 s | 36.2 s | [量測摘要](data/update_20261102_104440_865_63508_432164796_18.html) |
| 192.00 KiB | 196,608 | 100.5 s | 2.5 s | 103.5 s | [量測摘要](data/update_20261102_104640_859_63508_432284781_19.html) |
| 448.00 KiB | 458,752 | 232.9 s | 4.6 s | 238.0 s | [量測摘要](data/update_20261102_105059_529_63508_432543421_20.html) |
| 960.00 KiB | 983,040 | 499.0 s | 6.5 s | 506.1 s | [量測摘要](data/update_20261102_105946_691_63508_433070515_21.html) |

##### Classical CAN／Host 115200 baud：分階段原始數值

| 來源報告 | Metadata | START | transfer | END CRC | App 確認 | elapsed_ms |
| --- | --- | --- | --- | --- | --- | --- |
| [20261102_104340](data/update_20261102_104340_302_63508_432104234_17.html) | 1056 ms | 15 ms | 18168 ms | 48 ms | 1489 ms | 21291 ms |
| [20261102_104440](data/update_20261102_104440_865_63508_432164796_18.html) | 1055 ms | 48 ms | 33046 ms | 63 ms | 1506 ms | 36234 ms |
| [20261102_104640](data/update_20261102_104640_859_63508_432284781_19.html) | 1063 ms | 63 ms | 99187 ms | 160 ms | 2515 ms | 103513 ms |
| [20261102_105059](data/update_20261102_105059_529_63508_432543421_20.html) | 1060 ms | 159 ms | 231390 ms | 336 ms | 4565 ms | 238036 ms |
| [20261102_105946](data/update_20261102_105946_691_63508_433070515_21.html) | 1062 ms | 336 ms | 496944 ms | 688 ms | 6488 ms | 506058 ms |

<a id="rh850-can-fd-update-measurements"></a>

#### CAN FD／Host 115200 baud

量測日期：2026-10-27、2026-11-05；Tool：0.1.0.0109、0.1.0.0115。
Host Baud：115200 bit/s；報告記錄的 bus 條件：CAN FD 500K/2M, standard data RX filter 0x00000701 / 0x000007FF。

| App BIN | bytes | 寫入相關階段 | App 確認 | 總耗時 | 報告 |
| --- | --- | --- | --- | --- | --- |
| 29.18 KiB | 29,876 | 16.2 s | 10.1 s | 26.8 s | [量測摘要](data/update_20261027_070530_320_31112_4626953_1.html) |
| 64.00 KiB | 65,536 | 34.3 s | 9.8 s | 44.6 s | [量測摘要](data/update_20261027_070726_000_31112_4742640_2.html) |
| 192.00 KiB | 196,608 | 100.4 s | 10.4 s | 111.4 s | [量測摘要](data/update_20261027_070952_777_31112_4889406_3.html) |
| 448.00 KiB | 458,752 | 233.9 s | 10.3 s | 244.7 s | [量測摘要](data/update_20261027_071505_750_31112_5202390_4.html) |
| 960.00 KiB | 983,040 | 499.5 s | 11.8 s | 511.8 s | [量測摘要](data/update_20261027_072426_940_31112_5763562_5.html) |
| 34.93 KiB | 35,768 | 19.2 s | 1.5 s | 21.2 s | [量測摘要](data/update_20261105_023439_091_16348_73046265_1.html) |
| 64.00 KiB | 65,536 | 34.2 s | 1.5 s | 36.2 s | [量測摘要](data/update_20261105_023543_273_16348_73110453_2.html) |
| 192.00 KiB | 196,608 | 101.3 s | 2.6 s | 104.5 s | [量測摘要](data/update_20261105_023742_825_16348_73230000_3.html) |
| 448.00 KiB | 458,752 | 234.3 s | 4.6 s | 239.4 s | [量測摘要](data/update_20261105_024204_512_16348_73491671_4.html) |
| 944.00 KiB | 966,656 | 490.0 s | 6.5 s | 497.0 s | [量測摘要](data/update_20261105_110744_756_15320_103831187_1.html) |
| 956.00 KiB | 978,944 | 495.9 s | 6.5 s | 503.0 s | [量測摘要](data/update_20261105_112021_170_15320_104587578_2.html) |
| 959.00 KiB | 982,016 | 497.5 s | 6.5 s | 504.5 s | [量測摘要](data/update_20261105_112941_593_15320_105148000_3.html) |
| 960.00 KiB | 983,040 | 498.7 s | 6.5 s | 505.7 s | [量測摘要](data/update_20261105_114227_919_15320_105914296_4.html) |

##### CAN FD／Host 115200 baud：分階段原始數值

| 來源報告 | Metadata | START | transfer | END CRC | App 確認 | elapsed_ms |
| --- | --- | --- | --- | --- | --- | --- |
| [20261027_070530](data/update_20261027_070530_320_31112_4626953_1.html) | 1055 ms | 15 ms | 15077 ms | 32 ms | 10099 ms | 26795 ms |
| [20261027_070726](data/update_20261027_070726_000_31112_4742640_2.html) | 1055 ms | 32 ms | 33151 ms | 64 ms | 9761 ms | 44578 ms |
| [20261027_070952](data/update_20261027_070952_777_31112_4889406_3.html) | 1067 ms | 64 ms | 99113 ms | 160 ms | 10441 ms | 111366 ms |
| [20261027_071505](data/update_20261027_071505_750_31112_5202390_4.html) | 1059 ms | 160 ms | 232331 ms | 336 ms | 10305 ms | 244718 ms |
| [20261027_072426](data/update_20261027_072426_940_31112_5763562_5.html) | 1086 ms | 336 ms | 497394 ms | 689 ms | 11751 ms | 511840 ms |
| [20261105_023439](data/update_20261105_023439_091_16348_73046265_1.html) | 1054 ms | 16 ms | 18118 ms | 47 ms | 1473 ms | 21226 ms |
| [20261105_023543](data/update_20261105_023543_273_16348_73110453_2.html) | 1055 ms | 48 ms | 32998 ms | 64 ms | 1489 ms | 36169 ms |
| [20261105_023742](data/update_20261105_023742_825_16348_73230000_3.html) | 1067 ms | 64 ms | 100053 ms | 160 ms | 2643 ms | 104513 ms |
| [20261105_024204](data/update_20261105_024204_512_16348_73491671_4.html) | 1073 ms | 160 ms | 232770 ms | 336 ms | 4565 ms | 239435 ms |
| [20261105_110744](data/update_20261105_110744_756_15320_103831187_1.html) | 1060 ms | 703 ms | 487526 ms | 688 ms | 6472 ms | 496995 ms |
| [20261105_112021](data/update_20261105_112021_170_15320_104587578_2.html) | 1077 ms | 688 ms | 493488 ms | 689 ms | 6472 ms | 502954 ms |
| [20261105_112941](data/update_20261105_112941_593_15320_105148000_3.html) | 1072 ms | 700 ms | 495009 ms | 688 ms | 6488 ms | 504505 ms |
| [20261105_114227](data/update_20261105_114227_919_15320_105914296_4.html) | 1075 ms | 701 ms | 496234 ms | 689 ms | 6471 ms | 505715 ms |

<!-- RH850_TIMING_DATA_END -->

寫入相關階段為 Metadata＋START＋transfer＋END CRC；總耗時另外包含 App 確認及未單獨分階段的 Tool 開銷。
Classical CAN 使用 500 kbit/s；CAN FD 使用 nominal 500 kbit/s／data 2 Mbit/s，對應範例的資料幀使用 BRS。
PC 到 MCU host 的 Host Baud 與 CAN bus 速率分別記錄，不將 data rate 當成實際有效寫入速率。
耗時供相同 Host Baud／CAN 設定下的量級參考。

容量與 Boot 分區見 [Flash mapping](porting.html#rh850-flash-layout)，封包與 page 累積見 [格式參考](reference.html#rh850-can-frames)，App IRQ／交接見 [App 開發](app-development.html#rh850-app-editing)。
操作後的實際結果以 [Firmware update report](https://released.github.io/slide_simple_renesas_isp_tool/status-and-reports.html#update-confirmation) 為準。
<!-- RH850_TIMING_END -->

<!-- RH850_I2C_MEASURED_BEGIN -->
<a id="rh850-i2c-update-measurements"></a>

### I2C ISP 實板量測

R7F701684、F24 Bridge、I2C 100 kHz、7-bit 位址 `0x20`，Host Link 115200。接線、配對映像及流程見 [RH850 × I2C 工程設定](i2c-device.html#upgrade-rh850-i2c)。

| App BIN | Bytes | CRC32 | Write（s） | END CRC（s） | App 確認（s） | 總耗時（s） |
| --- | ---: | --- | ---: | ---: | ---: | ---: |
| 正式 App | 26,380 | `0x1E2D1D94` | 45.242 | 0.109 | 1.996 | 48.401 |
| 64 KiB | 65,536 | `0x052022B6` | 112.564 | 0.170 | 2.007 | 115.796 |
| 192 KiB | 196,608 | `0xD7C171E5` | 337.683 | 0.234 | 3.033 | 342.004 |
| 448 KiB | 458,752 | `0xD14E042C` | 790.122 | 0.417 | 5.069 | 796.665 |
| 960 KiB | 983,040 | `0x153845EB` | 1695.078 | 0.788 | 6.993 | 1703.928 |

- 五筆更新均確認 START、END、APP_READY 和全部 256 bytes 的已安裝 Metadata。每筆都觀察到 App 進入 Boot，更新後 UART0 印出 App 啟動標記及完成訊息。
- 獨立 Transfer 完成三輪 PING、ECHO、計數器及最終 INFO。UART0 紀錄中的三對 96-byte ECHO 內容相符，全程無 Flash 指令。
- Host Link retry 為 0，Host 錯誤計數差值無法比較。測試範圍為正常更新與 warm ENTER。獨立冷啟動、UART0 z/Z 和更新中斷復原另需驗證。
<!-- RH850_I2C_MEASURED_END -->

---

[上一主題：Flash、Metadata 與 CAN 封包參考](reference.html) · [指南入口](index.html) · [下一主題：Tool 操作與通訊驗證入口](tool-guides.html)
