import React, { useState, useEffect } from 'react';
import { TextField, Checkbox, IconButton } from '@mui/material';
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline"
import EditIcon from "@mui/icons-material/Edit"
import OpenInNewIcon from "@mui/icons-material/OpenInNew"
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { useTheme } from '@mui/material/styles';

const StyledTableCell = ({ children, withDivider, ...props }) => (
  <TableCell
    sx={{
      borderRight: withDivider ? '1px solid rgba(224, 224, 224, 1)' : 'none',
    }}
    {...props}
  >
    {children}
  </TableCell>
);

const TableColumns = ({ columns }) => (
  <TableRow key="1">
    {columns.map((column, colIndex) => {
      return (
        <StyledTableCell
          key={colIndex}
        >
          {column.label}
        </StyledTableCell>
      );
    })}
    <StyledTableCell key="action">Action</StyledTableCell>
  </TableRow>
);

function VirtualizedTable(props) {
  const { data, columns, handleDelete, handleEditView, workspace } = props;
  const [dataValue, setDataHeaders] = useState([]);
  const theme = useTheme();
  useEffect(() => {
    setDataHeaders(data);
  }, [data])

  const handleDeleteClick = (index) => {
    let payload = {
      method: dataValue[index].method,
      path: dataValue[index].path,
      workspace: workspace,
    }
    handleDelete(payload)
  }

  const handleEditViewClick = (index, isEdit, isView) => {
    let payload = {
      isEdit,
      isView,
      request: dataValue[index],
    }
    handleEditView(payload)
  }

  return (
    <TableContainer style={{ position: 'relative', height: '100%', width: '100%', display: 'block' }}>
      <Table sx={{ border: "1px solid", borderColor: theme.palette.divider, position: 'absolute', height: 'auto', overflow: 'scroll', top: 0, left: 0 }} size="small" aria-label="virtualized table">
        <TableHead>
          <TableColumns columns={columns} />
        </TableHead>
        <TableBody>
          {dataValue.map((val, index) => {
            return (<TableRow key={index}>
              {
                columns.map((column, colIndex) => {
                  return (
                    <StyledTableCell key={colIndex} align="left">
                      {val[`${column.dataKey}`]}
                    </StyledTableCell>)
                })
              }
              <StyledTableCell key="action">
                <IconButton onClick={() => { handleDeleteClick(index) }}><DeleteOutlineIcon /></IconButton>
                <IconButton onClick={() => { handleEditViewClick(index, true, false) }}><EditIcon /></IconButton>
                <IconButton onClick={() => { handleEditViewClick(index, false, true) }}><OpenInNewIcon /></IconButton>
              </StyledTableCell>
            </TableRow>)
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
VirtualizedTable.defaultProps = {
  value: []
}
export default VirtualizedTable;
