import * as React from 'react';
import { SxProps } from '@mui/system';
import { Theme } from '@mui/material/styles';
import { SlotComponentPropsFromProps } from '@mui/x-internals/types';
import { TransitionProps } from '@mui/material/transitions';
import { SlotComponentProps } from '@mui/utils/types';
import { UseTreeItemParameters, UseTreeItemStatus } from '../useTreeItem';
import { TreeItemClasses } from './treeItemClasses';
import { TreeItemIconSlotProps, TreeItemIconSlots } from '../TreeItemIcon';
import { TreeViewCancellableEventHandler } from '../models';

export interface TreeItemSlots extends TreeItemIconSlots {
  /**
   * The component that renders the root.
   * @default TreeItemRoot
   */
  root?: React.ElementType;
  /**
   * The component that renders the content of the item.
   * (e.g.: everything related to this item, not to its children).
   * @default TreeItemContent
   */
  content?: React.ElementType;
  /**
   * The component that renders the children of the item.
   * @default TreeItemGroupTransition
   */
  groupTransition?: React.ElementType;
  /**
   * The component that renders the icon.
   * @default TreeItemIconContainer
   */
  iconContainer?: React.ElementType;
  /**
   * The component that renders the item checkbox for selection.
   * @default TreeItemCheckbox
   */
  checkbox?: React.ElementType;
  /**
   * The component that renders the item label.
   * @default TreeItemLabel
   */
  label?: React.ElementType;
  /**
   * The component that renders the input to edit the label when the item is editable and is currently being edited.
   * @default TreeItemLabelInput
   */
  labelInput?: React.ElementType;
  /**
   * The component that renders the overlay when an item reordering is ongoing.
   * Warning: This slot is only useful when using the `<RichTreeViewPro />` component.
   * @default TreeItemDragAndDropOverlay
   */
  dragAndDropOverlay?: React.ElementType;
  /**
   * The component that is rendered when the item is in an error state.
   * Warning: This slot is only useful when using the `<RichTreeViewPro />` component is lazy loading is enabled.
   * @default TreeItemErrorContainer
   */
  errorIcon?: React.ElementType;
  /**
   * The component that is rendered when the item is in an loading state.
   * Warning: This slot is only useful when using the `<RichTreeViewPro />` component is lazy loading is enabled.
   * @default TreeItemLoadingContainer
   */
  loadingIcon?: React.ElementType;
}

export interface TreeItemSlotProps extends TreeItemIconSlotProps {
  root?: SlotComponentProps<'li', {}, {}>;
  content?: SlotComponentProps<'div', {}, {}>;
  groupTransition?: SlotComponentPropsFromProps<TransitionProps, {}, {}>;
  iconContainer?: SlotComponentProps<'div', {}, {}>;
  checkbox?: SlotComponentProps<'button', {}, {}>;
  label?: SlotComponentProps<'div', {}, {}>;
  labelInput?: SlotComponentProps<'input', {}, {}>;
  dragAndDropOverlay?: SlotComponentProps<'div', {}, {}>;
  errorIcon?: SlotComponentProps<'div', {}, {}>;
  loadingIcon?: SlotComponentProps<'div', {}, {}>;
}

export interface TreeItemProps
  extends Omit<UseTreeItemParameters, 'rootRef'>,
    Omit<React.HTMLAttributes<HTMLLIElement>, 'onFocus'> {
  className?: string;
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx?: SxProps<Theme>;
  /**
   * Override or extend the styles applied to the component.
   */
  classes?: Partial<TreeItemClasses>;
  /**
   * Overridable component slots.
   * @default {}
   */
  slots?: TreeItemSlots;
  /**
   * The props used for each component slot.
   * @default {}
   */
  slotProps?: TreeItemSlotProps;
  /**
   * This prop isn't supported.
   * Use the `onItemFocus` callback on the tree if you need to monitor an item's focus.
   */
  onFocus?: null;
  /**
   * Callback fired when the item root is blurred.
   */
  onBlur?: TreeViewCancellableEventHandler<React.FocusEvent<HTMLLIElement>>;
  /**
   * Callback fired when a key is pressed on the keyboard and the tree is in focus.
   */
  onKeyDown?: TreeViewCancellableEventHandler<React.KeyboardEvent<HTMLLIElement>>;
}

export interface TreeItemOwnerState extends Omit<TreeItemProps, 'disabled'>, UseTreeItemStatus {}
