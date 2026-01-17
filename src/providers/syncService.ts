import type { NotesRepository } from './notesRepository';
import type { DriveService } from './driveService';
import type { DriveItem } from '@microsoft/microsoft-graph-types';

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
        if (note.graphId) {
          await this.#driveService.deleteItem(note.graphId);
        }

        await this.#notesRepository.deleteNote(note.id);
      } else {
        if (note.graphId) {
          await this.#driveService.updateContent(note.graphId, note.content || '');
          await this.#notesRepository.updateNote({ ...note, isDirty: 0 });
        } else {
          const parent = await this.#notesRepository.getById(note.parentId);
          if (!parent || !parent.graphId) {
            continue; // TODO: repeat, when parent is created
          }

          let item: DriveItem;
          if (note.content !== null) {
            item = await this.#driveService.createFile(parent.graphId, note.name, note.content);
          } else {
            item = await this.#driveService.createFolder(parent.graphId, note.name);
          }

          await this.#notesRepository.updateNote({ ...note, graphId: item.id!, isDirty: 0 });
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
          await this.#notesRepository.deleteNote(note.id);
        }

        continue;
      }

      const content =
        item.file && item.file.mimeType === 'text/markdown' ? await this.#driveService.getContent(item.id!) : null;

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
          type: item.folder ? 'folder' : 'file',
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
