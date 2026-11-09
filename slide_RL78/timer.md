[主題索引](index.html) · [知識庫總索引](https://released.github.io/)

# Timer 與程式產生

<!-- CHAPTER_SCOPE -->
Timer 與程式產生 整理設定位置、操作畫面與對應程式／文件連結。

- 圖中型號、clock、pin、位址與工具介面屬於各參考工程的條件，不延伸為所有型號的固定配置。
- 實際設定與結果以所選 MCU 手冊、工程設定、linker map 及量測為準；原始文件與範例連結保留在各節。



---

<a id="article_timer"></a>

## Smart Configurator：Interval Timer

![Smart Config. : Interval Timer — slide extend RL7835](img/slide_extend_RL7835.png)

![Smart Config. : Interval Timer — slide extend RL7834](img/slide_extend_RL7834.png)

![Smart Config. : Interval Timer — slide extend RL7836](img/slide_extend_RL7836.png)

<u>RL78 Smart Configurator User's Guide: CS+</u>
[back to top](index.html#article_top)    

---

<span style="color:#FF0000">
TAUxx timer difference<br><br>
</span>  

![Smart Config. : Interval Timer — slide extend RL7837](img/slide_extend_RL7837.png)


<span style="color:#FF0000">
TAUxx timer clock source<br><br>
</span>

![Smart Config. : Interval Timer — slide extend RL7838](img/slide_extend_RL7838.png)


<u>RL78 Smart Configurator User's Guide: CS+</u>
[back to top](index.html#article_top)    

---

![Smart Config. : Interval Timer — slide extend RL7839](img/slide_extend_RL7839.png)

![Smart Config. : Interval Timer — slide extend RL7840](img/slide_extend_RL7840.png)

<u>RL78 Smart Configurator User's Guide: CS+</u>
[back to top](index.html#article_top)    

---

<span style="color:#FF0000">
Press <b>[Generate Code]</b> in Smart config. will automatically generate driver source code under CS+ project<br><br>
</span> 

![Smart Config. : Interval Timer — slide extend RL7841](img/slide_extend_RL7841.png)

![Smart Config. : Interval Timer — slide extend RL7842](img/slide_extend_RL7842.png)

![Smart Config. : Interval Timer — slide extend RL7843](img/slide_extend_RL7843.png)

 

<u>RL78 Smart Configurator User's Guide: CS+</u>
[back to top](index.html#article_top)    

---

<span style="color:#FF0000">
Re-build project , will see the build result is complete without error<br><br>
</span>

![Smart Config. : Interval Timer — slide extend RL7845](img/slide_extend_RL7845.png)

![Smart Config. : Interval Timer — slide extend RL7844](img/slide_extend_RL7844.png)


<u>RL78 Smart Configurator User's Guide: CS+</u>
[back to top](index.html#article_top)    

---

![Smart Config. : Interval Timer — slide extend RL7846](img/slide_extend_RL7846.png)

![Smart Config. : Interval Timer — slide extend RL7847](img/slide_extend_RL7847.png)

![Smart Config. : Interval Timer — slide extend RL7848](img/slide_extend_RL7848.png)

![Smart Config. : Interval Timer — slide extend RL7849](img/slide_extend_RL7849.png)

![Smart Config. : Interval Timer — slide extend RL7850](img/slide_extend_RL7850.png)

<u>RL78 Smart Configurator User's Guide: CS+</u>
[back to top](index.html#article_top)    

---

<span style="color:#FF0000">
Need to manual add interrupt enable and while(1)<br><br>
</span>

```c
BSP_EI();

while(1)
{
}

```

<span style="color:#FF0000">
Need to manual add driver start API , ex : <br><br>
</span>

```c
R_Config_TAU0_0_Start(); 
```

![Smart Config. : Interval Timer — slide extend RL7851](img/slide_extend_RL7851.png)


<u>RL78 Smart Configurator User's Guide: CS+</u>
[back to top](index.html#article_top)    

---


<span style="color:#FF0000">
Need to manual add include file , to fix warning<br><br>
</span>

```c
#include "r_smc_entry.h"
#include "platform.h"
```

![Smart Config. : Interval Timer — slide extend RL7852](img/slide_extend_RL7852.png)

![Smart Config. : Interval Timer — slide extend RL7853](img/slide_extend_RL7853.png)

<u>RL78 Smart Configurator User's Guide: CS+</u>
[back to top](index.html#article_top)    

---

![Smart Config. : Interval Timer — slide extend RL7856](img/slide_extend_RL7856.png)

![Smart Config. : Interval Timer — slide extend RL7854](img/slide_extend_RL7854.png)

![Smart Config. : Interval Timer — slide extend RL7855](img/slide_extend_RL7855.png)


<span style="color:#FF0000">
Add TIMER interrupt function under <br><br>
</span>  

```c
r_Config_TAU0_0_interrupt()
```

![Smart Config. : Interval Timer — slide extend RL7857](img/slide_extend_RL7857.png)

![Smart Config. : Interval Timer — slide extend RL7858](img/slide_extend_RL7858.png)


<u>RL78 Smart Configurator User's Guide: CS+</u>
[back to top](index.html#article_top)    

---

<a id="smart-config-timer-delay---interrupt"></a>

## Smart Configurator：Timer delay - interrupt

![Smart Config. : Timer delay - interrupt — slide extend RL7860](img/slide_extend_RL7860.png)

![Smart Config. : Timer delay - interrupt — slide extend RL7859](img/slide_extend_RL7859.png)


<u>RL78 Smart Configurator User's Guide: CS+</u>
[back to top](index.html#article_top)    

---

<a id="smart-config-timer-delay---polling-f2440mhz"></a>

## Smart Configurator：Timer delay - polling (F24@40MHz)

![Smart Config. : Timer delay - polling (F24@40MHz) — slide extend RL7859 1](img/slide_extend_RL7859_1.png)

nop delay : wait delay , 1.0562ms
```c
    for (i = 0; i < 2000; i++) 
    {
        __nop();
    }
```

timer delay : timer delay , 1.007ms @ clock src 2500KHz , fCLK/2^4 , 1ms

![Smart Config. : Timer delay - polling (F24@40MHz) — slide extend RL7859 3](img/slide_extend_RL7859_3.png)


example 1:
```c
    R_Config_TAU0_0_Start();
    while(!(TCR00 == 0));
    R_Config_TAU0_0_Stop();
```

![Smart Config. : Timer delay - polling (F24@40MHz) — slide extend RL7859 2](img/slide_extend_RL7859_2.png)

example 2:
```c

    unsigned long tick_count = 0;

    tick_count = 1;
    R_Config_TAU0_0_Start();
    while ((tick_count))
    {
      if (TMIF00 == 1)
      {
        TMIF00 = 0;
        R_Config_TAU0_0_Stop();
        if (--tick_count)
        {
          R_Config_TAU0_0_Start();
        }
      }
    }

```

![Smart Config. : Timer delay - polling (F24@40MHz) — slide extend RL7859 4](img/slide_extend_RL7859_4.png)



<u>RL78 Smart Configurator User's Guide: CS+</u>
[back to top](index.html#article_top)    

---

<a id="smart-config-generate-code"></a>

## Smart Configurator：Generate code

<span style="color:#FF0000">
[Generate Code] in Smart configurator , will re-generate driver code <b><u>every time</b></u><br><br>
</span> 

![Smart Config. : Generate code — slide extend RL7861](img/slide_extend_RL7861.png)

![Smart Config. : Generate code — slide extend RL7862](img/slide_extend_RL7862.png)


<u>RL78 Smart Configurator User's Guide: CS+</u>
[back to top](index.html#article_top)    

---

<a id="cs-driver-code"></a>

## CS+：driver code

<span style="color:#FF0000">
Put custom application code , variable , declaration , between these 2 comment , will merge into driver code when execute [Generate Code] in Smart config<br><br>
</span>  

![CS+ : driver code — slide extend RL7863](img/slide_extend_RL7863.png)

![CS+ : driver code — slide extend RL7864](img/slide_extend_RL7864.png)

![CS+ : driver code — slide extend RL7865](img/slide_extend_RL7865.png)




<u>RL78 Smart Configurator User's Guide: CS+</u>
[back to top](index.html#article_top)    

[主題索引](index.html) · [上一主題](clock.html) · [下一主題](gpio.html)
