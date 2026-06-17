import { z } from "zod";

const graphDateTimeTimeZoneSchema = z.object({
  dateTime: z.string(),
  timeZone: z.string().optional(),
});

export const graphTodoTaskListSchema = z.object({
  id: z.string().min(1),
  displayName: z.string().min(1),
  isOwner: z.boolean().optional(),
  isShared: z.boolean().optional(),
  wellknownListName: z
    .enum(["none", "defaultList", "flaggedEmails", "unknownFutureValue"])
    .optional(),
});

export const graphTodoTaskSchema = z.object({
  id: z.string().min(1),
  title: z.string().nullish(),
  body: z
    .object({
      content: z.string().nullish(),
      contentType: z.string().optional(),
    })
    .nullish(),
  dueDateTime: graphDateTimeTimeZoneSchema.nullish(),
  importance: z.enum(["low", "normal", "high"]).optional(),
  status: z
    .enum(["notStarted", "inProgress", "completed", "waitingOnOthers", "deferred"])
    .optional(),
  lastModifiedDateTime: z.string().nullish(),
});

export const graphTodoTaskDeltaItemSchema = graphTodoTaskSchema.extend({
  "@removed": z
    .object({
      reason: z.string().optional(),
    })
    .passthrough()
    .optional(),
});

export const graphDriveItemSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).optional(),
  eTag: z.string().optional(),
  webUrl: z.string().optional(),
  lastModifiedDateTime: z.string().nullish(),
  parentReference: z
    .object({
      driveId: z.string().optional(),
      id: z.string().optional(),
      path: z.string().optional(),
    })
    .optional(),
  file: z.object({}).passthrough().optional(),
  folder: z
    .object({
      childCount: z.number().optional(),
    })
    .passthrough()
    .optional(),
  deleted: z.object({}).passthrough().optional(),
});

export type GraphTodoTaskList = z.infer<typeof graphTodoTaskListSchema>;
export type GraphTodoTask = z.infer<typeof graphTodoTaskSchema>;
export type GraphTodoTaskDeltaItem = z.infer<typeof graphTodoTaskDeltaItemSchema>;
export type GraphDriveItem = z.infer<typeof graphDriveItemSchema>;
