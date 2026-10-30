import { render } from "./progress"

window.terra.getState().then(s => { if (s) render(s) }).catch(() => {})
window.terra.onState(render)

const applyTransparency = (t:Number) =>
    document.documentElement.style.setProperty("--widget-opacity", String(1 - (Number(t))))
window.terraSettings.onTransparency(applyTransparency)