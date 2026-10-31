import { Tray, Menu, App } from "electron";
import { retry, onState } from "./session";
import { openSettingsWindow } from ".";
import { trayIcon, iconPath, macIcon, appIcon } from "./icon";
import type { SessionState } from "../lib/types"

let tray: Tray | null = null;


function buildMenu(app: App, s?: SessionState) {
    const status = s ? `${s.status}${s.view ? ` - ${s.view.percent.toFixed()}%` : ""}` : "starting"
    return Menu.buildFromTemplate([
        { label: `Terra widget: ${status}`, enabled: false},
        { type: "separator"},
        { label: "Settings", click: () => openSettingsWindow()},
        { label: "Reconnect", click: () => retry()},
        { type: "separator"},
        { label: "Quit", click: () => app.quit() }
    ])
}
  

export async function createTray(app : App) {


    let image = (process.platform == "darwin") ? macIcon() : trayIcon()
    if (image.isEmpty()) image = appIcon().resize({ width: 16, height: 16 })

    if (image.isEmpty()) {
        console.error("Tray icon failed to load:", iconPath);
        return;
    }

    tray = new Tray(image);

    tray.setToolTip("Terra widget")

    onState((s) => {
        const toolTip = s.view
            ? `Terra widget - ${s.status} - ${s.view.percent.toFixed()}%`
            : `Terra widget - ${s.status}`
        tray?.setToolTip(toolTip)
        tray?.setContextMenu(buildMenu(app, s))
    })

    tray.setContextMenu(buildMenu(app))

    if (process.platform === "win32") {
        tray.on("click", () => openSettingsWindow())
    }

}