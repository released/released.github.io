[主題索引](index.html) · [知識庫總索引](https://released.github.io/)

# 燒錄、除錯與記憶體配置

<!-- CHAPTER_SCOPE -->
燒錄、除錯與記憶體配置 整理設定位置、操作畫面與對應程式／文件連結。

- 圖中型號、clock、pin、位址與工具介面屬於各參考工程的條件，不延伸為所有型號的固定配置。
- 實際設定與結果以所選 MCU 手冊、工程設定、linker map 及量測為準；原始文件與範例連結保留在各節。



---

<a id="cs-entry-debug-mode"></a>

## CS+：entry debug mode

<span style="color:#FF0000">
Make sure <u><b>[DISCONNECT]</b></u> CS+ project before REMOVE DEBUGGER tool <br><br>
</span>  

![CS+ : entry debug mode — slide extend RL78144](img/slide_extend_RL78144.png)

download program after rebuild
![CS+ : entry debug mode — slide extend RL78147](img/slide_extend_RL78147.png)

debug function
![CS+ : entry debug mode — slide extend RL78145](img/slide_extend_RL78145.png)
![CS+ : entry debug mode — slide extend RL78146](img/slide_extend_RL78146.png)
![CS+ : entry debug mode — slide extend RL78149](img/slide_extend_RL78149.png)
![CS+ : entry debug mode — slide extend RL78150](img/slide_extend_RL78150.png)

![CS+ : entry debug mode — slide extend RL78148](img/slide_extend_RL78148.png)


<u>Integrated Development Environment User's Manual: RL78 Debug Tool</u>
[back to top](index.html#article_top)    

---

<a id="renesas-flash-programmer-2"></a>

## Renesas Flash Programmer

![Renesas Flash Programmer — slide extend RL78151](img/slide_extend_RL78151.png)

![Renesas Flash Programmer — slide extend RL78153](img/slide_extend_RL78153.png)

![Renesas Flash Programmer — slide extend RL78152](img/slide_extend_RL78152.png)

![Renesas Flash Programmer — slide extend RL78154](img/slide_extend_RL78154.png)

<u>Renesas Flash Programmer V*.** Flash memory programming softwareUser's Manual </u>
[back to top](index.html#article_top)    

---

<a id="article_tips"></a>

## Convert to Hex


![Tips : Convert to Hex — slide extend RL78155](img/slide_extend_RL78155.png)

![Tips : Convert to Hex — slide extend RL78156](img/slide_extend_RL78156.png)
   

---

<a id="tips-emulator-power-on-mcu"></a>

## Emulator power on MCU

![Tips : Emulator power on MCU — slide extend RL78157](img/slide_extend_RL78157.png)

![Tips : Emulator power on MCU — slide extend RL78158](img/slide_extend_RL78158.png)
   

---

<a id="tips-map-file-display"></a>

## map file display

![Tips : map file display — slide extend RL78159](img/slide_extend_RL78159.png)

<span style="color:#FF0000">
Function address<br>
size display<br>
location assignment<br>
Code size <br>
RAM size display<br><br>
</span>

variable place address (SRAM)
![Tips : map file display — slide extend RL78160](img/slide_extend_RL78160.png)

function place address (FLASH)
![Tips : map file display — slide extend RL78161](img/slide_extend_RL78161.png)

section size display in map file
![Tips : map file display — slide extend RL78162](img/slide_extend_RL78162.png)
   

---

<a id="tips-section-message-display"></a>

## section message display

![Tips : section message display — slide extend RL78163](img/slide_extend_RL78163.png)


Display section message
![Tips : section message display — slide extend RL78164](img/slide_extend_RL78164.png)
   

---

<a id="tips-section-size-display-in-output-window"></a>

## section size display in output window

![Tips : section size display in output window — slide extend RL78165](img/slide_extend_RL78165.png)

![Tips : section size display in output window — slide extend RL78166](img/slide_extend_RL78166.png)
   

---

<a id="tips-backup-times-generate-code"></a>

## Backup times (generate code)

![Tips : Backup times (generate code) — slide extend RL78167](img/slide_extend_RL78167.png)
   

---

<a id="tips-section-define-modify"></a>

## section define modify

![Tips : section define modify — slide extend RL78168 1](img/slide_extend_RL78168_1.png)
   

---

<a id="tips-section-define-const"></a>

## section define (const)

<span style="color:#FF0000">
ADD [<b>privateData.const</b>] in Section Settings<br>
1. Select on [.data] in Section<br>
2. Select [Add]<br>
3. Key in [<b>privateData.const</b>] <br><br>
</span>  

![Tips : section define (const) — slide extend RL78168](img/slide_extend_RL78168.png)

| item | note |
|:--:|:--:|
| data  | variables with initial value  |
| bss  | variables with no initial value  |
| text  | program code  |
|<span style="color:#FF0000"><b>const</b></span>   | <span style="color:#FF0000"><b>constant data</b></span>  |

![Tips : section define (const) — slide extend RL78169](img/slide_extend_RL78169.png)

Code assignment example
![Tips : section define (const) — slide extend RL78170](img/slide_extend_RL78170.png)

<u>CC-RL Compiler User's Manual</u>
[back to top](index.html#article_top)
   
---

<a id="tips-section-define-data"></a>

## section define (data)

<span style="color:#FF0000">
ADD [<b>privateData.data</b>] in Section Settings<br>
1. Select on [.data] in Section<br>
2. Select [Add]<br>
3. Key in [<b>privateData.data</b>] <br><br>
</span>

![Tips : section define (data) — slide extend RL78171](img/slide_extend_RL78171.png)

| item | note |
|:--:|:--:|
| <span style="color:#FF0000"><b>data</b></span>  | <span style="color:#FF0000"><b>variables with initial value</b></span>  |
| bss  | variables with no initial value  |
| text  | program code  |
|const   | constant data  |

![Tips : section define (data) — slide extend RL78173](img/slide_extend_RL78173.png)

Code assignment example
![Tips : section define (data) — slide extend RL78172](img/slide_extend_RL78172.png)

<u>CC-RL Compiler User's Manual</u>
[back to top](index.html#article_top)

---

<a id="tips-section-define-bss"></a>

## section define (bss)

<span style="color:#FF0000">
ADD [<b>privateData.bss</b>] in Section Settings<br>
1. Select on [.bss] in Section<br>
2. Select [Add]<br>
3. Key in [<b>privateData.bss</b>] <br><br>
</span>


![Tips : section define (bss) — slide extend RL78174](img/slide_extend_RL78174.png)


| item | note |
|:--:|:--:|
| data  | variables with initial value  |
| <span style="color:#FF0000"><b>bss</b></span>  | <span style="color:#FF0000"><b>variables with no initial value</b></span>  |
| text  | program code  |
|const   | constant data  |

![Tips : section define (bss) — slide extend RL78176](img/slide_extend_RL78176.png)

Code assignment example
![Tips : section define (bss) — slide extend RL78175](img/slide_extend_RL78175.png)

<u>CC-RL Compiler User's Manual</u>
[back to top](index.html#article_top)   

---

<a id="tips-section-define-not-assigned-address"></a>

## section define (not assigned address)

<span style="color:#FF0000">
New add custom define section as below <br>
Also able to define the address base on application<br><br>
</span>

![Tips : section define (not assigned address) — slide extend RL78177](img/slide_extend_RL78177.png)

Code assignment example
![Tips : section define (not assigned address) — slide extend RL78178](img/slide_extend_RL78178.png)

check the address in map file
![Tips : section define (not assigned address) — slide extend RL78179](img/slide_extend_RL78179.png)


<u>CC-RL Compiler User's Manual</u>
[back to top](index.html#article_top)


---

<a id="tips-section-define-assigned-address"></a>

## section define (assigned address)

<span style="color:#FF0000">
New add custom define section as the capture<br>
Also able to define the address base on application<br><br>
</span>

![Tips : section define (assigned address) — slide extend RL78180](img/slide_extend_RL78180.png)

Code assignment example
![Tips : section define (assigned address) — slide extend RL78181](img/slide_extend_RL78181.png)

check the address in map file
![Tips : section define (assigned address) — slide extend RL78182](img/slide_extend_RL78182.png)


<u>CC-RL Compiler User's Manual</u>
[back to top](index.html#article_top)

---

<a id="tips-section-allocation-size"></a>

## section allocation , size

![Tips : section allocation , size — slide extend RL78183](img/slide_extend_RL78183.png)

<u>CC-RL Compiler User's Manual</u>
[back to top](index.html#article_top)

---

<a id="tips-project-split"></a>

## project split


<span style="color:#FF0000">
Use [<b> Build Mode Setting </b>] , to split different macro in different project setting if necessary<br><br>
</span>

![Tips : project split — slide extend RL78184](img/slide_extend_RL78184.png)

Project split example , modify the projec name
![Tips : project split — slide extend RL78185](img/slide_extend_RL78185.png)

![Tips : project split — slide extend RL78186](img/slide_extend_RL78186.png)

![Tips : project split — slide extend RL78187](img/slide_extend_RL78187.png)

Add the macro define for extra project 
![Tips : project split — slide extend RL78188](img/slide_extend_RL78188.png)

<u>CC-RL Compiler User's Manual</u>
[back to top](index.html#article_top)


---

<a id="tips-add-global-variable-into-watch-window-with-real-time-update"></a>

## add global variable into watch window with real time update

[display value real time under watch windows](https://en-support.renesas.com/knowledgeBase/16979169)

<span style="color:#FF0000">
enable [<b>Access during the execution</b>] at Debugger Property > Debug Tool Settings tab<br>
</span>

![Tips : add global variable into watch window with real time update — RL78 watch window update1](img/RL78_watch_window_update1.png)

<span style="color:#FF0000">
Add (non-static) global variable/structure into watch window , by [<b>Register to Watch1</b>] and verify the variable in window<br>
</span>

![Tips : add global variable into watch window with real time update — RL78 watch window update2](img/RL78_watch_window_update2.png)



<u>CC-RL Compiler User's Manual</u>
[back to top](index.html#article_top)

---

<a id="tips-e1203124"></a>

## E1203124

<span style="color:#FF0000">
[Direct Error Cause]
Writing to the on-chip debug reserved area is prohibited.(address: 0x00000002)(E1203124)<br><br>
</span>

![Tips : E1203124 — slide extend RL78189](img/slide_extend_RL78189.png)

how to fix
![Tips : E1203124 — slide extend RL78190](img/slide_extend_RL78190.png)

![Tips : E1203124 — slide extend RL78191](img/slide_extend_RL78191.png)

<u>CC-RL Compiler User's Manual</u>
[back to top](index.html#article_top)

---

<a id="tips-unable-to-set-break-point-under-debug-mode"></a>

## unable to set break point under debug mode


when entry debug mode , unable to set break point
![Tips : unable to set break point under debug mode — slide extend RL78204](img/slide_extend_RL78204.png)
![Tips : unable to set break point under debug mode — slide extend RL78203](img/slide_extend_RL78203.png)

Link Options > Output debug Information 

<span style="color:#FF0000">
<b>turn on output debug mode information</b> <br><br>
</span>

![Tips : unable to set break point under debug mode — slide extend RL78200](img/slide_extend_RL78200.png)

Common Options > Output File Type and Path 

<span style="color:#FF0000">
<b>enable Execute Module (Load Module File)</b> <br><br>
</span>

![Tips : unable to set break point under debug mode — slide extend RL78202](img/slide_extend_RL78202.png)

will be able to set break point after entry debug mode

![Tips : unable to set break point under debug mode — slide extend RL78201](img/slide_extend_RL78201.png)

<u>CC-RL Compiler User's Manual</u>
[back to top](index.html#article_top)

---

<a id="tips-how-to-copy-project-without-configcompiler-error"></a>

## How to copy project without config/compiler error

- step 1 : copy target project and ==rename== the new project 

ex : 
old project NAME : RL78_G16_ADC_PWM_Input_Pulse_UART_1M
new project NAME : RL78_G16_ADC_PWM_INTP_UART_1M

![Tips : How to copy project without config/compiler error — project copy 1](img/project_copy_1.png)

- step 2 : under the new project folder , ==rename below 4 project CONFIG files (__mtud , mtpj , rcpe , scfg__)== , to new project name (ex : RL78_G16_ADC_PWM_INTP_UART_1M.xxx )

![Tips : How to copy project without config/compiler error — project copy 2](img/project_copy_2.png)

- step 3 : OPEN the ==4 project CONFIG files (__mtud , mtpj , rcpe , scfg__)== by NOTEPAD++ , at the same time

![Tips : How to copy project without config/compiler error — project copy 3](img/project_copy_3.png)

- step 4 : ==use ctrl+C== , to __SEARCH__ the OLD project name (ex : RL78_G16_ADC_PWM_Input_Pulse_UART_1M) under all opened files

![Tips : How to copy project without config/compiler error — project copy 4](img/project_copy_4.png)

- step 5 : wil see below result , the OLD project name will appear under below 3 project CONFIG files (__mtud , mtpj , rcpe__)

![Tips : How to copy project without config/compiler error — project copy 5](img/project_copy_5.png)


- step 6 : ==use ctrl+H== , __FIND AND REPLACE__ , find the OLD project name (ex : RL78_G16_ADC_PWM_Input_Pulse_UART_1M) and repalce with new project name (ex : RL78_G16_ADC_PWM_INTP_UART_1M) under all opened files

![Tips : How to copy project without config/compiler error — project copy 6](img/project_copy_6.png)

<u>CC-RL Compiler User's Manual</u>
[back to top](index.html#article_top)

---


[主題索引](index.html) · [上一主題](build.html)
