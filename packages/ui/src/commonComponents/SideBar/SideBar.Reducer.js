const initialState = {
    component: "API_TESTER",
    showFiles: false,
}

const sideBarReducer = (state = initialState, action) => {
    switch (action.type) {
        case "SET_COMPONENT": return {
            ...state, component: action.component
        }
        case "SET_SHOW_FILES": return {
            ...state, showFiles: action.showFiles
        }
        default: return state
    }
}

export { sideBarReducer }