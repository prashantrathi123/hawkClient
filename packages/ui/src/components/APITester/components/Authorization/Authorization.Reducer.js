const initialState = {
    openManageTokens: false,
    isFetchingToken: false,
    tokens: [],
    isAuthCodeFlow: false,
    errorFetchingToken: ''
}

const authorizationReducer = (state = initialState, action) => {
    switch (action.type) {
        case "SET_OPEN_MANAGE_TOKENS": return {
            ...state, openManageTokens: action.openManageTokens
        }
        case "SET_IS_FETCHING_TOKEN": return {
            ...state, isFetchingToken: action.isFetchingToken
        }
        case "SET_IS_AUTH_CODE_FLOW": return {
            ...state, isAuthCodeFlow: action.isAuthCodeFlow
        }
        case "ADD_TOKEN": {
            const { tokenName, token } = action;

            // Filter out any existing token with the same name
            const updatedTokens = state.tokens.filter(t => t.name !== tokenName);

            return {
                ...state,
                tokens: [...updatedTokens, { name: tokenName, token }]
            };
        }
        case "ERROR_FETCHING_TOKEN": return {
            ...state, errorFetchingToken: action.errorFetchingToken
        }
        default: return state
    }
}

export { authorizationReducer }