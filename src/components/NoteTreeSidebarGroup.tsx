import { useState } from 'react';
import { Link, useLoaderData, useRouteContext } from '@tanstack/react-router';
import { ChevronRight, File, Folder } from 'lucide-react';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem
} from './ui/sidebar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { Skeleton } from './ui/skeleton';
import type { FC } from 'react';
import type { DriveItem } from '@microsoft/microsoft-graph-types';
import type { Tree, TreeNode } from '@/model/tree';
import { TREE_ROOT, compareByTypeAndName, driveItemToTreeNode, isVisibleFolderOrNote } from '@/model/tree';

const NoteTree: FC<{ tree: Tree; node: TreeNode; onOpen: (id: string) => void }> = ({ tree, node, onOpen }) => {
  if (node.type === 'file') {
    return (
      <SidebarMenuButton asChild>
        <Link to="/$id" params={{ id: node.id }}>
          <File />
          <span>{node.name}</span>
        </Link>
      </SidebarMenuButton>
    );
  }

  const childNodes = tree[node.id];

  const handleOpenChange = (open: boolean) => {
    if (open && !childNodes) {
      onOpen(node.id);
    }
  };

  return (
    <SidebarMenuItem>
      <Collapsible
        className="group/collapsible [&[data-state=open]>button>svg:first-child]:rotate-90"
        onOpenChange={handleOpenChange}
      >
        <CollapsibleTrigger asChild>
          <SidebarMenuButton>
            <ChevronRight className="transition-transform" />
            <Folder />
            <span>{node.name}</span>
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {!childNodes && new Array(node.childCount).fill(0).map((_, index) => (
              <SidebarMenuSubItem key={index}>
                <Skeleton className="h-8 w-full" />
              </SidebarMenuSubItem>
            ))}
            {childNodes?.map((childNode) => (
              <NoteTree key={childNode.id} tree={tree} node={childNode} onOpen={onOpen} />
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </Collapsible>
    </SidebarMenuItem>
  );
};

const NoteTreeSidebarGroup: FC = () => {
  const { graph } = useRouteContext({ from: '__root__' });
  const { items } = useLoaderData({ from: '__root__' });
  const [tree, setTree] = useState<Tree>({
    [TREE_ROOT]: items.filter(isVisibleFolderOrNote).sort(compareByTypeAndName).map(driveItemToTreeNode)
  });

  const handleOpen = async (id: string) => {
    if (tree[id]) {
      return;
    }

    try {
      const response = await graph.api(`/me/drive/items/${id}/children`).get();
      const children: Array<DriveItem> = response.value || [];
      const nodes = children.filter(isVisibleFolderOrNote).sort(compareByTypeAndName).map(driveItemToTreeNode);
      setTree((prevTree) => ({ ...prevTree, [id]: nodes }));
    } catch (error) {
      console.error('Error loading tree nodes:', error);
    }
  };

  const rootNodes = tree[TREE_ROOT] || [];

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Notes</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {rootNodes.map((node) => (
            <NoteTree key={node.id} tree={tree} node={node} onOpen={handleOpen} />
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};

export default NoteTreeSidebarGroup;
