import { combineReducers } from "redux";
import { sideBarReducer } from "../commonComponents/SideBar/SideBar.Reducer"
import { apiTesterReducer } from "../components/APITester/APITester.Reducer";
import { variablesReducer } from "../components/APITester/components/EnvVariables/Variables.Reducer";
import { settingsReducer } from "../commonComponents/Settings/Settings.Reducer";
import { authorizationReducer } from "../components/APITester/components/Authorization/Authorization.Reducer";
import workSpaceReducer from "../components/WorkSpace/WorkSpace.Reducer";

const rootReducer = combineReducers({
    sideBarReducer,
    apiTesterReducer,
    variablesReducer,
    workSpaceReducer,
    settingsReducer,
    authorizationReducer,
})

export { rootReducer }