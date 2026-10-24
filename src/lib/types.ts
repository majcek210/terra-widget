export interface hoursUpdateData {
   visibile: boolean,
   weekKey: string,
   goalSeconds: number,
   rentWeek: boolean,
   week: {
    totalSeconds: number,
    aiSeconds: number,
    aiCreditedSeconds: number,
    creditedSeconds: number
   }
   unclaimed: {
    totalSeconds: number,
    aiSeconds: number,
    aiCreditedSeconds: number,
    creditedSeconds: number
   }
   computedAt: string
}

export interface  roomOptions {
    debug: boolean
}

export type corner="top-left" | "top-right" | "bottom-left" | "bottom-right"
export interface Settings {
    version: string,
    marginX: number,
    marginY: number,
    debug: boolean,
    corner: corner,
    size: number
}

export interface roomConnections {
    onHours: Array<(data: hoursUpdateData) => void>
    onClose: Array<(code: number) => void>
    onCrash: Array<(msg: string) => void>
    onConflict: Array<() => void> 
}

export type settingsUpdateResult = | { success: true; settings: Settings } | { success: false, error: string }
export type SettingsPatch = Partial<Pick<Settings, "marginX" | "marginY" | "debug" | "corner" | "size">>
export type settingsLisener = (settings: Settings) => void

export type checkResult = { ok: true; expiresAt: number | null } | { ok: false; reason: string }
export type ExpResult =  | {ok: true, expiresAt: number | null} | {ok: false, reason: "not-a-jwt" | "bad-payload"}

export type TokenInfo = { exists: boolean; expiresAt: number | null; expired: boolean }

export type Status = | "signed-out" | "connecting" | "live" | "reconnecting" | "conflict" | "token-expired" | "error"
export type SessionState = {
    status: Status
    message:string
    updatedAt: number
    view: View | null
}

export type View = {
    weekKey: string
    percent: number
    devLoggedPercent: number
    aiPercent: number
    creditedSeconds: number
    goalSeconds: number
    remainingSeconds: number
    visible: boolean
    computedAt: unknown
    receivedAt: number
}