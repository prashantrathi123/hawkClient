const executeAPI = async ({ payload, signal }) => {
    let response = {};
    try {
        if (typeof electron !== 'undefined') {
            response = electron.handler.executeAPI(payload);

            // // Use Promise.race to return whichever resolves first: the API call or the signal abort
            await Promise.race([
                response,
                new Promise((_, reject) =>
                    signal.addEventListener('abort', () => reject(new Error('Operation aborted')))
                )
            ]);
        }
    }
    catch (error) {
        if (error.message === 'Operation aborted' || error.name === 'AbortError') {
            console.log('API request was aborted');
        } else {
            console.error("Error in service for executing request", payload.url, error);
        }
        return {
            logs: [],
            postScriptResponse: {
                logs: [],
                testResults: []
            }
        };
    }
    return response;
}

export { executeAPI }
