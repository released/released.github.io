[主題索引](index.html) · [知識庫總索引](https://released.github.io/)

# PWM

<!-- CHAPTER_SCOPE -->
PWM 整理設定位置、操作畫面與對應程式／文件連結。

- 圖中型號、clock、pin、位址與工具介面屬於各參考工程的條件，不延伸為所有型號的固定配置。
- 實際設定與結果以所選 MCU 手冊、工程設定、linker map 及量測為準；原始文件與範例連結保留在各節。



---

<a id="article_pwm"></a>

## Smart Configurator：PWM

![Smart Config. – PWM — slide extend RH850128](img/slide_extend_RH850128.png)

![Smart Config. – PWM — slide extend RH850129](img/slide_extend_RH850129.png)

<u>RH850 Smart Configurator User's Guide: CS+</u>
[back to top](index.html#article_top)    

---

![Smart Config. – PWM — slide extend RH850131](img/slide_extend_RH850131.png)

![Smart Config. – PWM — slide extend RH850130](img/slide_extend_RH850130.png)

<u>RH850 Smart Configurator User's Guide: CS+</u>
[back to top](index.html#article_top)    

---

![Smart Config. – PWM — slide extend RH850132](img/slide_extend_RH850132.png)

![Smart Config. – PWM — slide extend RH850134](img/slide_extend_RH850134.png)

![Smart Config. – PWM — slide extend RH850133](img/slide_extend_RH850133.png)

<u>RH850 Smart Configurator User's Guide: CS+</u>
[back to top](index.html#article_top)    

---

[Sample_Project_RH850_S1_PWM_MultiCh](https://github.com/released/Sample_Project_RH850_S1_PWM_MultiCh)

[Sample_Project_RH850_S1_Input_Capture](https://github.com/released/Sample_Project_RH850_S1_Input_Capture)

[Sample_Project_RH850_S1_PWM_Input_Capture](https://github.com/released/Sample_Project_RH850_S1_PWM_Input_Capture)


![Smart Config. – PWM — slide extend RH850135](img/slide_extend_RH850135.png)

![Smart Config. – PWM — slide extend RH850137](img/slide_extend_RH850137.png)


PWM duty adjust example

![Smart Config. – PWM — slide extend RH850136](img/slide_extend_RH850136.png)


<span style="color:#FF0000">
Need to manual add driver start API , ex : <br><br>
</span>

```
R_Config_TAUB0_Start();
```

![Smart Config. – PWM — slide extend RH850138](img/slide_extend_RH850138.png)

<u>RH850 Smart Configurator User's Guide: CS+</u>
[back to top](index.html#article_top)    

[主題索引](index.html) · [上一主題](uart.html) · [下一主題](adc.html)
