const getCertificates = async (workspace) => {
    let response;
    if (typeof electron !== 'undefined') {
        response = await electron.handler.getCertificates({ workspace });
    }

    return response;
}

const addCertificates = async (payload, workspace) => {
    let response;
    if (typeof electron !== 'undefined') {
        response = await electron.handler.addCertificates({ ...payload, workspace });
    }

    return response;
}

export {
    getCertificates,
    addCertificates
}
