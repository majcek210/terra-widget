import { app, BrowserWindow, screen, ipcMain, shell } from "electron";
import type { IpcMainInvokeEvent } from "electron";
import { fileURLToPath } from "node:url";
import { loadSettings, getSettings, updateSettings, onSettingsChanged } from "./settings";
import type { Settings, corner } from "../lib/types";
import { start, stop, getState, onState } from "./session"
import { createTray } from "./tray"
import electronUpdater from "electron-updater";
import { appIcon } from "./icon"

const { autoUpdater } = electronUpdater

import { saveToken, clearToken, tokenInfo, enablePlainTextStorage } from "./secrets"
import { signIn, clearLoginSession, hasLoginSession } from "./tokenLogin"
import { isAutoStart, setAutoStart } from "./autoStartUp";

const BASE_WIDGET_SIZE = { width: 170, height: 150 }

const icon = appIcon()


if (process.platform === "linux") {
    app.commandLine.appendSwitch("ozone-platform", "x11")
    app.commandLine.appendSwitch("enable-transparent-visuals")

    if (process.env.TERRA_DISABLE_GPU === "1") app.disableHardwareAcceleration()
}


function widgetPosition(corner:corner,marginX: number, marginY: number, width: number, height: number, displayId: number) {
    const targetDisplay = screen.getAllDisplays().find(d => d.id === displayId) ?? screen.getPrimaryDisplay()
    const { workArea } = targetDisplay

    const isRight = corner.endsWith("right")
    const isBottom = corner.startsWith("bottom")

    return {
        x: isRight ? (workArea.x + workArea.width - width - marginX) : workArea.x + marginX,
        y: isBottom ? workArea.y + workArea.height - height - marginY : workArea.y + marginY
    }
}

function createWindow(corner: corner,marginX: number, marginY: number, size: number, displayId: number) {

    const WIDGET_SIZE = { width: Math.round(BASE_WIDGET_SIZE.width * size), height: Math.round(BASE_WIDGET_SIZE.height * size)}

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
        hasShadow: false, // this is for mac
        focusable: false, // for linux
        backgroundColor: "#00000000",

        ...widgetPosition(corner,marginX, marginY, WIDGET_SIZE.width, WIDGET_SIZE.height, displayId),

        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            sandbox: false,
            preload: fileURLToPath(new URL("../preload/index.mjs", import.meta.url))
        },
        
        
    });

    if (process.platform == "darwin") {
        app.dock?.hide()
        win.setAlwaysOnTop(true, "screen-saver")
        win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true})
    } else if (process.platform == "linux") {
        win.setVisibleOnAllWorkspaces(true)
    }

    win.setIgnoreMouseEvents(true)

    win.webContents.on("did-finish-load", () => {
        win.webContents.setZoomFactor(size)
        win.webContents.send("settings:transparency", getSettings().transparency)
    })
    win.webContents.setZoomFactor(size)

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
            partition: "settings",
            sandbox: false,
            preload: fileURLToPath(new URL("../preload/index.mjs", import.meta.url))
        }
    })

    if (!icon.isEmpty()) {
        settingsWindow.setIcon(icon)
    }
    
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

async function saveAndRestart(raw: string) {
    const response = await saveToken(raw)
    if (!response.ok) return { ok: false, reason: "reason" in response ? String(response.reason) : "unknown"}
    await stop()
    void start()
    return { ok:true, saved: "saved" in response ? response.saved : true  }
    
}


const isSingleInstance = await app.requestSingleInstanceLock()
if (!isSingleInstance) {
    app.exit(0)
    
}





let widgetWindow: BrowserWindow 
app.whenReady().then(async () => {

    if (app.isPackaged) {
        autoUpdater.on("update-available", () => {
            const isPortableWin = !!process.env.PORTABLE_EXECUTABLE_FILE
            const isLinuxNoAppImage = process.platform === "linux" && !process.env.APPIMAGE
            const isMac = process.platform === "darwin"
            if (isPortableWin || isLinuxNoAppImage || isMac) {
                shell.openExternal("https://github.com/majcek210/terra-widget/releases")
            }
        })
        autoUpdater.checkForUpdatesAndNotify()
    }

    await loadSettings()
    
    const settings = getSettings()

    if (settings.plainTextToken) enablePlainTextStorage()



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

    ipcMain.handle("settings:getDisplays", async event => {
        if (!fromSettings(event)) return null
        return screen.getAllDisplays().map((display, index) => ({
            id: display.id,
            label: `Display ${index + 1}${display.id === screen.getPrimaryDisplay().id ? " (Primary)" : ""}`
        }))
    })


    ipcMain.handle("token:save", async (event, raw: unknown) => {
        if (!fromSettings(event)) return null
        if (typeof raw !== "string") return { ok: false, reason: "invalid" }
        return saveAndRestart(raw)
    })

    ipcMain.handle("token:clear", async event => {
        if (!fromSettings(event)) return false
        clearToken()
        await clearLoginSession()
        await stop()
        void start()
        return true
    })

    ipcMain.handle("token:login", async event => {
        if (!fromSettings(event)) return null
        const response = await signIn()
        if (!response.ok) return { ok:false, reason: response.reason }
        return saveAndRestart(response.token)
    })

    ipcMain.handle("autostart:get", event => (fromSettings(event) ? isAutoStart() : null))

    ipcMain.handle("autostart:set", (event, state: unknown) => {
        if (!fromSettings(event) || typeof state !== "boolean") return null
        if (!app.isPackaged) return { ok: false, reason: "dev" }
        setAutoStart(state)
        return { ok: true, enabled: isAutoStart() }
    })



    if (process.platform === "linux") {
        await new Promise(r => setTimeout(r, 300))
    }
    widgetWindow = createWindow(settings.corner,settings.marginX, settings.marginY, settings.size, settings.displayId)

    

    const placeWidget = (s: Settings) => {
        if (widgetWindow.isDestroyed()) return

        const width = Math.round(BASE_WIDGET_SIZE.width * s.size)
        const height = Math.round(BASE_WIDGET_SIZE.height * s.size)

        const { x, y } = widgetPosition(
            s.corner,
            s.marginX,
            s.marginY,
            width,
            height,
            s.displayId
        )

        widgetWindow.setBounds({
            x,
            y,
            width,
            height
        })
        widgetWindow.webContents.setZoomFactor(s.size)
        widgetWindow.webContents.send("settings:transparency", s.transparency)
    }

    onSettingsChanged(placeWidget)

    screen.on("display-added", () => placeWidget(getSettings()))
    screen.on("display-removed", () => placeWidget(getSettings()))
    screen.on("display-metrics-changed", () => placeWidget(getSettings()))

    onState(s => {
        for (const w of BrowserWindow.getAllWindows()) {
            if(!w.isDestroyed()) w.webContents.send("state:push", s)
        }
    })

    await createTray(app)

    if(!(await tokenInfo()).exists && !(await hasLoginSession())) openSettingsWindow()

   if (isAutoStart()) setAutoStart(true)

    void start()
});

let isQuitting = false

app.on("before-quit", async event => {
    if (isQuitting) return
    isQuitting = true

    event.preventDefault()
    stop().finally( () => app.quit())
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