[主題索引](index.html) · [知識庫總索引](https://released.github.io/)

# I²C 更新封包與操作

<!-- CHAPTER_SCOPE -->
I²C 更新封包與操作 整理設定位置、操作畫面與對應程式／文件連結。

- 圖中型號、clock、pin、位址與工具介面屬於各參考工程的條件，不延伸為所有型號的固定配置。
- 實際設定與結果以所選 MCU 手冊、工程設定、linker map 及量測為準；原始文件與範例連結保留在各節。



---

<a id="project-boot-code-modifictaion---i2c-command-flow"></a>

## Project : boot code modification - I2C command flow

* No READ operation
* No Authentication operation

![Project : boot code modifictaion - I2C command flow — boot i2c command packet](../img/boot_i2c_command_packet.jpg)
![Project : boot code modifictaion - I2C command flow — boot i2c data packet](../img/boot_i2c_data_packet.jpg)

![Project : boot code modifictaion - I2C command flow — boot i2c 01](../img/boot_i2c_01.jpg)
![Project : boot code modifictaion - I2C command flow — boot i2c 02](../img/boot_i2c_02.jpg)
![Project : boot code modifictaion - I2C command flow — boot i2c 03](../img/boot_i2c_03.jpg)


---

<a id="project-boot-code-modifictaion---i2c-command-flow-check_generic_boot_standard_interface"></a>

## Project : boot code modification - I2C command flow (check_generic_boot_standard_interface)

(0) send initial byte (master)
![Project : boot code modifictaion - I2C command flow (check generic boot standard interface) — LA m 0 init](../img/LA_m_0_init.jpg)


(1) boot mode check command byte (master)
![Project : boot code modifictaion - I2C command flow (check generic boot standard interface) — LA m 1 init 1](../img/LA_m_1_init_1.jpg)


(1-1) check read status (master)
![Project : boot code modifictaion - I2C command flow (check generic boot standard interface) — LA m 1 init 2](../img/LA_m_1_init_2.jpg)
![Project : boot code modifictaion - I2C command flow (check generic boot standard interface) — LA m 1 init 3](../img/LA_m_1_init_3.jpg)


(2) device inquiry command packet (master)
![Project : boot code modifictaion - I2C command flow (check generic boot standard interface) — LA m 2 device inquiry cmd](../img/LA_m_2_device_inquiry_cmd_packet.jpg)

(2-1) report status about device inquiry command packet (slave)
![Project : boot code modifictaion - I2C command flow (check generic boot standard interface) — LA s 2 device inquiry data](../img/LA_s_2_device_inquiry_data_status_ok_0.jpg)
![Project : boot code modifictaion - I2C command flow (check generic boot standard interface) — LA s 2 device inquiry data](../img/LA_s_2_device_inquiry_data_status_ok_1.jpg)


---

<a id="project-boot-code-modifictaion---i2c-command-flow-read_device_signature"></a>

## Project : boot code modification - I2C command flow (read_device_signature)

(3) obtain target device signature (master)
![Project : boot code modifictaion - I2C command flow (read device signature) — LA m 3 signature request cmd packet 0](../img/LA_m_3_signature_request_cmd_packet_0.jpg)
![Project : boot code modifictaion - I2C command flow (read device signature) — LA m 3 signature request cmd packet 1](../img/LA_m_3_signature_request_cmd_packet_1.jpg)
![Project : boot code modifictaion - I2C command flow (read device signature) — LA m 3 signature request cmd packet 2](../img/LA_m_3_signature_request_cmd_packet_2.jpg)

(3-1) report status about obtain target device signature (slave)
![Project : boot code modifictaion - I2C command flow (read device signature) — LA s 3 SIGNATURE RESPOND 0](../img/LA_s_3_SIGNATURE_RESPOND_0.jpg)
![Project : boot code modifictaion - I2C command flow (read device signature) — LA s 3 SIGNATURE RESPOND 1](../img/LA_s_3_SIGNATURE_RESPOND_1.jpg)
![Project : boot code modifictaion - I2C command flow (read device signature) — LA s 3 SIGNATURE RESPOND 2](../img/LA_s_3_SIGNATURE_RESPOND_2.jpg)

---

<a id="project-boot-code-modifictaion---i2c-command-flow-read_area_information"></a>

## Project : boot code modification - I2C command flow (read_area_information)

(4) obtain target device signature  (master)
![Project : boot code modifictaion - I2C command flow (read area information) — LA m 4 memory area info request cmd packet](../img/LA_m_4_memory_area_info_request_cmd_packet_0.jpg)
![Project : boot code modifictaion - I2C command flow (read area information) — LA m 4 memory area info request cmd packet](../img/LA_m_4_memory_area_info_request_cmd_packet_1.jpg)
![Project : boot code modifictaion - I2C command flow (read area information) — LA m 4 memory area info request cmd packet](../img/LA_m_4_memory_area_info_request_cmd_packet_2.jpg)

(4-1) report status about obtain target device signature  (slave)
![Project : boot code modifictaion - I2C command flow (read area information) — LA s 4 AREA INFO RESPOND 0](../img/LA_s_4_AREA_INFO_RESPOND_0.jpg)
![Project : boot code modifictaion - I2C command flow (read area information) — LA s 4 AREA INFO RESPOND 1](../img/LA_s_4_AREA_INFO_RESPOND_1.jpg)
![Project : boot code modifictaion - I2C command flow (read area information) — LA s 4 AREA INFO RESPOND 2](../img/LA_s_4_AREA_INFO_RESPOND_2.jpg)

---

<a id="project-boot-code-modifictaion---i2c-command-flow-start_device_image_transfer"></a>

## Project : boot code modification - I2C command flow (start_device_image_transfer)

(5) erase user code flash area (master)
![Project : boot code modifictaion - I2C command flow (start device image transfer) — LA m 5 erase cmd packet header 0](../img/LA_m_5_erase_cmd_packet_header_0.jpg)
![Project : boot code modifictaion - I2C command flow (start device image transfer) — LA m 5 erase cmd packet header 1](../img/LA_m_5_erase_cmd_packet_header_1.jpg)

(5-1) report status about erase user code flash area (slave)
![Project : boot code modifictaion - I2C command flow (start device image transfer) — LA s 5 ERASE MEMORY 0](../img/LA_s_5_ERASE_MEMORY_0.jpg)
![Project : boot code modifictaion - I2C command flow (start device image transfer) — LA s 5 ERASE MEMORY 1](../img/LA_s_5_ERASE_MEMORY_1.jpg)


(6) initiate write user code flash area (master)
![Project : boot code modifictaion - I2C command flow (start device image transfer) — LA m 6 write cmd packet header 0](../img/LA_m_6_write_cmd_packet_header_0.jpg)
![Project : boot code modifictaion - I2C command flow (start device image transfer) — LA m 6 write cmd packet header 1](../img/LA_m_6_write_cmd_packet_header_1.jpg)

(6-1) report status about initiate write user code flash area (master)
![Project : boot code modifictaion - I2C command flow (start device image transfer) — LA s 6 WRITE MEMORY START 0](../img/LA_s_6_WRITE_MEMORY_START_0.jpg)
![Project : boot code modifictaion - I2C command flow (start device image transfer) — LA s 6 WRITE MEMORY START 1](../img/LA_s_6_WRITE_MEMORY_START_1.jpg)

---

<a id="project-boot-code-modifictaion---i2c-command-flow-terminal-operation-master-slave"></a>

## Project : boot code modification - I2C command flow terminal operation (master & slave)

(1) log message at master : set target image 
![Project : boot code modifictaion - I2C command flow terminal operation (master & slave) — i2c transfer m 1 ConfigProgram](../img/i2c_transfer_m_1_ConfigProgramInfo.jpg)

(2) log message at master : check slave status
![Project : boot code modifictaion - I2C command flow terminal operation (master & slave) — i2c transfer m 2 Obtain target](../img/i2c_transfer_m_2_Obtain_target_device_info.jpg)

(3) log message at master : program binary to slave code flash
![Project : boot code modifictaion - I2C command flow terminal operation (master & slave) — i2c transfer m 3 StartImageTra](../img/i2c_transfer_m_3_StartImageTransfer.jpg)

(4) log message at slave : erase (RL78 F24)
![Project : boot code modifictaion - I2C command flow terminal operation (master & slave) — i2c transfer s erase](../img/i2c_transfer_s_erase.jpg)

(5) log message at slave : programming finish (RL78 F24)
![Project : boot code modifictaion - I2C command flow terminal operation (master & slave) — i2c transfer s program finish](../img/i2c_transfer_s_program_finish.jpg)

(6) code flow at slave : WriteCodeFlash (RL78 F24)
![Project : boot code modifictaion - I2C command flow terminal operation (master & slave) — i2c transfer s code 1](../img/i2c_transfer_s_code_1.jpg)

erase per page (1K bytes) , program per 4 bytes
![Project : boot code modifictaion - I2C command flow terminal operation (master & slave) — i2c transfer s code 2](../img/i2c_transfer_s_code_2.jpg)

[主題索引](index.html) · [上一主題](boot-driver.html) · [下一主題](xmodem.html)
