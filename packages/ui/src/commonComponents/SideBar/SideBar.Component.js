import React from "react"
import { Box, ListItem, ListItemIcon, ListItemText, ListItemButton, Typography } from "@mui/material"
import APIIcon from "@mui/icons-material/Api"
import { useDispatch, useSelector } from 'react-redux';
import styles from './SideBar.Style'
import { useTheme } from '@mui/material/styles';

const SideBar = (props) => {
    const theme = useTheme();
    const classes = styles()
    const dispatch = useDispatch()
    const component = useSelector(state => state.sideBarReducer.component)

    const handleClick = (component) => {
        dispatch({ type: "SET_COMPONENT", component: component })
    }
    return (
        <Box sx={{ overflow: "hidden" }} className={classes.appbar}>
            <ListItem className={classes.item} sx={{ padding: '0px' }}>
                <ListItemButton style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    backgroundColor: component === 'API_TESTER'
                        ? theme.palette.action.selected // Use theme's selected color
                        : 'transparent',
                }} onClick={() => handleClick("API_TESTER")}>
                    <ListItemIcon style={{ alignItems: "center", justifyContent: "center" }}>
                        <APIIcon />
                    </ListItemIcon>
                    <ListItemText disableTypography primary={<Typography variant="body2" style={{ fontSize: "10px", textAlign: "center" }}>Test APIs</Typography>} />
                </ListItemButton>
            </ListItem>

        </Box>
    )
}

SideBar.propTypes = {
}

export { SideBar }