import { makeStyles } from '@mui/styles';

const useStyles = makeStyles(()=> ({
    container: {
        justifyContent: "space-between",
        display: "flex",
        borderWidth: "1px",
        borderStyle: "solid",
        borderColor: "#C8CDD7",
        borderRadius: "4px"
    },
    sidePannel: {
        padding: "24px",
        width: "10%",
        borderWidth: "1px",
        borderStyle: "solid",
        borderColor: "#C8CDD7",
        borderRadius: "4px"
    },
    mainPannel: {
        padding: "24px",
        width: "50%",
        gap: "10px",
        borderWidth: "1px",
        borderStyle: "solid",
        borderColor: "#C8CDD7",
        borderRadius: "4px"
    },
    content: {
        // padding: "20px",
        flexGrow: 1,
        p:3
    },
    asterisk: {
        color: "red"
    }
}))

export default useStyles