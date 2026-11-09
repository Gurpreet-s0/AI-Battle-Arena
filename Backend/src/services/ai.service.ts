import { ChatGoogle } from "@langchain/google";
import { ChatMistralAI } from "@langchain/mistralai";
import { ChatCohere } from "@langchain/cohere";
import configKeys from "../config/config.js";

const geminiModel = new ChatGoogle({
  model: "gemini-3.5-flash-lite",
  apiKey: configKeys.GEMINI_API_KEY,
});

const mistralModel = new ChatMistralAI({
  model: "codestral-2508",
  apiKey: configKeys.MISTRAL_API_KEY
});

const cohereModel = new ChatCohere({
    model:"command-a-03-2025",
    apiKey: configKeys.COHERE_API_KEY
});

export {
    geminiModel,
    mistralModel,
    cohereModel
}