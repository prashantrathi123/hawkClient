const initialState = {
    apiCollection: {},
    requestTabsContent: {
        "Default": {
            isSaved: true,
            type: "Overview",
            path: [],
            namePath: [],
            collectionName: "",
            collectionDisplayName: "",
            requestTabValue: "1",
            request: {
                name: "New Request",
                id: "",
                method: "GET",
                url: "",
                body: { json: "" },
                headers: [],
                bodyType: 'json',
                auth: {
                    authType: 'none',
                    basic: { username: "", password: "" },
                    bearer: [],

                },
                urlContent: {
                    query: []
                },
                validation: []
            },
            nodeId: '',
            response: {
                body: ''
            },
            isResponseLoading: false,
            testResults: {
                assertResults: []
            }
        }
    },
    currentTab: "Default",
    isDeleteTabExecuted: false,
    isTwoPane: true,
    expandedTreeNodes: [],
    selectedTreeNodes: []
}

const apiTesterReducer = (state = initialState, action) => {
    switch (action.type) {
        case "SET_API_COLLECTION": return {
            ...state, apiCollection: action.apiCollection
        }
        case "ADD_REQUEST_TAB_CONTENT": {
            let requestTabsContent = state.requestTabsContent;

            // Check if the id is already present in requestTabsContent
            if (!requestTabsContent.hasOwnProperty(action.id)) {
                requestTabsContent = {
                    ...requestTabsContent,
                    [action.id]: action.selectedRequest
                };
                // console.log("resetting tab")
                return {
                    ...state,
                    requestTabsContent
                };
            } else {
                return state;
            }


        }
        case "UPDATE_REQUEST_TAB_CONTENT": {
            let requestTabsContent = state.requestTabsContent
            if (requestTabsContent.hasOwnProperty(action.id)) {
                requestTabsContent[action.id] = { ...requestTabsContent[action.id], ...action.selectedRequest }
                return {
                    ...state, requestTabsContent: requestTabsContent
                }
            } else {
                return state
            }
        }
        case "CLOSE_REQUEST_TAB_CONTENT": {
            let requestTabsContent = { ...state.requestTabsContent };
            delete requestTabsContent[action.id];

            const currentTab = action.isChangeTab ? action.newTab : state.currentTab;
            const selectedTreeNodes = requestTabsContent[currentTab] ? [requestTabsContent[currentTab].nodeId] : [];

            return {
                ...state,
                requestTabsContent,
                currentTab,
                isDeleteTabExecuted: true,
                selectedTreeNodes,
            };
        }
        case "SET_CURRENT_TAB": return {
            ...state, currentTab: action.currentTab, selectedTreeNodes: [state.requestTabsContent[action.currentTab].nodeId]
        }
        case "SET_IS_DELETE_TAB_EXECUTED": return {
            ...state, isDeleteTabExecuted: action.isDeleteTabExecuted
        }
        case "UPDATE_IS_TWO_PANE": return {
            ...state, isTwoPane: action.isTwoPane
        }
        case "SET_EXPANDED_TREE_NODES": return {
            ...state, expandedTreeNodes: action.expandedTreeNodes
        }
        case "SET_SELECTED_TREE_NODES": return {
            ...state, selectedTreeNodes: action.selectedTreeNodes
        }
        case "SET_RESPONSE": {
            let requestTabsContent = state.requestTabsContent
            requestTabsContent[action.id] = { ...requestTabsContent[action.id], response: action.response, isResponseLoading: action.isResponseLoading }
            return {
                ...state, requestTabsContent: requestTabsContent
            }
        }
        case "SET_IS_RESPONSE_LOADING": {
            let requestTabsContent = state.requestTabsContent
            requestTabsContent[action.id] = { ...requestTabsContent[action.id], isResponseLoading: action.isResponseLoading, response: { body: '' } }
            return {
                ...state, requestTabsContent: requestTabsContent
            }
        }
        case "SET_ASSERT_RESULT": {
            let requestTabsContent = state.requestTabsContent
            requestTabsContent[action.id] = { ...requestTabsContent[action.id], testResults: { ...requestTabsContent[action.id].testResults, assertResults: action.assertResults }, isResponseLoading: action.isResponseLoading }
            return {
                ...state, requestTabsContent: requestTabsContent
            }
        }
        case "SET_TEST_RESULT": {
            let requestTabsContent = state.requestTabsContent
            requestTabsContent[action.id] = { ...requestTabsContent[action.id], testResults: { ...requestTabsContent[action.id].testResults, testResults: action.testResults }, isResponseLoading: action.isResponseLoading }
            return {
                ...state, requestTabsContent: requestTabsContent
            }
        }
        case "RESET_API_TESTER_INITIAL_STATE": {
            return {
                ...state, ...initialState
            }
        }
        case 'DELETE_TABS_WITH_MATCHING_COLLECTION_DISPLAY_NAME': {
            const { collectionId, filename, relativePath } = action;

            if (collectionId === null && filename === 'collection.json') {
                // Extract the first folder from the relativePath
                const firstFolder = relativePath.split('/')[0];

                // Create a new state object excluding the matching keys
                const newRequestTabsContent = Object.keys(state.requestTabsContent).reduce(
                    (acc, key) => {
                        const tabContent = state.requestTabsContent[key];
                        if (tabContent.collectionDisplayName !== firstFolder) {
                            acc[key] = tabContent;
                        }
                        return acc;
                    },
                    {}
                );

                // Return the updated state
                return {
                    ...state,
                    requestTabsContent: newRequestTabsContent,
                };
            }

            return state;
        }
        default: return state
    }
}

export { apiTesterReducer }