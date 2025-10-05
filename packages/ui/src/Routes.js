import React from "react"
import {Route, Routes } from "react-router-dom"
import Home from "./components/Home/Home.Component"

const MyRoutes = () => {
    <div>
        <Route exact path ="/" component={Home}/>
    </div>
}

export { MyRoutes }