import type { GraphClient } from "@/lib/graph/graph-client";
import { z } from "zod";

export interface DriveItem {
  id: string;
  name: string;
  parentId: string | null;
  isFile: boolean;
  isFolder: boolean;
  updatedAt: Date;
  removed: boolean;
}

export interface DriveDeltaPage {
  value: DriveItem[];
  nextLink: string | null;
  deltaLink: string | null;
}

export interface AppRoot {
  id: string;
}

const graphDriveItemSchema = z
  .object({
    id: z.string(),
    name: z.string().optional(),
    parentReference: z.object({ id: z.string().optional() }).optional(),
    file: z.looseObject({}).optional(),
    folder: z.looseObject({}).optional(),
    lastModifiedDateTime: z.string().optional(),
    "@removed": z.object({ reason: z.string().optional() }).optional(),
  })
  .transform(
    (raw): DriveItem => ({
      id: raw.id,
      name: raw.name ?? "",
      parentId: raw.parentReference?.id ?? null,
      isFile: raw.file !== undefined,
      isFolder: raw.folder !== undefined,
      updatedAt: raw.lastModifiedDateTime ? new Date(raw.lastModifiedDateTime) : new Date(),
      removed: raw["@removed"] !== undefined,
    }),
  );

const graphDriveDeltaPageSchema = z
  .object({
    value: z.array(graphDriveItemSchema),
    "@odata.nextLink": z.string().optional(),
    "@odata.deltaLink": z.string().optional(),
  })
  .transform(
    (raw): DriveDeltaPage => ({
      value: raw.value,
      nextLink: raw["@odata.nextLink"] ?? null,
      deltaLink: raw["@odata.deltaLink"] ?? null,
    }),
  );

const graphAppRootSchema = z
  .object({ id: z.string() })
  .transform((raw): AppRoot => ({ id: raw.id }));

const graphDriveItemResponseSchema = graphDriveItemSchema.transform((item) => {
  if (item.removed) {
    throw new Error("Unexpected @removed in drive item response");
  }

  return item;
});

export async function getAppRoot(graph: GraphClient): Promise<AppRoot> {
  return await graph.get("/me/drive/special/approot", graphAppRootSchema);
}

export async function filesDelta(
  graph: GraphClient,
  deltaLink: string | null,
): Promise<DriveDeltaPage> {
  return await graph.get(deltaLink ?? "/me/drive/special/approot/delta", graphDriveDeltaPageSchema);
}

export async function downloadFile(graph: GraphClient, itemId: string): Promise<string> {
  return await graph.getText(`/me/drive/items/${encodeURIComponent(itemId)}/content`);
}

export async function uploadFile(
  graph: GraphClient,
  parentPath: string[],
  name: string,
  content: string,
): Promise<DriveItem> {
  const path = [...parentPath, name].map(encodePathSegment).join("/");
  return await graph.putText(
    `/me/drive/special/approot:/${path}:/content`,
    graphDriveItemResponseSchema,
    content,
  );
}

export async function renameItem(
  graph: GraphClient,
  itemId: string,
  newName: string,
): Promise<DriveItem> {
  return await graph.patch(
    `/me/drive/items/${encodeURIComponent(itemId)}`,
    graphDriveItemResponseSchema,
    { name: newName },
  );
}

export async function deleteItem(graph: GraphClient, itemId: string): Promise<void> {
  await graph.delete(`/me/drive/items/${encodeURIComponent(itemId)}`);
}

const encodePathSegment = (segment: string) => encodeURIComponent(segment).replaceAll("%20", " ");
