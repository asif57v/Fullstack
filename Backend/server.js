import Groq from "groq-sdk";
import dotenv from "dotenv";
import express from "express";
import cors from "cors";

let app = express();

app.use(cors());
app.use(express.json());

dotenv.config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

app.post('/ask', async (req, res) => {
  const { question, history } = req.body;

  if (!question) {
    return res.send({
      _status: false,
      finalData: "Question is required"
    });
  }

  try {
    // 🔥 Limit history (performance safe)
    const lastMessages = history?.slice(-10) || [];

    // 🔥 Convert frontend format → Groq format
    const messages = [
      {
        role: "system",
        content:
          "You are a helpful AI assistant. Answer clearly, professionally, and in well formatted text."
      },

      ...lastMessages.map((msg) => ({
        role: msg.type === "user" ? "user" : "assistant",
        content: msg.text
      })),

      {
        role: "user",
        content: question
      }
    ];

    // 🔥 Groq API call
    const data = await groq.chat.completions.create({
      messages: messages,
      model: "llama-3.1-8b-instant"
    });

    const finalData = data.choices[0].message.content;

    res.send({
      _status: true,
      finalData
    });

  } catch (error) {
    console.log(error);

    res.send({
      _status: false,
      finalData: "Something went wrong"
    });
  }
});

app.listen(5000, () => {
  console.log("Server Running on Port 5000");
});