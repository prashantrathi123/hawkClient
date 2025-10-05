const getWorkSpaces = async () => {
    let response;
    if (typeof electron !== 'undefined') {
        response = await electron.handler.getWorkSpaces({});
    }

    return response;
}

const addWorkSpaces = async (payload) => {
    let response;
    if (typeof electron !== 'undefined') {
        response = await electron.handler.addWorkSpaces(payload);
    }

    return response;
}

export {
    getWorkSpaces,
    addWorkSpaces
}
