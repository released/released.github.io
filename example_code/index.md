
[回到知識庫總索引](https://released.github.io/)

<a id="article_top"></a>

# 嵌入式範例程式索引

> 透過 GitHub repository 搜尋 MCU、周邊與通訊介面的範例程式。下載前先核對晶片型號、toolchain、開發板與 clock / pin 設定，避免直接套用不相容的專案。

[開啟 released 的 GitHub repositories](https://github.com/released/ "Browse example code")

## 搜尋流程

```mermaid
flowchart LR
    REPO["進入 GitHub Repositories"] --> SEARCH["輸入 MCU 或周邊關鍵字"]
    SEARCH --> FILTER["比對晶片 / IDE / 功能"]
    FILTER --> README["閱讀 README 與接線說明"]
    README --> DOWNLOAD["Clone 或 Download ZIP"]
    DOWNLOAD --> VERIFY["Build 並以最小功能驗證"]
```

## 1. 進入 repository 清單

在 GitHub 個人頁面切換到 **Repositories**，查看目前公開的範例專案。

![GitHub Repositories 頁籤與專案清單](img/how_to_search_1.jpg)

---

## 2. 使用搜尋欄位

在 repository 搜尋欄位輸入功能或 MCU 關鍵字。

![GitHub repository 搜尋欄位](img/how_to_search_2.jpg)

---

## 3. 使用單一關鍵字

可先搜尋 `I2C`、`ADC`、`CAN` 等周邊名稱，再從結果中核對目標平台。

![以周邊名稱搜尋的結果](img/how_to_search_3.jpg)

---

## 4. 組合多個關鍵字

結果太多時，加入 MCU 與功能名稱，例如 `M031 ADC`，縮小專案範圍。

![以 MCU 與周邊組合關鍵字搜尋](img/how_to_search_4.jpg)

---

## 5. 下載與使用專案

可使用 Git clone，或在專案頁選擇 **Code → Download ZIP**。

![Code 選單的 Download ZIP 入口](img/how_to_download.jpg)

> 導入正式產品前，請重新檢查 license、錯誤處理、timeout、interrupt priority、buffer 邊界與硬體保護條件。範例程式的主要用途是建立可工作的最小起點。

[回到頁首](#article_top)
