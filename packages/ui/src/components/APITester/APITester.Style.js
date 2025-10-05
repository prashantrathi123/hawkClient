import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme) => ({
    container: {
        justifyContent: "space-between",
        display: "flex",
        borderWidth: "1px",
        borderStyle: "solid",
        borderColor: "#C8CDD7",
        borderRadius: "4px"
    },
    mainPannel: {
        paddingLeft: "3px",
        gap: "10px",
        overflowY: "hidden",
        overflowX: "hidden",
        width: "80%",
        borderLeft: "1px solid #C8CDD7",
        height: "100%",
        position: "relative"
    },
    requestContainer: {
        height: "calc(100vh - 110px)",
        boxSizing: "border-box",
    },
    method: {
    },
    asterisk: {
        color: "red"
    },
    endpoint: {
        height: "36px",
        flex: 1
    },
    tab: {
        fontFamily: "Noto Sans",
        fontSize: "10px",
        color: "black"
    },
    headersTitle: {
        color: "black",
        width: "50%",
    },
    headersValue: {
        width: "50%",
    },
    GET: {
        color: theme.palette.success.main,
    },
    PUT: {
        color: theme.palette.primary.main,
    },
    POST: {
        color: theme.palette.warning.main,
    },
    DELETE: {
        color: theme.palette.error.main,
    },
    PATCH: {
        color: theme.palette.secondary.dark,
    },
    HEAD: {
        color: theme.palette.success.main,
    },
    OPTIONS: {
        color: "voilet",
    },
    resizer: {
        width: "3px",
        top: 0,
        left: 0,
        cursor: "col-resize",
        height: "100%",
        position: "absolute",
        backgroundColor: "#42b362",
        '&:hover': {
            backgroundColor: "#5e5ee8",
        }
    },
    topresizer: {
        width: "100%",
        top: 0,
        left: 0,
        cursor: "row-resize",
        height: "3px",
        position: "sticky",
        backgroundColor: "#ffffff",
        '&:hover': {
            backgroundColor: "#5e5ee8",
        },
        zIndex: 76
    },
    mainArea: {
        display: 'flex',
        flexDirection: 'column',
        // flexGrow: 1,
        overflow: 'hidden',
        paddingLeft: '3px',
        position: 'relative',
    },
    sideResizer: {
        zIndex: 2,
        width: '3px',
        backgroundColor: theme.palette.mode == "dark" ? "#333" : '#C8CDD7',
        cursor: 'col-resize',
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        '&:hover': {
            backgroundColor: theme.palette.primary.main,
        },
    },
    tabs: {
        width: 'calc(100% - 190px)'
    }
}))

export default useStyles