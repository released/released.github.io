# Nuvoton AEC / NR 操作指南

本頁整理 USB Audio AEC（Acoustic Echo Cancellation）與 NR（Noise Reduction）的錄音、回放及結果判讀流程，並以中英文保留相同的操作資訊。

- 發布頁面：<https://released.github.io/slide_Nuvoton_AEC_NR_operation/>
- 可編輯內容：`index.md`
- 網頁入口：`index.html`
- 共用版型：`notices_can/assets/style.css` 與 `notices_can/assets/app.js`

## 內容範圍

- EVB 的 USB UAC speaker／microphone 列舉狀態。
- GoldWave 與 Audacity 的播放、錄音裝置設定。
- Audacity 的 Stereo 錄音、Mono 音軌拆分及單獨聲道監聽。
- far-end 與 near-end 訊號的錄製流程。
- AEC／NR 開啟與關閉時的回放比較。
- Mono 聲道限制、驗收條件與常見異常排查。

## 操作條件與資料

頁面以 `I94124_NAU88C22_MB_REVC` EVB、USB UAC 韌體，以及 GoldWave 或 Audacity 為操作組合。

- [GoldWave release page](https://goldwave.com/release.php)
- [Audacity download page](https://www.audacityteam.org/download/)

不同工具的比較需保留相同音量、距離、噪音來源、聲道模式與錄音檔案。

正文中的 EVB、電路、裝置列舉、GoldWave 與 Audacity 畫面用於對照操作狀態。AEC／NR 的效果仍會受到麥克風、喇叭、聲學環境及韌體參數影響。
