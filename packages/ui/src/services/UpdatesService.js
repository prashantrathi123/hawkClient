const checkForUpdates = async () => {
    let response;
    if (typeof electron !== 'undefined') {
        response = await electron.handler.checkForUpdates();
    }

    return response;
}

export {
    checkForUpdates
}