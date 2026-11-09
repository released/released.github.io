# Nuvoton M031 PWM Register 與 Peripheral View

本頁以 M031LE3AE 的單一 PWM channel 為例，連結 BSP API、clock path、硬體 register 與 debugger Peripheral View 中可觀察的數值。

- 發布頁面：<https://released.github.io/slide_Nuvoton_peripheral_view_under_debug_mode/>
- 可編輯內容：`index.md`
- 網頁入口：`index.html`
- 共用版型：`notices_can/assets/style.css` 與 `notices_can/assets/app.js`
- 操作畫面：Keil MDK / µVision、Nuvoton NuEclipse

## 固定條件

| 項目 | 設定 |
| --- | --- |
| MCU／輸出 | M031LE3AE、PWM0 CH2、PB.3 (`PWM0_CH2`) |
| PWM | 30 Hz、50% duty |
| Clock | HIRC／HCLK／PCLK0 = 48 MHz |
| 開發環境 | Keil MDK / µVision、Nuvoton NuEclipse |

## 內容範圍

- `PWM_ConfigOutputChannel()` 的 prescaler、period 與 compare 計算。
- `CLK`、`SYS`、`PWM0` 的 register mapping。
- 由 register 反推 PWM frequency 與 duty。
- Keil System Viewer 與 NuEclipse Peripheral Registers View 的操作畫面。
- CH2／CH3 共用 prescaler 與 period 所形成的設定關係。

## 文件與程式碼依據

- [OpenNuvoton M031BSP](https://github.com/OpenNuvoton/M031BSP)
- [M031 Series Datasheet](https://www.nuvoton.com/resource-download.jsp?tp_GUID=DA00-M031)
- [M031/M032 Series Technical Reference Manual](https://www.nuvoton.com/resource-download.jsp?tp_GUID=DA05-M031)
- [PWM_OutputWaveform 範例](https://github.com/OpenNuvoton/M031BSP/blob/master/SampleCode/StdDriver/PWM_OutputWaveform/main.c)
- [`PWM_ConfigOutputChannel()` 實作](https://github.com/OpenNuvoton/M031BSP/blob/master/Library/StdDriver/src/pwm.c#L125-L204)
- [NuEclipse Windows](https://www.nuvoton.com/resource-download.jsp?tp_GUID=SW132022111608043510) 與 [NuEclipse User Manual](https://www.nuvoton.com/export/resource-files/en-us--UM_NuEclipse_EN.pdf#page=24)

register 名稱與位元定義依所選 device pack、BSP 及文件版本為準；debugger 顯示值也會隨程式停止位置而變化。
