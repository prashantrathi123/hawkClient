
const path = require('path');
const fs = require("fs")
const WriteFile = require("../../writeFile")
const constants = require('../constants/constants')
const settingsJsonPath = path.join(constants.WorkSpaceFolderPath, '/settings/settings.json');

// getSettings - function to get getSettings
const getSettings = () => {
    let folderName = path.join(constants.WorkSpaceFolderPath, '/settings')
    if (!fs.existsSync(folderName)) {
        fs.mkdirSync(folderName);
    }
    if (!fs.existsSync(settingsJsonPath)) {
        saveSettings({
            theme: 'light',
            fontSize: 14
        })
    }
    let settingsJson = JSON.parse(fs.readFileSync(settingsJsonPath, 'utf8'));
    return settingsJson
}

const saveSettings = (settingsJson) => {
    let { theme, fontSize } = settingsJson;
    let folderName = path.join(constants.WorkSpaceFolderPath, '/settings');

    if (!fs.existsSync(folderName)) {
        fs.mkdirSync(folderName);
    }

    WriteFile.WriteFile(settingsJsonPath, JSON.stringify({ theme, fontSize }, null, 2));
    return { theme, fontSize };
};


module.exports = {
    getSettings,
    saveSettings
};
