import type { SessionState, Status } from "../lib/types"
import { powerMonitor, PowerMonitor } from "electron"
import { loadToken, tokenInfo } from "./secrets"
import RoomHandler from "../lib/room"

import { buildView } from "../lib/view"

const MAX_ATTEMPTS = 10

let state: SessionState = { status: "signed-out", message: "", view: null, updatedAt: Date.now()}
const liseners = new Set<(s: SessionState) => void>()

let handler: RoomHandler | null = null

let attempt = 0
let retryTimer: NodeJS.Timeout |null = null
let stopping = false
let generation = 0
let resumeHooked = false
let receivedAt = 0

function setState(status: Status, message = "", view: SessionState["view"] = state.view) {
    state = { status, message,  view, updatedAt: Date.now()}
    for (const fn of liseners) fn({...state})
}

export function getState(): SessionState {
    return { ...state }
}

export function onState(fn: (s: SessionState) => void) {
    liseners.add(fn)
    return () => {liseners.delete(fn)}
}

function clearRetry()  {
    if (retryTimer) clearTimeout(retryTimer)
    retryTimer = null
}

async function dropHandler() {
    const h = handler
    handler = null
    if (!h) return
    try {
        await Promise.race([h.disconnect(), new Promise(resolve => setTimeout(resolve, 3000))])
    } catch {}
}

function scheduleRetry(reason: string) {
    if (stopping) {
        return
    }
    void dropHandler()

    attempt += 1
    if (attempt > MAX_ATTEMPTS) {
        setState("error", `${reason}. Gave up after ${MAX_ATTEMPTS} tries.`)
        return
    }

    const base = Math.min(60_000, 1000 * 2 ** (attempt -1))
    const delay = Math.round(base + Math.random() * base * 0.25)
    setState("reconnecting", `${reason}. Retrying in ${Math.round(delay / 1000)}s`)

    clearRetry()
    retryTimer = setTimeout(() => { void connect()}, delay)

}

async function connect() {
    const id = ++generation
    clearRetry()
    await dropHandler()
    if (stopping ||id !== generation) return

    const info = await tokenInfo()
    if (!info.exists) return setState("signed-out", "No token saved")
    if(info.expired) return setState("token-expired", "Token expired")

    const token = await loadToken()

    if (stopping || id !== generation) return
    if (!token) return setState("signed-out", "I couldnt read the stored token")
    
    setState("connecting", "")

    const roomHandler = new RoomHandler(token, { debug: false})
    handler = roomHandler

    roomHandler.onHoursUpdate(data => {
        if (handler !== roomHandler) return
        const view = buildView(data, Date.now())
        if (!view) return
        receivedAt = Date.now()
        attempt = 0
        setState("live", "", buildView(data))
    })

    roomHandler.onClose(code => {
        if (handler !== roomHandler) return
        scheduleRetry("Connection closed.")
    })

    roomHandler.onCrash(msg => {
        if (handler !== roomHandler) return
        scheduleRetry(msg)
    })
    roomHandler.onConflict(() => {
        if (handler !== roomHandler) return
        attempt = 0
        void dropHandler()
        setState("conflict", "This account is active somewhere else! Close the tab to use it here")
    })


    try {
        await roomHandler.connect()
    } catch (err: any) {
        if (handler !== roomHandler) return


        // had to put this here bc it doesnt register under onConflict, idk why
        if (err && (err.code == 4412)) {
            void dropHandler()
            setState("conflict", "This account is active somewhere else! Close the tab to use it here")
            return
        }

        console.log("connection failed: ", err?.code, err?.message)
        scheduleRetry(err?.message ? String(err.message) : "Count not connect to the room")
    }

}

export async function start() {
    stopping = false
    if (!resumeHooked) {
        resumeHooked = true
        powerMonitor.on("resume", () => {
            if (["conflict", "token-expired", "signed-out"].includes(state.status)) return
            attempt = 0
            void connect()
        })
    }
    await connect()
}

export function retry() {
    attempt = 0
    stopping = false
    void connect()
}

export async function stop() {
    stopping = true
    generation ++
    clearRetry()
    await dropHandler()
}