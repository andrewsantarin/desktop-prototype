import React, { Fragment } from 'react';
import { TabData } from 'rc-dock';

import './TabTitle.css';


interface TabTitleProps extends Pick<TabData, 'title'> {
  /**
   * Additional suffix details, e.g. an index number.
   *
   * @type {string}
   * @memberof TabTitleProps
   */
  suffix?: string;
}

export const TabTitle = (props: TabTitleProps) => {
  return (
    <Fragment>
      {props.title}
      <span className="dock-tab-title-suffix">
        {props.suffix}
      </span>
    </Fragment>
  );
}
