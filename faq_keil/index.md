
[回到知識庫總索引](https://released.github.io/)

<a id="article_top"></a>

# FAQ (IDE-KEIL)

> 整理 Keil MDK 搭配 Nu-Link 的 driver 安裝、進入 debug mode 與 Watch Window 操作。異常紀錄包含 MCU 型號、Keil 版本、Nu-Link firmware 與完整錯誤訊息。

## 快速診斷流程

```mermaid
flowchart LR
    DRIVER["更新 Nu-Link / Device Driver"] --> CONNECT["確認 Debug Adapter 與 Target Power"]
    CONNECT --> BUILD["確認 Device / Scatter / Build"]
    BUILD --> DEBUG["進入 Debug Mode"]
    DEBUG --> WATCH["Watch / Register / Memory 驗證"]
```

* [Necessary driver install](#common_driver)

* [Entry debug mode](#entry_debug_mode)

* [Watch Window](#watch_window)



---

<a id="common_driver"></a>

# Make sure driver installed is latest

* __step 1 : install necessary driver__

Nu-Link_Keil_Driver  , driver for KEILC (為了要讓KEILC 知道 , 目前要支援哪些新唐MCU list的driver)
https://www.nuvoton.com/resource-download.jsp?tp_GUID=SW1120200221180521


ICP_Programming_Tool  (PC GUI , programming with NULINK)
https://www.nuvoton.com/resource-download.jsp?tp_GUID=SW1720200221181328


NuTool-PinConfigure (PC GUI , arrange MCU PIN define )
https://www.nuvoton.com/resource-download.jsp?tp_GUID=SW1320200319135912


NuMicro_ISP_Programming_Tool (PC GUI programming tool ,  without NULINK , programming by MCU interfae : USB , UART etc)
https://www.nuvoton.com/resource-download.jsp?tp_GUID=SW1720201209134839

* __step 2 : some other useful link for user manual , driver__ 

[user manual] Nu-Link_Keil_Driver (cortex-M)
https://www.nuvoton.com/resource-download.jsp?tp_GUID=UG1320220111160454


[user manual] Nu-Link_Keil_Driver (8051)
https://www.nuvoton.com/resource-download.jsp?tp_GUID=UG1320220111160909


Nu-Link_IAR_Driver  , driver for IAR
https://www.nuvoton.com/resource-download.jsp?tp_GUID=SW1120200221180914


[user manual] Nu-Link_IAR_Driver (cortex-M)
https://www.nuvoton.com/resource-download.jsp?tp_GUID=UG1320220111161317


[user manual] Nu-Link_IAR_Driver (8051)
https://www.nuvoton.com/resource-download.jsp?tp_GUID=UG1320211228183307


[user manual] ICP_Programming_Tool 
安裝目錄內的 `ICPTool/Nuvoton NuMicro ICP Programmer User Guide.pdf`；實際位置依安裝設定而異。


[user manual] NuTool-PinConfigure
https://www.nuvoton.com/resource-download.jsp?tp_GUID=UG1320220401093634


[user manual] NuMicro_ISP_Programming_Tool (解壓縮開資料夾底下)
NuMicro_ISP_Programming_Tool\User Manual\UM_ISP_Programming_Tool_Rev*.**.pdf


[back to top](#article_top)   


---

<a id="entry_debug_mode"></a>

# How to entry debug mode in KEIL

* __step 1 : check KEIL option setting__ 

![Keil Options for Target 設定入口](img/entry_debug_000.jpg)


- Option for Target > Output > Select , 
    - Debug Information
    - Create HEX File
    - Browse Information

![Output 的 Debug Information、HEX 與 Browse 選項](img/entry_debug_001.jpg)


- Option for Target > Debug > Select ,
    - Nuvoton Nu-Link Debugger

![Debug 選擇 Nuvoton Nu-Link Debugger](img/entry_debug_002.jpg)


- Option for Target > Debug > Select , 
    - Settings
    - Update Nu-Link firmware , if the Nu-Link firmware version not same as KEIL driver 

![Nu-Link Settings 與 firmware 更新](img/entry_debug_003.jpg)


make sure 

- MCU Series selection is correct

- Reset Options > Connect > Select , 
    - ==Connect : Under Reset==
    - purpose : KEIL will be able to reset MCU with nRESET pin __before__ entry debug mode

![MCU Series 與 Connect Under Reset](img/entry_debug_004.jpg)


- Option for Target > Utilities > Select ,
    - Use Debug Driver

![Utilities 選擇 Use Debug Driver](img/entry_debug_005.jpg)


- Option for Target > Utilities > Select , 
    - Settings

make sure 

- Download Function > Select ,  
    - ==Reset and Run==
    - KEIL will be able to reset MCU __after__ update MCU firmware 

![Download Function 的 Reset and Run 選項](img/entry_debug_006.jpg)


* __step 2 : make sure project is compiled successfully__

![Keil Build 結果與錯誤訊息](img/entry_debug_007.jpg)


* __step 3 : entry debug mode__

![Keil Start Debug Session 入口](img/entry_debug_008.jpg)


* __step 4 : will stop at main__

![Debugger 停止於 main 的位置](img/entry_debug_009.jpg)


* __step 5 : some debug mode function__

- press Run , to start code process

![Debugger Run 控制](img/entry_debug_010.jpg)


- press Reset , to reset MCU to main code

![Debugger Reset 控制](img/entry_debug_011.jpg)


- trace code , by Step in or Step Over

![Step Into 與 Step Over 單步執行](img/entry_debug_012.jpg)


* __step 6 : How to jump to function prototype__

- Right click function name and select , 
    - Go To Definition Of xxx 

![函式右鍵選單的 Go To Definition](img/entry_debug_017.jpg)

[back to top](#article_top)   


---


<a id="watch_window"></a>

# How to monitor variables/structure in watch window

* __step 1 : check KEIL setting__ 

- View > Select

    - Periodic Window Update

![View 的 Periodic Window Update](img/entry_debug_013.jpg)



* __step 2 : select variable/structure and right click__

- Add the desired variable/structure into watch window

![變數右鍵選單的 Add to Watch](img/entry_debug_014.jpg)

![Watch Window 中的變數與結構](img/entry_debug_015.jpg)

- press Run , to start code process

![Debugger Run 控制](img/entry_debug_010.jpg)

- will see the value change in real time 

![程式執行時 Watch Window 的數值](img/entry_debug_016.jpg)


[back to top](#article_top)   

---


