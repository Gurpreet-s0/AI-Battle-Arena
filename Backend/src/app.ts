import express from "express";
import runGraph from "./services/graph.service.js";
const app = express();
app.use(express.json())

app.get("/health", (req, res) => {
  res.status(200).json({
    message: "Server is healthy and good",
  });
});

app.post("/invoke", async (req, res) => {
  const { problem } = req.body;
  const result = await runGraph(problem);

  res.status(200).json({
    message: "Answer come successfully",
    result,
  });
});

export default app;
