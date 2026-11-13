export type ApiBattleResult = {
  problem: string
  solution1: string
  solution2: string
  judge: {
    solution_1_Score: number
    solution_2_Score: number
    solution_1_reasoning: string
    solution_2_reasoning: string
  }
}

type InvokeResponse = {
  message: string
  result: ApiBattleResult
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api'

export async function invokeBattle(problem: string): Promise<ApiBattleResult> {
  const response = await fetch(`${API_BASE_URL}/invoke`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ problem }),
  })

  const body = (await response.json().catch(() => null)) as InvokeResponse | { message?: string } | null
  if (!response.ok || !body || !('result' in body)) {
    throw new Error(body?.message ?? 'The arena could not reach the AI service. Please try again.')
  }
  return body.result
}
