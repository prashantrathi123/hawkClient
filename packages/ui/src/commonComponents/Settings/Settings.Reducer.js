const initialState = {
    clientCertificates: [],
    theme: "light",
    fontSize: 12,
    caCertificate: {
        isEnabled: false
    },
    isCertSaved: true,
    isVerifyTLS: false,
    isSettingsSaved: true,
    isUpdatesAvailable: false,
}

const settingsReducer = (state = initialState, action) => {
    switch (action.type) {
        case "ADD_CLIENT_CERTIFICATES": return {
            ...state, clientCertificates: [...state.clientCertificates, action.clientCertificates]
        }
        case "SET_THEME": return {
            ...state, theme: action.theme, isSettingsSaved: action.isSettingsSaved
        }
        case "ENABLE_CA_CERT": return {
            ...state, caCertificate: { ...state.caCertificate, isEnabled: action.isEnabled }
        }
        case "ADD_CA_CERT": return {
            ...state, caCertificate: { ...state.caCertificate, isEnabled: true, caPath: action.caPath }
        }
        case "SET_CA_CERT": return {
            ...state, caCertificate: { ...state.caCertificate, isEnabled: action.isEnabled, caPath: action.caPath }
        }
        case "UPDATE_CLIENT_CERTIFICATES": return {
            ...state, clientCertificates: action.clientCertificates
        }
        case "RESET__CERTIFICATES": return {
            ...state, clientCertificates: [], caCertificate: { isEnabled: false }
        }
        case "SET_IS_CERT_SAVED": {
            return {
                ...state, isCertSaved: action.isCertSaved
            }
        }
        case "SET_IS_VERIFY_TLS": {
            return {
                ...state, isVerifyTLS: action.isVerifyTLS
            }
        }
        case "SET_FONT_SIZE": return {
            ...state, fontSize: action.fontSize, isSettingsSaved: action.isSettingsSaved
        }
        case "SET_IS_UPDATES_AVAILABLE": {
            return {
                ...state, isUpdatesAvailable: action.isUpdatesAvailable
            }
        }
        default: return state
    }
}

export { settingsReducer }