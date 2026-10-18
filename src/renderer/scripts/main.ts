const button = document.querySelector<HTMLElement>(".more_button")
const notice =  document.querySelector<HTMLElement>(".notice")

if (button && notice) {
    button.addEventListener("click", () => {
        notice.hidden = !notice.hidden;
        console.log("test")
        button.textContent = notice.hidden ? "More" : "Close";
    })
}

