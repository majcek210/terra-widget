import type { hoursUpdateData, View } from "./types"

const num = (value: unknown): number => typeof value === "number" && Number.isFinite(value) && value > 0 ? value : 0

export function buildView(data: hoursUpdateData, receivedAt: number = Date.now()): View | null {
    
    const d: any = data
    if (!d || typeof d !== "object" || !d.week || !d.unclaimed) return null

    const goal = num(d.goalSeconds)
    const credited = num(d.week.creditedSeconds)

    return {
        weekKey: String(d.weekKey ?? ""),
        percent: goal > 0 ? (credited / goal) * 100 : 0,
        // this 2 not done yet
        devLoggedPercent: 0,   
        aiPercent: 0, 
        //         
        creditedSeconds: credited,
        goalSeconds: goal,
        remainingSeconds: Math.max(0, goal - credited),
        visible: d.visible !== false,
        computedAt: d.computedAt ?? null,
        receivedAt,
    }
}   

export function format(p: number): string {
    return p.toFixed(2)
}

export function formatDuration(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  return h > 0 ? `${h}h ${m}m` : `${m}m ${s % 60}s`
}