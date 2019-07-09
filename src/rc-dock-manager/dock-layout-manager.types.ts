import { ComponentType, ComponentProps } from 'react';
import DockLayout, { TabBase, TabData, TabGroup } from 'rc-dock';


export type DockLayoutProps = ComponentProps<typeof DockLayout>;

export type TabDataOptions = {}
  & TabBase
  & Pick<TabData, 'group' | 'parent' | 'closable' | 'cached' | 'cacheContext' | 'minWidth' | 'minHeight'>;

export type TabDataSchema = {
  [key: string]: TabData;
}

export type TabGroupSchema = {
  [key: string]: TabGroup;
}

// Extensions

export type TabContent = React.ReactElement | ((tab: TabData) => React.ReactElement);

export interface TabDataExtended extends Omit<TabData, 'content'> {
  content?: TabContent;
  component?: ComponentType<any>;
}

/**
 * An version of `TabDataSchema` which uses `TabDataExtended`
 *
 * @export
 * @interface TabDataSchemaExtended
 */
export interface TabDataSchemaExtended {
  [key: string]: TabDataExtended;
}

export type DetachedWindowLayout = { [key: string]: TabData };
