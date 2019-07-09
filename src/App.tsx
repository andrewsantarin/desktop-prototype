import React, { CSSProperties, Component, createRef } from 'react';
import { PanelData, DockContext } from 'rc-dock';
import { DockLayoutManager } from 'rc-dock-manager/DockLayoutManager';
import { PanelCloseButton } from 'rc-dock-manager/PanelCloseButton';
import { TabDataSchema, TabGroupSchema, TabDataOptions } from 'rc-dock-manager/dock-layout-manager.types';
import { enhanceTabDataSchema } from 'rc-dock-manager/dock-layout-manager.utilities';

import { safeInvokeWithRef, safeInvoke } from 'lib';
import { isNullOrUndefined } from 'util';
import { Test, KEY as TEST } from 'Test';


type AppProps = {
}

type AppState = {
}

export class App extends Component<AppProps, AppState> {
  private dockLayoutManager = createRef<DockLayoutManager>();

  // #region tab definitions
  private tabDataSchema: TabDataSchema = {
    [TEST]: {
      title: 'Test',
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
      position: 'absolute',
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
        defaultActivePanelId="+1"
        defaultLayout={{
          dockbox: {
            id: '+1',
            mode: 'horizontal',
            children: [
              {
                id: '+0',
                tabs: [
                  {
                    id: `${TEST}#1`,
                  },
                  {
                    id: `${TEST}#2`,
                  },
                ],
              },
            ],
          },
        }}
        dropMode="default"
        style={style}
        tabDataSchema={tabDataSchema}
      />
    );
  }
}
