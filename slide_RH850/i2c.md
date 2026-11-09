[主題索引](index.html) · [知識庫總索引](https://released.github.io/)

# I²C

<!-- CHAPTER_SCOPE -->
I²C 整理設定位置、操作畫面與對應程式／文件連結。

- 圖中型號、clock、pin、位址與工具介面屬於各參考工程的條件，不延伸為所有型號的固定配置。
- 實際設定與結果以所選 MCU 手冊、工程設定、linker map 及量測為準；原始文件與範例連結保留在各節。



---

<a id="article_i2c"></a>

## Smart Configurator：I2C

![Smart Config. – I2C — slide extend RH85090](img/slide_extend_RH85090.png)

![Smart Config. – I2C — slide extend RH85091](img/slide_extend_RH85091.png)

<u>RH850 Smart Configurator User's Guide: CS+</u>
[back to top](index.html#article_top)    

---

![Smart Config. – I2C — slide extend RH85092](img/slide_extend_RH85092.png)

<u>RH850 Smart Configurator User's Guide: CS+</u>
[back to top](index.html#article_top)    

---

![Smart Config. – I2C — slide extend RH85093](img/slide_extend_RH85093.png)

<u>RH850 Smart Configurator User's Guide: CS+</u>
[back to top](index.html#article_top)    

---

[Sample_Project_RH850_S1_RIIC_I2C_Master](https://github.com/released/Sample_Project_RH850_S1_RIIC_I2C_Master)

[Sample_Project_RH850_S1_RIIC_I2C_Slave](https://github.com/released/Sample_Project_RH850_S1_RIIC_I2C_Slave)

[Sample_Project_RH850_S1_I2C_Master_Slave](https://github.com/released/Sample_Project_RH850_S1_I2C_Master_Slave)

[Sample_Project_RH850_S1_RIIC_I2C_Slave_Master_combination](https://github.com/released/Sample_Project_RH850_S1_RIIC_I2C_Slave_Master_combination)


![Smart Config. – I2C — slide extend RH85094](img/slide_extend_RH85094.png)

![Smart Config. – I2C — slide extend RH85095](img/slide_extend_RH85095.png)

![Smart Config. – I2C — slide extend RH85096](img/slide_extend_RH85096.png)

![Smart Config. – I2C — slide extend RH85097](img/slide_extend_RH85097.png)


<span style="color:#FF0000">
Need to manual add driver start API , ex : <br><br>
</span>

```
R_Config_RIIC0_Start();
```

![Smart Config. – I2C — slide extend RH85098](img/slide_extend_RH85098.png)

<u>RH850 Smart Configurator User's Guide: CS+</u>
[back to top](index.html#article_top)    

[主題索引](index.html) · [上一主題](interrupt.html) · [下一主題](spi.html)
