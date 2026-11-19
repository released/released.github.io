# 網站維護與發布

網站內容由 `released/released.github.io` 的 `main` 分支管理。各主題資料夾是同一個 Git repository 的內容，不需要分別初始化或推送。

## 發布入口

在 repository 根目錄執行：

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\publish_site.ps1 -DryRun
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\publish_site.ps1
```

根目錄 `github_push.bat` 是本機操作入口，保留於磁碟並由 Git 忽略；原始碼 checkout 使用上述 helper。既有本機 batch 可繼續使用 `--check` 或互動發布。

- `--check` 檢查 Git 目的地、網站內容與受影響的來源契約，不修改 Git 狀態。
- 預設 commit message 為 `update`；檢查通過後，輸入 `PUSH` 才會提交與推送。
- 每次發布只有一個目標：`released/released.github.io` 的 `main`。
- 入口不會自動產生內容、建立 repository、pull、merge 或 force push。
- Git 推送完成與 Pages 部署完成分開核對。

## 主題與共用資源

- `site-catalog.json` 列出具有獨立內容宣告的主題資料夾。
- 各主題的 `web-site.json` 定義頁面、原稿與內容契約；根目錄宣告彙整全站。
- 入口站內的其他頁面由根目錄宣告管理。
- `assets/app.js` 與 `assets/style.css` 是共用 runtime 原稿。
- `notices_can/assets` 與 `notices_can_uds/assets` 保留相容網址，其內容由同步入口產生。

明確更新內容或共用資源後執行：

```powershell
node scripts/sync_web_runtime.mjs
node scripts/deploy_web_contracts.mjs
.\github_push.bat --check
```

新增主題沿用既有資料夾與 manifest 格式，加入 catalog 後更新全站宣告；主題內不建立 `.git`。既有資料夾名稱、章節錨點及資源網址是相容性介面。

## 外部文件來源

Tool／Bootloader 部分章節由對應 Tool repository 的文件同步產生。原稿與同步入口仍由該專案管理，網站上的同步產物集中在此 repository。

- 這些主題有變動時，發布檢查會比對 canonical 文件；不會自動同步或略過失敗。
- Tool checkout 位置由 `WEB_PUBLISH_REFERENCE_ROOT` 或忽略的 `github_push.local.psd1` 中 `ReferenceRoot` 提供。
- 其他主題的更新不要求無關的 Tool checkout。
- 個人設定、工程紀錄與測試產物不屬於公開網站內容。
