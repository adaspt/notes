import { Store } from '@tanstack/react-store';

export interface Bookmark {
  id: string;
  title: string;
}

export const bookmarkStore = new Store<Array<Bookmark>>(JSON.parse(localStorage.getItem('bookmarks') || '[]'));

bookmarkStore.subscribe((bookmarks) => localStorage.setItem('bookmarks', JSON.stringify(bookmarks.currentVal)));

export const addBookmark = (bookmark: Bookmark) => {
  bookmarkStore.setState((bookmarks) => [...bookmarks, bookmark]);
};

export const removeBookmark = (id: string) => {
  bookmarkStore.setState((bookmarks) => bookmarks.filter((bookmark) => bookmark.id !== id));
};
