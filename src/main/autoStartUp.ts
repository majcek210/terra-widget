import { app } from "electron"
import { join, dirname } from "node:path"
import { homedir } from "node:os"
import { mkdirSync, writeFileSync, rmSync, existsSync } from "fs"

const executablePath = () => process.env.PORTABLE_EXECUTABLE_FILE ?? process.execPath

const desktopFile = () =>
    join(process.env.XDG_CONFIG_HOME ?? join(homedir(), ".config"), "autostart", "terra-widget.desktop")

export function isAutoStart(): boolean {
    if (process.platform === "linux") return existsSync(desktopFile())
    return app.getLoginItemSettings({ path: executablePath()}).openAtLogin
}

export function setAutoStart(enabled: boolean) {
    if (!app.isPackaged) return
    if (process.platform !== "linux") {
        app.setLoginItemSettings({ openAtLogin: enabled, path: executablePath()})
        return
    }
    const file = desktopFile()
    if (!enabled) { rmSync(file, { force: true}); return}

    mkdirSync(dirname(file), { recursive: true})

     writeFileSync(file, [
        "[Desktop Entry]", "Type=Application", "Name=Terra Widget",
        `Exec="${process.env.APPIMAGE ?? process.execPath}"`,
        "Terminal=false", "X-GNOME-Autostart-enabled=true", ""
    ].join("\n"))   // uhh i had to copy paste this shit
}