import { makeStyles } from '@mui/styles';

const useStyles = makeStyles(() => ({
    header: {
        // height: "70px",
        // width: "100vw",
        // backgroundColor: "#1976d2",
        // position: "fixed",
        // top: 0,
        // left: 0,
        // right: 0,
        // zIndex: 1200,
        // color: "#fff",
        // alignItems: "center",
        // flexDirection: "column",
        // gap: "10px",
        // paddingLeft: "20px"
        height: '50px',
        backgroundColor: '#333',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 10px',
        gap: "10px",
    },
    formControl: {
        width: '190px',
        // borderColor: 'white',
        '& .MuiOutlinedInput-root': {
            '& fieldset': {
                borderColor: '#9e9e9e',
            },
            '&:hover fieldset': {
                borderColor: 'white',
            },
            '&.Mui-focused fieldset': {
                // borderColor: 'white',
            },
            '& .MuiSelect-icon': {
                color: 'white',
            },
            '& .MuiInputBase-input': {
                color: 'white',
            },
        },
    },
}))

export default useStyles

