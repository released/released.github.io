[知識庫首頁](https://released.github.io/) · [RH850 Bootloader](index.html)

<a id="article_top"></a>

# 串列 ISP 共用工程與協定契約

平台配置、C header、建置、Metadata、SC 與共用 Frame／命令／INFO／Status。

<!-- BOOTLOADER_TOPICS_BEGIN -->
<details>
<summary>章節與另一平台對照</summary>

| 章節／規格 | 本頁 | 另一平台 |
| --- | --- | --- |
| 配置與資料來源 | [閱讀](#guide-serial-device-1) | [RL78](../slide_boot_loader_for_RL78/serial-device.html#guide-serial-device-1) |
| 編輯、產生與建置 | [閱讀](#guide-serial-device-2) | [RL78](../slide_boot_loader_for_RL78/serial-device.html#guide-serial-device-2) |
| Metadata offset與協定配置 | [閱讀](#guide-serial-device-3) | [RL78](../slide_boot_loader_for_RL78/serial-device.html#guide-serial-device-3) |
| SC設定與重新產生 | [閱讀](#guide-serial-device-4) | [RL78](../slide_boot_loader_for_RL78/serial-device.html#guide-serial-device-4) |
| Framed control與INFO | [閱讀](#guide-serial-device-5) | [RL78](../slide_boot_loader_for_RL78/serial-device.html#guide-serial-device-5) |
| 驗證範圍 | [閱讀](#guide-serial-device-9) | [RL78](../slide_boot_loader_for_RL78/serial-device.html#guide-serial-device-9) |

</details>
<!-- BOOTLOADER_TOPICS_END -->

<!-- RH850_SERIAL_CHAPTER_BEGIN -->
## 公開範圍與串列協定參考

RH850 串列的共用協定由 RL78 章節維護。已公開的配對工程見 [介面索引](index.html#boot-interfaces)。

- [I2C 配對工程與接線](i2c-device.html#upgrade-rh850-i2c)

<a id="guide-serial-device-1"></a>

### 配置與資料來源

[共用契約與說明](../slide_boot_loader_for_RL78/serial-device.html#guide-serial-device-1)；實際參數與工程配置依該章列出的平台及配對工程判讀。

<a id="guide-serial-device-2"></a>

### 編輯、產生與建置

[共用契約與說明](../slide_boot_loader_for_RL78/serial-device.html#guide-serial-device-2)；實際參數與工程配置依該章列出的平台及配對工程判讀。

<a id="guide-serial-device-3"></a>

### Metadata offset與協定配置

[共用契約與說明](../slide_boot_loader_for_RL78/serial-device.html#guide-serial-device-3)；實際參數與工程配置依該章列出的平台及配對工程判讀。

<a id="guide-serial-device-4"></a>

### SC設定與重新產生

<a id="rh850-serial-sc-roundtrip"></a>

[共用契約與說明](../slide_boot_loader_for_RL78/serial-device.html#guide-serial-device-4)；實際參數與工程配置依該章列出的平台及配對工程判讀。

<a id="guide-serial-device-5"></a>

### Framed control與INFO

[共用契約與說明](../slide_boot_loader_for_RL78/serial-device.html#guide-serial-device-5)；實際參數與工程配置依該章列出的平台及配對工程判讀。

<a id="guide-serial-device-9"></a>

### 驗證範圍

<a id="rh850-serial-runtime"></a>

[公開工程與實板紀錄](experiments.html#experiment-scope)。

<!-- RH850_SERIAL_CHAPTER_END -->

---

[上一主題：App Metadata 與 IRQ](app-development.html) · [指南入口](index.html) · [下一主題：Boot／App 移植與 Flash](porting.html)
