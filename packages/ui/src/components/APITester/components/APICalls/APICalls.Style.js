import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme) => ({
  tableContainer: {
    position: 'relative',
    height: '100%',
    width: '100%',
    display: 'block',
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
}))

export default useStyles

