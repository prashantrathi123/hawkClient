import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme) => ({
    sideResizer: {
        zIndex: 34,
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
    resizer: {
        zIndex: 34,
        height: '3px',
        backgroundColor: theme.palette.mode == "dark" ? "#333" : '#C8CDD7',
        cursor: 'row-resize',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        '&:hover': {
            backgroundColor: theme.palette.primary.main,
        },
    },

}))

export default useStyles

