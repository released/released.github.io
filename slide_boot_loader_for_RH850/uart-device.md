[知識庫首頁](https://released.github.io/) · [RH850 Bootloader](index.html)

<a id="article_top"></a>

# UART Bootloader 與協定格式

資料 UART、接收中斷、framed ISP 更新、封包範例與診斷。

<!-- BOOTLOADER_TOPICS_BEGIN -->
<details>
<summary>章節與另一平台對照</summary>

| 章節／規格 | 本頁 | 另一平台 |
| --- | --- | --- |
| 工程與接線 | [閱讀](#guide-uart-device-1) | [RL78](../slide_boot_loader_for_RL78/uart-device.html#guide-uart-device-1) |
| 通訊設定 | [閱讀](#guide-uart-device-2) | [RL78](../slide_boot_loader_for_RL78/uart-device.html#guide-uart-device-2) |
| Boot 執行流程 | [閱讀](#guide-uart-device-3) | [RL78](../slide_boot_loader_for_RL78/uart-device.html#guide-uart-device-3) |
| Protocol Format | [閱讀](#guide-uart-device-4) | [RL78](../slide_boot_loader_for_RL78/uart-device.html#guide-uart-device-4) |
| 異常與完成條件 | [閱讀](#guide-uart-device-5) | [RL78](../slide_boot_loader_for_RL78/uart-device.html#guide-uart-device-5) |
| 程式對照與診斷 | [閱讀](#guide-uart-device-6) | [RL78](../slide_boot_loader_for_RL78/uart-device.html#guide-uart-device-6) |

</details>
<!-- BOOTLOADER_TOPICS_END -->

<!-- DEVICE_UPGRADE_PATHS_BEGIN -->
## 公開範圍與協定參考

目前公開範圍未包含此平台與介面的配對工程、配置及更新映像。通訊概念見 [共用機制與格式](../slide_boot_loader_for_RL78/uart-device.html)；實板資料見 [驗證範圍](experiments.html#experiment-scope)。
<!-- DEVICE_UPGRADE_PATHS_END -->

<!-- UART_DEVICE_BEGIN -->
<a id="uart-bootloader"></a>
<a id="guide-serial-device-6"></a>

[UART 共用機制與封包範例](../slide_boot_loader_for_RL78/uart-device.html)由 RL78 介面章節維護；此處保留共用協定參考，不列 RH850 配對工程。

<a id="guide-uart-device-1"></a>

### 工程與接線

[共用說明與流程](../slide_boot_loader_for_RL78/uart-device.html#guide-uart-device-1)；[公開範圍與參考](serial-device.html#guide-serial-device-1)。

<a id="guide-uart-device-2"></a>

### 通訊設定

[共用說明與流程](../slide_boot_loader_for_RL78/uart-device.html#guide-uart-device-2)；[公開範圍與參考](serial-device.html#guide-serial-device-1)。

<a id="guide-uart-device-3"></a>
<a id="uart-boot-flow"></a>

### Boot 執行流程

[共用說明與流程](../slide_boot_loader_for_RL78/uart-device.html#guide-uart-device-3)；[公開範圍與參考](serial-device.html#guide-serial-device-1)。

<a id="guide-uart-device-4"></a>
<a id="uart-protocol"></a>

### Protocol Format

[共用說明與流程](../slide_boot_loader_for_RL78/uart-device.html#guide-uart-device-4)；[公開範圍與參考](serial-device.html#guide-serial-device-1)。

<a id="guide-uart-device-5"></a>

### 異常與完成條件

[共用說明與流程](../slide_boot_loader_for_RL78/uart-device.html#guide-uart-device-5)；[公開範圍與參考](serial-device.html#guide-serial-device-1)。

<a id="guide-uart-device-6"></a>
<a id="serial-uart-diagnostics"></a>

### 程式對照與診斷

[共用說明與流程](../slide_boot_loader_for_RL78/uart-device.html#guide-uart-device-6)；[公開範圍與參考](serial-device.html#guide-serial-device-1)。

#### UART診斷格式

[診斷欄位與計數範圍](../slide_boot_loader_for_RL78/uart-device.html#serial-uart-diagnostics)依對應公開工程判讀。
<!-- UART_DEVICE_END -->

<!-- MODEL_DETAILS_BEGIN -->

<!-- MODEL_DETAILS_END -->

---

[上一主題：I2C Bootloader 與協定格式](i2c-device.html) · [指南入口](index.html) · [下一主題：Xmodem Bootloader 與協定格式](xmodem-device.html)
