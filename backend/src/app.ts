import express from "express";
import ndjson from "ndjson";
import { ChatGPT } from "./llms/chat-gpt";
import { Claude } from "./llms/claude";
import { Gemini } from "./llms/gemini";
import { Llama } from "./llms/llama";
import { LLM } from "./llms/llm.interface";
require('dotenv').config();
const cors = require("cors");

// class Main {
//   async run() {
//     const prompt =
//       "I want to quickly create a UI for one of my passion project, it is a simple UI where user gives a prompt and he gets a response from multiple LLMs, he can then rate the responses. What UI framework / library should I use so that I can build this as fast as possible?";
//     const chatGPT = new ChatGPT();
//     const gemini = new Gemini();
//     const claude = new Claude();
//     const llama = new Llama();

//     const chatGPTResponse = await chatGPT.ask({ message: prompt });
//     console.log("=================== ChatGPT ===================");
//     console.log(chatGPTResponse.response);
//     console.log("===============================================");
//     console.log()

//     const geminiResponse = await gemini.ask({ message: prompt });
//     console.log("=================== Gemini ====================");
//     console.log(geminiResponse.response);
//     console.log("===============================================");
//     console.log()

//     const claudeResponse = await claude.ask({ message: prompt });
//     console.log("=================== Claude ====================");
//     console.log(claudeResponse.response);
//     console.log("===============================================");
//     console.log()

//     const ollamaResponse = await llama.ask({ message: prompt });
//     console.log("=================== Ollama ====================");
//     console.log(ollamaResponse.response);
//     console.log("===============================================");
//     console.log()
//   }
// }

// new Main().run();

const app = express();
const port = 6765;
// Use CORS middleware
app.use(cors());
app.use(express.json());

app.get("/ask", async (req, res) => {
    // const { prompt, llm } = req.body;
    const prompt = req.query.prompt;
    const llm = req.query.llm;

    if (!prompt || !llm) {
        return res.status(400).json({ error: "Prompt and LLM are required" });
    }

    let llmInstance: LLM;
    switch (llm.toLowerCase()) {
        case "chatgpt":
            llmInstance = new ChatGPT();
            break;
        case "claude":
            llmInstance = new Claude();
            break;
        case "gemini":
            llmInstance = new Gemini();
            break;
        case "llama":
            llmInstance = new Llama();
            break;
        default:
            return res.status(400).json({ error: "Invalid LLM specified" });
    }

    try {
        const response = await llmInstance.ask({ message: prompt });
        res.json({ response: response.response });
    } catch (error) {
        res.status(500).json({ error: "Failed to get response from LLM" });
    }
});

app.get("/ask-stream", async (req, res) => {
    // const { prompt, llm } = req.body;
    const prompt = req.query.prompt;
    const llm = req.query.llm;

    if (!prompt || !llm) {
        return res.status(400).json({ error: "Prompt and LLM are required" });
    }

    let llmInstance: LLM;
    switch (llm.toLowerCase()) {
        case "chatgpt":
            llmInstance = new ChatGPT();
            break;
        case "claude":
            llmInstance = new Claude();
            break;
        case "gemini":
            llmInstance = new Gemini();
            break;
        case "llama":
            llmInstance = new Llama();
            break;
        default:
            return res.status(400).json({ error: "Invalid LLM specified" });
    }

    const streamResponse = llmInstance.askStream({ message: prompt });

    // Set headers to allow for streaming
    // res.setHeader('Content-Type', 'text/event-stream');
    // res.setHeader('Cache-Control', 'no-cache');
    // res.setHeader('Connection', 'keep-alive');

    // for await (const response of llmInstance.askStream({ message: prompt })) {
    //   res.write(`data: ${response.response}\n\n`);
    // }

    // Create the NDJSON stream
    const stream = ndjson.stringify();

    // Pipe the stream to the response immediately
    stream.pipe(res);

    for await (const response of streamResponse) {
        stream.write(response);
    }

    res.end();
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
