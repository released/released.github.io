[知識庫首頁](https://released.github.io/) · [ISP Tool](index.html)

<a id="article_top"></a>

# Xmodem 操作

XMODEM-CRC128 更新與無 Flash 串流測試。

<a id="xmodem-operation"></a>


1. 完成[資料 UART 接線](serial-isp.html#serial-wiring)與 [Open + Probe Host](operation.html#tool-operation)。Xmodem 使用同一個 **UART / Xmodem** tab，不另開 COM。
2. 設定 **Bridge port** 與 **Device baud**；更新 App 時 Workflow 選 **XMODEM-CRC**，使用配對 Xmodem App BIN，依[共用更新流程](serial-isp.html#serial-app-update)執行。
3. 測試獨立 Xmodem Transfer 時選 **Xmodem Transfer → Discover Test Target → Transfer Test**。Tool 執行 PING／ECHO／counters 與 CRC128 streaming，資料進入診斷 RAM sink，不擦寫 Flash。

| 需要查閱的資料 | 直接入口 |
| --- | --- |
| MCU 工程、Boot／App 機制、實驗資料 | [RL78 Xmodem](../slide_boot_loader_for_RL78/xmodem-device.html)／[RH850 Xmodem](../slide_boot_loader_for_RH850/xmodem-device.html) |
| CRC16、block、EOT 與 ACK | [Xmodem 協定格式](../slide_boot_loader_for_RL78/xmodem-device.html#xmodem-protocol) |
| 完成、取消與未知結果 | [共用報告與結果判讀](status-and-reports.html) |
| G22 | [XMODEM-CRC128 配對工程與實板紀錄](../slide_boot_loader_for_RL78/xmodem-device.html#upgrade-g22-xmodem) |

---

[Tool 首頁](index.html) · [共用接線與更新流程](serial-isp.html) · [結果與報告](status-and-reports.html)
