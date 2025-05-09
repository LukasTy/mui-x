import { TreeViewItemId } from '../../../models';
import { TreeViewItemMeta } from '../../models';
import { createSelector, TreeViewRootSelector } from '../../utils/selectors';
import { UseTreeViewItemsSignature } from './useTreeViewItems.types';
import { isItemDisabled, TREE_VIEW_ROOT_PARENT_ID } from './useTreeViewItems.utils';

const selectorTreeViewItemsState: TreeViewRootSelector<UseTreeViewItemsSignature> = (state) =>
  state.items;

/**
 * Get the loading state for the Tree View.
 * @param {TreeViewState<[UseTreeViewItemsSignature]>} state The state of the tree view.
 * @returns {boolean} The loading state for the Tree View.
 */
export const selectorIsTreeViewLoading = createSelector(
  selectorTreeViewItemsState,
  (items) => items.loading,
);
/**
 * Get the error state for the Tree View.
 * @param {TreeViewState<[UseTreeViewItemsSignature]>} state The state of the tree view.
 * @returns {boolean} The error state for the Tree View.
 */
export const selectorGetTreeViewError = createSelector(
  selectorTreeViewItemsState,
  (items) => items.error,
);

/**
 * Get the meta-information of all items.
 * @param {TreeViewState<[UseTreeViewItemsSignature]>} state The state of the tree view.
 * @returns {TreeViewItemMetaLookup} The meta-information of all items.
 */
export const selectorItemMetaLookup = createSelector(
  selectorTreeViewItemsState,
  (items) => items.itemMetaLookup,
);

const EMPTY_CHILDREN: TreeViewItemId[] = [];

/**
 * Get the ordered children ids of a given item.
 * @param {TreeViewState<[UseTreeViewItemsSignature]>} state The state of the tree view.
 * @param {TreeViewItemId} itemId The id of the item to get the children of.
 * @returns {TreeViewItemId[]} The ordered children ids of the item.
 */
export const selectorItemOrderedChildrenIds = createSelector(
  [selectorTreeViewItemsState, (_, itemId: string | null) => itemId],
  (itemsState, itemId) =>
    itemsState.itemOrderedChildrenIdsLookup[itemId ?? TREE_VIEW_ROOT_PARENT_ID] ?? EMPTY_CHILDREN,
);

/**
 * Get the model of an item.
 * @param {TreeViewState<[UseTreeViewItemsSignature]>} state The state of the tree view.
 * @param {TreeViewItemId} itemId The id of the item to get the model of.
 * @returns {R} The model of the item.
 */
export const selectorItemModel = createSelector(
  [selectorTreeViewItemsState, (_, itemId: string) => itemId],
  (itemsState, itemId) => itemsState.itemModelLookup[itemId],
);

/**
 * Get the meta-information of an item.
 * Check the `TreeViewItemMeta` type for more information.
 * @param {TreeViewState<[UseTreeViewItemsSignature]>}
 * @param {TreeViewItemId} itemId The id of the item to get the meta-information of.
 * @returns {TreeViewItemMeta | null} The meta-information of the item.
 */
export const selectorItemMeta = createSelector(
  [selectorItemMetaLookup, (_, itemId: string | null) => itemId],
  (itemMetaLookup, itemId) =>
    (itemMetaLookup[itemId ?? TREE_VIEW_ROOT_PARENT_ID] ?? null) as TreeViewItemMeta | null,
);

/**
 * Check if an item is disabled.
 * @param {TreeViewState<[UseTreeViewItemsSignature]>} state The state of the tree view.
 * @param {TreeViewItemId} itemId The id of the item to check.
 * @returns {boolean} `true` if the item is disabled, `false` otherwise.
 */
export const selectorIsItemDisabled = createSelector(
  [selectorItemMetaLookup, (_, itemId: string) => itemId],
  isItemDisabled,
);

/**
 * Get the index of an item in its parent's children.
 * @param {TreeViewState<[UseTreeViewItemsSignature]>} state The state of the tree view.
 * @param {TreeViewItemId} itemId The id of the item to get the index of.
 * @returns {number} The index of the item in its parent's children.
 */
export const selectorItemIndex = createSelector(
  [selectorTreeViewItemsState, selectorItemMeta],
  (itemsState, itemMeta) => {
    if (itemMeta == null) {
      return -1;
    }

    const parentIndexes =
      itemsState.itemChildrenIndexesLookup[itemMeta.parentId ?? TREE_VIEW_ROOT_PARENT_ID];
    return parentIndexes[itemMeta.id];
  },
);

/**
 * Get the id of the parent of an item.
 * @param {TreeViewState<[UseTreeViewItemsSignature]>} state The state of the tree view.
 * @param {TreeViewItemId} itemId The id of the item to get the parent id of.
 * @returns {TreeViewItemId | null} The id of the parent of the item.
 */
export const selectorItemParentId = createSelector(
  [selectorItemMeta],
  (itemMeta) => itemMeta?.parentId ?? null,
);

/**
 * Get the depth of an item (items at the root level have a depth of 0).
 * @param {TreeViewState<[UseTreeViewItemsSignature]>} state The state of the tree view.
 * @param {TreeViewItemId} itemId The id of the item to get the depth of.
 * @returns {number} The depth of the item.
 */
export const selectorItemDepth = createSelector(
  [selectorItemMeta],
  (itemMeta) => itemMeta?.depth ?? 0,
);

/**
 * Check if the disabled items are focusable.
 * @param {TreeViewState<[UseTreeViewItemsSignature]>} state The state of the tree view.
 * @returns {boolean} Whether the disabled items are focusable.
 */
export const selectorDisabledItemFocusable = createSelector(
  [selectorTreeViewItemsState],
  (itemsState) => itemsState.disabledItemsFocusable,
);

export const selectorCanItemBeFocused = createSelector(
  [selectorDisabledItemFocusable, selectorIsItemDisabled],
  (disabledItemsFocusable, isDisabled) => {
    if (disabledItemsFocusable) {
      return true;
    }

    return !isDisabled;
  },
);
