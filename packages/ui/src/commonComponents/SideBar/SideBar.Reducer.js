const initialState = {
    component: "API_TESTER",
}

const sideBarReducer = (state = initialState, action) => {
    switch (action.type) {
        case "SET_COMPONENT": return {
            ...state, component: action.component
        }
        default: return state
    }
}

export { sideBarReducer }
