import { app, nativeImage } from "electron"
import path from "node:path"


const fileName = process.platform === "win32" ? "icon.ico" : "icon-512.png"

export const iconPath = app.isPackaged ? path.join(process.resourcesPath, fileName) : path.join(app.getAppPath(), "src", "assets", fileName)

export function appIcon() {
    return nativeImage.createFromPath(iconPath)
}

export function trayIcon() {
    const image = appIcon()
    if (image.isEmpty() || process.platform === "win32") return image

    return image.resize({width: 22, height: 22, quality: "best"})
}