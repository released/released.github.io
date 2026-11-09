
[回到知識庫總索引](https://released.github.io/)

<a id="article_top"></a>

# RL78 開發工具與周邊實作

> 彙整 Renesas RL78 的 IDE、compiler、Smart Configurator、燒錄工具及 clock、GPIO、timer、通訊介面、PWM、ADC 與除錯資料。

<a id="內容範圍"></a>

## 內容範圍

- 建立 CS+、e² studio、CC-RL、Smart Configurator 與 Renesas Flash Programmer 的角色分工。
- 專案建立、周邊 driver 產生、應用程式整合、編譯與燒錄。
- clock、pin、register、interrupt 與量測結果的除錯對照。

<a id="主題關聯"></a>

## 主題關聯

```mermaid
flowchart LR
    TOOL["安裝 IDE / Compiler / Debug Tool"] --> PROJECT["建立 RL78 專案"]
    PROJECT --> CONFIG["Clock 與 Pin 設定"]
    CONFIG --> DRIVER["Smart Configurator 產生 Driver"]
    DRIVER --> APP["Timer / GPIO / I2C / SPI / UART / ADC"]
    APP --> BUILD["Build 與 Flash Programming"]
    BUILD --> DEBUG["Watch Window / Register / 波形除錯"]
```

<a id="內容索引"></a>

## 內容索引

* IDE 開發工具的安裝&介紹
  * CS+ , e² studio , CCRH , CCRL , Smart Configurator , Renesas Flash programmer
* Smart Configurator
  * [Clock tree , Pin configuration , Peripheral configuration](clock.html#article_clock)
  * [Timer](timer.html#article_timer)
  * [GPIO](gpio.html#article_gpio)
  * [external pin interrupt](interrupt.html#article_ext)
  * [I2C](i2c.html#article_i2c)
  * [SPI](spi.html#article_spi)
  * [UART](uart.html#article_uart)
  * [PWM](pwm.html#article_pwm)
  * [ADC](adc.html#article_adc)
* CS+
  * Code Compiler & programming flow ( from C code to IC ).
* Tips

## 主題頁

| 項目 | 內容 |
| --- | --- |
| [開發環境與專案](tools.html) | 開發環境與專案的設定、畫面與來源 |
| [時脈與元件](clock.html) | 時脈與元件的設定、畫面與來源 |
| [Timer 與程式產生](timer.html) | Timer 與程式產生的設定、畫面與來源 |
| [GPIO 與範例](gpio.html) | GPIO 與範例的設定、畫面與來源 |
| [外部中斷](interrupt.html) | 外部中斷的設定、畫面與來源 |
| [I²C／IICA](i2c.html) | I²C／IICA的設定、畫面與來源 |
| [SPI／CSI](spi.html) | SPI／CSI的設定、畫面與來源 |
| [UART](uart.html) | UART的設定、畫面與來源 |
| [PWM](pwm.html) | PWM的設定、畫面與來源 |
| [ADC](adc.html) | ADC的設定、畫面與來源 |
| [建置與程式整合](build.html) | 建置與程式整合的設定、畫面與來源 |
| [燒錄、除錯與記憶體配置](debug.html) | 燒錄、除錯與記憶體配置的設定、畫面與來源 |
