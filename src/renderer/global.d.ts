import { ipcRenderer } from 'electron';
/// <reference types="electron-vite/node" />
import type { SessionState, Settings, TokenInfo, settingsUpdateResult, SettingsPatch } from "../lib/types"

declare global {
  interface Window {
    terra: {
      getState(): Promise<SessionState | null>
      onState(cb: (s: SessionState) => void): () => void
      openSettings(): void
    }
    terraSettings: {
      get(): Promise<{ settings: Settings; token: TokenInfo } | null>
      update(patch: SettingsPatch): Promise<settingsUpdateResult | null>
      saveToken(raw: string): Promise<{ ok: boolean; reason?: string } | null>
      clearToken(): Promise<boolean>
      closeSettings(): Promise<void>
      closeWidget(): Promise<void>
      getDisplays(): Promise<{ id: number; label: string }[]>
      onTransparency(cb: (s: number) => void): () => void
      login(): Promise<{ ok: boolean; reason?: string} | null >
      getAutoStart(): Promise<boolean |null>
      setAutoStart(on:boolean): Promise<boolean | null>
    }
  }
}
export {}
