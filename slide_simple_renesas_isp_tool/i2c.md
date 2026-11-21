[知識庫首頁](https://released.github.io/) · [ISP Tool](index.html)

<a id="article_top"></a>

# I2C 操作

I2C port、7-bit 位址、時脈、App 更新與 Custom Transfer。

<a id="i2c-operation"></a>


1. 依[共用接線表](serial-isp.html#serial-wiring)連接 SCL／SDA、共地及相容上拉，再完成 [Open + Probe Host](operation.html#tool-operation)。
2. 選 **I2C** tab、實接 **Bridge port**、**I2C speed** 與未左移的 **Slave (7-bit)**；值須符合已安裝的 Boot／App 及 BIN。範例預設為 100 kHz／`0x20`，並非固定限制。
3. 更新 App 選 **I2C ISP**，依[共用更新流程](serial-isp.html#serial-app-update)執行；測試獨立 Transfer 選 **Custom Transfer → Discover Test Target → Transfer Test**，不載入 BIN、不擦寫 Flash。

| 需要查閱的資料 | 直接入口 |
| --- | --- |
| MCU 工程、Boot／App 機制、實驗資料 | [RL78 I2C](../slide_boot_loader_for_RL78/i2c-device.html)／[RH850 I2C](../slide_boot_loader_for_RH850/i2c-device.html) |
| 位址／速率與映像要求 | [通訊設定與更新必要條件](serial-isp.html#serial-update-requirements) |
| NACK、timeout 或 App 未確認 | [錯誤與未知結果](status-and-reports.html#tool-error-guidance) |

G16 Reference 是另一個唯讀 workflow，不提供 ISP erase／write／jump；見[Reference 探索](serial-isp.html#4-i2c-master)。

---

[Tool 首頁](index.html) · [共用接線與更新流程](serial-isp.html) · [結果與報告](status-and-reports.html)
