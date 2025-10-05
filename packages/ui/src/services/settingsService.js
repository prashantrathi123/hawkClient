const getSettings = async () => {
    let response;
    if (typeof electron !== 'undefined') {
        response = await electron.handler.getSettings();
    }

    return response;
}

const saveSettings = async (payload) => {
    let response;
    if (typeof electron !== 'undefined') {
        response = await electron.handler.saveSettings(payload);
    } else {
        return payload;
    }

    return response;
}

export {
    getSettings,
    saveSettings
}
