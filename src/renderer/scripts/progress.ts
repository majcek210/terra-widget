import type { SessionState, Status} from "../../lib/types"

const $ = (sel: string) => document.querySelector<HTMLElement>(sel)
const setText = (sel: string, text: string) => { const el = $(sel); if (el) el.textContent = text }
const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n))

const STATUS_TEXT: Record<Status, string> = {
  "signed-out": "Not signed in",
  "connecting": "Connecting",
  "live": "",
  "reconnecting": "Reconnecting",
  "conflict": "Close Terra in the other tab or window",
  "token-expired": "Sign in again",
  "error": "",  
}


function hm(seconds: number) {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    return `${h}h ${m}mins`
}




export function render(s: SessionState) {

    document.body.classList.toggle("dim", s.status === "connecting" || s.status === "reconnecting")
    setText("#status", s.status === "error" ? s.message : STATUS_TEXT[s.status])

    if (!s.view) return
    const values = s.view

    const progress = clamp(values.percent,0,100)
    const devlogged = clamp(values.devLoggedPercent, 0 , progress)
    const ai = clamp(values.aiPercent, 0, 100- progress)

    const fill = $(".fill")
    const aiFill = $(".ai_fill")
    const devloggedFill = $(".dev_logged")
    const aiCut = $("ai_cut")

    if (fill) fill.style.height = `${progress}%`
    if (aiFill) { aiFill.style.bottom = `${progress}%`; aiFill.style.height = `${ai}%` }
    if (devloggedFill) devloggedFill.style.height = `${devlogged}%`
    if (aiCut) aiCut.style.bottom = `${progress + ai}%`

    setText(".procentage_value", `${Math.round(progress)}%`)
    setText(".total_hours", `Total hours: ${hm(values.creditedSeconds)}`)
}

