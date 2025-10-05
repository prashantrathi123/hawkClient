const initialState = {
    workspaces: [],
    selectedWorkSpace: "none"
}

const workSpaceReducer = (state = initialState, action) => {
    switch (action.type) {
        case "SET_SELECTED_WORK_SPACE": return {
            ...state, selectedWorkSpace: action.selectedWorkSpace
        }
        case "SET_WORK_SPACES": return {
            ...state, workspaces: action.workspaces
        }
        case "SET_WORK_SPACES_AND_SELECTED_WORK_SPACE": return {
            ...state, workspaces: action.workspaces, selectedWorkSpace: action.selectedWorkSpace
        }
        default: return state
    }
}

export default workSpaceReducer;