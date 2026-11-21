[知識庫首頁](https://released.github.io/) · [RL78 Bootloader](index.html)

<a id="article_top"></a>

# Tool 操作與通訊驗證入口

下載、更新、報告、MCU host 與 Custom Transfer 的主題連結。

<!-- BOOTLOADER_TOPICS_BEGIN -->
<details>
<summary>章節與另一平台對照</summary>

| 章節／規格 | 本頁 | 另一平台 |
| --- | --- | --- |
| Tool 與其他操作入口 | [閱讀](#tool-links) | [RH850](../slide_boot_loader_for_RH850/tool-guides.html#tool-links) |
| 下載與操作入口 | [閱讀](#downloads) | [RH850](../slide_boot_loader_for_RH850/tool-guides.html#downloads) |
| F24 (MCU CAN host)：App 工程與向量設定 | [閱讀](#host-app-engineering) | [RH850](../slide_boot_loader_for_RH850/tool-guides.html#host-app-engineering) |
| 更新政策與通訊速度 | [閱讀](#image-update-policy) | [RH850](../slide_boot_loader_for_RH850/tool-guides.html#image-update-policy) |
| 更新確認與驗證紀錄 | [閱讀](#update-confirmation) | [RH850](../slide_boot_loader_for_RH850/tool-guides.html#update-confirmation) |
| CAN FD App 更新操作 | [閱讀](#can-fd-update) | [RH850](../slide_boot_loader_for_RH850/tool-guides.html#can-fd-update) |
| CAN FD Custom Transfer 通訊測試 | [閱讀](#can-fd-custom-transfer) | [RH850](../slide_boot_loader_for_RH850/tool-guides.html#can-fd-custom-transfer) |
| 串列介面共用操作 | [閱讀](#uart-device-operation) | [RH850](../slide_boot_loader_for_RH850/tool-guides.html#uart-device-operation) |

</details>
<!-- BOOTLOADER_TOPICS_END -->

<a id="tool-links"></a>

## Tool 與其他操作入口

<a id="共用-tool-操作"></a>

| 操作目的 | 直接入口 |
| --- | --- |
| 連接Host與核對BIN | [COM／Host](../slide_simple_renesas_isp_tool/operation.html#tool-operation)／[BIN欄位](../slide_simple_renesas_isp_tool/status-and-reports.html#tool-ui-fields) |
| 更新Device App | [CAN／CAN FD](../slide_simple_renesas_isp_tool/can-update.html)／[UART／Xmodem／I2C](../slide_simple_renesas_isp_tool/serial-isp.html#serial-device-operation) |
| 查看更新結果 | [完成提示](../slide_simple_renesas_isp_tool/status-and-reports.html#update-completion)／[HTML報告](../slide_simple_renesas_isp_tool/status-and-reports.html#update-html-report) |
| 驗證通訊 | [Custom Transfer](../slide_simple_renesas_isp_tool/custom-transfer.html#custom-transfer) |
| 對照資料流與Flash寫入 | [CAN更新逐層導讀](../slide_simple_renesas_isp_tool/can-protocol.html#can-update-walkthrough) |
| 更新Host App | [Misc操作](../slide_simple_renesas_isp_tool/host-firmware.html#host-bridge-firmware) |

<!-- PUBLIC_RESOURCES_BEGIN -->
<a id="downloads"></a>

## 下載與操作入口

[下載與操作入口](https://released.github.io/slide_simple_renesas_isp_tool/downloads.html#downloads)
<!-- PUBLIC_RESOURCES_END -->

<!-- F24_APP_IRQ_BEGIN -->
<a id="host-app-engineering"></a>

## F24 (MCU CAN host)：App 工程與向量設定

[F24 (MCU CAN host)：App 工程與向量設定](https://released.github.io/slide_simple_renesas_isp_tool/host-firmware.html#host-app-engineering)
<!-- F24_APP_IRQ_END -->

<!-- COMMON_IMAGE_POLICY_BEGIN -->
<a id="image-update-policy"></a>

## 更新政策與通訊速度

[更新政策與通訊速度](https://released.github.io/slide_simple_renesas_isp_tool/operation.html#image-update-policy)
<!-- COMMON_IMAGE_POLICY_END -->

<!-- UPDATE_EVIDENCE_BEGIN -->
<a id="update-confirmation"></a>

## 更新確認與驗證紀錄

[更新確認與驗證紀錄](https://released.github.io/slide_simple_renesas_isp_tool/status-and-reports.html#update-confirmation)
<!-- UPDATE_EVIDENCE_END -->

<!-- FD_UPDATE_BEGIN -->
<a id="can-fd-update"></a>

## CAN FD App 更新操作

[CAN FD App 更新操作](https://released.github.io/slide_simple_renesas_isp_tool/can-fd.html#can-fd-update)
<!-- FD_UPDATE_END -->

<!-- FD_TRANSFER_BEGIN -->
<a id="can-fd-custom-transfer"></a>

## CAN FD Custom Transfer 通訊測試

[CAN FD Custom Transfer 通訊測試](https://released.github.io/slide_simple_renesas_isp_tool/custom-transfer.html#can-fd-custom-transfer)
<!-- FD_TRANSFER_END -->

<!-- UART_TOOL_GUIDE_BEGIN -->
<a id="uart-device-operation"></a>

## 串列介面共用操作

[串列介面共用操作](https://released.github.io/slide_simple_renesas_isp_tool/serial-isp.html#uart-device-operation)
<!-- UART_TOOL_GUIDE_END -->

---

[上一主題：各介面實驗資料](experiments.html) · [指南入口](index.html)
