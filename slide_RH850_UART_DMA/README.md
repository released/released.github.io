# RH850 UART DMA 資料流指南

本頁以 RH850/F1KM-S1 為背景，整理 UART TX／RX、DMA、interrupt、idle timer、PEG 保護與 SRAM 配置之間的資料流。

- 發布頁面：<https://released.github.io/slide_RH850_UART_DMA/>
- 可編輯內容：`index.md`
- 網頁入口：`index.html`
- 共用版型：`notices_can/assets/style.css` 與 `notices_can/assets/app.js`

## 內容範圍

- UART0 TX DMA 與 RX interrupt／RX DMA 的流程差異。
- DMA channel、source／destination address、count 與 trigger。
- PEG、SPID、supervisor mode 與 SRAM access protection。
- Local RAM 位址、linker section 與 DMA buffer 配置。
- RX idle timer、封包邊界、watch window 與通訊紀錄。

## 參考工程

- [Sample_Project_RH850_S1_UART_TX_DMA_RX_interrupt](https://github.com/released/Sample_Project_RH850_S1_UART_TX_DMA_RX_interrupt)
- [Sample_Project_RH850_S1_UART_TX_RX_DMA](https://github.com/released/Sample_Project_RH850_S1_UART_TX_RX_DMA)

頁面中的板卡、MCU、UART instance、DMA channel、RAM 位址與 register base address 屬於所列工程配置。移植至其他 RH850 型號時，需依對應 User’s Manual、linker map、Smart Configurator 設定與實際 bus-master view 核對。
