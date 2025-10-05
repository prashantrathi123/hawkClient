import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme) => ({
  appbar: {
    width: '90px',
    backgroundColor: theme.palette.mode == "dark" ? "background.default" : '#f5f5f5',
    color: theme.palette.text.primary,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '0px',
    borderRight: theme.palette.mode == "dark" ? '1px solid #333' : "1px solid #C8CDD7",
    boxSizing: 'border-box'
  },
  item: {
    // color: 'white',
    margin: '4px 0px',
    padding: '0px',
    cursor: 'pointer',
    fontSize: '16px',
    '&:hover': {
      // color: '#007acc',
    },
  },
  button: {
    display: "flex", flexDirection: "column", alignItems: "center",
    '&:hover': {
      // color: '#007acc',
    },
    // color: "white",
  },
  icon: {
    alignItems: "center",
    justifyContent: "center",
    // color: "white",
  },
  text: {
    fontSize: "10px",
    fontWeight: 300,
    textAlign: "center",
    // color: "black",
  }

}))

export default useStyles

