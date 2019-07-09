import React, { Fragment } from 'react';
import { TabData } from 'rc-dock';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExternalLinkSquareAlt, faWindowMaximize } from '@fortawesome/free-solid-svg-icons';

import './TabTitle.css';

import { TabButton } from './TabButton';


interface TabTitleProps extends Pick<TabData, 'title'> {
  /**
   * Additional suffix details, e.g. an index number.
   *
   * @type {string}
   * @memberof TabTitleProps
   */
  suffix?: string;

  /**
   *
   *
   * @memberof TabTitleProps
   */
  onDetachTabClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  /**
   *
   *
   * @memberof TabTitleProps
   */
  onMaximizeTabClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}

export const TabTitle = ({
  title,
  suffix,
  onDetachTabClick,
  onMaximizeTabClick,
}: TabTitleProps) => {
  return (
    <Fragment>
      {title}
      <span className="dock-tab-title-suffix">
        {suffix}
      </span>
      <div className="dock-tab-btn-group">
        <TabButton onClick={onDetachTabClick}>
          <FontAwesomeIcon
            className="dock-tab-btn-icon"
            fixedWidth
            icon={faExternalLinkSquareAlt}
            size="sm"
          />
        </TabButton>
        <TabButton onClick={onMaximizeTabClick}>
          <FontAwesomeIcon
            className="dock-tab-btn-icon"
            fixedWidth
            icon={faWindowMaximize}
            size="sm"
          />
        </TabButton>
      </div>
    </Fragment>
  );
}
