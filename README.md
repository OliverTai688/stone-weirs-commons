# 石滬・共享未來 Stone Weirs, Shared Futures

亞太海洋文化遺產交流平台（Pilot）。APCONF 論文〈Stone Weirs, Shared Futures〉的實作。

- **3D 地球首頁**：各地在地節點（新屋為第一個，其他為邀請中）
- **工具一** `/tools/interview`：AI 半結構訪談 → CIDOC-CRM 概念圖（每個節點連回原話）
- **工具二** `/ask`、`/nodes/xinwu/guide`、`/exhibit/xinwu`：只根據治理紀錄回答、強制引用的問答、導覽與展場 QR
- **後台** `/admin`：研究者聯絡名單（只匯出同意聯絡者）
- **中英雙語**：預設英文（`/en`），頁首可切換中文（`/zh`）
- **AI 設定** `/settings/ai`：使用者自帶 Anthropic / OpenAI 金鑰（加密儲存、只經由 BFF 使用）

架構（多租戶、BFF、BYOK）見 [ARCHITECTURE.md](./ARCHITECTURE.md)。

## 開發

```bash
npm install
npm run dev        # http://localhost:3000
npm run build
```

不需要任何金鑰即可執行（示範模式）。接上 Supabase、Google 登入、Cloudflare R2 的步驟見 [SETUP.md](./SETUP.md)。

## 結構

| 路徑 | 說明 |
|---|---|
| `src/data/` | 示範資料：僅使用論文中出現的事實；邀請中節點不含任何內容 |
| `src/server/` | BFF 伺服器層（server-only）：session、repo、qa、AI 供應商、加密 |
| `src/server/repo.ts` | 資料存取層（之後換成 Supabase，頁面不需改動） |
| `src/server/qa.ts` | 治理檢索問答：只檢索已審核且非限制級紀錄、引用驗證、地理隱私防護 |
| `src/lib/interview.ts` | 工具一的訪談面向、示範抽取器與 LLM 提示 |
| `supabase/schema.sql` | 資料表與 RLS 權限（單一正式資料庫） |

Next.js 16（App Router、Cache Components）、Tailwind CSS 4、react-globe.gl（Three.js）、React Flow。
