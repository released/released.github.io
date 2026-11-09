[UDS 首頁](../) · [ISO 標準](../iso/) · [實作與測試](../implementation/)

<a id="article_top"></a>

# 網路來源、版本與著作權原則

> 本頁只列使用者可直接從網路查證的來源。私人硬碟路徑、離線 PDF 與未公開的內部筆記不作為公開 reference。

## 1. ISO 官方標準頁面

| 標準 | 本站用來說明的範圍 | 官方來源 |
|---|---|---|
| ISO 14229-1 | UDS Application Layer、Services、Request/Response/NRC | [ISO 14229-1:2026](https://www.iso.org/standard/87962.html) |
| ISO 14229-2 | Session Layer Services、transport-independent primitives | [ISO 14229-2:2021](https://www.iso.org/standard/77322.html) |
| ISO 14229-3 | UDS on CAN implementation profile | [ISO 14229-3:2022](https://www.iso.org/standard/77323.html) |
| ISO 15765-2 | DoCAN Transport/Network Layer、ISO-TP | [ISO 15765-2:2024](https://www.iso.org/standard/84211.html) |

ISO 頁面可確認標準名稱、scope、edition 與狀態；完整 normative requirement 仍需由 ISO 或授權經銷管道取得。本站不重製付費標準的條文、表格、state table 或原始圖示。

## 2. CAN / CAN FD 官方與產業來源

- [CAN in Automation — CAN Knowledge](https://www.can-cia.org/can-knowledge)：CAN lower layer、CAN CC/CAN FD 與產業術語入口。
- [Bosch — CAN FD Protocol](https://www.bosch-semiconductors.com/products/ip-modules/can-protocols/can-fd/)：CAN FD frame、payload 與 bit-rate switch 的原始技術背景。
- [ISO 11898 catalogue](https://www.iso.org/ics/43.040.15/x/)：CAN data-link/physical-layer 標準狀態。
- [ISO 11898-2:2026](https://www.iso.org/standard/90697.html)：目前有效的 High-speed CAN physical medium attachment scope；2024 edition 已被此版取代。

## 3. PEAK / PCAN 官方來源

| 主題 | 官方來源 |
|---|---|
| PCAN-USB hardware interface | [PEAK PCAN-USB](https://www.peak-system.com/products/hardware/external-pc-interfaces/pcan-usb/) |
| PCAN-UDS product/API | [PEAK PCAN-UDS API](https://www.peak-system.com/PCAN-UDS-API.370.0.html) |
| PCAN-UDS API details | [PCAN-UDS 2.x User Manual](https://www.peak-system.com/produktcd/Pdf/English/PCAN-UDS-API_UserMan_eng.pdf) |
| Raw CAN API | [PEAK PCAN-Basic](https://www.peak-system.com/products/software/development-packages/pcan-basic/) |
| Monitor / transmit list | [PEAK PCAN-View](https://www.peak-system.com/products/software/analysis-software/pcan-view/?L=1) |

產品版本、API signature 與支援平台會變動。本站只說明架構與能力邊界；實作時應重新查看 PEAK 最新 package、header 與 manual。

## 4. EcuBus Pro 官方來源

- [UDS Bootloader Implementation Guide](https://app.whyengineer.com/docs/um/uds/example/example.html)：以 EcuBus Pro、USB-CAN interface 與 S32K144 示範診斷服務設定、sequence 與 script。
- [NXP Bootloader Example](https://app.whyengineer.com/examples/nxp_bootloader/readme.html)：EcuBus Pro、USB-CAN adapter 與 NXP ECU 的公開範例。

官方範例使用的 adapter、CAN ID、service sequence、DID、RID、memory address 與 security algorithm 屬於該範例配置。標準 SID／sub-function 的定義仍以 ISO 14229 為準；其他 ECU 的專案參數則以各自的 diagnostic specification 與工具設定為準。

## 5. AUTOSAR 官方規格

- [AUTOSAR Specification of Diagnostic Communication Manager](https://www.autosar.org/fileadmin/standards/R22-11/CP/AUTOSAR_SWS_DiagnosticCommunicationManager.pdf)
- [AUTOSAR Specification of Diagnostic Event Manager](https://www.autosar.org/fileadmin/standards/R20-11/CP/AUTOSAR_SWS_DiagnosticEventManager.pdf)
- [AUTOSAR Standards Search](https://www.autosar.org/search)

本站使用 DSL/DSD/DSP、DCM/DEM/CanTp 等名稱來建立責任模型。實際 release 的 API、configuration 與 requirement ID 應以專案採用的 AUTOSAR release 為準。

## 6. Bootloader、Firmware Security 與 Recovery

- [NIST SP 800-193 — Platform Firmware Resiliency Guidelines](https://csrc.nist.gov/pubs/sp/800/193/final)：Protection、Detection、Recovery 與 firmware resiliency。
- [MCUboot Design](https://docs.mcuboot.com/design.html)：Image header/TLV、slot、swap、revert 與 downgrade prevention 的公開實作設計。
- [Uptane Standards Reference Center](https://uptane.org/docs/latest/all-versions)：車輛 software update 的 metadata、trust 與 compromise-resilient update framework。

這些來源不是 ISO 14229 Bootloader command specification。它們用來交叉檢查 image authenticity、rollback、power-loss recovery 與 update trust chain；UDS wire protocol 仍以 ISO 14229/15765 與 ECU specification 為準。

## 7. 原作者與公開參考來源

- [Lularible/uds-book](https://github.com/Lularible/uds-book)：UDS、ISO-TP、AUTOSAR DCM 與 `uds-lite` 參考專案。Repository README 標示正文採 CC BY-NC-ND 4.0，`uds-lite` 採 MIT license。
- [Vector — UDS / ISO 14229 Overview](https://www.vector.com/cn/zh/products/solutions/diagnostic-standards/uds-unified-diagnostic-services-iso14229/)：UDS 診斷與刷寫應用概覽。
- [KopherBit — UDS Bootloader Diagnostic Services](https://kopherbit.com/knowledge/uds-bootloader-diagnostic-services/)：Bootloader service chain 與工程輸入範例。
- [AEDiscuss — 統一診斷服務 UDS 概述](https://aediscuss.com/1-%E7%B5%B1%E4%B8%80%E8%A8%BA%E6%96%B7%E6%9C%8D%E5%8B%99uds%E6%A6%82%E8%BF%B0/)：延伸閱讀；若頁面無法存取，不作為唯一事實來源。

第三方文章只作為 secondary reference。若與 ISO、AUTOSAR、vendor manual 或 ECU specification 不一致，以後者為準。

## 8. 內容重新撰寫與著作權政策

本站遵循以下編輯原則：

1. **不直接複製網站段落**：所有說明均以工程觀點重新組織與撰寫。
2. **不重製付費標準**：只說明標準的 scope、責任邊界與實作時應查閱的主題。
3. **圖表自行建立**：Mermaid 流程圖、架構圖與 sequence diagram 由本站重新設計，不擷取來源圖片。
4. **表格重新整理**：比較表以本站的內容分類重新整理，不照搬來源欄位或文字。
5. **範例資料**：DID、RID、CAN ID、memory address 與 security data 若未明示為標準值，均視為 example/project-defined。
6. **避免長篇引文**：必要引用只保留極短術語，並連回原始頁面。
7. **標示版本與來源層級**：區分 normative standard、official vendor documentation、open-source project 與 secondary article。

## 9. 查證方式

來源層級：

```text
ISO / AUTOSAR normative source
        ↓
ECU Diagnostic Specification / ODX
        ↓
MCU and Tool Vendor Manual
        ↓
Original Open-Source Repository
        ↓
Technical Article / Secondary Reference
```

網路文章可協助理解，但不能取代專案的 diagnostic specification、ODX、Flash manual 與安全需求。

[回到 UDS 首頁](../) · [回到頁首](#article_top)
