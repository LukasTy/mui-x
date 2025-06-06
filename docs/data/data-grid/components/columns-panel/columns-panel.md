---
productId: x-data-grid
components: ColumnsPanelTrigger
packageName: '@mui/x-data-grid'
githubLabel: 'scope: data grid'
---

# Data Grid - Columns Panel component 🚧

<p class="description">Customize the Data Grid's columns panel.</p>

:::warning
This component is incomplete.

Currently, the Columns Panel Trigger is the only part of the Columns Panel component available.
Future versions of the Columns Panel component will make it possible to compose each of its parts to create a custom columns panel.

In the meantime, it's still possible to deeply customize the panel's subcomponents using custom slots.
See [Custom subcomponents—Columns panel](/x/react-data-grid/components/#columns-panel) for more details.

:::

The columns panel is part of the [column visibility feature](/x/react-data-grid/column-visibility/) and is enabled by default.
Users can trigger the columns panel via the column menu, as well as from the toolbar when `showToolbar` is passed to the `<DataGrid />` component.

You can use the Columns Panel Trigger and [Toolbar](/x/react-data-grid/components/toolbar/) components when you need to customize the columns panel trigger, or when implementing a custom toolbar.

## Basic usage

The demo below shows how to add a columns panel trigger to a custom toolbar.

{{"demo": "GridColumnsPanelTrigger.js", "bg": "inline", "defaultCodeOpen": false}}

## Anatomy

```tsx
import { ColumnsPanelTrigger } from '@mui/x-data-grid';

<ColumnsPanelTrigger />;
```

### Columns Panel Trigger

`<ColumnsPanelTrigger />` is a button that opens and closes the columns panel.
It renders the `baseButton` slot.

## Custom elements

Use the `render` prop to replace default elements.
See [Components usage—Customization](/x/react-data-grid/components/usage/#customization) for more details, and [Toolbar—Custom elements demo](/x/react-data-grid/components/toolbar/#custom-elements) for an example of a custom Columns Panel Trigger.

## Accessibility

### ARIA

You must apply a text label or an `aria-label` attribute to the `<ColumnsPanelTrigger />`.
