import { render } from "./progress"
const button = document.querySelector<HTMLElement>(".more_button")
const notice =  document.querySelector<HTMLElement>(".notice")

if (button && notice) {
    button.addEventListener("click", () => {
        button.textContent = notice.hidden ? "More" : "Close";
        window.terra.openSettings()
    })
}

window.terra.getState().then(s => { if (s) render(s) }).catch(() => {})
window.terra.onState(render)
