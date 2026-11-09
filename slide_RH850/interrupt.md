[主題索引](index.html) · [知識庫總索引](https://released.github.io/)

# 外部中斷

<!-- CHAPTER_SCOPE -->
外部中斷 整理設定位置、操作畫面與對應程式／文件連結。

- 圖中型號、clock、pin、位址與工具介面屬於各參考工程的條件，不延伸為所有型號的固定配置。
- 實際設定與結果以所選 MCU 手冊、工程設定、linker map 及量測為準；原始文件與範例連結保留在各節。



---

<a id="article_ext"></a>

## Smart Configurator：external int.

![Smart Config. – external int. — slide extend RH85082](img/slide_extend_RH85082.png)

![Smart Config. – external int. — slide extend RH85083](img/slide_extend_RH85083.png)

<u>RH850 Smart Configurator User's Guide: CS+</u>
[back to top](index.html#article_top)    

---

![Smart Config. – external int. — slide extend RH85084](img/slide_extend_RH85084.png)

<u>RH850 Smart Configurator User's Guide: CS+</u>
[back to top](index.html#article_top)    

---

[Sample_Project_RH850_S1_Button_INT](https://github.com/released/Sample_Project_RH850_S1_Button_INT)

![Smart Config. – external int. — slide extend RH85085](img/slide_extend_RH85085.png)

![Smart Config. – external int. — slide extend RH85086](img/slide_extend_RH85086.png)


<span style="color:#FF0000">
Add code when trigger external interrupt INTP2<br><br>
</span>

![Smart Config. – external int. — slide extend RH85088](img/slide_extend_RH85088.png)

![Smart Config. – external int. — slide extend RH85089](img/slide_extend_RH85089.png)

<span style="color:#FF0000">
Need to manual add driver start API , ex : <br><br>
</span>

```
R_Config_INTC_INTP2_Start();
```

![Smart Config. – external int. — slide extend RH85087](img/slide_extend_RH85087.png)

<u>RH850 Smart Configurator User's Guide: CS+</u>
[back to top](index.html#article_top)    

[主題索引](index.html) · [上一主題](gpio.html) · [下一主題](i2c.html)
