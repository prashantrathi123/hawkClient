const getHttpSnippet = async (payload) => {
    let response;
    if (typeof electron !== 'undefined') {
        response = await electron.handler.getHttpSnippet(payload);
    }

    return response;
}

export { getHttpSnippet }
