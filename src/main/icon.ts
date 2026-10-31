import { app, nativeImage } from "electron"
import path from "node:path"


const fileName = process.platform === "win32" ? "icon.ico" : "icon-512.png"

export const iconPath = app.isPackaged ? path.join(process.resourcesPath, fileName) : path.join(app.getAppPath(), "src", "assets", fileName)
export const macTrayIcon = app.isPackaged? path.join(process.resourcesPath, "iconTemplate.png") : path.join(app.getAppPath(), "src", "assets", "iconTemplate.png")


export function appIcon() {
    return nativeImage.createFromPath(iconPath)
}
export function macIcon() {
    const macImg = nativeImage.createFromPath(macTrayIcon)
    macImg.setTemplateImage(true)
    return macImg
}


export function trayIcon() {
    const image = appIcon()
    if (image.isEmpty() || process.platform === "win32") return image

    if (process.platform == "darwin")  {
        const small = nativeImage.createFromPath(iconPath)
        small.setTemplateImage(true)
        return small
    }

    return image.resize({width: 22, height: 22, quality: "best"})
}