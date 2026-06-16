export {
  acquireMicrosoftGraphToken,
  createMicrosoftAuthClient,
  createMicrosoftAuthConfig,
  getActiveMicrosoftAccount,
  getMicrosoftAuthEnvironment,
  initializeMicrosoftAuthSession,
  microsoftGraphScopes,
  signInWithMicrosoft,
  type MicrosoftAuthEnvironment,
  type MicrosoftAuthSession,
  type MicrosoftGraphScope,
} from "./auth";
export {
  createGraphClient,
  GraphApiError,
  GraphClient,
  graphCollectionResponseSchema,
  readPagedGraphCollection,
  readPagedGraphCollectionWithDelta,
  type GraphClientOptions,
  type PagedGraphCollectionResult,
} from "./graph-client";
export {
  graphDateTimeTimeZoneSchema,
  graphDriveItemSchema,
  graphTodoTaskDeltaItemSchema,
  graphTodoTaskListSchema,
  graphTodoTaskSchema,
  type GraphDriveItem,
  type GraphTodoTask,
  type GraphTodoTaskDeltaItem,
  type GraphTodoTaskList,
} from "./graph-schemas";
export { loadInitialMicrosoftData, type InitialMicrosoftLoadResult } from "./initial-load";
export {
  parseNoteFileContent,
  syncNotesWithDelta,
  type NoteDeltaSyncResult,
} from "./note-delta-sync";
export { pushPendingNoteWrites, serializeNoteFileContent, upsertOneDriveNote } from "./notes";
export { syncTodoTasksWithDelta, type TodoTaskDeltaSyncResult } from "./task-delta-sync";
export {
  deleteDriveItem,
  getDriveItemContent,
  getOneDriveAppRoot,
  hasDriveItemName,
  isProjectFolder,
  isSupportedNoteFile,
  listDriveItemDelta,
  putDriveItemChildContent,
  putDriveItemContent,
} from "./onedrive";
export {
  discoverDefaultTodoTaskList,
  listTodoTaskLists,
  normalizeTodoTask,
  pushPendingTaskWrites,
  toGraphTodoTaskPayload,
  upsertTodoTask,
} from "./tasks";
