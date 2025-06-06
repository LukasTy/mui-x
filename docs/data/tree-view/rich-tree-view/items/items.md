---
productId: x-tree-view
components: RichTreeView, TreeItem
packageName: '@mui/x-tree-view'
githubLabel: 'scope: tree view'
waiAria: https://www.w3.org/WAI/ARIA/apg/patterns/treeview/
---

# Rich Tree View - Items

<p class="description">Pass data to your Tree View.</p>

## Basic usage

The items can be defined with the `items` prop, which expects an array of objects.

:::warning
The `items` prop should keep the same reference between two renders except if you want to apply new items.
Otherwise, the Tree View will re-generate its entire structure.
:::

{{"demo": "BasicRichTreeView.js"}}

## Item identifier

Each item must have a unique identifier.

This identifier is used internally to identify the item in the various models and to track the item across updates.

By default, the Rich Tree View component looks for a property named `id` in the data set to get that identifier:

```tsx
const ITEMS = [{ id: 'tree-view-community' }];

<RichTreeView items={ITEMS} />;
```

If the item's identifier is not called `id`, then you need to use the `getItemId` prop to tell the Rich Tree View component where it is located.

The following demo shows how to use `getItemId` to grab the unique identifier from a property named `internalId`:

```tsx
const ITEMS = [{ internalId: 'tree-view-community' }];

function getItemId(item) {
  return item.internalId;
}

<RichTreeView items={ITEMS} getItemId={getItemId} />;
```

{{"demo": "GetItemId.js", "defaultCodeOpen": false}}

:::warning
Just like the `items` prop, the `getItemId` function should keep the same JavaScript reference between two renders.
Otherwise, the Tree View will re-generate its entire structure.

It could be achieved by either defining the prop outside the component scope or by memoizing using the `React.useCallback` hook if the function reuses something from the component scope.
:::

## Item label

Each item must have a label which does not need to be unique.

By default, the Rich Tree View component looks for a property named `label` in the data set to get that label:

```tsx
const ITEMS = [{ label: '@mui/x-tree-view' }];

<RichTreeView items={ITEMS} />;
```

If the item's label is not called `label`, then you need to use the `getItemLabel` prop to tell the Rich Tree View component where it's located:

The following demo shows how to use `getItemLabel` to grab the unique identifier from a property named `name`:

```tsx
const ITEMS = [{ name: '@mui/x-tree-view' }];

function getItemLabel(item) {
  return item.name;
}

<RichTreeView items={ITEMS} getItemLabel={getItemLabel} />;
```

{{"demo": "GetItemLabel.js", "defaultCodeOpen": false}}

:::warning
Just like the `items` prop, the `getItemLabel` function should keep the same JavaScript reference between two renders.
Otherwise, the Tree View will re-generate its entire structure.

It could be achieved by either defining the prop outside the component scope or by memoizing using the `React.useCallback` hook if the function reuses something from the component scope.
:::

:::warning
Unlike the Simple Tree View component, the Rich Tree View component only supports string labels, you cannot pass React nodes to it.
:::

## Item children

Each item can contain children, which are rendered as nested nodes in the tree.

By default, the Rich Tree View component looks for a property named `children` in the data set to get the children:

```tsx
const ITEMS = [
  { children: [{ id: 'tree-view-community', label: '@mui/x-tree-view' }] },
];

<RichTreeView items={ITEMS} />;
```

If the item's children are not called `children`, then you need to use the `getItemChildren` prop to tell the Rich Tree View component where they're located:

The following demo shows how to use `getItemChildren` to grab the children from a property named `nodes`:

```tsx
const ITEMS = [
  { nodes: [{ id: 'tree-view-community', label: '@mui/x-tree-view' }] },
];

function getItemChildren(item) {
  return item.nodes;
}

<RichTreeView items={ITEMS} getItemChildren={getItemChildren} />;
```

{{"demo": "GetItemChildren.js", "defaultCodeOpen": false}}

:::warning
Just like the `items` prop, the `getItemChildren` function should keep the same JavaScript reference between two renders.
Otherwise, the Tree View will re-generate its entire structure.

It could be achieved by either defining the prop outside the component scope or by memoizing using the `React.useCallback` hook if the function reuses something from the component scope.
:::

## Disabled items

Use the `isItemDisabled` prop on the Rich Tree View to disable interaction and focus on a Tree Item:

```tsx
function isItemDisabled(item) {
  return item.disabled ?? false;
}

<RichTreeView isItemDisabled={isItemDisabled} />;
```

{{"demo": "DisabledPropItem.js", "defaultCodeOpen": false}}

:::warning
Just like the `items` prop, the `isItemDisabled` function should keep the same JavaScript reference between two renders.
Otherwise, the Tree View will re-generate its entire structure.

This can be achieved by either defining the prop outside the component scope or by memoizing using the `React.useCallback` hook if the function reuses something from the component scope.
:::

### Focus disabled items

Use the `disabledItemsFocusable` prop to control if disabled Tree Items can be focused.

When this prop is set to false:

- Navigating with keyboard arrow keys will not focus the disabled items, and the next non-disabled item will be focused instead.
- Typing the first character of a disabled item's label will not move the focus to it.
- Mouse or keyboard interaction will not expand/collapse disabled items.
- Mouse or keyboard interaction will not select disabled items.
- <kbd class="key">Shift</kbd> + arrow keys will skip disabled items, and the next non-disabled item will be selected instead.
- Programmatic focus will not focus disabled items.

When it's set to true:

- Navigating with keyboard arrow keys will focus disabled items.
- Typing the first character of a disabled item's label will move focus to it.
- Mouse or keyboard interaction will not expand/collapse disabled items.
- Mouse or keyboard interaction will not select disabled items.
- <kbd class="key">Shift</kbd> + arrow keys will not skip disabled items, but the disabled item will not be selected.
- Programmatic focus will focus disabled items.

{{"demo": "DisabledItemsFocusable.js", "defaultCodeOpen": false}}

## Track item clicks

Use the `onItemClick` prop to track the clicked item:

{{"demo": "OnItemClick.js"}}

## Imperative API

:::success
To use the `apiRef` object, you need to initialize it using the `useTreeViewApiRef` hook as follows:

```tsx
const apiRef = useTreeViewApiRef();

return <RichTreeView apiRef={apiRef} items={ITEMS}>;
```

When your component first renders, `apiRef` will be `undefined`.
After this initial render, `apiRef` holds methods to interact imperatively with the Tree View.
:::

### Get an item by ID

Use the `getItem` API method to get an item by its ID.

```ts
const item = apiRef.current.getItem(
  // The id of the item to retrieve
  itemId,
);
```

{{"demo": "ApiMethodGetItem.js", "defaultCodeOpen": false}}

### Get an item's DOM element by ID

Use the `getItemDOMElement()` API method to get an item's DOM element by its ID.

```ts
const itemElement = apiRef.current.getItemDOMElement(
  // The id of the item to get the DOM element of
  itemId,
);
```

{{"demo": "ApiMethodGetItemDOMElement.js", "defaultCodeOpen": false}}

### Get the current item tree

Use the `getItemTree` API method to get the current item tree.

```ts
const itemTree = apiRef.current.getItemTree();
```

{{"demo": "ApiMethodGetItemTree.js", "defaultCodeOpen": false}}

:::info
This method is mostly useful when the Tree View has some internal updates on the items.
For now, the only features causing updates on the items is the [re-ordering](/x/react-tree-view/rich-tree-view/ordering/).
:::

### Get an item's children by ID

Use the `getItemOrderedChildrenIds` API method to get an item's children by its ID.

```ts
const childrenIds = apiRef.current.getItemOrderedChildrenIds(
  // The id of the item to retrieve the children from
  itemId,
);
```

{{"demo": "ApiMethodGetItemOrderedChildrenIds.js", "defaultCodeOpen": false}}

### Get an item's parent id

Use the `getParentId()` API method to get the id of the item's parent.

```ts
publicAPI.getParentId(itemId);
```

{{"demo": "GetParentIdPublicAPI.js", "defaultCodeOpen": false}}

### Imperatively disable an item

Use the `setIsItemDisabled` API method to imperatively toggle the items's disabled state.

```ts
publicAPI.setIsItemDisabled({
  // The id of the item to disable or enable
  itemId,
  // If `true` the item will be disabled
  // If `false` the item will be enabled
  // If not defined, the item's new disable status will be the opposite of its current one
  shouldBeDisabled: true,
});
```

{{"demo": "DisableTreeItemPublicAPI.js", "defaultCodeOpen": false}}
