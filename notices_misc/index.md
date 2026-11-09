[回到知識庫總索引](https://released.github.io/)

<a id="article_top"></a>

# 開發工具與流程筆記

以批次入口同步多個既有 Git checkout。同步只從已設定的 origin upstream
進行 fast-forward，不提交或推送本機內容。

## GitHub 同步流程

~~~mermaid
flowchart TD
    CHECK{範圍有效且本機乾淨？} -->|是| REVIEW[列出 repository、branch 與 origin]
    CHECK -->|否| STOP[保留原狀]
    REVIEW --> CONFIRM{明確確認 SYNC}
    CONFIRM -->|取消| STOP[保留原狀]
    CONFIRM -->|確認| FETCH[Fetch 指定 upstream]
    FETCH --> HISTORY{歷史可快轉或本機已領先}
    HISTORY -->|分岔| STOP
    HISTORY -->|可快轉| FF[Fast-forward；保護 ignored 檔案]
    HISTORY -->|已領先或相同| KEEP[保留目前 HEAD]
    FF --> VERIFY[核對 SHA]
    KEEP --> VERIFY
~~~

<a id="notice_github_sync"></a>

## 批次入口與使用範圍

1. 安裝 Git for Windows，並完成所需的 GitHub 登入設定。
2. 將 [sync_all_repo.bat](examples/sync_all_repo.bat) 與
   [sync_repositories.ps1](examples/sync_repositories.ps1) 放在 checkout 的共同上層。
3. 每個 repository 先設定明確的 origin upstream，並保存工作內容。
4. 執行預覽，核對資料夾、目前分支、origin 與遠端分支。
5. 加上 Apply 後再次檢視範圍，輸入 SYNC 才開始 fetch 與快轉。

~~~powershell
# 預覽：不 fetch、不修改 index 或工作檔
.\sync_all_repo.bat

# 執行：列出範圍後要求 SYNC 確認
.\sync_all_repo.bat -Apply
~~~

也可直接指定範圍：

~~~powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\sync_repositories.ps1 -Root 'D:\Projects' -Apply
~~~

## 保留與停止條件

- 選定根目錄本身是 repository 時，只處理該 repository；否則搜尋兩層直屬資料夾。
- 有已追蹤修改、未追蹤檔案、暫存內容或未完成 Git 操作時，停止並保留原狀。
- 不猜測 main/master，不切換分支，也不重設 origin。
- 遠端與本機歷史分岔時停止；本機已領先時保留 HEAD，不自行推送。
- 不執行 reset、clean 或自動 stash。被忽略的本機檔案與新遠端檔案衝突時停止。
- 拒絕連結目錄與非獨立 Git checkout，避免範圍延伸到其他位置。
- 多個 repository 不構成單一交易；後續失敗時，已完成的快轉不自動回復。依輸出核對狀態後重跑。

同步範例與本站的 github_push.bat 分開：前者取得既有遠端更新，後者發布本站內容。

[回到頁首](#article_top)
