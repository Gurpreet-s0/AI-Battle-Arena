import { useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import ReactMarkdown from 'react-markdown'
import { invokeBattle, type ApiBattleResult } from './api'
import './App.css'

type IconName = 'sparkle' | 'arrow' | 'copy' | 'check' | 'refresh' | 'scale' | 'chevron'
type Solution = { model: string; provider: string; initials: string; score: number; text: string; reasoning: string }
type Battle = { problem: string; solutions: [Solution, Solution] }

function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  const paths: Record<IconName, ReactNode> = {
    sparkle: <><path d="m12 3-1.45 5.55L5 10l5.55 1.45L12 17l1.45-5.55L19 10l-5.55-1.45L12 3Z" /><path d="m19 16-.65 2.35L16 19l2.35.65L19 22l.65-2.35L22 19l-2.35-.65L19 16Z" /></>,
    arrow: <><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></>, copy: <><rect x="8" y="8" width="11" height="11" rx="2" /><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" /></>, check: <path d="m5 12 4.2 4.2L19 6.5" />,
    refresh: <><path d="M20 11a8.1 8.1 0 0 0-15.5-2M4 5v4h4" /><path d="M4 13a8.1 8.1 0 0 0 15.5 2M20 19v-4h-4" /></>, scale: <><path d="M12 3v18M5 6h14M5 6l-3 6h6L5 6ZM19 6l-3 6h6l-3-6ZM8 21h8" /></>, chevron: <path d="m9 18 6-6-6-6" />,
  }
  return <svg {...common} aria-hidden="true">{paths[name]}</svg>
}

const exampleProblem = 'Explain what a factorial is in the most simple form?'
const exampleBattle: Battle = {
  problem: exampleProblem,
  solutions: [
    { model: 'Mistral', provider: 'Mistral AI', initials: 'M', score: 8, text: 'A factorial is a simple way to multiply all the whole numbers from 1 up to a given number.\n\nFor example:\n• 5! = 5 × 4 × 3 × 2 × 1 = 120\n• 3! = 3 × 2 × 1 = 6\n\nIt is a shortcut for multiplying a series of numbers in order.', reasoning: 'Clear and concise with good examples, making it very easy to understand quickly.' },
    { model: 'Gemini', provider: 'Google', initials: 'G', score: 9.5, text: 'In the simplest terms, a factorial is a shortcut for multiplying a whole number by every whole number below it down to 1.\n\nWe use an exclamation mark (!) to mean factorial.\n\nFor example\nWhat is 3! (read as “3 factorial”)?\n3 × 2 × 1 = 6\n\nWhy do we use it?\nIt tells you how many different ways you can arrange things.', reasoning: 'Excellent context, notation, and real-world intuition. The books example makes the concept memorable.' },
  ],
}

function toBattle(result: ApiBattleResult): Battle {
  return { problem: result.problem, solutions: [
    { model: 'Mistral', provider: 'Mistral AI', initials: 'M', score: result.judge.solution_1_Score, text: result.solution1, reasoning: result.judge.solution_1_reasoning },
    { model: 'Gemini', provider: 'Google', initials: 'G', score: result.judge.solution_2_Score, text: result.solution2, reasoning: result.judge.solution_2_reasoning },
  ] }
}

function SolutionCard({ solution, winner }: { solution: Solution; winner: boolean }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => { await navigator.clipboard?.writeText(solution.text); setCopied(true); window.setTimeout(() => setCopied(false), 1600) }
  return <article className={`solution-card ${winner ? 'winner' : ''}`}>
    {winner && <div className="winner-ribbon"><Icon name="sparkle" size={13} /> Top answer</div>}
    <div className="solution-topline"><div className="model-meta"><div className={`model-avatar ${winner ? 'green' : 'blue'}`}>{solution.initials}</div><div><h2>{solution.model}</h2><p>{solution.provider}</p></div></div><button className="icon-button" onClick={copy} aria-label={`Copy ${solution.model} response`}><Icon name={copied ? 'check' : 'copy'} size={17} /></button></div>
    <div className="answer-copy">
      <ReactMarkdown>{solution.text}</ReactMarkdown>
    </div>
    <div className="solution-footer"><div className="score-block"><span>Judge score</span><strong>{solution.score}<small>/10</small></strong></div><div className="score-track"><span style={{ width: `${Math.max(0, Math.min(solution.score, 10)) * 10}%` }} /></div></div>
  </article>
}

function App() {
  const [problem, setProblem] = useState(exampleProblem)
  const [battle, setBattle] = useState<Battle>(exampleBattle)
  const [isComparing, setIsComparing] = useState(false)
  const [error, setError] = useState('')
  const [showDetails, setShowDetails] = useState(false)
  const winnerIndex = battle.solutions[0].score > battle.solutions[1].score ? 0 : 1
  const winner = battle.solutions[winnerIndex]
  const runnerUp = battle.solutions[Number(!winnerIndex)]

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (!problem.trim()) return
    setIsComparing(true); setError(''); setShowDetails(false)
    try { setBattle(toBattle(await invokeBattle(problem.trim()))) }
    catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'Something went wrong. Please try again.') }
    finally { setIsComparing(false) }
  }

  return <main className="app-shell">
    <header className="site-header"><a className="brand" href="#top" aria-label="AI Battle Arena home"><span className="brand-mark"><Icon name="sparkle" size={16} /></span>AI Battle Arena</a><div className="header-status"><span className="live-dot" /> 2 models ready</div></header>
    <section className="hero" id="top"><p className="eyebrow">COMPARE AI ANSWERS</p><h1>Put the best answer<br /><em>in the arena.</em></h1><p className="hero-copy">Ask one question. Watch two models answer. Let an impartial AI judge decide what lands best.</p></section>
    <section className="prompt-panel" aria-label="Create an AI battle"><form onSubmit={submit}><label htmlFor="problem">Your prompt</label><div className="prompt-field"><textarea id="problem" value={problem} onChange={(e) => setProblem(e.target.value)} rows={2} placeholder="Ask anything..." /><button className="compare-button" type="submit" disabled={isComparing || !problem.trim()}>{isComparing ? 'Comparing…' : <>Compare <Icon name="arrow" size={18} /></>}</button></div></form><button className="example-button" onClick={() => setProblem(exampleProblem)}><Icon name="sparkle" size={14} /> Try an example</button>{error && <p className="request-error" role="alert">{error}</p>}</section>
    <section className="battle-section" aria-labelledby="arena-title"><div className="section-heading"><div><p className="eyebrow">CURRENT BATTLE <span>•</span> JUST NOW</p><h2 id="arena-title">{battle.problem}</h2></div><button className="new-battle" onClick={() => { setProblem(''); document.getElementById('problem')?.focus() }}><Icon name="refresh" size={16} /> New battle</button></div><div className="solutions-grid"><SolutionCard solution={battle.solutions[0]} winner={winnerIndex === 0} /><div className="versus">VS</div><SolutionCard solution={battle.solutions[1]} winner={winnerIndex === 1} /></div></section>
    <section className="verdict-card" aria-label="Judge verdict"><div className="judge-heading"><div className="judge-icon"><Icon name="scale" size={20} /></div><div><p className="eyebrow">JUDGE VERDICT</p><h2>{winner.model} takes this round</h2></div><div className="winning-score"><strong>{winner.score}</strong><span>out of 10</span></div></div><div className="verdict-grid"><p><strong>Why it won</strong>{winner.reasoning}</p><p><strong>A strong contender</strong>{runnerUp.reasoning}</p></div>{showDetails && <div className="evaluation-detail">{winner.model} ranked higher by {Math.abs(winner.score - runnerUp.score).toFixed(1)} points after the judge compared clarity, completeness, and usefulness.</div>}<button className="details-button" onClick={() => setShowDetails((current) => !current)}>{showDetails ? 'Hide full evaluation' : 'View full evaluation'} <Icon name="chevron" size={16} /></button></section>
    <footer>Powered by independent AI evaluation <span>·</span> Scores are generated for comparison, not absolute truth.</footer>
  </main>
}
export default App
