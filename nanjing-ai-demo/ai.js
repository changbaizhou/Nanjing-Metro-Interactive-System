const API_URL = "http://localhost:3000/chat";

const messagesDiv = document.getElementById("messages");

function appendMessage(text, isUser = false) {
  const div = document.createElement("div");
  div.className = "msg " + (isUser ? "user" : "bot");
  div.textContent = text;
  messagesDiv.appendChild(div);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

async function sendMessage() {
  const input = document.getElementById("input");
  const content = input.value.trim();
  if (!content) return;

  appendMessage(content, true);
  input.value = "请稍候…";

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: content
      })
    });

    const data = await res.json();
    appendMessage(data?.reply ?? "无法获取有效回复");
  } catch (e) {
    console.error("请求出错：", e);
    appendMessage("请求失败，请检查网络或 API 设置");
  }

  input.value = "";
}
