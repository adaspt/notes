import { readPagedGraphCollectionWithDelta, type GraphClient } from "./graph-client";
import { graphDriveItemSchema, type GraphDriveItem } from "./graph-schemas";

export async function getOneDriveAppRoot(client: Pick<GraphClient, "get">) {
  return client.get(
    "/me/drive/special/approot?$select=id,name,parentReference,lastModifiedDateTime",
    graphDriveItemSchema,
  );
}

export async function listDriveItemDelta(
  client: Pick<GraphClient, "get">,
  driveId: string,
  driveItemId: string,
) {
  return readPagedGraphCollectionWithDelta(
    client,
    `/drives/${encodeURIComponent(driveId)}/items/${encodeURIComponent(driveItemId)}/delta?$select=id,name,parentReference,lastModifiedDateTime,file,folder,deleted`,
    graphDriveItemSchema,
  );
}

export async function getDriveItemContent(
  client: Pick<GraphClient, "getText">,
  driveItemId: string,
) {
  return client.getText(`/me/drive/items/${encodeURIComponent(driveItemId)}/content`);
}

export async function deleteDriveItem(client: Pick<GraphClient, "delete">, driveItemId: string) {
  await client.delete(`/me/drive/items/${encodeURIComponent(driveItemId)}`);
}

export async function putDriveItemContent(
  client: Pick<GraphClient, "put">,
  driveItemId: string,
  content: string,
) {
  return client.put(
    `/me/drive/items/${encodeURIComponent(driveItemId)}/content`,
    graphDriveItemSchema,
    content,
    {
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
      },
    },
  );
}

export async function putDriveItemChildContent(
  client: Pick<GraphClient, "put">,
  parentDriveItemId: string,
  name: string,
  content: string,
) {
  return client.put(
    `/me/drive/items/${encodeURIComponent(parentDriveItemId)}:/${encodeURIComponent(name)}:/content`,
    graphDriveItemSchema,
    content,
    {
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
      },
    },
  );
}

export function isProjectFolder(item: GraphDriveItem) {
  return hasDriveItemName(item) && item.folder !== undefined && item.deleted === undefined;
}

export function isSupportedNoteFile(item: GraphDriveItem) {
  return (
    hasDriveItemName(item) &&
    item.file !== undefined &&
    item.deleted === undefined &&
    item.name.endsWith(".md")
  );
}

export function hasDriveItemName(item: GraphDriveItem): item is GraphDriveItem & { name: string } {
  return typeof item.name === "string" && item.name.length > 0;
}
