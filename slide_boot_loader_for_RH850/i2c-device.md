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
## MCU 工程與實驗索引

工程設定與實板紀錄分開列出；每個入口直接到達對應主題。

| MCU／料號 | 工程設定 | 實驗資料 |
| --- | --- | --- |
| RH850／R7F701684 | [配對工程與配置](#upgrade-rh850-i2c) | [實板紀錄與限制](experiments.html#rh850-i2c-update-measurements) |


<!-- DEVICE_UPGRADE_PATHS_END -->

<!-- I2C_DEVICE_BEGIN -->
<a id="i2c-bootloader"></a>
<a id="guide-serial-device-7"></a>

[I2C 共用機制與封包範例](../slide_boot_loader_for_RL78/i2c-device.html)由 RL78 介面章節維護；本頁提供 RH850 工程與實驗索引。

<a id="guide-i2c-device-1"></a>

### 工程與接線

[共用說明與流程](../slide_boot_loader_for_RL78/i2c-device.html#guide-i2c-device-1)；[RH850 I2C 工程設定](#upgrade-rh850-i2c)。

<a id="guide-i2c-device-2"></a>

### 通訊設定

[共用說明與流程](../slide_boot_loader_for_RL78/i2c-device.html#guide-i2c-device-2)；[RH850 I2C 工程設定](#upgrade-rh850-i2c)。

<a id="guide-i2c-device-3"></a>
<a id="i2c-boot-flow"></a>

### Boot 執行流程

[共用說明與流程](../slide_boot_loader_for_RL78/i2c-device.html#guide-i2c-device-3)；[RH850 I2C 工程設定](#upgrade-rh850-i2c)。

<a id="guide-i2c-device-4"></a>
<a id="i2c-protocol"></a>

### Protocol Format

[共用說明與流程](../slide_boot_loader_for_RL78/i2c-device.html#guide-i2c-device-4)；[RH850 I2C 工程設定](#upgrade-rh850-i2c)。

<a id="guide-i2c-device-5"></a>

### 異常與完成條件

[共用說明與流程](../slide_boot_loader_for_RL78/i2c-device.html#guide-i2c-device-5)；[RH850 I2C 工程設定](#upgrade-rh850-i2c)。

<a id="guide-i2c-device-6"></a>

### 程式對照與診斷

[共用說明與流程](../slide_boot_loader_for_RL78/i2c-device.html#guide-i2c-device-6)；[RH850 I2C 工程設定](#upgrade-rh850-i2c)。
<!-- I2C_DEVICE_END -->

<!-- MODEL_DETAILS_BEGIN -->
<a id="upgrade-rh850-i2c"></a>

### RH850 × I2C：工程設定

#### 配對工程、接線與映像

| 項目 | 此組合的設定 |
| --- | --- |
| Device／target | R7F701684／`0x8501` |
| Boot 工程 | [`Sample_Project_RH850_S1_ISP_Boot_loader_I2C`](https://github.com/released/Sample_Project_RH850_S1_ISP_Boot_loader_I2C) |
| App 工程 | [`Sample_Project_RH850_S1_ISP_Boot_loader_I2C_app`](https://github.com/released/Sample_Project_RH850_S1_ISP_Boot_loader_I2C_app) |
| Transfer 工程 | [`Sample_Project_RH850_S1_I2C_Slave_Transfer`](https://github.com/released/Sample_Project_RH850_S1_I2C_Slave_Transfer)，使用自己的 HEX 執行 PING／ECHO／計數器測試 |
| 初次安裝 | Boot 工程的 `DefaultBuild/boot0000_FFFF.hex`，由 programmer 安裝；確認 MCU 與擦除範圍 |
| Tool 更新檔 | App 工程的 `DefaultBuild/Sample_Project_RH850_S1_ISP_Boot_loader_I2C_app_update.bin`；HEX、boot_app 合併檔與 Transfer HEX 不放入 App 更新欄 |
| Flash 配置 | 64 KiB Boot 在 `0x00000–0x0FFFF`。App BIN 範圍為 `0x10000–0xFFFFF`，上限 960 KiB，含 Metadata、vectors、padding 與 CRC。 |
| 資料介面 | RIIC1 SCL `P8_1`、SDA `P8_0`。範例為 7-bit `0x20`／100 kHz，Boot／App／BIN／Tool 設定須一致。 |
| UART0 Log | RLIN30 TX `P0_2`、RX `P0_3`，115200 8-N-1。BLDC Starter Kit V2 使用板載 UART/USB 路徑 `J14`。 |
| RAM 交接 | `0xFEDFFFF0..0xFEDFFFFF`；返回 Boot request：`signature／request／反碼／owner` |

- F24 Bridge 的 IICA0 SCL `P62` 接 RH850 `P8_1`，SDA `P63` 接 `P8_0`，並共地及使用相容電壓的上拉。BLDC Starter Kit V2 的 CN9 I2C 切換位置接的是 RIIC0，接這份 RIIC1 工程時依上表的 MCU 腳位選擇實際引出點。見 [Renesas 板卡手冊表 26 與表 32](https://www.renesas.com/en/document/mat/rh850f1km-s1-bldc-starter-kit-v2-users-manual)。
- [Tool I2C 操作](https://released.github.io/slide_simple_renesas_isp_tool/i2c.html)提供接線、Discover、Enter Boot、更新與結果確認。
- [Boot 接收與驗證機制](https://released.github.io/slide_boot_loader_for_RH850/i2c-device.html#i2c-boot-flow)集中描述此介面的接收、CRC、更新命令與完成回覆。
- [App 返回 Boot 與 RAM 交接](https://released.github.io/slide_boot_loader_for_RH850/architecture.html#boot-app-handoff)說明 ENTER 與 UART0 z/Z 的差異；實際保留位址以本節表格為準。
- [實板量測與確認範圍](https://released.github.io/slide_boot_loader_for_RH850/experiments.html#rh850-i2c-update-measurements)集中記錄 Transfer 與五種 App BIN 的驗證結果。
- 程式入口為配對工程的 `custom_func.c`：`hardware_init()`／`loop()`；移植修改位置見 [Boot／App 移植](https://released.github.io/slide_boot_loader_for_RH850/porting.html)。
<!-- MODEL_DETAILS_END -->

---

[上一主題：CAN FD Bootloader 與工程](can-fd-device.html) · [指南入口](index.html) · [下一主題：UART Bootloader 與協定格式](uart-device.html)
