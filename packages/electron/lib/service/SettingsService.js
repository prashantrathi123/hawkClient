const { getSettings, saveSettings } = require("../database/SettingsDatabase");

const GetSettings = async () => {
    console.log("GetSettings() service")
    const workSpaces = getSettings();
    return workSpaces;
}

const SaveSettings = async (request) => {
    console.log("SaveSettings() service")
    let { theme, fontSize } = request;
    return saveSettings({ theme, fontSize })
}

module.exports = {
    GetSettings,
    SaveSettings
}