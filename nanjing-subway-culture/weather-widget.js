document.addEventListener("DOMContentLoaded", async () => {
  const config = window.JL_METRO_CONFIG || {};
  const apiKey = config.QWEATHER_KEY || "";
  const cityElement = document.getElementById("currentCity");
  const weatherElement = document.getElementById("currentWeather");

  if (!cityElement || !weatherElement) return;

  if (!apiKey) {
    cityElement.innerText = "未配置";
    weatherElement.innerText = "请配置和风天气 Key";
    return;
  }

  // 使用浏览器地理定位获取经纬度
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(async (position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;

      try {
        // 第一步：根据经纬度反查城市
        const locationRes = await fetch(
          `https://geoapi.qweather.com/v2/city/lookup?location=${lon},${lat}&key=${apiKey}`
        );
        const locationData = await locationRes.json();

        if (locationData.code === "200" && locationData.location.length > 0) {
          const city = locationData.location[0];
          const cityName = city.name;
          const locationId = city.id;

          cityElement.innerText = cityName;

          // 第二步：根据城市ID获取当前天气
          const weatherRes = await fetch(
            `https://devapi.qweather.com/v7/weather/now?location=${locationId}&key=${apiKey}`
          );
          const weatherData = await weatherRes.json();

          if (weatherData.code === "200") {
            const now = weatherData.now;
            weatherElement.innerText =
              `${now.text}，${now.temp}℃，湿度 ${now.humidity}%`;
          } else {
            weatherElement.innerText = "天气获取失败";
          }
        } else {
          cityElement.innerText = "城市定位失败";
        }
      } catch (error) {
        console.error("天气服务错误：", error);
        weatherElement.innerText = "天气服务错误";
      }
    }, (error) => {
      console.warn("定位失败：", error.message);
      cityElement.innerText = "无法获取位置";
      weatherElement.innerText = "请开启定位权限";
    });
  } else {
    cityElement.innerText = "浏览器不支持定位";
    weatherElement.innerText = "无法获取天气";
  }
});

