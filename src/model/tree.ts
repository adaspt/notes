import type { DriveItem } from "@microsoft/microsoft-graph-types";

export const TREE_ROOT = '';

export interface TreeNode {
  readonly id: string;
  readonly parentId: string | null;
  readonly name: string;
  readonly type: 'folder' | 'file';
}

export type Tree = { [key: string]: ReadonlyArray<TreeNode> | undefined };

export const isVisibleFolderOrNote = (item: DriveItem) => {
  const name = item.name ?? '';
  return (item.folder && !name.startsWith('.')) || (item.file && name.endsWith('.md'));
};

export const compareByTypeAndName = (a: DriveItem, b: DriveItem) => {
  if (a.folder && !b.folder) return -1; // Folders first
  if (!a.folder && b.folder) return 1; // Files after folders
  return (a.name ?? '').localeCompare(b.name ?? ''); // Sort by name
};

export const driveItemToTreeNode = (item: DriveItem): TreeNode => ({
  id: item.id ?? '',
  parentId: item.parentReference?.id ?? null,
  name: item.name ?? '',
  type: item.folder ? 'folder' : 'file'
});
