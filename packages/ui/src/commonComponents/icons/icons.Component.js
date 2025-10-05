import React from 'react';
import { Box } from "@mui/material";
import styles from './icons.Style'

export const VerticalSplitIcon = () => {
  const classes = styles();

  return (
      <Box className={classes.icon}>
        <Box className={classes.verticalSplit}>
          <div></div>
          <div></div>
        </Box>
      </Box>
  );
};

export const HorizontalSplitIcon = () => {
    const classes = styles();
  
    return (
        <Box className={classes.icon}>
          <Box className={classes.horizontalSplit}>
            <div></div>
            <div></div>
          </Box>
        </Box>
    );
  };

// export HorizontalSplitIcon
