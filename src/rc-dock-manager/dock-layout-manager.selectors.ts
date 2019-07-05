import { oc } from 'ts-optchain.macro';

import { TabDataSchema } from './dock-layout-manager.types';
import { createTabData } from './dock-layout-manager.utilities/create-layout-base';


export const selectTabDataFromTabDataSchema = function selectTabDataFromTabDataSchema(
  key: string,
  schema?: TabDataSchema
) {
  return oc(schema)[key](createTabData());
}
