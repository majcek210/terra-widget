import { render } from "./progress"

window.terra.getState().then(s => { if (s) render(s) }).catch(() => {})
window.terra.onState(render)

window.terraSettings.onTransparency(v => document.documentElement.style.setProperty("--bg-alpha", String(v)) )