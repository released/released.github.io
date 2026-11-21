[知識庫首頁](https://released.github.io/) · [RH850 Bootloader](index.html)

<a id="article_top"></a>

# Bootloader 整體架構

Boot／App／Host 分工、啟動驗證、更新流程與 RAM 交接。

<!-- BOOTLOADER_TOPICS_BEGIN -->
<details>
<summary>章節與另一平台對照</summary>

| 章節／規格 | 本頁 | 另一平台 |
| --- | --- | --- |
| Boot、App 與 Host 的責任 | [閱讀](#boot-architecture) | [RL78](../slide_boot_loader_for_RL78/architecture.html#boot-architecture) |
| 啟動、更新與交接 | [閱讀](#boot-app-handoff) | [RL78](../slide_boot_loader_for_RL78/architecture.html#boot-app-handoff) |

</details>
<!-- BOOTLOADER_TOPICS_END -->

<a id="boot-architecture"></a>

## Boot、App 與 Host 的責任

[共用整體架構與生命週期](../slide_boot_loader_for_RL78/architecture.html#boot-architecture)集中說明 Tool、bridge、Boot 與 App 分工。

<a id="boot-app-handoff"></a>

## 啟動、更新與交接

RH850 保留 64 KiB Boot，App 以 R8V1 契約交接 EBASE／INTBP；RAM 與 ECC 初始化須避開交接區。各介面的實際保留位址見該頁 MCU 工程表。

- [啟動與更新流程圖](can-device.html#guide-can-device-4)
- [ENTER、正常 reset 與保留 RAM 的共用條件](../slide_boot_loader_for_RL78/architecture.html#boot-app-handoff)
- [RH850 startup、FCL RAM 與 Flash 移植](porting.html)
- [512-entry IRQ table 與 App 設定](app-development.html)

---

[指南入口](index.html) · [下一主題：CAN Bootloader 與工程](can-device.html)
