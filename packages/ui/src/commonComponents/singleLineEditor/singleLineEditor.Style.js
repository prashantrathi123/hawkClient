import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme) => ({
    ace_editor_single_line: {
        border: "1px solid",
        borderColor: theme.palette.divider,
        borderRadius: '4px',
        lineHeight: '21px',
        transition: 'border-color 0.3s ease',
        whiteSpace: 'pre-wrap', // Enable word-wrapping
        wordBreak: 'break-word', // Break long words if needed
        zIndex: 10,
        '&:hover:not(.focused)': {
            borderColor: theme.palette.mode == "dark" ? "#C8CDD7" : 'black',
        },
        '&.focused': {
            border: '2px solid',
            borderColor: theme.palette.primary.main,
            lineHeight: '19px',
            zIndex: 100,
        },
        '& .ace_cursor': {
            visibility: 'hidden',
        },
        '&.focused .ace_cursor': {
            visibility: 'visible',
        },
        '& .ace_placeholder': {
            margin: '5px 10px',
        },
    },

}))

export default useStyles

