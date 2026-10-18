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

export interface Settings {
    version: string,
    marginX: number,
    marginY: number,
    debug: boolean
}

export interface roomConnections {
    onHours: Array<(data: hoursUpdateData) => void>
    onClose: Array<(code: number) => void>
    onCrash: Array<(msg: string) => void>
}

export type settingsUpdateResult = | { sucess: true; settings: Settings } | { sucess: false, error:string}
export type settingsLisener = (settings: Settings) => void
export type checkResult = { ok: true; expiresAt: number | null } | { ok: false; reason: string }
export type ExpResult =  | {ok: true, expiresAt: number | null} | {ok: false, reason: "not-a-jwt" | "bad-payload"}
