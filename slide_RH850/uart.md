[主題索引](index.html) · [知識庫總索引](https://released.github.io/)

# UART

<!-- CHAPTER_SCOPE -->
UART 整理設定位置、操作畫面與對應程式／文件連結。

- 圖中型號、clock、pin、位址與工具介面屬於各參考工程的條件，不延伸為所有型號的固定配置。
- 實際設定與結果以所選 MCU 手冊、工程設定、linker map 及量測為準；原始文件與範例連結保留在各節。



---

<a id="article_uart"></a>

## Smart Configurator：UART0

![Smart Config. – UART0 — slide extend RH850120](img/slide_extend_RH850120.png)

![Smart Config. – UART0 — slide extend RH850121](img/slide_extend_RH850121.png)

<u>RH850 Smart Configurator User's Guide: CS+</u>
[back to top](index.html#article_top)    

---

![Smart Config. – UART0 — slide extend RH850122](img/slide_extend_RH850122.png)

<u>RH850 Smart Configurator User's Guide: CS+</u>
[back to top](index.html#article_top)    

---

[Sample_Project_RH850_S1_UART_TX_DMA_RX_interrupt](https://github.com/released/Sample_Project_RH850_S1_UART_TX_DMA_RX_interrupt)

[Sample_Project_RH850_S1_UART_TX_RX_DMA](https://github.com/released/Sample_Project_RH850_S1_UART_TX_RX_DMA)

[Sample_Project_RH850_S1_UART_printf](https://github.com/released/Sample_Project_RH850_S1_UART_printf)

[Sample_Project_RH850_S1_UART1_TX_RX](https://github.com/released/Sample_Project_RH850_S1_UART1_TX_RX)


![Smart Config. – UART0 — slide extend RH850123](img/slide_extend_RH850123.png)

![Smart Config. – UART0 — slide extend RH850124](img/slide_extend_RH850124.png)

![Smart Config. – UART0 — slide extend RH850125](img/slide_extend_RH850125.png)

![Smart Config. – UART0 — slide extend RH850127](img/slide_extend_RH850127.png)


<span style="color:#FF0000">
Need to manual add driver start API , ex : <br><br>
</span>

```
R_Config_UART0_Start();
```

![Smart Config. – UART0 — slide extend RH850126](img/slide_extend_RH850126.png)

<u>RH850 Smart Configurator User's Guide: CS+</u>
[back to top](index.html#article_top)    

[主題索引](index.html) · [上一主題](spi.html) · [下一主題](pwm.html)
