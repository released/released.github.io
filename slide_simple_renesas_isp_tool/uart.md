[知識庫首頁](https://released.github.io/) · [ISP Tool](index.html)

<a id="article_top"></a>

# UART 操作

Device baud、UART ISP 更新與 Custom Transfer。

<a id="uart-operation"></a>


1. 依[共用接線表](serial-isp.html#serial-wiring)交叉連接資料 TX／RX，診斷 UART0 另接 terminal，再完成 [Open + Probe Host](operation.html#tool-operation)。
2. 選 **UART / Xmodem** tab、實接 **Bridge port** 與 **Device baud**，Workflow 選 **UART ISP**。Host Baud 與 Device baud 分開設定；Device 使用 8-N-1，範例預設 115200。
3. 依[共用更新流程](serial-isp.html#serial-app-update)更新配對 App BIN；測試獨立 UART Transfer 時改選 **Custom Transfer → Discover Test Target → Transfer Test**，不擦寫 Flash。

| 需要查閱的資料 | 直接入口 |
| --- | --- |
| MCU 工程、Boot／App 機制、實驗資料 | [RL78 UART](../slide_boot_loader_for_RL78/uart-device.html)／[RH850 UART](../slide_boot_loader_for_RH850/uart-device.html) |
| 可選 baud 與映像條件 | [通訊設定與更新必要條件](serial-isp.html#serial-update-requirements) |
| 獨立 Log、RX／TX 診斷及 z/Z | [Device 串列診斷](serial-isp.html#serial-device-diagnostics) |

---

[Tool 首頁](index.html) · [共用接線與更新流程](serial-isp.html) · [結果與報告](status-and-reports.html)
