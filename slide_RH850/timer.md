[主題索引](index.html) · [知識庫總索引](https://released.github.io/)

# Timer 與程式產生

<!-- CHAPTER_SCOPE -->
Timer 與程式產生 整理設定位置、操作畫面與對應程式／文件連結。

- 圖中型號、clock、pin、位址與工具介面屬於各參考工程的條件，不延伸為所有型號的固定配置。
- 實際設定與結果以所選 MCU 手冊、工程設定、linker map 及量測為準；原始文件與範例連結保留在各節。



---

<a id="article_timer"></a>

## Smart Configurator：Interval Timer

![Smart Config. – Interval Timer — slide extend RH85036](img/slide_extend_RH85036.png)

![Smart Config. – Interval Timer — slide extend RH85035](img/slide_extend_RH85035.png)

![Smart Config. – Interval Timer — slide extend RH85037](img/slide_extend_RH85037.png)

<u>RH850 Smart Configurator User's Guide: CS+</u>
[back to top](index.html#article_top)    

---

<span style="color:#FF0000">
TAUxx timer difference<br><br>
</span>

![Smart Config. – Interval Timer — slide extend RH85038](img/slide_extend_RH85038.png)


<span style="color:#FF0000">
TAUxx timer clock source<br><br>
</span>

![Smart Config. – Interval Timer — slide extend RH85039](img/slide_extend_RH85039.png)

![Smart Config. – Interval Timer — slide extend RH85040](img/slide_extend_RH85040.png)

<u>RH850 Smart Configurator User's Guide: CS+</u>
[back to top](index.html#article_top)    

---

![Smart Config. – Interval Timer — slide extend RH85041](img/slide_extend_RH85041.png)

![Smart Config. – Interval Timer — slide extend RH85042](img/slide_extend_RH85042.png)

<u>RH850 Smart Configurator User's Guide: CS+</u>
[back to top](index.html#article_top)    

---

<span style="color:#FF0000">
Press <b>[Generate Code]</b> in Smart config. will automatically generate driver source code under CS+ project<br><br>
</span> 

![Smart Config. – Interval Timer — slide extend RH85044](img/slide_extend_RH85044.png)

![Smart Config. – Interval Timer — slide extend RH85043](img/slide_extend_RH85043.png)

![Smart Config. – Interval Timer — slide extend RH85045](img/slide_extend_RH85045.png)


<u>RH850 Smart Configurator User's Guide: CS+</u>
[back to top](index.html#article_top)    

---

<span style="color:#FF0000">
Re-build project , will see the build result is complete without error<br><br>
</span>

![Smart Config. – Interval Timer — slide extend RH85046](img/slide_extend_RH85046.png)

![Smart Config. – Interval Timer — slide extend RH85047](img/slide_extend_RH85047.png)


<span style="color:#FF0000">
This will be project main code : <br>
<b>r_cg_main.c</b><br><br>
</span>

![Smart Config. – Interval Timer — slide extend RH85048](img/slide_extend_RH85048.png)


<u>RH850 Smart Configurator User's Guide: CS+</u>
[back to top](index.html#article_top)    

---

![Smart Config. – Interval Timer — slide extend RH85049](img/slide_extend_RH85049.png)

![Smart Config. – Interval Timer — slide extend RH85051](img/slide_extend_RH85051.png)

![Smart Config. – Interval Timer — slide extend RH85052](img/slide_extend_RH85052.png)

![Smart Config. – Interval Timer — slide extend RH85050](img/slide_extend_RH85050.png)

![Smart Config. – Interval Timer — slide extend RH85053](img/slide_extend_RH85053.png)


<span style="color:#FF0000">
Need to manual add driver start API , ex : <br><br>
</span>

```
R_Config_TAUJ0_0_Start(); 
```

![Smart Config. – Interval Timer — slide extend RH85054](img/slide_extend_RH85054.png)

<u>RH850 Smart Configurator User's Guide: CS+</u>
[back to top](index.html#article_top)    

---

![Smart Config. – Interval Timer — slide extend RH85055](img/slide_extend_RH85055.png)

![Smart Config. – Interval Timer — slide extend RH85056](img/slide_extend_RH85056.png)

![Smart Config. – Interval Timer — slide extend RH85059](img/slide_extend_RH85059.png)


<span style="color:#FF0000">
Add TIMER interrupt function under <br><br>
</span>  

```
r_Config_TAUJ0_0_interrupt()
```

![Smart Config. – Interval Timer — slide extend RH85058](img/slide_extend_RH85058.png)

![Smart Config. – Interval Timer — slide extend RH85057](img/slide_extend_RH85057.png)

<u>RH850 Smart Configurator User's Guide: CS+</u>
[back to top](index.html#article_top)    

---

<a id="smart-config-timer-delay"></a>

## Smart Configurator：Timer delay

![Smart Config. : Timer delay — slide extend RH85061](img/slide_extend_RH85061.png)

![Smart Config. : Timer delay — slide extend RH85060](img/slide_extend_RH85060.png)


<u>RH850 Smart Configurator User's Guide: CS+</u>
[back to top](index.html#article_top)    

---

<a id="smart-config-–-generate-code"></a>

## Smart Configurator：Generate code

<span style="color:#FF0000">
[Generate Code] in Smart configurator , will re-generate driver code <b><u>every time</b></u><br><br>
</span> 

![Smart Config. – Generate code — slide extend RH85062](img/slide_extend_RH85062.png)

![Smart Config. – Generate code — slide extend RH85063](img/slide_extend_RH85063.png)



<u>RH850 Smart Configurator User's Guide: CS+</u>
[back to top](index.html#article_top)    

---

<a id="cs---driver-code"></a>

## CS+：driver code

<span style="color:#FF0000">
Put custom application code , variable , declaration , between these 2 comment , will merge into driver code when execute [Generate Code] in Smart config<br><br>
</span>  

![CS+ - driver code — slide extend RH85064](img/slide_extend_RH85064.png)

![CS+ - driver code — slide extend RH85065](img/slide_extend_RH85065.png)

![CS+ - driver code — slide extend RH85066](img/slide_extend_RH85066.png)



<u>RH850 Smart Configurator User's Guide: CS+</u>
[back to top](index.html#article_top)    

[主題索引](index.html) · [上一主題](clock.html) · [下一主題](gpio.html)
