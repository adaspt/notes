import type { GraphDriveService } from './graphDrive';
import type { NotesRepository } from './notesRepository';

export class SyncNotesService {
  constructor(notesRepository: NotesRepository, graphDriveService: GraphDriveService) {
    this.#notesRepository = notesRepository;
    this.#graphDriveService = graphDriveService;
  }

  #notesRepository: NotesRepository;
  #graphDriveService: GraphDriveService;

  #syncOperation: Promise<void> | null = null;

  sync() {
    if (this.#syncOperation) {
      return this.#syncOperation;
    }

    this.#syncOperation = this.#syncNotes().finally(() => {
      this.#syncOperation = null;
    });

    return this.#syncOperation;
  }

  async #syncNotes() {
    await this.#pushLocalChanges();
    await this.#pullChangesFromRemote();
  }

  async #pushLocalChanges() {
    const changes = await this.#notesRepository.getDirtyNotes();
    console.log(`Pushing ${changes.length} local changes to Graph Drive`, changes);

    for (const note of changes) {
      if (note.isDeleted) {
        if (note.graphId) {
          // await this.#graphDriveService.deleteFile(note.graphId);
        }
      } else {
        if (note.graphId) {
          await this.#graphDriveService.updateContent(note.graphId, note.content || '');
          await this.#notesRepository.updateNote({ ...note, isDirty: 0 });
        }
      }
    }
  }

  async #pullChangesFromRemote() {
    const graphFiles = await this.#graphDriveService.getFilesDelta();
    const appRoot = await this.#graphDriveService.getAppRoot();

    for (const driveItem of graphFiles.data) {
      if (driveItem.id === appRoot.id) {
        continue;
      }

      const note = await this.#notesRepository.getByGraphId(driveItem.id!);
      if ('deleted' in driveItem) {
        if (note) {
          await this.#notesRepository.deleteNote(note.id);
        }

        continue;
      }

      const driveContent = driveItem.file ? await this.#graphDriveService.getContent(driveItem.id!) : null;

      let parentId: number | null = null;
      if (driveItem.parentReference?.id !== appRoot.id) {
        parentId = (await this.#notesRepository.getByGraphId(driveItem.parentReference?.id || ''))?.id ?? null;
        if (!parentId) {
          console.warn(
            `Parent folder with Graph ID ${driveItem.parentReference?.id} not found for file ${driveItem.id}`
          );
        }
      }

      if (!note) {
        await this.#notesRepository.createNote({
          id: 0,
          graphId: driveItem.id!,
          parentId,
          name: driveItem.name!,
          content: driveContent,
          isDirty: 0,
          isDeleted: false,
          createdDateTime: driveItem.createdDateTime!,
          lastModifiedDateTime: driveItem.lastModifiedDateTime!
        });

        continue;
      }

      await this.#notesRepository.updateNote({
        ...note,
        parentId,
        name: driveItem.name!,
        content: driveContent,
        isDirty: 0,
        isDeleted: false,
        createdDateTime: driveItem.createdDateTime!,
        lastModifiedDateTime: driveItem.lastModifiedDateTime!
      });
    }

    this.#graphDriveService.saveDriveDeltaLink(graphFiles.deltaLink);
  }
}
