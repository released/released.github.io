# RL78 開發工具與周邊實作

本頁彙整 Renesas RL78 的開發環境、code generation、常用周邊設定與除錯資料，並保留對應官方文件、範例工程及操作畫面。

- 發布頁面：<https://released.github.io/slide_RL78/>
- 可編輯內容：`index.md` 主題索引及 `tools.md`、`clock.md`、`timer.md`、`gpio.md`、`interrupt.md`、`i2c.md`、`spi.md`、`uart.md`、`pwm.md`、`adc.md`、`build.md`、`debug.md`。
- 網頁入口：`index.html`
- 共用版型：`notices_can/assets/style.css` 與 `notices_can/assets/app.js`

每個主題有獨立目錄及上一／下一主題連結。`legacy-routes.json` 保留原首頁章節網址；圖片與範例連結留在所屬主題。

## 內容範圍

- CS+、e² studio、CC-RL、Smart Configurator 與 Renesas Flash Programmer。
- 專案建立、clock、pin、interrupt 與 driver code generation。
- GPIO、timer、external interrupt、I2C／IICA、SPI、UART、PWM 與 ADC。
- register、interrupt flag、量測結果與通訊資料的除錯對照。
- RL78/F13、F24、G16 等系列的公開範例與差異提示。

## 主要官方資源

- [CS+](https://www.renesas.com/en/software-tool/cs)
- [e² studio](https://www.renesas.com/en/software-tool/e-studio)
- [CC-RL compiler](https://www.renesas.com/en/software-tool/c-compiler-package-rl78-family)
- [Smart Configurator](https://www.renesas.com/en/software-tool/smart-configurator)
- [Renesas Flash Programmer](https://www.renesas.com/en/software-tool/renesas-flash-programmer-programming-gui)

各 RL78 系列的 register、clock、pin、interrupt 與記憶體配置可能不同；頁面中的數值與畫面需和目標 MCU、板卡、device file 及手冊版本一併核對。
