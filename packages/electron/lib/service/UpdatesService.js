const { Version } = require("../constants/constants");
const axios = require("axios");

async function checkForUpdates() {

    try {
        const response = await axios.get(`https://api.github.com/repos/prashantrathi123/hawkClient/releases/latest`);
        const latestVersion = response.data.tag_name.replace(/^v/, ""); // Remove 'v' prefix if exists
        const currentVersion = Version;
        console.log("latestVersion", latestVersion, "currentVersion", currentVersion)

        if (latestVersion !== currentVersion) {
            return { updateAvailable: true, latestVersion, releaseUrl: response.data.html_url };
        } else {
            return { updateAvailable: false };
        }
    } catch (error) {
        console.error("Failed to check for updates:", error);
        return { updateAvailable: false };
    }
}

module.exports = { checkForUpdates };
