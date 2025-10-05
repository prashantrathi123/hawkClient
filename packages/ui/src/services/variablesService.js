const getGlobalVariables = async (payload) => {
    let response;
    if (typeof electron !== 'undefined') {
        response = await electron.handler.getGlobalVariables(payload);
    }

    return response;
}

const addGlobalVariables = async (payload) => {
    let response;
    if (typeof electron !== 'undefined') {
        response = await electron.handler.addGlobalVariables(payload);
    }

    return response;
}

const getEnvVariables = async (payload) => {
    let response;
    if (typeof electron !== 'undefined') {
        response = await electron.handler.getEnvVariables(payload);
    }

    return response;
}

const updateEnvVariables = async (payload) => {
    let response;
    if (typeof electron !== 'undefined') {
        response = await electron.handler.updateEnvVariables(payload);
    }

    return response;
}

const addEnvVariables = async (payload) => {
    let response;
    if (typeof electron !== 'undefined') {
        response = await electron.handler.addEnvVariables(payload);
    }

    return response;
}

const deleteEnvVariables = async (payload) => {
    let response;
    if (typeof electron !== 'undefined') {
        response = await electron.handler.deleteEnvVariables(payload);
    }

    return response;
}

const importPostmanEnvVariables = async (payload) => {
    let response;
    try {
        if (typeof electron !== 'undefined') {
            response = await electron.handler.importPostmanEnvVariables(payload);
        }
    }
    catch (error) {
        return { error: true, errorDescription: "unexpected error" };
    }

    return response;
}

const duplicateEnvVariables = async (payload) => {
    let response;
    try {
        if (typeof electron !== 'undefined') {
            response = await electron.handler.duplicateEnvVariables(payload);
        }
    }
    catch (error) {
        return { error: true, errorDescription: "unexpected error" };
    }

    return response;
}

export {
    getGlobalVariables,
    addGlobalVariables,
    getEnvVariables,
    updateEnvVariables,
    addEnvVariables,
    deleteEnvVariables,
    importPostmanEnvVariables,
    duplicateEnvVariables
}
