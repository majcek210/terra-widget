/// <reference types="electron-vite/node" />
import type { SessionState, Settings, TokenInfo, settingsUpdateResult, SettingsPatch, TokenSaveResult, AutoStartResult } from "../lib/types"

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
      saveToken(raw: string): Promise<TokenSaveResult | null>
      clearToken(): Promise<boolean>
      closeSettings(): Promise<void>
      getDisplays(): Promise<{ id: number; label: string }[]>
      onTransparency(cb: (s: number) => void): () => void
      login(): Promise<TokenSaveResult | null>
      getAutoStart(): Promise<boolean |null>
      setAutoStart(on:boolean): Promise<AutoStartResult | null>
    }
  }
}
export {}
