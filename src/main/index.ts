import { app, BrowserWindow, screen, ipcMain} from "electron";
import type { IpcMainInvokeEvent } from "electron";
import { fileURLToPath } from "node:url";
import { loadSettings, getSettings, updateSettings, onSettingsChanged } from "./settings";
import type { Settings, corner } from "../lib/types";
import { start, stop, getState, onState } from "./session"
import { createTray } from "./tray"

import { saveToken, clearToken, tokenInfo } from "./secrets"

const WIDGET_SIZE = { width: 170, height: 350 }


function widgetPosition(corner:corner,marginX: number, marginY: number) {
    const { workArea } = screen.getPrimaryDisplay()

    const isRight = corner.endsWith("right")
    const isBottom = corner.startsWith("bottom")

    return {
        x: isRight ? (workArea.x + workArea.width - WIDGET_SIZE.width - marginX) : workArea.x + marginX,
        y: isBottom ? workArea.y + workArea.height - WIDGET_SIZE.height - marginY : workArea.y + marginY
    }
}

function createWindow(corner: corner,marginX: number, marginY: number) {

    const win = new BrowserWindow({
        ...WIDGET_SIZE,
        title: "Terra Widget",
        frame: false,
        skipTaskbar: true,
        resizable: false,
        minimizable: false,
        maximizable: false,
        alwaysOnTop: true,
        transparent: true,

        ...widgetPosition(corner,marginX, marginY),

        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            sandbox: false,
            preload: fileURLToPath(new URL("../preload/index.mjs", import.meta.url))
        },
        
        
    });

    
    if (process.env.ELECTRON_RENDERER_URL) {
        void win.loadURL(process.env.ELECTRON_RENDERER_URL);
    } else {
        const html = fileURLToPath(
            new URL("../renderer/index.html", import.meta.url)
        );

        void win.loadFile(html);
    }

    return win
}

let settingsWindow: BrowserWindow | null = null

export function openSettingsWindow() {
    if (settingsWindow && !settingsWindow.isDestroyed()) {
        settingsWindow.focus()
        return
    }

    settingsWindow = new BrowserWindow({
        width: 360,
        height: 580,
        useContentSize: true,
        title: "Terra Widget Settings",
        resizable: false,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            sandbox: false,
            preload: fileURLToPath(new URL("../preload/index.mjs", import.meta.url))
        }
    })
    if (process.env.ELECTRON_RENDERER_URL) {
        void settingsWindow.loadURL(`${process.env.ELECTRON_RENDERER_URL}/settings.html`)
    } else {
        void settingsWindow.loadFile(fileURLToPath(new URL("../renderer/settings.html", import.meta.url)))
    }
    settingsWindow.on("closed", () => { settingsWindow = null })

}

function fromSettings(event: IpcMainInvokeEvent) {
    return !!settingsWindow && !settingsWindow.isDestroyed() && event.sender === settingsWindow.webContents
}


const isSingleInstance = await app.requestSingleInstanceLock()
if (!isSingleInstance) {
    app.exit(0)
    
}

 


let widgetWindow: BrowserWindow 
app.whenReady().then(async () => {
    await loadSettings()
    
    const settings = getSettings()



    //ipc stuff

    ipcMain.handle("state:get", event => {
        if (event.sender !== widgetWindow?.webContents) return null;   // later: also allow the settings window
        return getState();
    });
    ipcMain.on("app:open-settings", event => {
        if (event.sender !== widgetWindow?.webContents) return;
        openSettingsWindow()
    });

    ipcMain.handle("settings:get", async event => {
        if (!fromSettings(event)) return null
        return { settings: getSettings(), token: await tokenInfo() }
    })

    ipcMain.handle("settings:update", async (event, patch: unknown) => {
        if (!fromSettings(event)) return null
        return updateSettings(patch as Partial<Settings>)
    })

    ipcMain.handle("settings:close", async (event) => {
        if (!fromSettings(event)) return
        settingsWindow?.destroy()
    })


    ipcMain.handle("token:save", async (event, raw: unknown) => {
        if (!fromSettings(event)) return null
        if (typeof raw !== "string") return { ok: false, reason: "invalid" }
        const r = await saveToken(raw)
        if (!r.ok) return { ok: false, reason: "reason" in r ? String(r.reason) : "unknown" }
        await stop()
        void start()
        return { ok: true }
    })

    ipcMain.handle("token:clear", async event => {
        if (!fromSettings(event)) return false
        clearToken()
        await stop()
        void start()
        return true
    })




    widgetWindow = createWindow(settings.corner,settings.marginX, settings.marginY)

    

    onSettingsChanged(s => {
        if (widgetWindow.isDestroyed()) return
        const { x, y } = widgetPosition(s.corner,s.marginX, s.marginY)
        widgetWindow.setPosition(x, y)
    })

    onState(s => {
        for (const w of BrowserWindow.getAllWindows()) {
            if(!w.isDestroyed()) w.webContents.send("state:push", s)
        }
    })

    await createTray(app)

   

    void start()
});

app.on("before-quit", async () => {
    await stop()
})

app.on("second-instance", () => {
    if (!widgetWindow || (widgetWindow && widgetWindow.isDestroyed())) return
    widgetWindow.show();
    openSettingsWindow()
})




app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});