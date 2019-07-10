import { PanelData, TabData } from 'rc-dock';
import { IWindowFeatures } from 'react-new-window';
import { isNullOrUndefined } from 'util';


export const createNewWindowFeatures = (tabData: TabData): IWindowFeatures => {
  const { parent: panelData } = tabData;

  if (isNullOrUndefined(panelData)) {
    const features: IWindowFeatures = {
      width: 600,
      height: 480,
    };

    return features;
  }

  const panelElement = document.querySelectorAll(`[data-dockid='${panelData.id!}']`)[0];

  type PositionMap = {
    x: keyof Pick<ClientRect, 'left'>;
    y: keyof Pick<ClientRect, 'top'>;
    w: keyof Pick<ClientRect, 'width'>;
    h: keyof Pick<ClientRect, 'height'>;
  }
  const positonMap: PositionMap = {
    w: 'width',
    h: 'height',
    x: 'left',
    y: 'top',
  };

  const features: IWindowFeatures = {
    width: 0,
    height: 0,
  };

  Object.keys(positonMap).forEach((key) => {
    const knownValue = panelData[key as keyof Pick<PanelData, 'x' | 'y'>];
    const positonMapKey = positonMap[key as keyof PositionMap];
    if (!isNullOrUndefined(knownValue)) {
      features[positonMapKey] = knownValue;
    } else {
      const rect = panelElement.getBoundingClientRect();
      features[positonMapKey] = rect[positonMapKey];
    }
  });

  return features;
};
