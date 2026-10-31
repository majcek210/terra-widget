import { BrowserWindow, session } from "electron"
import type { LoginResult, LoginOptions } from "../lib/types"

const config = {
    partition: "persist:terra-login",
    terra_origin: "https://terra.hackclub.com",
    terra_api: "api.terra.hackclub.com",
    game_host: "game.terra.hackclub.com",
    start: "https://api.terra.hackclub.com/auth/login"
}

let active: Promise<LoginResult> | null = null
let activeVisible = false
let currentWindow: BrowserWindow | null = null

function isOnExchange(value: string | undefined) : boolean {
    if (!value) return false
    try {
        const url = new URL(value)
        return url.hostname === config.terra_api && url.pathname === "/auth/exchange"
    } catch {
        return false
    }
}

async function tryLogin(options: LoginOptions) {
    const ses = session.fromPartition(config.partition)

    await ses.clearStorageData({ origin: config.terra_origin}).catch(() => {})

    ses.webRequest.onBeforeRequest(
        { urls: [`https://${config.game_host}/*`, `wss://${config.game_host}/*`]},
        (_details, callback) => callback({ cancel: true})
    )

    return new Promise<LoginResult>(resolve => {
        const win = new BrowserWindow({
            width: 480, height: 720, show: options.visible,
            title: "Sign in", autoHideMenuBar: true,
            webPreferences: { partition: config.partition, nodeIntegration: false, contextIsolation: true, sandbox: true }
        })
        currentWindow = win

        const dbg = win.webContents.debugger
        const exchanges = new Set<string>()
        let done = false
        let timer: NodeJS.Timeout | undefined

        const finish = (result:LoginResult) => {
            if (done) return
            done = true
            clearTimeout(timer)
            try {dbg.detach()} catch {}
            ses.webRequest.onBeforeRequest(null)
            if (currentWindow === win) currentWindow = null
            if (!win.isDestroyed()) win.destroy()
            resolve(result)
        }

        timer = setTimeout(() => finish({ ok: false, reason: "timeout" }), options.timeoutMs)

        const readToken = async(requestId: string) => {
            try {
                const { body, base64Encoded } = await dbg.sendCommand("Network.getResponseBody", { requestId})
                const text = base64Encoded ? Buffer.from(body, "base64").toString("utf-8") : body
                const token = JSON.parse(text)?.token
                if (typeof token === "string" && token) finish({ok: true, token})
            } catch {}
        }

        dbg.on("message", (_event, method, param) => {
            if (method === "Network.responseReceived") {
                if (!isOnExchange(param.response?.url)) return
                const status: number = param.response.status
                if (status >= 400) 
                    finish({ok:false, reason: "failed"}) 
                else if (status === 200)  exchanges.add(param.requestId)
            } else if (method === "Network.loadingFinished" && exchanges.delete(param.requestId)) {
                void readToken(param.requestId)
            }
        })

        win.on("closed", () => finish({ok: false, reason: "cancelled"}))

        win.webContents.on("did-fail-load", (_e, code, _d, _u, isMainFrame) => {
            if (isMainFrame && code !== -3) finish({ ok: false, reason: "failed" })
        })

        win.webContents.setWindowOpenHandler(() => ({
            action: "allow",
            overrideBrowserWindowOptions: { parent: win, autoHideMenuBar: true}
        }))

        try { 
            dbg.attach("1.3")
        } catch(err) {
            console.log("[login] attach failed:", err)
            finish({ ok: false, reason: "failed"}); return
        }

        dbg.sendCommand("Network.enable").catch(e => console.log("[login] Network.enable failed:", e))
        win.loadURL(options.startUrl).catch(e => console.log("[login] loadURL failed:", e))
    })
}

function once(options: LoginOptions): Promise<LoginResult> {
    if (!active) {
        activeVisible = options.visible
        active = tryLogin(options).finally(() => { active = null})
    }
    return active
}

export async function signIn() : Promise<LoginResult> {
    if (active && !activeVisible) {
        currentWindow?.destroy()
        await active
    }
    return once({ visible: true, startUrl: config.terra_origin, timeoutMs: 5* 60_000})
}

export function silentRefresh(): Promise<LoginResult> {
    return once({visible: false, startUrl: config.start, timeoutMs: 20_000})
}

export async function clearLoginSession() {
    try { await session.fromPartition(config.partition).clearStorageData() } catch {}
}