
[回到知識庫總索引](https://released.github.io/)

<a id="article_top"></a>

# FAQ (Nuvoton)

> 以 Nuvoton ICP Programming Tool 為主，說明如何重新載入 MCU 的預設或目前 Config Bits。寫入前請先保存現有設定，並確認 erase 動作是否會清除 APROM、LDROM 或 Data Flash。

## Config Bits 操作流程

```mermaid
flowchart LR
    CONNECT["連接 Nu-Link 與 Target"] --> READ["讀取並保存目前設定"]
    READ --> MODE{"需要 Default 或 Current？"}
    MODE -->|Default| ERASE["Erase 後載入 On-board Config"]
    MODE -->|Current| HISTORY["從 Update History 重新讀取"]
    ERASE --> VERIFY["檢查 Config Bits"]
    HISTORY --> VERIFY
```

* [MCU default config](#default_config)

* [MCU current config](#current_config)

---

<a id="default_config"></a>

# How to reload DEFAULT config from MCU by using ICP tool

* __step 1 : erase MCU flash__

![ICP Erase 選項與整顆 Flash 擦除範圍](img/ICP_erase_whole_target_chip.jpg)

* __step 2 : by select On-board Config under Update History , to reload config from MCU__

![Update History 的 On-board Config 入口](img/ICP_display_config_default2.jpg)

![重新讀取目標 MCU Config 的畫面](img/ICP_display_config_before_entry.jpg)

* __step 3 : Select Config Bits Setting , will display default config setting__

![M480 Config Bits Setting 欄位](img/ICP_display_config_default_M480.jpg)


![MS51 Config Bits Setting 欄位](img/ICP_display_config_default_MS51.jpg)

[back to top](#article_top)   

---

<a id="current_config"></a>

# How to reload CURRENT config from MCU by using ICP tool

* __step 1 : by select On-board Config under Update History , to reload config from MCU__

![Update History 的 On-board Config 入口](img/ICP_display_config_default2.jpg)

![重新讀取目標 MCU Config 的畫面](img/ICP_display_config_before_entry.jpg)


* __step 2 : Select Config Bits Setting to display the configuration read from the MCU__

![M480 Config Bits Setting 欄位](img/ICP_display_config_default_M480.jpg)


[back to top](#article_top)   

---



