import { app, BrowserWindow, screen } from "electron";
import { fileURLToPath } from "node:url";
import { loadSettings, getSettings, updateSettings } from "./settings";
import type { Settings } from "../lib/types";

function createWindow(marginX: number, marginY: number) {

    const { workArea } = screen.getPrimaryDisplay()

    const size = { width: 220, height: 520}

    const win = new BrowserWindow({
        width: size.width,
        height: size.height,
        title: "Terra Widget",
        frame: false,
        skipTaskbar: true,
        resizable: false,
        minimizable: false,
        maximizable: false,
        alwaysOnTop: true,
        transparent: true,

        x: workArea.x + marginX,
        y: workArea.y + workArea.height - size.height + marginY,

        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true
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
}

app.whenReady().then(async () => {
    await loadSettings()
    
    const settings = getSettings()

    createWindow(settings.marginX, settings.marginY)
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});