import { Tray, Menu, App, nativeImage} from "electron";
import { retry, onState } from "./session";
import { openSettingsWindow } from ".";
import { trayIcon, iconPath } from "./icon";

let tray: Tray | null = null;


  

export async function createTray(app : App) {


    const image = trayIcon()
    if (image.isEmpty()) {
        console.error("Tray icon failed to load:", iconPath);
        return;
    }

    tray = new Tray(image);

    const contextMenu = Menu.buildFromTemplate([
        {
            label: "Settings",
            click: async () => {
                await openSettingsWindow()
            }
        },
        {
            label: "Reconnect",
            click: async () => {
                await retry()
            }
        },
        {
            label: "Quit",
            click: async () => {
               app.quit()
            }
        }
    ])


    tray.setToolTip("Terra widget")

    tray.on("click", async () => {
        await openSettingsWindow()
    })

    onState((s) => {
        const status = s.status
        const percent = s.view?.percent
        const toolTip = `Terra widget - ${status} - ${percent?.toFixed()}%`
        tray?.setToolTip(toolTip)
    })

    tray.setContextMenu(contextMenu)


}