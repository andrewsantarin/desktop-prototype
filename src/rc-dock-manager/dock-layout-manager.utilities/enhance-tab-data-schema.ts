import { TabDataSchema, TabDataOptions } from '../dock-layout-manager.types';


/**
 * Enhance tab data schema with additional generic attribute options.
 *
 * @export
 *
 * @param {TabDataSchema} tabDataSchema Tab data lookup schema
 * @param {TabDataOptions} options Attributes to apply to all tab base objects
 *
 * @returns {TabDataSchema} A new tab data schema object with the additional attributes
 */
export const enhanceTabDataSchema = function enhanceTabDataSchema(
  tabDataSchema: TabDataSchema,
  options: TabDataOptions
): TabDataSchema {
  return Object.keys(tabDataSchema).reduce((lookup: TabDataSchema, key: string) => {
    lookup[key] = Object.assign(
      {},
      tabDataSchema[key],
      options,
    );
    return lookup;
  }, {} as TabDataSchema);
}
