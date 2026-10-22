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
    }
  }
}
export {}
