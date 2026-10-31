import { app, safeStorage } from "electron"
import { join } from "path"
import { readFileSync, writeFile, writeFileSync, renameSync, existsSync, rmSync } from "fs"
import type { checkResult, ExpResult } from "./../lib/types"
import { getSettings } from "./settings"

const file = () => join(app.getPath("userData"), "token.bin")
let cached: string | null = null 

function clean(raw:string) : string | null {
    let token = raw.trim()

    if (
        (token.startsWith('"') && token.endsWith('"')) ||
        (token.startsWith("'") && token.endsWith("'"))
    ) {
        token = token.slice(1, -1).trim();
    }

    token = token.replace(/^bearer\s+/i, "").trim()

    if (!token || Buffer.byteLength(token, "utf8") > 8192 ) {
        return null;
    }

    return token

}

async function canEncrypt() {
    if (!(await safeStorage.isAsyncEncryptionAvailable())) return false
    if (process.platform === "linux" && safeStorage.getSelectedStorageBackend() === "basic_text") {
        return getSettings().plainTextToken
    }
    return true
}

function readExp(token:string): ExpResult {
    const parts = token.split(".")
    if (parts.length !== 3) return { ok: false, reason: "not-a-jwt"}

    let payload: any

    try {
        payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf-8"))
    } catch {
        return { ok: false, reason: "bad-payload"}
    }

    if (payload === null || typeof payload !== "object" || Array.isArray(payload)) {
        return { ok: false, reason: "bad-payload" }
    }
    
    const expiresAt = typeof payload.exp === "number" ? payload.exp * 1000 : null
    return { ok: true, expiresAt }
}

function check(token: string): checkResult {
    const r = readExp(token)
    if (!r.ok) return r
    if (r.expiresAt !== null && r.expiresAt <= Date.now()) {
        return { ok: false, reason: "expired" }
    }
    return r
}

export async function saveToken(raw: string) {
    const token = clean(raw)
    if (!token) return {ok: false, reason: "empty"}

    const checked = check(token)
    if (!checked.ok) return checked

    cached = token;
    if (! await canEncrypt()) return { ok: true, saved: false, expiresAt: checked.expiresAt }

    const tmp = file() + ".tmp"
    try {
        const bytes = await safeStorage.encryptStringAsync(token)
        writeFileSync(tmp, bytes)
        renameSync(tmp, file())
    } catch {
        return { ok:false, reason: "write-failed"}
    }

    return { ok: true, saved: true, expiresAt: checked.expiresAt}
}

export async function loadToken() {
    if (cached) return cached
    if (!existsSync(file())) return null
    try {
        const decrypt = await safeStorage.decryptStringAsync(readFileSync(file()))

        cached = decrypt.result
        if (decrypt.shouldReEncrypt) {
            await saveToken(decrypt.result)
        }

    } catch {
        return null
    }
    return cached
}

export function clearToken() {
    rmSync(file(), { force: true })
    cached = null
}



export async function tokenInfo() {
    const token = await loadToken()
    if (!token) return { exists: false, expiresAt: null as  number | null, expired: false}
    
    const r = readExp(token)
    const expiresAt = r.ok ? r.expiresAt : null

    return {
        exists: true,
        expiresAt,
        expired: expiresAt !== null && expiresAt <= Date.now()
    }
}