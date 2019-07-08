import React, { CSSProperties } from "react";

import './PanelCloseButton.css';

interface PanelCloseButtonProps {
  onClosePanelButtonClick?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  style?: CSSProperties;
}

export const PanelCloseButton = ({
  onClosePanelButtonClick,
  style
}: PanelCloseButtonProps) => {
  return (
    <div
      className="my-panel-close-btn"
      onClick={onClosePanelButtonClick}
      style={style}
    >
      X
    </div>
  );
}
