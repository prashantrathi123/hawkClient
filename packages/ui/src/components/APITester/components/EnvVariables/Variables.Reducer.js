const initialState = {
    variables: {
        globalVariables: {
            values: []
        },
        envVariables: {

        },
        selectedEnv: 'none'
    },
}

const variablesReducer = (state = initialState, action) => {
    switch (action.type) {
        case "SET_GLOBAL_VARIABLES": return {
            ...state, variables: { ...state.variables, globalVariables: action.globalVariables }
        }
        case "SET_ENV_VARIABLES": return {
            ...state, variables: { ...state.variables, envVariables: action.envVariables }
        }
        case "UPDATE_ENV_VARIABLES": {
            let variables = state.variables.envVariables
            let fileName = variables[action.envId].name
            if (action.name != null) {
                fileName = action.name
            }
            variables[action.envId] = { ...variables[action.envId], values: action.values, name: fileName }
            return {
                ...state, variables: { ...state.variables, envVariables: variables }
            }
        }
        case "SET_SELECTED_ENV": return {
            ...state, variables: { ...state.variables, selectedEnv: action.selectedEnv }
        }
        default: return state
    }
}

export { variablesReducer }