import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import OpenAI from 'openai';

const app = express();
const allowedOrigin = process.env.CORS_ORIGIN || true;
app.use(cors({ origin: allowedOrigin }));
app.use(express.json());

const port = Number(process.env.PORT || 3000);
const model = process.env.AI_MODEL || "qwen-plus";
const apiKey = process.env.DASHSCOPE_API_KEY;

const openai = new OpenAI({
  apiKey,
  baseURL: process.env.DASHSCOPE_BASE_URL || "https://dashscope.aliyuncs.com/compatible-mode/v1"
});

app.post("/chat", async (req, res) => {
  try {
    if (!apiKey) {
      return res.status(500).json({ error: "AI 服务未配置 DASHSCOPE_API_KEY" });
    }

    const userMessage = req.body.message;
    const completion = await openai.chat.completions.create({
      model,
      messages: [
        { role: "system", content: "你是一个非常专业的南京地铁文化导览助手，回答问题时请结合南京地铁文化特色。" },
        { role: "user", content: userMessage }
      ],
    });
    res.json({ reply: completion.choices[0].message.content });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "AI 调用失败" });
  }
});

app.listen(port, () => {
  console.log(`AI 服务运行在 http://localhost:${port}`);
});
