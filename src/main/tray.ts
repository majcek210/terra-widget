import { Tray, Menu, App, nativeImage} from "electron";
import { retry, onState } from "./session";
import { openSettingsWindow } from ".";
import path from "path";

let tray: Tray | null = null;


  

export async function createTray(app : App) {

    const iconPath = app.isPackaged
        ? path.join(process.resourcesPath, "icon.ico")
        : path.join(app.getAppPath(), "src", "assets", "icon.ico");

    const image = nativeImage.createFromPath(iconPath);
    if (image.isEmpty()) {
        console.error("Tray icon failed to load:", iconPath);
        return;
    }

    tray = new Tray(iconPath);

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