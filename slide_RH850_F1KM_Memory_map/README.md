# RH850/F1KM Memory Map 指南

本頁整理 RH850/F1KM-S1、F1KM-S2、F1KM-S4 與 F1KH-D8 的 RAM 位址視圖、容量及產品型號對照。

- 發布頁面：<https://released.github.io/slide_RH850_F1KM_Memory_map/>
- 可編輯內容：`index.md`
- 網頁入口：`index.html`
- 共用版型：`notices_can/assets/style.css` 與 `notices_can/assets/app.js`

## 內容範圍

- CPU1 view、SELF view 與 bus-master 可見的 RAM 區域。
- Local RAM、retention RAM 與 global RAM 的起點、終點及 size。
- 不同 Code Flash 容量對應的 RAM 配置。
- pin count、溫度等級與 part number 對照。
- linker section、DMA buffer 與 access protection 判讀時的位址關係。

## 資料依據

- `REN_r01uh0684ej0130-rh850f1kh-rh850f1km_MAH_20210929.pdf`
- Product Lineup：Section `1A/1B/1C.3`
- Memory Configuration：Section `45.2`、Figure `45.1`～`45.4`

表格中的 size 以 `end address - start address + 1` 計算，`1 KB = 1024 bytes`。實際 linker 與 DMA 配置仍需依完整 part number、bus master 視圖及 access protection 設定核對。
