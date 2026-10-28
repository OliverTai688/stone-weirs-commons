# 交接設定：從示範模式到正式環境

目前網站在**示範模式**運作：不需要任何金鑰，資料放在 `src/data/`，AI 問答與訪談使用不呼叫外部服務的示範引擎。
以下四個步驟需要你本人的帳號來完成；每一步做完，把「要給 Claude 的東西」交回來，我就接著寫程式。

> 只有**一個正式資料庫**（不另建測試資料庫）。Vercel 的預覽部署與正式部署共用同一個 Supabase 專案，
> 所以在預覽環境測試時，寫入的資料就是正式資料。測試帳號請用自己的 Gmail。

---

## 步驟 1　Vercel 測試部署（5 分鐘，現在就可以做）

1. 到 https://vercel.com/new ，用 GitHub 登入，Import `OliverTai688/stone-weirs-commons`。
2. Framework 會自動偵測為 Next.js，其他設定不用改，按 **Deploy**。
3. 部署完成後，到 Project → Settings → Environment Variables 新增：
   - `NEXT_PUBLIC_SITE_URL` = 你的 Vercel 網址（例如 `https://stone-weirs-commons.vercel.app`），QR code 會用這個網址。
4. 之後每次推送到 GitHub，Vercel 都會自動產生新的部署：`main` 分支是正式網址，其他分支會有預覽網址。

**要給 Claude 的：** Vercel 網址。

---

## 步驟 2　Supabase（資料庫與會員）

1. 到 https://supabase.com 建立新專案。Region 建議選 **Northeast Asia (Tokyo)** 或 **Southeast Asia (Singapore)**。
2. 左側 **SQL Editor** → New query → 貼上 `supabase/schema.sql` 的全部內容 → Run。
   （這份 SQL 已在 PostgreSQL 16 上測試過：建立資料表、權限規則，以及「Google 登入時自動建立會員資料」的觸發器。）
3. **Project Settings → API**，複製：
   - Project URL → Vercel 環境變數 `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`（⚠️ 這把金鑰可以繞過所有權限，**只貼在 Vercel，不要貼在聊天或程式碼裡**）

**要給 Claude 的：** Project URL 與 anon key（這兩個本來就會出現在前端，可以安全分享）。

---

## 步驟 3　Google 登入

1. 到 https://console.cloud.google.com → 建立專案（例如 `stone-weirs-commons`）。
2. **APIs & Services → OAuth consent screen**：User type 選 External，填 App 名稱「石滬・共享未來」、你的 Email；Scopes 只需要 `email`、`profile`、`openid`。
3. **Credentials → Create Credentials → OAuth client ID**：
   - Application type：Web application
   - Authorized redirect URI：`https://<你的 Supabase 專案代碼>.supabase.co/auth/v1/callback`（Supabase 的 Google provider 頁面會顯示這串網址，直接複製）
4. 把 Client ID 與 Client Secret 貼到 Supabase：**Authentication → Sign In / Providers → Google** → Enable。
5. Supabase **Authentication → URL Configuration**：
   - Site URL：你的 Vercel 正式網址
   - Redirect URLs 加入：`https://<vercel 網址>/auth/callback`、預覽部署網址（到 Vercel 任一個預覽部署複製網域，把會變動的部分換成 `*`，例如 `https://stone-weirs-commons-*.vercel.app/auth/callback`）、`http://localhost:3000/auth/callback`
6. 用你的 Gmail 登入一次網站（我接好程式後），再到 SQL Editor 執行，把自己設成管理員：
   ```sql
   update public.profiles set platform_role = 'admin' where email = 'taioliver688@gmail.com';
   ```
7. 正式上線前，OAuth consent screen 要按 **Publish App**，否則只有測試名單上的帳號能登入。

**要給 Claude 的：** 告訴我「Google provider 已啟用」即可（Client Secret 不需要給我）。

---

## 步驟 4　Cloudflare R2（錄音與照片）

1. Cloudflare Dashboard → **R2 Object Storage** → Create bucket，名稱 `stone-weirs-media`，Location 選 Asia-Pacific。
2. **Manage R2 API Tokens → Create API token**：權限 Object Read & Write，限定這個 bucket。
3. 複製 Account ID、Access Key ID、Secret Access Key，填到 Vercel 環境變數：
   `R2_ACCOUNT_ID`、`R2_ACCESS_KEY_ID`、`R2_SECRET_ACCESS_KEY`、`R2_BUCKET`
4. Bucket → Settings → **CORS policy** 貼上（讓瀏覽器可以直接上傳）：
   ```json
   [{ "AllowedOrigins": ["https://<你的 vercel 網址>", "http://localhost:3000"], "AllowedMethods": ["PUT", "GET"], "AllowedHeaders": ["*"], "MaxAgeSeconds": 3600 }]
   ```
   Bucket 保持**不公開**；錄音一律透過有時效的簽名網址存取。

**要給 Claude 的：** 告訴我「R2 已設定」即可。

---

## 選用：AI 金鑰

設定 `ANTHROPIC_API_KEY` 後，AI 問答與訪談會從示範引擎切換成真正的模型；伺服器仍會檢查每個引用都來自檢索到的紀錄，不符合就退回「資料不足」。沒有設定也能 demo。

---

## 我接下來會做的（拿到上面的東西之後）

| 收到 | Claude 會做 |
|---|---|
| Supabase URL + anon key | `src/lib/repo.ts` 改為讀寫 Supabase；把新屋示範紀錄匯入成 seed SQL |
| Google provider 已啟用 | `/join` 改成真正的 Google 登入、`/auth/callback`、`proxy.ts` 保護 `/admin`；後台名單改讀資料庫並寫稽核紀錄 |
| R2 已設定 | 工具一的「上傳錄音」：簽名上傳網址、轉寫流程 |
| 正式 35 筆治理紀錄（CSV 或 JSON） | 取代 `src/data/xinwu.ts` 的示範子集 |
