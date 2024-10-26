const express = require("express");
const {
  CopilotRuntime,
  GroqAdapter,
  copilotRuntimeNodeHttpEndpoint,
} = require("@copilotkit/runtime");
require("dotenv").config();

const app = express();
const cors = require("cors");
app.use(cors());
const Groq = require("groq-sdk");
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const serviceAdapter = new GroqAdapter({
  groq,
  model: "llama3-groq-8b-8192-tool-use-preview",
});
app.use("/copilotkit", (req, res, next) => {
  const runtime = new CopilotRuntime();
  const handler = copilotRuntimeNodeHttpEndpoint({
    endpoint: "/copilotkit",
    runtime,
    serviceAdapter,
  });

  return handler(req, res, next);
});

app.listen(4000, () => {
  console.log("Listening at http://localhost:4000/copilotkit");
});
