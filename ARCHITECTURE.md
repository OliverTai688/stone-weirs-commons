# 架構：多租戶 + BFF + 自帶 AI 金鑰

## 1. BFF（Backend for Frontend）

```
瀏覽器（React Client Components）
   │  只呼叫同網域的 /api/*（不持有任何金鑰、不直連 Supabase / AI）
   ▼
Next.js BFF（src/app/api/* 與 Server Components）
   │  1. 確認身分：src/server/session.ts
   │  2. 套用租戶範圍與治理規則：src/server/repo.ts、qa.ts
   │  3. 代為呼叫外部服務：Supabase（service role）、AI 供應商、Cloudflare R2
   ▼
Supabase（RLS 作為第二道防線） · Anthropic / OpenAI · R2
```

- `src/server/**` 全部 `import "server-only"`，被 client component 引用會直接 build 失敗。
- 會改變狀態的 BFF 路由都檢查 `Origin`（`src/server/guard.ts`），防 CSRF。
- 瀏覽器拿到的永遠是處理過的資料：地理隱私處理後的座標、金鑰只顯示末 4 碼、AI 只回報「用了哪個引擎」。

| BFF 路由 | 用途 |
|---|---|
| `POST /api/ask` | 治理檢索問答（引用驗證、地理隱私防護） |
| `POST /api/interview` | 工具一：訪談一輪 → 抽取實體與關係 → 下一題 |
| `GET/PUT/PATCH/DELETE /api/settings/ai` | 使用者自己的 AI 設定（金鑰只寫不讀） |
| `POST /api/settings/ai/models` | 驗證金鑰並列出可用模型 |

## 2. 多租戶

**租戶 = 在地節點**（`nodes`）。使用者透過 `node_members` 屬於一或多個節點，角色為 `steward`（節點管理者）或 `contributor`（貢獻者）。

| 資料 | 誰看得到 |
|---|---|
| 自己的草稿故事、訪談逐字、草稿實體與關係 | **只有自己** |
| 自己的 AI 金鑰、問答紀錄 | **只有自己**（金鑰連自己都只看得到末 4 碼） |
| 送審中的內容 | 作者 + 該節點的管理者 |
| 已審核公開的紀錄（`approved`） | 所有人（地球、導覽、展場、跨節點問答） |
| 節點成員名單 | 自己的成員資格；節點管理者看得到自己節點的成員 |
| 研究者聯絡名單、稽核紀錄 | 平台管理員 |

執行方式有兩層：
1. **BFF**：每個查詢都由伺服器依 `session.userId` 與 `session.tenantIds` 加上範圍（`assertTenant()`）。
2. **RLS**：`supabase/schema.sql` 的權限規則。就算 BFF 有疏漏，資料庫也不會回傳不屬於呼叫者的資料。已在 PostgreSQL 16 模擬四種角色測試過。

## 3. 自帶 AI 金鑰（BYOK）

- 使用者在 `/settings/ai` 加入 Anthropic 或 OpenAI 金鑰 → BFF 先呼叫供應商的模型清單 API 驗證 → 通過後才儲存，並讓使用者從清單選模型。
- 儲存：AES-256-GCM 加密（`src/server/crypto.ts`），金鑰來自伺服器環境變數 `APP_ENCRYPTION_KEY`。
  - 示範階段：加密後存在 httpOnly、SameSite=Strict 的 cookie，並綁定該瀏覽器的匿名使用者 ID。
  - 接上 Supabase 後：存到 `user_ai_keys`（RLS 開啟但沒有任何 policy → 只有 BFF 的 service role 能存取）。介面不變。
- 使用順序：**使用者自己的金鑰 → 平台金鑰（選用的環境變數）→ 示範引擎**。
- 不論用哪個模型，伺服器都會驗證回答裡的每個引用都來自這次檢索到的治理紀錄；不通過就退回示範引擎，並告訴使用者原因。
- 供應商網址可用 `ANTHROPIC_BASE_URL`、`OPENAI_BASE_URL` 覆寫（公司代理、閘道或本機測試）。

## 4. 從示範模式到正式環境要換的地方

| 檔案 | 示範 | 正式 |
|---|---|---|
| `src/server/session.ts` | 匿名 cookie ID | Supabase Auth（Google 登入）＋ `node_members` 帶出 `tenantIds` |
| `src/server/repo.ts` | `src/data/` 靜態資料 | Supabase 查詢（service role，BFF 內加範圍） |
| `src/server/ai/keystore.ts` | 加密 cookie | `user_ai_keys` 資料表 |
| `src/components/auth/*` | localStorage 示範名單 | `/api/admin/*` BFF 路由 |

## 5. 多語系（英文預設、可切換中文）

- 所有頁面在 `src/app/[lang]/` 底下：`/en/...`、`/zh/...`，兩種語言都在 build 時靜態產生。
- `src/proxy.ts`：沒有語言前綴的網址（例如 `/`、`/nodes/xinwu`、舊的 QR code）會導到使用者上次選的語言（cookie `NEXT_LOCALE`），沒有選過就導到英文。
- 介面文字在 `src/i18n/dictionaries.ts`（`en` 定義型別，`zh` 必須完整對應，缺字 build 會失敗）。
  - Server Components：`getDict()`（透過 `next/root-params` 取得語言）。
  - Client Components：`useI18n()`；連結用 `@/i18n/client` 的 `Link`，會自動加上語言前綴。
  - BFF：前端呼叫時帶 `x-ui-lang` 標頭，錯誤訊息依語言回覆。
- 內容（紀錄、節點、關係、標籤、治理欄位）以多語欄位保存，用 `pick(text, lang)` 取值，缺少時退回另一種語言；在地詞彙永遠保留原文。
- AI 問答依「提問的語言」回答；訪談可另外選擇訪談語言。
- 新增語言：在 `config.ts` 的 `locales` 加入代碼，並在 `dictionaries.ts` 加一份完整字典。
