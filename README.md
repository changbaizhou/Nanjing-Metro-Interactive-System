# 金陵地铁智行通

金陵地铁智行通是一个南京地铁主题的 WebGIS 演示项目，包含地铁线路展示、站点查询、路径规划、生活服务圈、客流统计、文化景点导览、天气展示和 AI 问答助手。

本项目由项目作者与团队另外两位成员共同开发完成。

## 功能模块

- `webgis1.html`：主入口，展示地铁地图、站点选择、路径查询和 AI 悬浮助手。
- `SubwayLife.html`：地铁站周边生活服务查询。
- `xianlu.html`：地铁线路简介和时刻表图片。
- `test1704.html`、`zhuzhuangtu.html`：客流量展示与统计图表。
- `nanjing-subway-culture/`：南京文化景点导览、详情页、天气与 AI 聊天组件。
- `nanjing-ai-demo/`：AI 问答后端代理服务，使用 DashScope 兼容 OpenAI SDK 的接口。

## 本地运行

前端是静态网页，建议使用本地 HTTP 服务运行，直接用 `file://` 打开可能导致 JSON 加载、定位等浏览器能力受限。

```bash
cd 金陵地铁智行通
python3 -m http.server 8080
```

访问：

```text
http://localhost:8080/webgis1.html
```

## 本地配置

仓库不会提交真实 API Key。复制示例配置后填入自己的 Key：

```bash
cp config.example.js config.local.js
```

`config.local.js` 示例：

```js
window.JL_METRO_CONFIG = {
  AMAP_KEY: "your_amap_key",
  QWEATHER_KEY: "your_qweather_key",
  AI_CHAT_ENDPOINT: "http://localhost:3000/chat"
};
```

`config.local.js` 已加入 `.gitignore`，不要提交到仓库。

## AI 服务

```bash
cd nanjing-ai-demo
npm install
cp .env.example .env
npm start
```

`.env` 中配置：

```text
DASHSCOPE_API_KEY=your_dashscope_api_key_here
DASHSCOPE_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
AI_MODEL=qwen-plus
PORT=3000
CORS_ORIGIN=http://localhost:8080
```

公开部署 AI 服务时，应限制 CORS 来源、设置调用频率限制，并避免把服务端密钥暴露到前端。

## 开源前检查

- 已移除仓库中的真实 `.env`、前端硬编码 Key、个人邮箱和本机路径。
- 如果历史中曾经提交过真实 Key，请在对应平台控制台吊销并重新生成。
- `node_modules/` 不入库，依赖通过 `package-lock.json` 安装。
- 地图、天气和 AI 服务 Key 请在供应商控制台限制域名、配额和可用服务范围。
- 图片、地图数据、地铁时刻表和 POI 数据可能包含第三方来源，正式发布前请确认再分发许可。

## 许可证

项目代码以 MIT License 发布。第三方库、图片、地图数据和外部服务数据遵循各自来源的许可与服务条款，详见 `NOTICE.md`。
