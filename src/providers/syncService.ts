import type { NotesRepository } from './notesRepository';
import type { DriveService } from './driveService';

export class SyncService {
  constructor(notesRepository: NotesRepository, driveService: DriveService) {
    this.#notesRepository = notesRepository;
    this.#driveService = driveService;
  }

  #notesRepository: NotesRepository;
  #driveService: DriveService;

  async sync() {
    await this.#pushChanges();
    await this.#pullChanges();
  }

  async #pushChanges() {
    const changes = await this.#notesRepository.getDirtyNotes();
    for (const note of changes) {
      if (note.isDeleted) {
        // TODO: delete from drive
      } else {
        if (note.graphId) {
          await this.#driveService.updateContent(note.graphId, note.content || '');
          await this.#notesRepository.updateNote({ ...note, isDirty: 0 });
        }
      }
    }
  }

  async #pullChanges() {
    const fileChanges = await this.#driveService.getFilesDelta();
    if (!fileChanges.data.length) {
      return;
    }

    const appRoot = await this.#driveService.getAppRoot();
    for (const item of fileChanges.data) {
      if (item.id === appRoot.id) {
        continue;
      }

      const note = await this.#notesRepository.getByGraphId(item.id!);
      if ('deleted' in item) {
        if (note) {
          this.#notesRepository.deleteNote(note.id);
        }

        continue;
      }

      const content = item.file ? await this.#driveService.getContent(item.id!) : null;

      let parentId = 0;
      if (item.parentReference && item.parentReference.id !== appRoot.id) {
        const parentNote = await this.#notesRepository.getByGraphId(item.parentReference.id!);
        parentId = parentNote?.id ?? 0;
      }

      if (!note) {
        await this.#notesRepository.createNote({
          id: 0,
          graphId: item.id!,
          parentId,
          name: item.name!,
          content: content ?? '',
          isDirty: 0,
          isDeleted: 0,
          createdDateTime: item.createdDateTime!,
          lastModifiedDateTime: item.lastModifiedDateTime!
        });

        continue;
      }

      await this.#notesRepository.updateNote({
        ...note,
        parentId,
        name: item.name!,
        content: content ?? note.content,
        isDirty: 0,
        isDeleted: 0,
        createdDateTime: item.createdDateTime!,
        lastModifiedDateTime: item.lastModifiedDateTime!
      });
    }

    this.#driveService.saveDriveDeltaLink(fileChanges.deltaLink);
  }
}
