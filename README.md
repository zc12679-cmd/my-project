# Wait, What to Eat

本倉庫蒐集與實作「等等要吃啥」應用。以下資源可協助你快速上手：

- [docs/wait-what-to-eat-prd.md](docs/wait-what-to-eat-prd.md)：完整 PRD 與需求說明。
- `app/`：基於 Expo/React Native 的行動 App 專案原始碼。

## 快速開始

1. 安裝依賴：

   ```bash
   cd app
   npm install
   ```

2. 建立 `.env`（或 `app.config.js`）設定 `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` 供 Google Places API 使用：

   ```bash
 codex/create-product-requirements-document-for-app-e56982
   cp .env.example .env
   ```

   本倉庫已直接填入一組測試用金鑰，複製即可執行；若你已申請自己的金鑰，也可以改寫 `.env` 或環境變數覆蓋。

   > 建議將金鑰限制於必要的 API 及網域，或透過自建後端代理封裝 API 呼叫。
   > 若金鑰曾公開（例如貼在 issue、討論區或版本控制），請立即在 Google Cloud Console 重新產生並刪除舊金鑰。


   echo "EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=你的GoogleMapsAPI金鑰" > .env
   ```

   > 建議將金鑰限制於必要的 API 及網域，或透過自建後端代理封裝 API 
   > codex/create-product-requirements-document-for-app-s4iumq
   > 若金鑰曾公開（例如貼在 issue、討論區或版本控制），請立即在 Google Cloud Console 重新產生並刪除舊金鑰。

   專案附上 [`app/.env.example`](app/.env.example) 可供複製為 `.env`，記得不要將真實金鑰提交到 Git。
  main

  main
3. 啟動開發伺服器：

   ```bash
   npm start
   ```

   使用 Expo Go 或模擬器掃描 QR Code 即可載入 App。

## 主要功能

- 依使用者即時定位呼叫 Google Places API，進行距離、評分、評論數、價格與類別等條件篩選。
- 權重隨機抽出餐廳，並避免短時間內重複。
- 收藏 / 黑名單、最近抽過列表與條件快調。
- 一鍵開啟 Google Maps 導航、電話與官網連結。

更多實作細節請參考程式碼內註解與 PRD 描述。
