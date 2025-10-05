import React from "react"
import { Box } from "@mui/material"
import PropTypes from "prop-types"
import { Header } from "../Header/Header.Component"
import { SideBar as AppBar } from "../SideBar/SideBar.Component"
import { Footer } from "../Footer/Footer"
import styles from './Wrapper.Style'

const Wrapper = (props) => {
    const classes = styles()

    return (
        <Box className={classes.app}>
            <Header />
            <Box className={classes.body}>
                <AppBar />
                {props.children}
            </Box>
            <Footer />
        </Box>
    )
}

Wrapper.propTypes = {
    children: PropTypes.any
}

export { Wrapper }
