import { makeStyles } from '@mui/styles';

const useStyles = makeStyles(() => ({
    root: {
      display: "block",
      flex: 1
    },
    table: {
      height: "100%",
      width: "100%"
    },
    list: {},
    thead: {},
    tbody: {
      width: "100%",
      height: "200px"
    },
    row: {
      display: "flex",
      flexDirection: "row",
      flexWrap: "nowrap",
      alignItems: "center",
      boxSizing: "border-box",
      minWidth: "100%",
      width: "100%"
    },
    headerRow: {},
    cell: {
      display: "block",
      flexGrow: 0,
      flexShrink: 0
    },
    expandingCell: {
      flex: 1
    },
    column: {}
  }));

  export default useStyles