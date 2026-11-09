[主題索引](index.html) · [知識庫總索引](https://released.github.io/)

# Boot 建置與燒錄設定

<!-- CHAPTER_SCOPE -->
Boot 建置與燒錄設定 整理設定位置、操作畫面與對應程式／文件連結。

- 圖中型號、clock、pin、位址與工具介面屬於各參考工程的條件，不延伸為所有型號的固定配置。
- 實際設定與結果以所選 MCU 手冊、工程設定、linker map 及量測為準；原始文件與範例連結保留在各節。



---

<a id="project-boot-code-property-modifictaion---e2-lite-setting"></a>

## Project : boot code property modification - E2 lite setting

![Project : boot code property modifictaion - E2 lite setting — boot e2 lite property flash](../img/boot_e2_lite_property_flash.jpg)


<u>CC-RL Compiler User's Manual</u>
<u>CS+ User’s Manual: CC-RL Build Tool Operation</u>


---

<a id="project-boot-code-property-modifictaion---cc-rl-build-tool-setting"></a>

## Project : boot code property modification - CC-RL Build Tool setting

**Common Options**

refer to How to Divide Boot and Flash Areas :
__3.2.5  Specifying hex file output only to the boot area address range__


![Project : boot code property modifictaion - CC-RL Build Tool setting — boot property common 01](../img/boot_property_common_01.jpg)


* __[Frequently Used Options (for Hex Output)] > [Division output file]__
  * base on MCU (ex : RL78F24) , to set boot code ==start address and end address== as file name
* file size will be different if use other platform (ex : RL78 F13 , RL78 G16 , etc)
  * [map const define ?](boot-startup.html#map_const)

```c
%BuildModeName%\boot0000_4FFF.hex=0000-4FFF
```

配置數值集中於 [App 起點與 map 對照](boot-startup.html#map_const)。
---

![Project : boot code property modifictaion - CC-RL Build Tool setting — boot property common 02](../img/boot_property_common_02.jpg)

<a id="fsy_file"></a>
* __[Other] > [Commands executed after build processing]__
  * add : copy_fsy.bat
  * copy ==boot code project fsy== file to app code project root folder

```c
copy /y/v .\DefaultBuild\RL78_F24_Basic_Boot_loader_UART.fsy ..\RL78_F24_Basic_Boot_loader_app\
```


![Project : boot code property modifictaion - CC-RL Build Tool setting — boot foloder DefaultBuild](../img/boot_foloder_DefaultBuild.jpg)


<u>How to Divide Boot and Flash Areas</u>
<u>CC-RL Compiler User's Manual</u>
<u>CS+ User’s Manual: CC-RL Build Tool Operation</u>

---

<a id="project-boot-code-property-modifictaion---cc-rl-build-tool-setting-2"></a>

## Project : boot code property modification - CC-RL Build Tool setting

**Compile Options**

![Project : boot code property modifictaion - CC-RL Build Tool setting — boot property compile 01](../img/boot_property_compile_01.jpg)

![Project : boot code property modifictaion - CC-RL Build Tool setting — boot property compile 02](../img/boot_property_compile_02.jpg)


<u>How to Divide Boot and Flash Areas</u>
<u>CC-RL Compiler User's Manual</u>
<u>CS+ User’s Manual: CC-RL Build Tool Operation</u>

---

<a id="project-boot-code-property-modifictaion---cc-rl-build-tool-setting-3"></a>

## Project : boot code property modification - CC-RL Build Tool setting

**Link Options**

![Project : boot code property modifictaion - CC-RL Build Tool setting — boot property link 01](../img/boot_property_link_01.jpg)
* __[Device] > [Option byte values for OCD]__
  * set to ```A5```
  * default will be 0xFF
![Project : boot code property modifictaion - CC-RL Build Tool setting — boot property link 02](../img/boot_property_link_02.jpg)
<br>
![Project : boot code property modifictaion - CC-RL Build Tool setting — boot property link 02 1](../img/boot_property_link_02_1.jpg)
<br>

* __==important notice==__
  * [RL78/F24 Locked](https://en.na4.teamsupport.com/knowledgeBase/21225578)

![Project : boot code property modifictaion - CC-RL Build Tool setting — boot property link 03](../img/boot_property_link_03.jpg)
* __[Output Code] > [Execute start address]__
  * will be called by cstart.asm
<br>

---
<a id="vect_address"></a>
* __[Output Code] > [Address setting for specified area for vector table]__
  * use vect_address.xlsx under boot code project , to copy shift address
![Project : boot code property modifictaion - CC-RL Build Tool setting — boot property link 03 1](../img/boot_property_link_03_1.jpg)

  * entry editor and paste the shift address
![Project : boot code property modifictaion - CC-RL Build Tool setting — boot property link 03 2](../img/boot_property_link_03_2.jpg)

  * the final result : 
![Project : boot code property modifictaion - CC-RL Build Tool setting — boot property link 04](../img/boot_property_link_04.jpg)
<br>


---

![Project : boot code property modifictaion - CC-RL Build Tool setting — boot property link 05](../img/boot_property_link_05.jpg)
* __[List] > [Ooutput link map file]__
  * select -SHow=ALL , will display the compile result (function , address) in map file for debug
  * map file under /DefaultBuild
![Project : boot code property modifictaion - CC-RL Build Tool setting — boot property link 05 1](../img/boot_property_link_05_1.jpg)

* refer to document : 
  * How to Divide Boot and Flash Areas (R20UT3475EJ0300) 
    * __3.2.2  Specifying the section allocation__
  * Renesas Flash Driver RL78 Type 02 User’s  Manual (R20UT5009EJ0110) 
    * __6.1.3.3  Section Item Settings__
<br>

---

![Project : boot code property modifictaion - CC-RL Build Tool setting — boot property link 06](../img/boot_property_link_06.jpg)
* __[Section] > [Section start address]__

  * set __Layout sections automatically__ to ==NO== 
  * entry editor and modify as below ( for code flash library ) 
  * flash area
  ```
  RFD_DATA_n 
  RFD_CMN_f 
  RFD_CF_f 
  SMP_CMN_f 
  SMP_CF_f 

  ```

  * ram area
  ```
  RFD_DATA_nR 
  RFD_CMN_fR 
  RFD_CF_fR
  SMP_CMN_fR 
  SMP_CF_fR  

  ```

  ![Project : boot code property modifictaion - CC-RL Build Tool setting — boot property link 06 1](../img/boot_property_link_06_1.jpg)
<br>

* __[Section] > [Section that outputs external symbols to the file]__
  * entry editor and modify as below : 

  ```
  .constf
  .text
  .textf
  .bss
  .sbss
  .data
  .sdata
  .RLIB
  .SLIB  
  ```

![Project : boot code property modifictaion - CC-RL Build Tool setting — boot property link 08](../img/boot_property_link_08.jpg)
<br>

* reserve SRAM flag 0xFF700 area [(ram flag)](architecture.html#ram_flag) , to prevent initial when power on

* __[Section] > [ROM to RAM mapped section]__
  * entry editor and modify as below :

  ```
  .data=.dataR
  .sdata=.sdataR
  RFD_DATA_n=RFD_DATA_nR 
  RFD_CMN_f=RFD_CMN_fR 
  RFD_CF_f=RFD_CF_fR 
  SMP_CMN_f=SMP_CMN_fR 
  SMP_CF_f=SMP_CF_fR

  ``` 

![Project : boot code property modifictaion - CC-RL Build Tool setting — boot property link 09](../img/boot_property_link_09.jpg)
![Project : boot code property modifictaion - CC-RL Build Tool setting — boot property link 09 1](../img/boot_property_link_09_1.jpg)


  * set __Layout sections automatically__ to ==YES== 
  * the final result : 
![Project : boot code property modifictaion - CC-RL Build Tool setting — boot property link 07](../img/boot_property_link_07.jpg)
![Project : boot code property modifictaion - CC-RL Build Tool setting — boot property link 09 2](../img/boot_property_link_09_2.jpg)
<br>

---

* 區段位址與配置說明（Section addresses and layout）

![Project : boot code property modifictaion - CC-RL Build Tool setting — boot debug monitor](../img/boot_debug_monitor.jpg)

  * ==flash assignment after debug area==
    * 0x000F0 (RL78 F24 , F23)

---

![Project : boot code property modifictaion - CC-RL Build Tool setting — boot map SRAM address 1](../img/boot_map_SRAM_address_1.jpg)
  * ==ram assignment==
    * 0xF9F00 (RL78 F24)
    * 0xFCF00 (RL78 F23)

![Project : boot code property modifictaion - CC-RL Build Tool setting — boot map SRAM address 2](../img/boot_map_SRAM_address_2.jpg)
![Project : boot code property modifictaion - CC-RL Build Tool setting — boot map SRAM address 3](../img/boot_map_SRAM_address_3.jpg)


---

![Project : boot code property modifictaion - CC-RL Build Tool setting — CCRL Section allocation](../img/CCRL_Section_allocation.jpg)
  * ==short direction address (.saddr) assignment==
    * 0xFFE20 (RL78 F24 , F23)

![Project : boot code property modifictaion - CC-RL Build Tool setting — boot map saddr address 1](../img/boot_map_saddr_address_1.jpg)


---

* in case of need to modify from RL78 F24 to RL78 F23 (code flash , data flash , extra area)
  * code flash
  ![Project : boot code property modifictaion - CC-RL Build Tool setting — boot property link 06 2](../img/boot_property_link_06_2.jpg)
  * data flash
  ![Project : boot code property modifictaion - CC-RL Build Tool setting — boot property link 06 3](../img/boot_property_link_06_3.jpg)
  * extra area
  ![Project : boot code property modifictaion - CC-RL Build Tool setting — boot property link 06 4](../img/boot_property_link_06_4.jpg)
  * RAM
  ![Project : boot code property modifictaion - CC-RL Build Tool setting — boot property link 06 5](../img/boot_property_link_06_5.jpg)
<br>

---

![Project : boot code property modifictaion - CC-RL Build Tool setting — boot property link 10](../img/boot_property_link_10.jpg)
* __[Others] > [Display total size sections]__
  * select -Total_size , will display the section size in output window
  * display build code size in Output window
![Project : boot code property modifictaion - CC-RL Build Tool setting — boot property link 10 1](../img/boot_property_link_10_1.jpg)


<u>How to Divide Boot and Flash Areas</u>
<u>CC-RL Compiler User's Manual</u>
<u>CS+ User’s Manual: CC-RL Build Tool Operation</u>
<u>Renesas Flash Driver RL78 Type 02 User’s  Manual</u>

---

<a id="project-boot-code-property-modifictaion---cc-rl-build-tool-setting-4"></a>

## Project : boot code property modification - CC-RL Build Tool setting

**Hex Output Options**

refer to How to Divide Boot and Flash Areas :
__3.2.5  Specifying hex file output only to the boot area address range__


![Project : boot code property modifictaion - CC-RL Build Tool setting — boot hex output 01](../img/boot_hex_output_01.jpg)

* __[Output File] > [Division output file]__  
  * base on MCU (ex : RL78F24) , to set boot code ==start address and end address== as file name
* file size will be different if use other platform (ex : RL78 F13 , RL78 G16 , etc)
  * [map const define ?](boot-startup.html#map_const)

```c
%BuildModeName%\boot0000_4FFF.hex=0000-4FFF
```

配置數值集中於 [App 起點與 map 對照](boot-startup.html#map_const)。
<br>

---

![Project : boot code property modifictaion - CC-RL Build Tool setting — boot hex output 02](../img/boot_hex_output_02.jpg)
* __[Hex Format]__  
  * follow the setting of the picture 


<u>How to Divide Boot and Flash Areas</u>
<u>CC-RL Compiler User's Manual</u>
<u>CS+ User’s Manual: CC-RL Build Tool Operation</u>
<u>Renesas Flash Driver RL78 Type 02 User’s  Manual</u>

---

<a id="reference---rl78f23-f24-user’s-manual-hardware---input-source-list"></a>

## Reference - RL78/F23, F24 User’s Manual: Hardware - Input Source List

![Reference - RL78/F23, F24 User’s Manual: Hardware - Input Source List — interrupt source list 01](../img/interrupt_source_list_01.jpg)
![Reference - RL78/F23, F24 User’s Manual: Hardware - Input Source List — interrupt source list 02](../img/interrupt_source_list_02.jpg)
![Reference - RL78/F23, F24 User’s Manual: Hardware - Input Source List — interrupt source list 03](../img/interrupt_source_list_03.jpg)
![Reference - RL78/F23, F24 User’s Manual: Hardware - Input Source List — interrupt source list 04](../img/interrupt_source_list_04.jpg)

---
<a id="vector_table"></a>
<a id="project-rl78f23-f24-user’s-manual-hardware---vector-table"></a>

## Project : RL78/F23, F24 User’s Manual: Hardware - Vector Table

![Project : RL78/F23, F24 User’s Manual: Hardware - Vector Table — vector table 01](../img/vector_table_01.jpg)
![Project : RL78/F23, F24 User’s Manual: Hardware - Vector Table — vector table 02](../img/vector_table_02.jpg)

[主題索引](index.html) · [上一主題](xmodem.html) · [下一主題](app.html)
