import { makeStyles } from '@mui/styles';

 const useStyles = makeStyles((theme) => ({
    icon: {
      display: 'flex',
      width: '12px',
      height: '12px',
      border: '1px solid white',
      borderRadius: '2px'
    },
    verticalSplit: {
      color: 'white',
      display: 'flex',
      width: '100%',
      height: '100%',
      '& div': {
        flex: 1,
        borderLeft: '1px solid white',
        '&:first-child': {
          borderLeft: 'none',
        },
      },
    },
    horizontalSplit: {
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      height: '100%',
      '& div': {
        flex: 1,
        borderTop: '1px solid white',
        '&:first-child': {
          borderTop: 'none',
        },
      },
    },
  }));

  export default useStyles;