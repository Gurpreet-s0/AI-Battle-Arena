import { geminiModel, mistralModel, cohereModel } from "./ai.service.js";
import {
  StateSchema,
  MessagesValue,
  type GraphNode,
  StateGraph,
  START,
  END,
  Graph,
} from "@langchain/langgraph";
import * as z from "zod";
import { createAgent, HumanMessage, providerStrategy } from "langchain";

// const res = await geminiModel.invoke("What model are you?")
// console.log(res)

const graphState = new StateSchema({
  problem: z.string().default(""),
  solution1: z.string().default(""),
  solution2: z.string().default(""),
  judge: z.object({
    solution_1_Score: z.number().default(0),
    solution_2_Score: z.number().default(0),
    solution_1_reasoning: z.string().default(""),
    solution_2_reasoning: z.string().default(""),
  }),
});

async function solutionNode(state: typeof graphState.State) {
  const sol1 = await mistralModel.invoke([
    { role: "user", content: state.problem },
  ]);
  const sol2 = await geminiModel.invoke([
    { role: "user", content: state.problem },
  ]);

  return {
    solution1: sol1.content,
    solution2: sol2.content,
  };
}

async function judgeNode(state: typeof graphState.State) {
  const judge = createAgent({
    model: geminiModel,
    responseFormat: providerStrategy(
      z.object({
        solution_1_Score: z.number().min(0).max(10),
        solution_2_Score: z.number().min(0).max(10),
        solution_1_reasoning: z.string(),
        solution_2_reasoning: z.string(),
      }),
    ),
    systemPrompt:
      "You are a judge to judge solutions from 2 different ai models and then compare those solutions and give a score in range of 0-10 to that solutions both the solutions scores cannot be same",
  });
  const judgeResponse = await judge.invoke({
    messages: [
      new HumanMessage(
        `problem: ${state.problem},
        solution1: ${state.solution1},
        solution2: ${state.solution2}`,
      ),
    ],
  });

  const {
    solution_1_Score,
    solution_2_Score,
    solution_1_reasoning,
    solution_2_reasoning,
  } = judgeResponse.structuredResponse;

  return {
    judge:{
solution_1_Score,
    solution_2_Score,
    solution_1_reasoning,
    solution_2_reasoning,
    }
    
  };
}

const graph = new StateGraph(graphState)
  .addNode("solution", solutionNode)
  .addNode("judgeNode", judgeNode)
  .addEdge(START,"solution")
  .addEdge("solution","judgeNode")
  .addEdge("judgeNode",END)
  .compile()


const result = await graph.invoke({
    problem:"Write a function for finding factorial of a number in Javascript"
})

console.log(result)