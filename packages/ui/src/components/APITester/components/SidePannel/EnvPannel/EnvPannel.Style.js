import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme)=> ({
    scrollableSection:{
        position: 'relative',
        height: '100%',
        width: '100%',
        display: 'block'
    },
    sideBarHeader: {
        display: 'flex',
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
}))

export default useStyles