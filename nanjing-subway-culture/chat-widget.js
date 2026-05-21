// chat-widget.js
(function () {
  // 创建悬浮球按钮
  const floatBtn = document.createElement("div");
  floatBtn.id = "chat-float-button";
  floatBtn.textContent = "🤖";
  Object.assign(floatBtn.style, {
    position: "fixed",
    width: "60px",
    height: "60px",
    borderRadius: "50%",
    backgroundColor: "#007bff",
    color: "#fff",
    fontSize: "28px",
    textAlign: "center",
    lineHeight: "60px",
    cursor: "grab",
    bottom: "20px",
    right: "20px",
    zIndex: 10000,
    userSelect: "none",
    boxShadow: "0 4px 12px rgba(0,0,0,0.3)"
  });
  document.body.appendChild(floatBtn);

  // 创建聊天窗口
  const widget = document.createElement("div");
  widget.id = "ai-chat-widget";
  widget.innerHTML = `
    <div id="chat-header" style="background:#007bff; color:#fff; padding:8px; text-align:center; cursor:move;">智能出行助手-小铁</div>
    
    <button class="suggest-btn">南京地铁有几条线？</button>
    <button class="suggest-btn">有哪些文化主题站？</button>
    <button class="suggest-btn">推荐一个适合旅游的地铁站</button>
  </div>

    <div id="chat-messages" style="max-height:300px; overflow-y:auto; background:#fafafa; padding:10px; display:none;"></div>
    <div id="chat-input-group" style="display:none; border-top:1px solid #ddd; display:flex;">
   <button id="chat-audio" style="background:#28a745; color:#fff; border:none; padding:8px 12px; cursor:pointer;">语言输入</button>

      <textarea id="chat-input" rows="1" placeholder="请输入你的问题，按Enter发送" style="flex:1; padding:8px; border:none; outline:none; resize:none; overflow:auto; max-height:100px;"></textarea>

      <button id="chat-send" style="background:#28a745; color:#fff; border:none; padding:8px 12px; cursor:pointer;">问</button>
    </div>`;
  Object.assign(widget.style, {
    position: "fixed",
    bottom: "90px",
    right: "20px",
    width: "300px",
    boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
    borderRadius: "8px",
    overflow: "hidden",
    fontFamily: "微软雅黑",
    zIndex: 9999,
    display: "none"
  });

  document.body.appendChild(widget);

  // 获取元素
  const header = widget.querySelector("#chat-header");
  const messages = widget.querySelector("#chat-messages");
  const inputGroup = widget.querySelector("#chat-input-group");
  const input = widget.querySelector("#chat-input");
  const send = widget.querySelector("#chat-send");

  // 悬浮球拖动逻辑
  let isDragging = false;
  let startX, startY, initialLeft, initialTop;

  floatBtn.style.left = (window.innerWidth - floatBtn.offsetWidth - 20) + "px";
  floatBtn.style.top = (window.innerHeight - floatBtn.offsetHeight - 20) + "px";

  floatBtn.addEventListener("mousedown", (e) => {
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;

    const style = window.getComputedStyle(floatBtn);
    initialLeft = parseInt(style.left);
    initialTop = parseInt(style.top);
    floatBtn.style.cursor = "grabbing";
    e.preventDefault();
  });

  document.addEventListener("mousemove", (e) => {
    if (!isDragging) return;

    let dx = e.clientX - startX;
    let dy = e.clientY - startY;

    let newLeft = initialLeft + dx;
    let newTop = initialTop + dy;

    const maxLeft = window.innerWidth - floatBtn.offsetWidth;
    const maxTop = window.innerHeight - floatBtn.offsetHeight;

    newLeft = Math.min(maxLeft, Math.max(0, newLeft));
    newTop = Math.min(maxTop, Math.max(0, newTop));

    floatBtn.style.left = newLeft + "px";
    floatBtn.style.top = newTop + "px";
  });

  document.addEventListener("mouseup", () => {
    if (isDragging) {
      isDragging = false;
      floatBtn.style.cursor = "grab";
    }
  });

  // 点击悬浮球切换聊天窗口显示
  // floatBtn.addEventListener("click", () => {
  //   if (isDragging) return; // 拖动时不触发点击

  //   if (widget.style.display === "block") {
  //     widget.style.display = "none";
  //   } else {
  //     widget.style.display = "block";
  //     messages.style.display = "block";
  //     inputGroup.style.display = "flex";
  //     input.focus();
  //   }
  // });
//添加几个候选问题
  floatBtn.addEventListener("click", () => {
  if (isDragging) return;

  const suggestions = document.getElementById("chat-suggestions");

  if (widget.style.display === "block") {
    widget.style.display = "none";
    suggestions.style.display = "none";
  } else {
    widget.style.display = "block";
    messages.style.display = "block";
    inputGroup.style.display = "flex";
    suggestions.style.display = "block";
    input.focus();
  }
});

  widget.querySelectorAll(".suggest-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    input.value = btn.textContent;
    send.click(); // 直接发送
  });
});

//可以根据时间更新问题
const now = new Date();
const month = now.getMonth();
if (month === 9) {
  // 十月国庆节提示
  suggestions.innerHTML += `<button class="suggest-btn">国庆期间有哪些文化活动？</button>`;
}


  // 聊天窗口拖动逻辑（拖动标题栏）
  let draggingWidget = false;
  let offsetXWidget = 0, offsetYWidget = 0;

  header.addEventListener("mousedown", (e) => {
    draggingWidget = true;
    offsetXWidget = e.clientX - widget.offsetLeft;
    offsetYWidget = e.clientY - widget.offsetTop;
    document.body.style.userSelect = "none";
  });

  document.addEventListener("mousemove", (e) => {
    if (!draggingWidget) return;
    widget.style.left = `${e.clientX - offsetXWidget}px`;
    widget.style.top = `${e.clientY - offsetYWidget}px`;
    widget.style.bottom = "auto";
    widget.style.right = "auto";
  });

  document.addEventListener("mouseup", () => {
    draggingWidget = false;
    document.body.style.userSelect = "auto";
  });
const style = document.createElement("style");
style.textContent = `
  .ai-reply {
    background: #f0f8ff;
    color: #1a1a1a;
    padding: 8px 12px;
    margin: 6px 0;
    border-radius: 6px;
    font-size: 14px;
    line-height: 1.5;
  }

  .user-msg {
    background: #d1eaff;
    color: #003366;
    padding: 8px 12px;
    margin: 6px 0;
    border-radius: 6px;
    text-align: right;
    font-size: 14px;
    line-height: 1.5;
  }
`;
document.head.appendChild(style);
  // 发送消息事件
  send.addEventListener("click", async () => {
    const text = input.value.trim();
    if (!text) return;

    // //用户消息
    // const userMsg = document.createElement("div");
    // userMsg.textContent = `你：${text}`;
    // messages.appendChild(userMsg);
    // input.value = "";
    // messages.scrollTop = messages.scrollHeight;

    // 用户消息
const userMsg = document.createElement("div");
userMsg.textContent = `你：${text}`;
userMsg.classList.add("user-message");
messages.appendChild(userMsg);

    //AI 思考提示
    const thinking = document.createElement("div");
    thinking.style.color = "black";
    thinking.textContent = "小铁 正在思考...";
    messages.appendChild(thinking);
    messages.scrollTop = messages.scrollHeight;

//     // 用户消息
// const userMsg = document.createElement("div");
// userMsg.textContent = `你：${text}`;
// userMsg.classList.add("user-message");
// messages.appendChild(userMsg);

// // AI 思考提示
// const thinking = document.createElement("div");
// thinking.textContent = "小铁 正在思考...";
// thinking.classList.add("thinking-message");
// messages.appendChild(thinking);

// // AI 回复
// const reply = document.createElement("div");
// reply.textContent = `小铁：${data.reply || "AI 无法回答"}`;
// reply.classList.add("ai-message");
// messages.appendChild(reply);

    try {
      const config = window.JL_METRO_CONFIG || {};
      const chatEndpoint = config.AI_CHAT_ENDPOINT || "http://localhost:3000/chat";
      const res = await fetch(chatEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text })
      });
      const data = await res.json();

      messages.removeChild(thinking);

      const reply = document.createElement("div");
      reply.className = "ai-reply";  // 添加 class
      //reply.textContent = `小铁：${data.reply || "AI 无法回答"}`;
      reply.innerHTML = `<strong>小铁：</strong><div class="ai-reply-content">${marked.parse(data.reply)}</div>`;
      messages.appendChild(reply);
      messages.scrollTop = messages.scrollHeight;
    } catch (e) {
      messages.removeChild(thinking);
      const err = document.createElement("div");
      err.style.color = "red";
      err.textContent = "请求失败，请检查服务器是否启动";
      messages.appendChild(err);
    }
  });
   // 新增：输入框按回车发送消息
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      send.click();
    }
  });
})();

//在AI窗口语言输入
document.addEventListener('DOMContentLoaded', () => {
  const voiceButton = document.getElementById('chat-audio');
  const inputBox = document.getElementById('chat-input');
  
  let recognition;
  let isRecording = false;

  // 检查浏览器是否支持
  if (!('webkitSpeechRecognition' in window)) {
    voiceButton.textContent = '浏览器不支持语音';
    voiceButton.disabled = true;
    return;
  }

  // 初始化识别器
  recognition = new webkitSpeechRecognition();
  recognition.continuous = false;         // 单句识别
  recognition.interimResults = false;     // 关闭临时结果
  recognition.lang = 'zh-CN';

  // 开始识别
  recognition.onstart = () => {
    voiceButton.textContent = '停止语音输入';
    voiceButton.style.backgroundColor = '#dc3545'; // 红色表示录音中
  };

  // 处理识别结果
  recognition.onresult = (event) => {
    let result = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      result += event.results[i][0].transcript;
    }
    inputBox.value = result;
    //录音完成自动发送
    document.getElementById('chat-send').click();
    voiceButton.textContent = '语言输入';
    voiceButton.style.backgroundColor = '#28a745';
  };

  // 停止或出错
  recognition.onerror = () => stopRecording();
  recognition.onend = () => {
    if (isRecording) stopRecording();
  };

  // 点击按钮
  voiceButton.addEventListener('click', () => {
    if (!isRecording) {
      startRecording();
    } else {
      stopRecording();
    }
  });

  function startRecording() {
    isRecording = true;
    recognition.start();
  }

  function stopRecording() {
    isRecording = false;
    recognition.stop();
    voiceButton.textContent = '语言输入';
    voiceButton.style.backgroundColor = '#28a745';
  }
});


