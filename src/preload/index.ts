import { contextBridge, ipcRenderer } from "electron";
import type { IpcRendererEvent } from "electron";
import type { SessionState , Settings, TokenInfo, settingsUpdateResult, SettingsPatch } from "../lib/types"



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
    saveToken: (raw: string): Promise<{ ok: boolean; reason?: string } | null> => ipcRenderer.invoke("token:save", raw),
    clearToken: (): Promise<boolean> => ipcRenderer.invoke("token:clear"),
    closeSettings: () => ipcRenderer.invoke("settings:close"),
})

export {};