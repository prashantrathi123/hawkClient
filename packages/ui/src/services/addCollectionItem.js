const addCollectionItem = async (payload) => {
    let response;
    if (typeof electron !== 'undefined') {
        response = await electron.handler.addCollectionItem(payload);
    } else {
        return {}
    }

    return response;
}

export { addCollectionItem }
