[主題索引](index.html) · [知識庫總索引](https://released.github.io/)

# ADC

<!-- CHAPTER_SCOPE -->
ADC 整理設定位置、操作畫面與對應程式／文件連結。

- 圖中型號、clock、pin、位址與工具介面屬於各參考工程的條件，不延伸為所有型號的固定配置。
- 實際設定與結果以所選 MCU 手冊、工程設定、linker map 及量測為準；原始文件與範例連結保留在各節。



---

<a id="article_adc"></a>

## Smart Configurator：ADC

![Smart Config. – ADC — slide extend RH850139](img/slide_extend_RH850139.png)

![Smart Config. – ADC — slide extend RH850140](img/slide_extend_RH850140.png)

<u>RH850 Smart Configurator User's Guide: CS+</u>
[back to top](index.html#article_top)    

---

![Smart Config. – ADC — slide extend RH850141](img/slide_extend_RH850141.png)

![Smart Config. – ADC — slide extend RH850142](img/slide_extend_RH850142.png)

![Smart Config. – ADC — slide extend RH850142 1](img/slide_extend_RH850142_1.png)

![Smart Config. – ADC — slide extend RH850142 2](img/slide_extend_RH850142_2.png)

<u>RH850 Smart Configurator User's Guide: CS+</u>
[back to top](index.html#article_top)    

---

<a id="smart-config-–-adc-sampling"></a>

## Smart Configurator：ADC sampling

![Smart Config. – ADC sampling — slide extend RH850143](img/slide_extend_RH850143.png)

![Smart Config. – ADC sampling — slide extend RH850144](img/slide_extend_RH850144.png)

<u>RH850 Smart Configurator User's Guide: CS+</u>
[back to top](index.html#article_top)    

---

<a id="smart-config-–-adc"></a>

## Smart Configurator：ADC

[Sample_Project_RH850_S1_ADC_MultiCh](https://github.com/released/Sample_Project_RH850_S1_ADC_MultiCh)

[Sample_Project_RH850_S1_ADC_MultiCh_Polling](https://github.com/released/Sample_Project_RH850_S1_ADC_MultiCh_Polling)

[Sample_Project_RH850_S1_ADC_Self_Diagnostic](https://github.com/released/Sample_Project_RH850_S1_ADC_Self_Diagnostic)


![Smart Config. – ADC — slide extend RH850145](img/slide_extend_RH850145.png)

![Smart Config. – ADC — slide extend RH850146](img/slide_extend_RH850146.png)

![Smart Config. – ADC — slide extend RH850149](img/slide_extend_RH850149.png)

![Smart Config. – ADC — slide extend RH850147 1](img/slide_extend_RH850147_1.png)

![Smart Config. – ADC — slide extend RH850147 2](img/slide_extend_RH850147_2.png)

![Smart Config. – ADC — slide extend RH850147 3](img/slide_extend_RH850147_3.png)

![Smart Config. – ADC — slide extend RH850147 4](img/slide_extend_RH850147_4.png)

<span style="color:#FF0000">
Need to manual add driver start API , ex : <br><br>
</span>

```
R_Config_ADCA0_ScanGroup1_Start();
R_Config_ADCA0_ScanGroup1_OperationOn();
```

![Smart Config. – ADC — slide extend RH850148](img/slide_extend_RH850148.png)

<u>RH850 Smart Configurator User's Guide: CS+</u>
[back to top](index.html#article_top)    

[主題索引](index.html) · [上一主題](pwm.html) · [下一主題](flash-can.html)
