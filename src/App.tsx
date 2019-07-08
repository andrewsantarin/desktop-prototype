import React, { CSSProperties, Component, createRef, Comp } from 'react';
import { PanelData, DockContext, LayoutBase } from 'rc-dock';
import { DockLayoutManager } from 'rc-dock-manager/DockLayoutManager';
import { PanelCloseButton } from 'rc-dock-manager/PanelCloseButton';
import { TabDataSchema, TabGroupSchema, TabDataOptions } from 'rc-dock-manager/dock-layout-manager.types';
import { getActiveIds, enhanceTabDataSchema } from 'rc-dock-manager/dock-layout-manager.utilities';

import { safeInvokeWithRef, safeInvoke } from 'lib';
import { isNullOrUndefined } from 'util';
import { Test, KEY as TEST } from 'Test';


interface AppProps {
}

interface AppState {
}

export class App extends Component<AppProps, AppState> {
  private dockLayoutManager = createRef<typeof DockLayoutManager>();

  // #region tab definitions
  private tabDataSchema: TabDataSchema = {
    [TEST]: {
      title: 'Quote Screen',
      content: (tab) => {
        return (
          <Test id={tab.id} />
        );
      },
    },
  };

  private tabGroupId: string = 'tabGroup';

  private tabGroupSchema: TabGroupSchema = {
    [this.tabGroupId]: {
      floatable: true,
      panelExtra: (panelData: PanelData, dockContext: DockContext) => (
        <PanelCloseButton
          onClosePanelButtonClick={this.handleClosePanelButtonClick(
            panelData,
            dockContext
          )}
        />
      ),
    },
  };

  private tabDataOptions: TabDataOptions = {
    cached: true,
    closable: true,
    group: this.tabGroupId,
  };
  // #endregion

  private handleAddTabClick = (tabKey: string, onSuccess?: (tabId: string) => void) => {
    safeInvokeWithRef(this.dockLayoutManager, (dockLayoutManager) => {
      const tabId = dockLayoutManager.addTabKeyToActivePanel(tabKey);

      if (isNullOrUndefined(tabId)) {
        return;
      }

      // Call whatever function is needed to work with the new tab ID after the new tab has been added.
      // e.g.: Dispatch an action carrying a custom payload, using the `tabId` as the destination's identifier.
      safeInvoke(onSuccess, tabId);
    });
  }

  private handleClosePanelButtonClick = (panelData: PanelData, dockContext: DockContext) => () => {
    dockContext.dockMove(panelData, null as any, 'remove');
  }

  render() {
    const style: CSSProperties = {
      position: "absolute",
      left: 10,
      top: 10,
      right: 10,
      bottom: 10
    };

    const tabDataSchema = enhanceTabDataSchema(
      this.tabDataSchema,
      this.tabDataOptions
    );

    return (
      <DockLayoutManager
        ref={this.dockLayoutManager}
        groups={this.tabGroupSchema}
        // defaultActivePanelId={layoutProps.activePanelId}
        // defaultLayout={layoutProps.layout}
        dropMode="edge"
        style={style}
        tabDataSchema={tabDataSchema}
      />
    );
  }
}
