import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme)=> ({
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
    requestText:{
    },
    resizer: {
        width: "3px",
        top: 0,
        right: 0,
        cursor: "col-resize",
        height: "100%",
        position: "absolute",
        backgroundColor: "#42b362"
    },
    sidebar: {
        flex: 1,
        overflowY: "scroll",
        overflowX:"hidden",
        // height: "85vh",
        // maxHeight: "80vh",
        position: "relative",
    },
    scrollableSection:{
        // width: "100%",
        // position:"absolute",
        // height: "100%",
        // overflowY:"scroll",
        // overflowX: "hidden",
        // paddingBottom: "5px"
        // flexGrow: 1,
        position: 'relative',
        height: '100%',
        width: '100%',
        display: 'block'
        // overflow: "auto"
    },
    sideBarHeader: {
        display: "flex",
        flexDirection: "row",
        height: "44px",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        backgroundColor: "background.default",
        zIndex: 1,
        borderBottom: theme.palette.mode == "dark" ? "1px solid #333" : "1px solid #C8CDD7"
    },
    sidePanel: {
        // backgroundColor: '#252526',
        // color: 'white',
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
        paddingRight: '0px',
        position: 'relative',
        overflowY: 'hidden',
        overflowX: 'hidden',
      },
      sideResizer: {
        zIndex: 2,
        width: '5px',
        backgroundColor: '#555',
        cursor: 'col-resize',
        position: 'absolute',
        top: 0,
        bottom: 0,
        right: 0,
        '&:hover': {
            backgroundColor: "#5e5ee8",
        },
      },
}))

export default useStyles