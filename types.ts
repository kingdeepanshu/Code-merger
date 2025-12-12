export interface FileEntry {
  id: string;
  file: File;
  content?: string;
  error?: string;
}

export interface MergeOptions {
  includeSeparator: boolean;
  separatorStyle: 'dash' | 'hash' | 'slash';
}

export type SortMethod = 'name' | 'size' | 'type' | 'none';
