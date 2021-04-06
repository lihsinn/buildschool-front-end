# 📝串接交通部觀光景點 API架構設計
- 本作業是透過 Leaflet 的 JS 地圖應用框架，再搭配 OpenStreetMap(OSM) 圖資，來設計 Web 應用。
## ⭐️地圖
### 第一層: Raster layer
- 搭配Leaflet裡的TileLayer來載入OSM圖資
### 第二層: icon群組(自定義圖層)
- 引用markercluster插件解決地圖上有太多的景點，避免效能受到影響以及視覺上的不美觀
- markercluster可以讓聚集的點用同一個圖標來表示，並且用圖標的數字、大小、顏色，讓視覺化上更加鮮明
### UI Layers
- 將API撈回的資料，搭配Marker在地圖加上標示點
- bindPopup標示點上的彈跳、提示訊息


## ⭐️畫面呈現
**畫面載入時用fetch得到`v2/Tourism/ScenicSpot`API的所有資料**
### 所有地區
 1. 寫一個func，撈出前30筆資料的資訊，並用appendChild的方式加進class為result的div裡面
 2. 每次拉動scrollbar會觸發onscroll的func，而當scrollbar拉到最底時，會再多產生30筆資料
### 縣市
**縣市選取列是引用tw-city-selector.js所產生**
 1. 將data做filter，比對data裡面的City是否等於選取的region
 2. 寫一個func，撈出每一筆資料的資訊，並用appendChild的方式加進class為result的div裡面