import { contextBridge, ipcRenderer } from "electron";
import type { IpcRendererEvent } from "electron";
import type { SessionState , Settings, TokenInfo, settingsUpdateResult, SettingsPatch, TokenSaveResult, AutoStartResult } from "../lib/types"



contextBridge.exposeInMainWorld("terra", {
    getState: (): Promise<SessionState | null> => ipcRenderer.invoke("state:get"),
    onState: (cb: (s: SessionState) => void) => {
        const handler = (_e: IpcRendererEvent, s:SessionState) => cb(s)
        ipcRenderer.on("state:push", handler)
        return () => { ipcRenderer.removeListener("state:push", handler)}
    },
    openSettings: () => ipcRenderer.send("app:open-settings")
})

contextBridge.exposeInMainWorld("terraSettings", {
    get: (): Promise<{ settings: Settings; token: TokenInfo } | null> => ipcRenderer.invoke("settings:get"),
    update: (patch: SettingsPatch): Promise<settingsUpdateResult | null> => ipcRenderer.invoke("settings:update", patch),
    saveToken: (raw: string): Promise<TokenSaveResult | null> => ipcRenderer.invoke("token:save", raw),
    clearToken: (): Promise<boolean> => ipcRenderer.invoke("token:clear"),
    closeSettings: () => ipcRenderer.invoke("settings:close"),
    getDisplays: (): Promise<{id: number; label:string}[]> => ipcRenderer.invoke("settings:getDisplays"),
    onTransparency: (cb: (v: number) => void) => {
        const handler = (_e: IpcRendererEvent, v: number) => cb(v)
        ipcRenderer.on("settings:transparency", handler)
        return () => { ipcRenderer.removeListener("settings:transparency", handler) }
    },
    login: (): Promise<TokenSaveResult | null> => ipcRenderer.invoke("token:login"),

    getAutoStart: (): Promise<boolean | null> => ipcRenderer.invoke("autostart:get"),
    setAutoStart: (state:boolean): Promise<AutoStartResult | null> => ipcRenderer.invoke("autostart:set", state)
})

export {};