## Festy App 開發規格 v0.3

### 技術架構

- **前端**：Next.js（PWA）
- **資料庫**：Supabase 免費版
- **圖片**：Cloudinary 免費版
- **部署**：Vercel 免費版
- **登入**：Supabase Magic Link
- **月費：€0**

---

### 設計風格

- 主色調：橘色
- App 圖示：🍻
- Vibe：友善、快樂、易用，分享歡樂、探索節慶、保留回憶

---

### 語言

- 預設根據手機語言自動偵測（英文 / 德文）
- 提供手動切換選單

---

### 用戶角色

| 角色 | 權限 |
| --- | --- |
| 管理員（Mia） | 全部權限，包含刪除任何資料 |
| 副管理員（Marcel） | 新增／編輯節慶 |
| 一般用戶 | 記錄體驗、查看朋友動態 |

用戶數不限。

---

### 登入

- Magic Link（輸入 email，點信件連結登入）
- 首次登入收集：電子郵件（唯一識別碼）、使用者名稱
- App 內提供改名功能
- 持久登入：session 長期保留，使用 Supabase persistent session，避免用戶重複登入

---

### 資料結構

### 節慶資料庫欄位

`Name` `Start Date` `End Date` `Category` `Location` `Description` `Link` `Latitude` `Longitude` `Image` `Date Range` `Status`

### 節慶分類（Category）

`Kirchweih 🏘️` `Music Event 🎵` `Folk Festival 👨‍👩‍👧‍👦` `Art Performance 🎭` `Seasonal Market 🛍️` `Food & Wine Tasting 🍷` `Parade & Procession 🎉` `Historical Reenactment ⚔️` `Sports Events 🏃`

### 體驗記錄欄位

`Festival`（自動填入）`User`（自動填入）`Join Date`（自動填入目前日期時間）`Bierbrauer` `Beer Name` `Beer Size` `Beer Price` `Bratwurstbrötchen Price` `Rating` `Rating_Stars` `Comment` `Senf` `Ice Cream Price` `Fahrgeschäfte`（多選）

### 娛樂設施選項（Fahrgeschäfte）

`🎠 Karussell` `🚗 Autoscooter` `🎡 Riesenrad` `🎢 Achterbahn` `⛓️ Kettenkarussell` `🚁 Break Dancer` `👻 Geisterbahn` `🎯 Schießbude` `🎲 Losbude` `🎪 Wurfbude` `🐟 Backfisch`

---

### 頁面與功能

### 1. Festivals（節慶總覽）

- 預設排序：進行中 → 即將到來 → 已結束
- 每筆顯示：城市、節慶名稱、類型（含 emoji）、日期
- 篩選：按城市
- 按鈕：「離我最近」（需用戶授權定位）
- 搜尋列

### 2. 節慶詳細頁

- 顯示節慶完整資訊
- **「我在這裡！」按鈕** → 開啟體驗記錄表單
- 表單自動填入：節慶名稱、目前日期與時間
- 照片上傳（Cloudinary）

### 3. My Fest

- 顯示自己去過的節慶
- 卡片排版
- 有照片顯示照片，無照片顯示預設圖

### 4. Freunde

- 時間軸動態流（仿社群媒體 feed）
- 所有用戶的節慶記錄，按時間倒序
- 自己也去過的節慶自動標註

### 5. 資訊頁

Toggle 展開收合式呈現，四個區塊：

**💡 How to add Festy to Home Screen**

1. Open the Festy app in browser
2. Tap the Share button
3. Select "Add to Home Screen"
4. Name your app and tap "Add"

**💡 Wish list / Bug report / Translation**
This APP is under developing by Mia🐨 & Marcel🦊. Welcome to improve this APP with us. 👇🏻

- [Report a bug](https://docs.google.com/forms/d/e/1FAIpQLScyxq1QhpzJFG-8_-jOQvBdgNKTculL08olTjk0Ydurf81N1Q/viewform?usp=header)
- [Ideen und Wünsche](https://docs.google.com/forms/d/e/1FAIpQLSecnIhLBnBOKdit9VJqJCoZ35NDRyrW8-vZpp2ZjEE2DRBA6Q/viewform?usp=header)
- [Translate into Deutsch](https://docs.google.com/spreadsheets/d/1cN_WPaO_ZmoI2JGlh2A3lMqJ4Ac2LbKVamBYBOgU8ew/edit?usp=sharing)
- [Submit new Festival](https://docs.google.com/forms/d/e/1FAIpQLSdtpK367_kVkFrkGmKAnBAcG2zFGqOGPIyTWWB_TIMwQ1kAEQ/viewform?usp=header)

**💡 Version History**

🆕📱 V1.2 - 📅 29.06.2025

- Festival Filtering: Filter festivals by status and other criteria
- Community Tab: View other users' festival experiences, ratings, and photos
- Attraction Tracking: Record specific rides and food stands

📱 V1.1 - 📅 24.06.2025

- Community Reviews: View all user reviews and ratings on festival detail pages
- Feedback System: Bug reporting and feature request forms
- Project Website: Dedicated website for project updates

📱 V1.0 - 📅 20.06.2025

- Festival Directory: Complete list of festivals with dates and details
- Personal Experience Logging: Add your own festival experiences with photos
- Personal Dashboard: View your festival history and memories

**💡 Data Controller Statement**
Data Controller: This app is developed and maintained by Mia Liou ([mialiou@gmail.com](mailto:mialiou@gmail.com)) as a personal project for tracking festival experiences among friends.
Data Usage: We collect only the information you voluntarily submit (festival experiences, photos). Your data is stored on third-party services and used solely for app operation and sharing experiences with other app users.
Your Rights: You can request deletion of your data or corrections at any time by contacting Mia.

### 6. 管理後台（管理員 + 副管理員）

- 新增／編輯／刪除節慶
- CSV 匯入**不在 app 內**，透過 Supabase 後台以電腦操作

---

### 資料移轉（開發完成後一次性作業）

- 文字資料：CSV 直接匯入 Supabase
- 照片：請 Claude Code 撰寫一次性腳本，自動從 Glide CDN 下載圖片並上傳至 Cloudinary，再更新資料庫網址

---

### 願望功能（暫不納入第一版）

**🗺️ 地圖 + 腳踏車路線規劃**
Leaflet + OpenRouteService，一天可規劃多場節慶路線

**🔔 朋友也在同一節慶的提醒通知**

**🏆 成就徽章系統**

| 徽章名稱 | 德文名 | Emoji | 觸發條件 | 備註 |
| --- | --- | --- | --- | --- |
| 節慶初體驗 | Erstes Festabenteuer | 🎈 | 記錄第 1 場 Kirchweih | 啟動式徽章 |
| 節慶達人 | Festprofi | 🎯 | 累積 5 場記錄 | 可擴充 5/10/20 場 |
| 啤酒王 | Bierkönig | 🍺 | 總喝酒量達 10 公升 | 可拆金銀銅 |
| 品酒小隊 | Bierentdecker-Team | 🍻 | 記錄超過 5 種不同啤酒品牌 |  |
| 市集生存王 | Imbissmeister | 🌭 | 登記 5 種以上街頭小吃 |  |
| 夜貓參戰者 | Nachtschwärmer | 🌙 | 記錄時間晚於 22:00 | 自動觸發 |
| 攝影魂覺醒 | Fotofieber | 📸 | 上傳 10 張以上照片 |  |
| 老手玩家 | Dauerläufer | 🧠 | 使用 app 累積超過 30 天 |  |
| 區域偵查員 | Städtejäger | 🗺️ | 不同地點記錄超過 5 個城市 | 結合地圖功能 |
