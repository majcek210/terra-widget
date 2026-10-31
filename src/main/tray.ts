import { Tray, Menu, App, nativeImage} from "electron";
import { retry, onState } from "./session";
import { openSettingsWindow } from ".";
import { trayIcon, iconPath } from "./icon";
import { SessionState } from "../lib/types"
import { build } from "electron-vite";

let tray: Tray | null = null;


function buildMenu(app: App, s?: SessionState) {
    const status = s ? `${s.status}${s.view ? ` - ${s.view.percent.toFixed()}%` : ""}` : "starting"
    return Menu.buildFromTemplate([
        { label: `Terra widget: ${status}`, enabled: false},
        { type: "separator"},
        { label: "Setttings", click: () => openSettingsWindow()},
        { label: "Reconnect", click: () => retry()},
        { type: "separator"},
        { label: "Quit", click: () => app.quit() }
    ])
}
  

export async function createTray(app : App) {


    const image = trayIcon()
    if (image.isEmpty()) {
        console.error("Tray icon failed to load:", iconPath);
        return;
    }

    tray = new Tray(image);

    tray.setToolTip("Terra widget")

    onState((s) => {
        const status = s.status
        const percent = s.view?.percent
        const toolTip = `Terra widget - ${status} - ${percent?.toFixed()}%`
        tray?.setToolTip(toolTip)
        tray?.setContextMenu(buildMenu(app, s))
    })

    tray.setContextMenu(buildMenu(app))


}