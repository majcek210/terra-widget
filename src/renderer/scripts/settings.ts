import type { corner, TokenInfo } from "../../lib/types"

const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T

const tokenForm = $<HTMLFormElement>("token_form")
const tokenInput = $<HTMLInputElement>("token_input")
const tokenClear = $<HTMLButtonElement>("token_clear")
const tokenStatus = $("token_status")
const settingsForm = $<HTMLFormElement>("settings_form")
const marginX = $<HTMLInputElement>("margin_x")
const marginY = $<HTMLInputElement>("margin_y")
const cornerField = $<HTMLInputElement>("corner")
const debug = $<HTMLInputElement>("debug")
const message = $<HTMLElement>("message")
const size = $<HTMLInputElement>("size")
const size_label = $<HTMLElement>("size_label")
const closeSettings = $<HTMLInputElement>("close_settings")

function say(text: string, error = false) {
    message.textContent = text
    message.dataset.error = String(error)
}

function showToken(t: TokenInfo) {
    if (!t.exists) tokenStatus.textContent = "Not signed in"
    else if (t.expired) tokenStatus.textContent = "Token expired, paste a new one"
    else if (t.expiresAt) tokenStatus.textContent = `Signed in, expires ${new Date(t.expiresAt).toLocaleString()}`
    else tokenStatus.textContent = "Signed in"
}

async function load() {
    const data = await window.terraSettings.get()
    if (!data) {
        say("Could not load settings", true)
        return
    }
    marginX.value = String(data.settings.marginX)
    marginY.value = String(data.settings.marginY)
    debug.checked = data.settings.debug
    cornerField.value = data.settings.corner


    size_label.textContent = `Widget size (${data.settings.size}x)`
    size.value = String(data.settings.size)

    showToken(data.token)
}

async function busy(form: HTMLFormElement, fn: () => Promise<void>) {
    const buttons = form.querySelectorAll("button")
    buttons.forEach(b => { b.disabled = true })
    try {
        await fn()
    } catch {
        say("Something went wrong", true)
    } finally {
        buttons.forEach(b => { b.disabled = false })
    }
}

tokenForm.addEventListener("submit", e => {
    e.preventDefault()
    void busy(tokenForm, async () => {
        const raw = tokenInput.value
        tokenInput.value = ""
        const r = await window.terraSettings.saveToken(raw)
        if (!r?.ok) {
            say(`Token not saved (${r?.reason ?? "unknown"})`, true)
            return
        }
        say("Token saved")
        await load()
    })
})

tokenClear.addEventListener("click", () => {
    void busy(tokenForm, async () => {
        await window.terraSettings.clearToken()
        say("Signed out")
        await load()
    })
})

size.addEventListener("input", () => {
    size_label.textContent = `Widget size (${size.value}x)`
})

settingsForm.addEventListener("submit", e => {
    e.preventDefault()
    void busy(settingsForm, async () => {
        const x = marginX.valueAsNumber
        const y = marginY.valueAsNumber

        const cornerValue = cornerField.value as corner

        if (!Number.isFinite(x) || !Number.isFinite(y)) {
            say("Margins must be numbers", true)
            return
        }

        const r = await window.terraSettings.update({ marginX: x, marginY: y, debug: debug.checked, corner: cornerValue, size: Number(size.value)})
        if (!r || !r.success) {
            say(r ? r.error : "Could not save", true)
            return
        }
        say("Saved")
        await load()
    })
})

closeSettings.addEventListener("click", e => {
    e.preventDefault()
    void busy(tokenForm, async () => {
        await window.terraSettings.closeSettings()
    })
})

void load()
