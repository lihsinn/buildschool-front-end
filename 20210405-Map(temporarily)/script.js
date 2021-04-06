 //一開始會先執行
 window.onload = function () {
    //先執行loading
    document.querySelector(".loading").classList.add("open");
    let finished;
    fetchData().then(res => {
      finished = res;
      if (finished)
        setTimeout(() => {
          document.querySelector(".loading").classList.remove("open");
        }, 1500)


    })
    //初始化地圖
    createMap();
  }


  let map, tileLayer;
  let data = [];
  let markersArr = [];
  //使用套件產生縣市選取器
  new TwCitySelector();




  //#
  // 捲則拉到底則補資料
  // 判斷:捲軸是否拉到底，是則補資料
  var Loaddata = []
  let N = 30;
  document.getElementById("resultHeight").onscroll = function () {

    if (document.getElementById("resultHeight").scrollTop >= document.getElementById("resultHeight").scrollHeight -
      document.documentElement.clientHeight + 59 == true) {
      
      //重新賦予資料是"全部"資料的初始值
      if (document.getElementsByClassName("card-title")[0].innerText.substr(0, 2) == "紫坪" && document
        .getElementsByClassName(
          "result-item").length == 30) {
        N = 30;
      }
      if (document.getElementsByClassName("result-item").length == N) {

        if (N <= data.length) {
          N = N + 30;
        } else {
          N = data.length;
        }

        Loaddata = [];
        for (var i = 0; i <= N - 1; i++) {

          Loaddata.push(data[i]);
        }
        //console.log(N)
        let result = document.querySelector(".result");
        //清空左邊顯示結果
        result.innerHTML = "";
        Loaddata.forEach(item => {
          let div = document.createElement("div");
          div.className = "result-item";
          div.innerHTML =
            `<div class="card-title">
            ${item.Name.length > 11 ? `<h2 class="long"><span>${item.Name}</span><a href="javascript:;" class="btn-search" data-Px="${item.Position.PositionLat}" data-Py="${item.Position.PositionLon}"><i class="fas fa-search-location"></i><span>查詢地點</span></a></h2>`:`<h2>${item.Name}<a href="javascript:;" class="btn-search" data-Px="${item.Position.PositionLat}" data-Py="${item.Position.PositionLon}"><i class="fas fa-search-location"></i><span>查詢地點</span></a></h2>`}
        </div>
        <div class="card-body">
        <h4>連絡電話 : ${item.Phone}</h4>
        <h5>地址 : ${item.Address}</h5>
        <h5>開放時間 : ${item.OpenTime}</h5>
        <p>${item.DescriptionDetail}</p>
        ${item.TicketInfo == "" || item.TicketInfo == null ? "" :`<h5>門票資訊 :  ${item.TicketInfo}</h5>`}</div>`
          result.appendChild(div);
        })
        document.querySelectorAll(".btn-search").forEach(item => {
          item.addEventListener("click", function () {
            searchLocation(item);
            if (window.innerWidth >= 768) {
              document.querySelector(".side-menu").classList.toggle("close");
              document.querySelector(".side-menu-btn").classList.toggle("close");
            } else {
              document.querySelector(".result").classList.toggle("close");
              document.querySelector(".side-menu-btn").classList.toggle("close");
            }
          })
        })
      }
    }

  };



  //取得JSON資料
  let url = "https://ptx.transportdata.tw/MOTC/v2/Tourism/ScenicSpot";
  const fetchData = async () => {
    await fetch(url)
      .then(res => res.json())
      .then(result => {
        data = result;
        createAllMarker();
        createFilterAllResult();
      })
    return true
  }




  //自定義Icon
  var greenIcon = new L.Icon({
    iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  //(1)初始化地圖
  const createMap = () => {
    //設定一個地圖，把這地圖定位在 #map，先訂位center座標，zoom定位16
    map = L.map('map', {
      center: [25.0054441, 121.5134411],
      zoom: 15, //遠近
    });
    //放地圖+-按鈕在地圖右下方
    L.control.zoom({
      position: 'bottomright'
    }).addTo(map);
    //1. Raster Layers(載入最底層圖資)
    //用TileLayer的方式
    titleLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
    map.addLayer(titleLayer)
  }

  //#地區
  //(2)往上加標記圖層
  const createMarker = (region) => {
    //
    let result = data.filter(item => item.City == region)
    //console.log(result)
    //2. 自定義圖層(縮放套件)
    //這圖層是專門放icon群組
    var markers = new L.MarkerClusterGroup().addTo(map);

    //3.UI Layers      
    for (let i = 0; data.length > i; i++) {

      //用來判斷圖片網址是否存在
      const PicArr = Object.keys(data[i].Picture)
      //bindPopup內容
      let info =
        `<h1>${data[i].Name}</h1> 
        <h3>連絡電話 : ${data[i].Phone}</h3>
        <h4>地址 : ${data[i].Address}</h4>
        ${data[i].Picture.PictureUrl1 == "" || PicArr == 0? "" :`<img src="${data[i].Picture.PictureUrl1}" alt="" width=100%>`}
        <h4>開放時間 : ${data[i].OpenTime}</h4>
        ${data[i].TicketInfo == "" || data[i].TicketInfo == null ? "" :`<h4>門票資訊 :  ${data[i].TicketInfo}</h4>`}
        <p>${data[i].Description == null ? "": data[i].Description.length > 80 ? `${data[i].Description.substring(0,80)}...`:data[i].Description}</p>`

      markers.addLayer(
        //我要加上一個marker，並設定他的座標及顏色樣式(不寫的話，預設為藍)，同時將這座標放入對應的地圖裡
        //L.marker([22.6066728, 120.3115429]).addTo(map)
        L.marker([data[i].Position.PositionLat, data[i].Position.PositionLon], {
          icon: greenIcon
        })
        //我要針對這個marker，加上Html內容進去
        //.bindPopup('<h1>測試藥局</h1><p>成人口罩')
        .bindPopup(info)
        //我預設要把它開啟
        .openPopup()
      );
    }
    markersArr.push(markers)
    map.addLayer(markers);
    map.setView([result[result.length - 1].Position.PositionLat, result[result.length - 1].Position.PositionLon], 13);
  }

  //(3)在頁面右側顯示"地區"結果
  const createFilterResult = (region) => {
    let result = document.querySelector(".result");
    //清空左邊顯示結果
    result.innerHTML = "";
    data.filter(item => item.City == region).forEach(item => {
      let div = document.createElement("div");
      div.className = "result-item";
      div.innerHTML =
        `<div class="card-title">
            ${item.Name.length > 11 ? `<h2 class="long"><span>${item.Name}</span><a href="javascript:;" class="btn-search" data-Px="${item.Position.PositionLat}" data-Py="${item.Position.PositionLon}"><i class="fas fa-search-location"></i><span>查詢地點</span></a></h2>`:`<h2>${item.Name}<a href="javascript:;" class="btn-search" data-Px="${item.Position.PositionLat}" data-Py="${item.Position.PositionLon}"><i class="fas fa-search-location"></i><span>查詢地點</span></a></h2>`}
        </div>
        <div class="card-body">
        <h4>連絡電話 : ${item.Phone}</h4>
        <h5>地址 : ${item.Address}</h5>
        <h5>開放時間 : ${item.OpenTime}</h5>
        <p>${item.DescriptionDetail}</p>
        ${item.TicketInfo == "" || item.TicketInfo == null ? "" :`<h5>門票資訊 :  ${item.TicketInfo}</h5>`}</div>`
      result.appendChild(div);
    })
    document.querySelectorAll(".btn-search").forEach(item => {
      item.addEventListener("click", function () {
        searchLocation(item);
        if (window.innerWidth >= 768) {
          document.querySelector(".side-menu").classList.toggle("close");
          document.querySelector(".side-menu-btn").classList.toggle("close");
        } else {
          document.querySelector(".result").classList.toggle("close");
          document.querySelector(".side-menu-btn").classList.toggle("close");
        }
      })
    })
  }


  //#全部
  //(2)往上加標記"全部地區"圖層
  const createAllMarker = () => {

    //2. 自定義圖層(縮放套件)
    //這圖層是專門放icon群組
    var markers = new L.MarkerClusterGroup().addTo(map);

    //3.UI Layers      
    for (let i = 0; data.length > i; i++) {

      //用來判斷圖片網址是否存在
      const PicArr = Object.keys(data[i].Picture)

      //bindPopup內容
      let info =
        `<h1>${data[i].Name}</h1> 
        <h3>連絡電話 : ${data[i].Phone}</h3>
        <h4>地址 : ${data[i].Address}</h4>
        ${data[i].Picture.PictureUrl1 == "" || PicArr == 0? "" :`<img src="${data[i].Picture.PictureUrl1}" alt="" width=100%>`}
        <h4>開放時間 : ${data[i].OpenTime}</h4>
        ${data[i].TicketInfo == "" || data[i].TicketInfo == null ? "" :`<h4>門票資訊 :  ${data[i].TicketInfo}</h4>`}
        <p>${data[i].Description == null ? "": data[i].Description.length > 80 ? `${data[i].Description.substring(0,80)}...`:data[i].Description}</p>`

      markers.addLayer(
        //我要加上一個marker，並設定他的座標及顏色樣式(不寫的話，預設為藍)，同時將這座標放入對應的地圖裡
        //L.marker([22.6066728, 120.3115429]).addTo(map)
        L.marker([data[i].Position.PositionLat, data[i].Position.PositionLon], {
          icon: greenIcon
        })
        //我要針對這個marker，加上Html內容進去
        //.bindPopup('<h1>測試藥局</h1><p>成人口罩')
        .bindPopup(info)
        //我預設要把它開啟
        .openPopup()
      );
    }
    markersArr.push(markers)
    map.addLayer(markers);
  }
  //(3)在頁面右側顯示"全部"結果
  const createFilterAllResult = () => {
    let result = document.querySelector(".result");
    //清空左邊顯示結果
    result.innerHTML = "";
    //一開始只載入前30筆
    let Top30data = [];
    for (var i = 0; i <= 29; i++) {
      Top30data.push(data[i]);
    }
    Top30data.forEach(item => {
      let div = document.createElement("div");
      div.className = "result-item";
      div.innerHTML =
        `<div class="card-title">
            ${item.Name.length > 11 ? `<h2 class="long"><span>${item.Name}</span><a href="javascript:;" class="btn-search" data-Px="${item.Position.PositionLat}" data-Py="${item.Position.PositionLon}"><i class="fas fa-search-location"></i><span>查詢地點</span></a></h2>`:`<h2>${item.Name}<a href="javascript:;" class="btn-search" data-Px="${item.Position.PositionLat}" data-Py="${item.Position.PositionLon}"><i class="fas fa-search-location"></i><span>查詢地點</span></a></h2>`}
        </div>
        <div class="card-body">
        <h4>連絡電話 : ${item.Phone}</h4>
        <h5>地址 : ${item.Address}</h5>
        <h5>開放時間 : ${item.OpenTime}</h5>
        <p>${item.DescriptionDetail}</p>
        ${item.TicketInfo == "" || item.TicketInfo == null ? "" :`<h5>門票資訊 :  ${item.TicketInfo}</h5>`}</div>`
      result.appendChild(div);
    })
    document.querySelectorAll(".btn-search").forEach(item => {
      item.addEventListener("click", function () {
        searchLocation(item);
        if (window.innerWidth >= 768) {
          document.querySelector(".side-menu").classList.toggle("close");
          document.querySelector(".side-menu-btn").classList.toggle("close");
        } else {
          document.querySelector(".result").classList.toggle("close");
          document.querySelector(".side-menu-btn").classList.toggle("close");
        }
      })
    })
  }




  //清除標記
  const cleanMarker = () => {
    markersArr.forEach(item => item.clearLayers())
    map.eachLayer(layer => {
      if (layer instanceof L.Marker) {
        map.removeLayer(layer)
      }
    })
  }




  //[動作]:選取地區
  document.querySelector(".button-select").addEventListener("click", function () {
    //data-county-value
    let region = document.querySelector(".county").value;
    cleanMarker();
    createMarker(region);
    createFilterResult(region);
  })

  //[動作]:看詳細
  document.querySelector(".side-menu-btn").addEventListener("click", function () {
    if (window.innerWidth >= 768) {
      document.querySelector(".side-menu").classList.toggle("close");
      document.querySelector(".side-menu-btn").classList.toggle("close");
    } else {
      document.querySelector(".result").classList.toggle("close");
      document.querySelector(".side-menu-btn").classList.toggle("close");
    }
  })


  //[動作]:看全部
  document.querySelector(".button-all").addEventListener("click", function () {
    //讓scroll在最頂
    document.getElementById("resultHeight").scrollTop = 0;

    document.querySelector(".loading").classList.add("open");
    setTimeout(() => {
      let markers = L.markerClusterGroup();
      //一開始只載入前30筆
      let Top30data = [];
      for (var i = 0; i <= 29; i++) {
        Top30data.push(data[i]);
      }
      Top30data.forEach(item => {
        //用來判斷圖片網址是否存在
        const PicArr = Object.keys(item.Picture)
        let info =
          `<h1>${item.Name}</h1> 
              <h3>連絡電話 : ${item.Phone}</h3>
                  <h4>地址 : ${item.Address}</h4>
            ${item.Picture.PictureUrl1 == "" || PicArr == 0? "" :`<img src="${item.Picture.PictureUrl1}" alt="" width=100%>`}
            <h4>開放時間 : ${data[i].OpenTime}</h4>
              ${item.TicketInfo == "" || item.TicketInfo == null ? "" :`<h4>門票資訊 :  ${item.TicketInfo}</h4>`}
              <p>${item.Description == null ? "": item.Description.length > 80 ? `${item.Description.substring(0,80)}...`:item.Description}</p>`
        let marker = L.marker([item.Position.PositionLat, item.Position.PositionLon], {
          title: item.Name,
          icon: greenIcon
        })
        marker.bindPopup(info).openPopup();
        markers.addLayer(marker)
      })
      markersArr.push(markers)
      map.addLayer(markers)

      map.setView([25.0054441, 121.5134411], 10);
    }, 1000)
    setTimeout(() => {
      document.querySelector(".loading").classList.remove("open");
    }, 3000)

    createFilterAllResult()
  })

  const searchLocation = (target) => {
    //console.log(target.dataset);
    map.setView([target.dataset.px, target.dataset.py], 18);

  }
  const getPosition = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(getPosSuccess, getPosFail);
    }
  }
  const getPosSuccess = location => {
    map.setView([location.coords.latitude, location.coords.longitude], 18);
  }
  const getPosFail = () => {}