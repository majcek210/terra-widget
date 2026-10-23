import { app } from "electron"
import { join } from "node:path"
import { readFile, rename, mkdir, writeFile } from "node:fs/promises"

import type { Settings, settingsLisener, settingsUpdateResult, corner } from "./../lib/types"

const corners: Array<corner> = ["top-left","top-right","bottom-left","bottom-right"]

const DEFAULT_SETTINGS: Settings = {
    version: "v1.0",
    marginX: 10,
    marginY: 20,
    debug: false,
    corner: "bottom-left"
}

const MAX_MARGIN = 300

let currentSettings: Settings
let isLoaded = false
const settingLiseners = new Set<settingsLisener>();

function validate(input: any) : Settings {
    const settings = { ...DEFAULT_SETTINGS}

    if (typeof input?.debug === "boolean") {
        settings.debug = input.debug
    }

     if (typeof input?.marginX === "number" && Number.isFinite(input.marginX)) {
        settings.marginX = Math.max(0, Math.min(MAX_MARGIN, Math.round(input.marginX)))
    }
    if (typeof input?.marginY === "number" && Number.isFinite(input.marginY)) {
        settings.marginY = Math.max(0, Math.min(MAX_MARGIN, Math.round(input.marginY)))
    }

    if (typeof input?.version === "string") {
        settings.version = input.version
    }

    if (typeof input?.corner === "string" && (corners.includes(input.corner))) {
        settings.corner = input.corner
    }

    return settings
}


export async function loadSettings(): Promise<Settings> {
    const path = join(app.getPath("userData"), "settings.json")

    let content: string

    try {
        content = await readFile(path, "utf8")
    } catch (err) {
        if((err as NodeJS.ErrnoException).code === "ENOENT") {
            //this meants that the file doesnt exist yet(most likely to happen on the first run)
            currentSettings = { ...DEFAULT_SETTINGS}
            isLoaded = true
            return {... currentSettings}
        }
        throw err
    }
    try {
        const isSaved = JSON.parse(content)

        currentSettings = validate(isSaved)
    } catch {
        console.warn("Settings.json was corrupted. A backup will try to be saved.")
        try {
            const bak_path = `${path}.bak`
            await rename(path, bak_path)
            console.warn(`A backup was saved to this location: ${bak_path}`)
        } catch (err) {
            console.error("Failed to backup settings: ", err)
        }
        currentSettings = { ...DEFAULT_SETTINGS }
    }

    isLoaded = true
    return {...currentSettings}
}

export function getSettings(): Settings {
    if (!isLoaded) {
        throw new Error("Load settings before requesting them")
    }
    return { ...currentSettings } 
}

export async function saveSettings(): Promise<void> {
    const folder = app.getPath("userData")

    const path = join(folder, "settings.json")
    const tempPath = join(folder, "settings.json.tmp")

    await mkdir(folder, { recursive: true})

    const data = JSON.stringify(currentSettings, null, 4)

    await writeFile(tempPath, data, "utf-8")
    await rename(tempPath, path)
}

export async function updateSettings(patch: Partial<Settings>): Promise<settingsUpdateResult> {
    if (!patch || typeof patch !== "object" || Array.isArray(patch)) {
        return { success: false, error: "Invalid patch" }
    }

    const allowedPatches = ["marginX", "marginY", "debug", "version", "corner"]
    const updated = { ...currentSettings }

    for (const [key, value] of Object.entries(patch)) {
        if (!allowedPatches.includes(key)) {
            return { success: false, error: "Invalid setting" }
        }
        switch (key) {
            case "debug":
                if (typeof value !== "boolean") return { success: false, error: "Invalid debug value" }
                updated.debug = value
                break
            case "marginX":
            case "marginY":
                if (typeof value !== "number" || !Number.isFinite(value)) {
                    return { success: false, error: "Invalid margin" }
                }
                updated[key] = Math.max(0, Math.min(MAX_MARGIN, Math.round(value)))
                break
            case "version":
                if (typeof value !== "string") return { success: false, error: "Invalid version" }
                updated.version = value
                break
            case "corner":
                if (typeof value !== "string") return { success: false, error: "Invalid corner data" }
                if (!corners.includes(value as corner)) return { success: false, error: "Invalid corner data" }

                updated.corner = value as corner
                break
        }
    }

    const previous = currentSettings
    currentSettings = updated

    try {
        await saveSettings()
    } catch {
        currentSettings = previous
        return { success: false, error: "Failed to save settings" }
    }

    const settings = { ...currentSettings }
    for (const lisener of settingLiseners) {
        try {
            lisener({ ...settings })
        } catch (err) {
            console.error("Lisener failed to execute w error: ", err)
        }
    }
    return { success: true, settings }
}

export function onSettingsChanged(lisener: settingsLisener): () => void {
    settingLiseners.add(lisener)

    return () => {
        settingLiseners.delete(lisener)
    }
}