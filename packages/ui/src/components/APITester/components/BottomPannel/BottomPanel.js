import React, { useState, useEffect } from 'react';
import './BottomPanel.css';
import styles from "./Bottompannel.Style"

const BottomPanel = (props) => {
  const { style, isTwoPane } = props;
  const [height, setHeight] = useState('40%');
  const [width, setWidth] = useState('50%');
  const [isResizing, setIsResizing] = useState(false);
  const [startPos, setStartPos] = useState(0);
  const [startSize, setStartSize] = useState(0);
  const [startPosY, setStartPosY] = useState(0);
  const [startSizeY, setStartSizeY] = useState(0);
  const classes = styles()

  const handleMouseDown = (e) => {
    setIsResizing(true);
    if (isTwoPane) {
      setStartPos(e.clientX);
      setStartSize(parseInt(getComputedStyle(document.querySelector('.bottom-panel')).width, 10));
    } else {
      setStartPosY(e.clientY);
      setStartSizeY(parseInt(getComputedStyle(document.querySelector('.bottom-panelv')).height, 10));
    }
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isResizing) {
        if (isTwoPane) {
          const newWidth = startSize - (e.clientX - startPos);
          setWidth(newWidth > 50 ? `${newWidth}px` : '50px'); // Minimum width of 50px
        } else {
          const newHeight = startSizeY - (e.clientY - startPosY);
          setHeight(newHeight > 50 ? `${newHeight}px` : '50px'); // Minimum height of 50px
        }
      }
    };

    const handleMouseUp = () => {
      if (isResizing) {
        setIsResizing(false);
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, startPos, startSize, isTwoPane, startPosY, startSizeY]);

  return (
    <div className={isTwoPane ? "bottom-panel" : "bottom-panelv"} style={{ height, width, ...style }}>
      {isTwoPane ? (
        <div className={classes.sideResizer} onMouseDown={handleMouseDown} />
      ) : (
        <div className={classes.resizer} onMouseDown={handleMouseDown} />
      )}
      {props.children}
    </div>
  );
};

BottomPanel.defaultProps = {
  isTwoPane: false,
};

export default BottomPanel;
