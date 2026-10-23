import { render } from "./progress"
const button = document.querySelector<HTMLElement>(".more_button")

if (button) {
    button.addEventListener("click", () => {
        window.terra.openSettings()
    })
}

window.terra.getState().then(s => { if (s) render(s) }).catch(() => {})
window.terra.onState(render)
