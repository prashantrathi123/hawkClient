const getAPITesterCollections = async (selectedWorkSpace) => {
    let response;
    if (typeof electron !== 'undefined') {
        response = await electron.handler.getAPITesterCollections(selectedWorkSpace);
    }

    return response;
}

export { getAPITesterCollections }
