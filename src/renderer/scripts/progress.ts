function updateProgress(
    percentage: number,
    devLoggedPercentage: number = 0,
    aiPercentage: number = 0
) {
    const progress = Math.max(0, Math.min(100, percentage))
    const devlogged = Math.max(0, Math.min(progress, devLoggedPercentage))

    const ai = Math.max(0, Math.min(100 - progress, aiPercentage))

    const fill = document.querySelector<HTMLElement>(".fill");
    const aiFill = document.querySelector<HTMLElement>(".ai_fill");
    const devloggedFill = document.querySelector<HTMLElement>(".dev_logged");
    const aiCut = document.querySelector<HTMLElement>(".ai_cut");
    const label = document.querySelector<HTMLElement>(".procentage_value");

    if (fill) fill.style.height = `${progress}%`;

    if (aiFill) {
        aiFill.style.bottom = `${progress}%`;
        aiFill.style.height = `${ai}%`;
    }

    if (devloggedFill) {
        devloggedFill.style.height = `${devlogged}%`;
    }

    if (aiCut) {
        aiCut.style.bottom = `${progress + ai}%`;
    }

    if (label) {
        label.textContent = `${Math.round(progress)}%`;
    }
}

