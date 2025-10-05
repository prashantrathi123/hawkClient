import * as React from 'react';
import { styled, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import { Grid } from '@mui/material';
import { TreeItem, treeItemClasses, useTreeItem } from '@mui/x-tree-view/TreeItem';
import clsx from 'clsx';

const StyledTreeItemRoot = styled(TreeItem)(({ theme }) => ({
  color: theme.palette.text.secondary,
  [`& .${treeItemClasses.content}`]: {
    color: theme.palette.text.secondary,
    borderTopRightRadius: theme.spacing(2),
    borderBottomRightRadius: theme.spacing(2),
    paddingRight: theme.spacing(1),
    fontWeight: theme.typography.fontWeightMedium,
    '&.Mui-expanded': {
      fontWeight: theme.typography.fontWeightRegular,
    },
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
    '&.Mui-focused, &.Mui-selected, &.Mui-selected.Mui-focused': {
      backgroundColor: `var(--tree-view-bg-color, ${theme.palette.action.selected})`,
      color: 'var(--tree-view-color)',
    },
    [`& .${treeItemClasses.label}`]: {
      fontWeight: 'inherit',
      color: 'inherit',
    },
  },
  [`& .${treeItemClasses.group}`]: {
    borderLeft: `1px solid ${theme.palette.divider}`, // Vertical line on child group
  },
}));

const CustomContent = React.forwardRef(function CustomContent(props, ref) {
  const {
    classes,
    className,
    label,
    nodeId,
    icon: iconProp,
    expansionIcon,
    displayIcon,
  } = props;

  const {
    disabled,
    expanded,
    selected,
    focused,
    handleExpansion,
    handleSelection,
    preventSelection,
  } = useTreeItem(nodeId);

  const icon = iconProp || expansionIcon || displayIcon;

  const handleMouseDown = (event) => {
    preventSelection(event);
  };

  const handleExpansionClick = (event) => {
    handleExpansion(event);
  };

  const handleSelectionClick = (event) => {
    handleSelection(event);
  };

  return (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div
      className={clsx(className, classes.root, {
        [classes.expanded]: expanded,
        [classes.selected]: selected,
        [classes.focused]: focused,
        [classes.disabled]: disabled,
      })}
      onMouseDown={handleMouseDown}
      ref={ref}
    >
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions */}
      <div onClick={handleExpansionClick} className={classes.iconContainer}>
        {icon}
      </div>
      <div style={{ flexGrow: 1 }}>
        {label}
      </div>
    </div>
  );
});

const StyledTreeItem = React.forwardRef(function CustomTreeItem(props, ref) {
  const theme = useTheme();
  const {
    labelicon: LabelIcon,
    labeliconB: LabelIconB,
    labeliconc: LabelIconC,
    labelInfo,
    labeltext,
    bgColor,
    color,
    colorForDarkMode,
    bgColorForDarkMode,
    nodeId,
    style
  } = props;

  const {
    disabled,
    expanded,
    selected,
    focused,
    handleExpansion,
    handleSelection,
    preventSelection,
  } = useTreeItem(nodeId);

  const handleSelectionClick = (event) => {
    handleExpansion(event);
    handleSelection(event);
  };

  const styleProps = {
    '--tree-view-color': theme.palette.mode !== 'dark' ? color : colorForDarkMode,
    '--tree-view-bg-color':
      theme.palette.mode !== 'dark' ? bgColor : bgColorForDarkMode,
    ...style
  };

  return (
    <StyledTreeItemRoot ContentComponent={CustomContent}
      label={
        <Grid container style={{ flexDirection: "row", height: "34px", alignItems: "center", justifyContent: "space-between", flexWrap: "nowrap" }}>
          <Grid item style={{ flexGrow: 1, height: '100%' }}>
            <Grid container style={{ flexDirection: "row", alignItems: "center", width: '100%', gap: '8px', height: '100%', flexWrap: "nowrap" }}>
              {/* <Box component={LabelIcon} color="inherit" sx={{ mr: 1 }} /> */}
              {LabelIcon}
              <Box
                onClick={handleSelectionClick}
                variant="body2"
                sx={{
                  fontWeight: 'inherit',
                  flexGrow: 1,
                  height: '100%',  // Take full height of the parent
                  display: 'flex',  // Use flex display
                  alignItems: 'center',  // Center align the text vertically
                  cursor: 'pointer'  // Add pointer cursor for better UX
                }}>
                {labeltext}
              </Box>
            </Grid>
          </Grid>
          <Grid item style={{ position: 'sticky', right: "8px", zIndex: 3, backgroundColor: theme.palette.background.default}}>
            {LabelIconB}
            {LabelIconC && (
              <span>{LabelIconC}</span>
            )}
          </Grid>
        </Grid>
      }
      {...props}
      style={styleProps}
      ref={ref}
    />
  );
});

export default StyledTreeItem;