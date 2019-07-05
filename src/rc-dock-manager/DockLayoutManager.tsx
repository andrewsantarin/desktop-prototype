import React, { forwardRef, useRef, useImperativeHandle, FunctionComponent, ComponentType, ComponentPropsWithRef } from 'react';
import { useMount } from 'react-use';
import { useAutoControlled } from 'react-auto-controlled';
import { DockLayout, LayoutBase, PanelBase, PanelData, TabData } from 'rc-dock';

import { safeInvoke } from 'lib';
import { DockLayoutProps } from './dock-layout-manager.types';
import { createLayoutBase } from './dock-layout-manager.utilities';


export interface DockLayoutManagerApi {
  
}

export interface DockLayoutManagerProps extends Omit<DockLayoutProps, 'onLayoutChange' | 'defaultLayout' | 'layout'> {
  // #region auto controlled props
  /**
   * Current active panel.
   *
   * @type {string}
   * @memberof DockLayoutManagerProps
   */
  activePanelId?: string;

  /**
   * Initial active panel.
   *
   * @type {string}
   * @memberof DockLayoutManagerProps
   */
  defaultActivePanelId?: string;

  /**
   * Current layout structure.
   *
   * @type {DockLayoutProps['layout']}
   * @memberof DockLayoutManagerProps
   */
  layout?: DockLayoutProps['layout'];

  /**
   * Initial layout structure.
   *
   * @type {LayoutBase}
   * @memberof DockLayoutManagerProps
   */
  defaultLayout?: LayoutBase;
  // #endregion

  // #region custom event handler methods
  /**
   * The layout change event.
   *
   * @param {LayoutBase} newLayout The next set of layout defintions after the change event.
   * @param {(string | null)} currentTabId The identifier of the tab which was affected by the change event.
   * @param {string} currentTabPanelId The identifier of the parent panel of the affected tab.
   *
   * @memberof DockLayoutManagerProps
   */
  onLayoutChange?: (newLayout: LayoutBase, currentTabId: string | null, currentTabPanelId: string) => void;

  /**
   * The layout load event.
   *
   * @param {LayoutBase} newLayout The next set of layout defintions after the change event.
   * @param {string} activePanelId The identifier of the currently active panel.
   *
   * @memberof DockLayoutManagerProps
   */
  onLayoutLoad?: (layout: LayoutBase, activePanelId: string) => void;
  // #endregion
}

export const DockLayoutManager = forwardRef<DockLayout, DockLayoutManagerProps>(function DockLayoutManager(props, ref) {
  const dockLayout = useRef<DockLayout>(null);

  const [ activePanelId, setActivePanelId ] = useAutoControlled('', {
    prop: props.activePanelId,
    defaultProp: props.defaultActivePanelId,
  });
  const [ layout, setLayout ] = useAutoControlled(createLayoutBase(), {
    prop: props.layout,
    defaultProp: props.defaultLayout,
  });

  useMount(() => {
    safeInvoke(props.onLayoutLoad, layout, activePanelId);
  });

  const handlePanelLoaded: DockLayoutManagerProps['afterPanelLoaded'] = undefined;
  const handlePanelSaved: DockLayoutManagerProps['afterPanelSaved'] = undefined;

  // https://codesandbox.io/s/kajitetsushi-exposed-component-api-nbu54
  // useImperativeHandle(
  //   ref,
  //   () => ({
  //     dockLayout,
  //   }),
  //   [
  //     dockLayout,
  //   ],
  // )

  // Ignore `defaultLayout`, `layout` from props.
  // Refer to the manager's internal `layout` state instead.
  // It should be able to govern itself without needing too much external control.
  const { style, groups, dropMode } = props;

  return (
    <DockLayout
      afterPanelLoaded={handlePanelLoaded}
      afterPanelSaved={handlePanelSaved}
      // loadTab={this.doLoadTab}
      // saveTab={this.doSaveTab}
      dropMode={dropMode}
      layout={layout}
      groups={groups}
      // onLayoutChange={this.handleLayoutChange}
      ref={dockLayout}
      style={style}
    />
  )
});
