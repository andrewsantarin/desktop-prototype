import React, { FunctionComponent, DetailedHTMLProps, ButtonHTMLAttributes } from 'react';


export type TabButtonProps = DetailedHTMLProps<
  ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
>;

export const TabButton: FunctionComponent<TabButtonProps> = (props) => {
  return (
    <button
      {...props}
      className="dock-tab-btn"
    />
  );
}
