import { render } from "./progress"

window.terra.getState().then(s => { if (s) render(s) }).catch(() => {})
window.terra.onState(render)
