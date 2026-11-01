async function getLatestRelease() {
    const response = await fetch(
        `https://api.github.com/repos/majcek210/terra-widget/releases/latest`
    );

    if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
    }

    return await response.json();
}

async function loadDownloads() {

    const status = document.getElementById("downolad_status")

    const windowsDownload = document.getElementById("download_win")
    const linuxDeb = document.getElementById("download_linux1")
    const linuxApp = document.getElementById("download_linux2")
    const mac = document.getElementById("downolad_mac")

    try {

        status.hidden = false
        status.textContent = "Fetching..."

        const release = await getLatestRelease();

        const platforms = [
            { name: "Windows", match: file => file.name.includes("Setup") && file.name.endsWith(".exe") , element: windowsDownload },
            { name: "Linux DEB", match: file => file.name.endsWith(".deb"), element: linuxDeb },
            { name: "Linux AppImage", match: file => file.name.endsWith(".AppImage"), element: linuxApp },
            { name: "macOS", match: file => file.name.endsWith(".dmg"), element: mac }
        ];

        for (const platform of platforms) {
            const asset = release.assets.find(platform.match)

            if (!asset) continue;
            console.log(asset)
            if (platform.element) {
                console.log("yes")
                platform.element.href = asset.browser_download_url
            }
            
        }

        status.hidden = true


    } catch (error) {
        console.error(error);
        status.hidden = false
        status.textContent = "Downloads are unavailable."
    }
}

loadDownloads();