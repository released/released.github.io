[主題索引](index.html) · [知識庫總索引](https://released.github.io/)

# SPI／CSIG／CSIH

<!-- CHAPTER_SCOPE -->
SPI／CSIG／CSIH 整理設定位置、操作畫面與對應程式／文件連結。

- 圖中型號、clock、pin、位址與工具介面屬於各參考工程的條件，不延伸為所有型號的固定配置。
- 實際設定與結果以所選 MCU 手冊、工程設定、linker map 及量測為準；原始文件與範例連結保留在各節。



---

<a id="article_spi"></a>


## Smart Configurator：SPI (CSIG0)

![Smart Config. – SPI (CSIG0) — slide extend RH85099](img/slide_extend_RH85099.png)

![Smart Config. – SPI (CSIG0) — slide extend RH850100](img/slide_extend_RH850100.png)

<u>RH850 Smart Configurator User's Guide: CS+</u>
[back to top](index.html#article_top)    

---

![Smart Config. – SPI (CSIG0) — slide extend RH850101](img/slide_extend_RH850101.png)

<u>RH850 Smart Configurator User's Guide: CS+</u>
[back to top](index.html#article_top)    

---

<a id="smart-config-–-cpolcpha"></a>

## Smart Configurator：CPOL/CPHA

* CPOL :
  * 0 : clock idle at LOW
  * 1 : clock idle at HIGH
* CPHA :
  * 0 : 1^st^ EDGE
  * 1 : 2^ND^ EDGE

![Smart Config. – CPOL/CPHA — slide extend RH850118](img/slide_extend_RH850118.png)

![Smart Config. – CPOL/CPHA — slide extend RH850119](img/slide_extend_RH850119.png)


| CPOL | CPHA | mode | Type |
|:--:|:--:|:--:|:--:|
| 1  | 1 | 3 | 1 |
| 0  | 1 | 1 | 2 |
| 1  | 0 | 2 | 3 |
| 0  | 0 | 0 | 4 |


<u>RH850 Smart Configurator User's Guide: CS+</u>
[back to top](index.html#article_top)    

---

![Smart Config. – CPOL/CPHA — slide extend RH850102](img/slide_extend_RH850102.png)

![Smart Config. – CPOL/CPHA — slide extend RH850103](img/slide_extend_RH850103.png)

![Smart Config. – CPOL/CPHA — slide extend RH850104](img/slide_extend_RH850104.png)


<span style="color:#FF0000">
Need to manual add driver start API , ex : <br><br>
</span>

```
R_Config_CSIG0_Start();
```

![Smart Config. – CPOL/CPHA — slide extend RH850105](img/slide_extend_RH850105.png)

<u>RH850 Smart Configurator User's Guide: CS+</u>
[back to top](index.html#article_top)    

---

<a id="smart-config-–-spi-csih0"></a>

## Smart Configurator：SPI (CSIH0)

![Smart Config. – SPI (CSIH0) — slide extend RH850106](img/slide_extend_RH850106.png)

![Smart Config. – SPI (CSIH0) — slide extend RH850107](img/slide_extend_RH850107.png)

<u>RH850 Smart Configurator User's Guide: CS+</u>
[back to top](index.html#article_top)    

---

![Smart Config. – SPI (CSIH0) — slide extend RH850109](img/slide_extend_RH850109.png)

![Smart Config. – SPI (CSIH0) — slide extend RH850108](img/slide_extend_RH850108.png)

<u>RH850 Smart Configurator User's Guide: CS+</u>
[back to top](index.html#article_top)    

---

[Sample_Project_RH850_S1_SPI_Master](https://github.com/released/Sample_Project_RH850_S1_SPI_Master)

[Sample_Project_RH850_S1_CSIH0_SPI_Master](https://github.com/released/Sample_Project_RH850_S1_CSIH0_SPI_Master)

[Sample_Project_RH850_S1_CSIH1_SPI_Slave](https://github.com/released/Sample_Project_RH850_S1_CSIH1_SPI_Slave)

![Smart Config. – SPI (CSIH0) — slide extend RH850110](img/slide_extend_RH850110.png)

![Smart Config. – SPI (CSIH0) — slide extend RH850111](img/slide_extend_RH850111.png)

![Smart Config. – SPI (CSIH0) — slide extend RH850112](img/slide_extend_RH850112.png)


<span style="color:#FF0000">
Need to manual add driver start API , ex : <br><br>
</span>

```
R_Config_CSIH0_Start();
```

![Smart Config. – SPI (CSIH0) — slide extend RH850113](img/slide_extend_RH850113.png)

<u>RH850 Smart Configurator User's Guide: CS+</u>
[back to top](index.html#article_top)    

---

<a id="smart-config-–-csig-vs-csih"></a>

## Smart Configurator：CSIG vs CSIH

![Smart Config. – CSIG vs CSIH — slide extend RH850115](img/slide_extend_RH850115.png)

![Smart Config. – CSIG vs CSIH — slide extend RH850116](img/slide_extend_RH850116.png)

![Smart Config. – CSIG vs CSIH — slide extend RH850114](img/slide_extend_RH850114.png)

![Smart Config. – CSIG vs CSIH — slide extend RH850117](img/slide_extend_RH850117.png)

<u>RH850 Smart Configurator User's Guide: CS+</u>
[back to top](index.html#article_top)    

[主題索引](index.html) · [上一主題](i2c.html) · [下一主題](uart.html)
