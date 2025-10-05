import React from "react"
import { AppBar, Toolbar, Typography, Grid, Box } from "@mui/material"
import PropTypes from "prop-types"
import styles from './Footer.Style'
import { APP_DISPLAT_NAME } from "../../constants/constants"

const Footer = (props) => {
    const classes = styles()
    return (
        <Box className={classes.footer}>
            <Typography style={{fontSize: "12px"}}>Welcome to {APP_DISPLAT_NAME}</Typography>
        </Box>
    )
}

Footer.propTypes = {
}

export { Footer }