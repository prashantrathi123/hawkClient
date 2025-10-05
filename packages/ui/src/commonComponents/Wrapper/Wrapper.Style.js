import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme) => ({
    app: {
        backgroundColor: theme.palette.background.default,
        color: theme.palette.text.primary,
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
    },
    body: {
        display: 'flex',
        flexGrow: 1,
        overflow: 'hidden',
    }

}))

export default useStyles

