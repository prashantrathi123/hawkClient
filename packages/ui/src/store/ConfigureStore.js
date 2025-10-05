import { createStore, applyMiddleware } from "redux";
import { rootReducer } from "./RootReducer";

const configureStore = () => {
    return {
        ...createStore(rootReducer)
    }
}

const store = configureStore()

export { store, configureStore}