[知識庫首頁](https://released.github.io/) · [RH850 Bootloader](index.html)

<a id="article_top"></a>

# I2C Bootloader 與協定格式

I2C Slave、STOP mailbox、111-byte reply window 與更新完成條件。

<!-- BOOTLOADER_TOPICS_BEGIN -->
<details>
<summary>章節與另一平台對照</summary>

| 章節／規格 | 本頁 | 另一平台 |
| --- | --- | --- |
| 工程與接線 | [閱讀](#guide-i2c-device-1) | [RL78](../slide_boot_loader_for_RL78/i2c-device.html#guide-i2c-device-1) |
| 通訊設定 | [閱讀](#guide-i2c-device-2) | [RL78](../slide_boot_loader_for_RL78/i2c-device.html#guide-i2c-device-2) |
| Boot 執行流程 | [閱讀](#guide-i2c-device-3) | [RL78](../slide_boot_loader_for_RL78/i2c-device.html#guide-i2c-device-3) |
| Protocol Format | [閱讀](#guide-i2c-device-4) | [RL78](../slide_boot_loader_for_RL78/i2c-device.html#guide-i2c-device-4) |
| 異常與完成條件 | [閱讀](#guide-i2c-device-5) | [RL78](../slide_boot_loader_for_RL78/i2c-device.html#guide-i2c-device-5) |
| 程式對照與診斷 | [閱讀](#guide-i2c-device-6) | [RL78](../slide_boot_loader_for_RL78/i2c-device.html#guide-i2c-device-6) |

</details>
<!-- BOOTLOADER_TOPICS_END -->

<!-- DEVICE_UPGRADE_PATHS_BEGIN -->
## MCU 與實板資料

本指南尚未列出此介面的實板更新紀錄；[平台工程設定](serial-device.html#guide-serial-device-1)與下方共用機制仍可查閱。工程資訊與硬體驗證分開判讀。
<!-- DEVICE_UPGRADE_PATHS_END -->

<!-- I2C_DEVICE_BEGIN -->
<a id="i2c-bootloader"></a>
<a id="guide-serial-device-7"></a>

[I2C 共用機制與封包範例](../slide_boot_loader_for_RL78/i2c-device.html)由 RL78 介面章節維護；本頁提供 RH850 工程與實驗索引。

<a id="guide-i2c-device-1"></a>

### 工程與接線

[共用說明與流程](../slide_boot_loader_for_RL78/i2c-device.html#guide-i2c-device-1)；[RH850 周邊配置](serial-device.html#guide-serial-device-1)。

<a id="guide-i2c-device-2"></a>

### 通訊設定

[共用說明與流程](../slide_boot_loader_for_RL78/i2c-device.html#guide-i2c-device-2)；[RH850 周邊配置](serial-device.html#guide-serial-device-1)。

<a id="guide-i2c-device-3"></a>
<a id="i2c-boot-flow"></a>

### Boot 執行流程

[共用說明與流程](../slide_boot_loader_for_RL78/i2c-device.html#guide-i2c-device-3)；[RH850 周邊配置](serial-device.html#guide-serial-device-1)。

<a id="guide-i2c-device-4"></a>
<a id="i2c-protocol"></a>

### Protocol Format

[共用說明與流程](../slide_boot_loader_for_RL78/i2c-device.html#guide-i2c-device-4)；[RH850 周邊配置](serial-device.html#guide-serial-device-1)。

<a id="guide-i2c-device-5"></a>

### 異常與完成條件

[共用說明與流程](../slide_boot_loader_for_RL78/i2c-device.html#guide-i2c-device-5)；[RH850 周邊配置](serial-device.html#guide-serial-device-1)。

<a id="guide-i2c-device-6"></a>

### 程式對照與診斷

[共用說明與流程](../slide_boot_loader_for_RL78/i2c-device.html#guide-i2c-device-6)；[RH850 周邊配置](serial-device.html#guide-serial-device-1)。
<!-- I2C_DEVICE_END -->

<!-- MODEL_DETAILS_BEGIN -->

<!-- MODEL_DETAILS_END -->

---

[上一主題：CAN FD Bootloader 與工程](can-fd-device.html) · [指南入口](index.html) · [下一主題：UART Bootloader 與協定格式](uart-device.html)
