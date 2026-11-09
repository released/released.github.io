# 開發工具與流程筆記

Git repository 同步操作與 Windows 批次入口的說明頁。

- [線上頁面](https://released.github.io/notices_misc/)
- 可編輯原稿：index.md；網頁入口：index.html。
- examples/ 提供先預覽、明確確認、僅 fast-forward 的同步範例。
- 頁面沿用 /notices_can/assets/ 的共用樣式與 Markdown／Mermaid renderer。

## 範例

sync_all_repo.bat 與 sync_repositories.ps1 放在相同資料夾。
預設只預覽；加上 -Apply 並輸入 SYNC 才 fetch／快轉。
本機修改、歷史分岔或 ignored 檔案衝突會停止，保留原有內容。
完整操作與條件見 [說明頁](index.md)。

## 預覽與維護

在 web 根目錄啟動 HTTP server，再開啟 /notices_misc/。
入口會載入 Markdown 與共用資源，需要 HTTP 環境及相應 CDN 連線。

- github_push.bat --check：檢查本站目的地、分支與內容。
- github_push.bat：確認後提交並推送本站。
- 上傳入口沿用上層 web 的 push-project.ps1；WEB_PUBLISH_ROOT 可指定其他共用入口位置。
- 個人設定與工程驗證紀錄不列入公開內容。
