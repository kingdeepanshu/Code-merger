import { FileEntry, MergeOptions } from '../types';

export const generateId = (): string => Math.random().toString(36).substring(2, 9);

export const readFileContent = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        resolve(event.target.result as string);
      } else {
        reject(new Error("Empty file content"));
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsText(file);
  });
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const getSeparator = (filename: string, style: MergeOptions['separatorStyle']) => {
  const lineLength = 50;
  const name = ` FILE: ${filename} `;
  let char = '-';
  
  if (style === 'hash') char = '#';
  if (style === 'slash') char = '/';

  const padding = Math.max(0, Math.floor((lineLength - name.length) / 2));
  const line = char.repeat(padding);
  const fullLine = char.repeat(lineLength);
  
  return `\n${fullLine}\n${line}${name}${line}\n${fullLine}\n`;
};

export const mergeFiles = async (files: FileEntry[], options: MergeOptions): Promise<string> => {
  const contents = await Promise.all(
    files.map(async (entry) => {
      try {
        const content = await readFileContent(entry.file);
        const header = options.includeSeparator 
          ? getSeparator(entry.file.name, options.separatorStyle)
          : `\n\n// --- ${entry.file.name} ---\n`;
          
        return `${header}\n${content}`;
      } catch (e) {
        console.error(`Failed to read ${entry.file.name}`, e);
        return `\n// !!! ERROR READING FILE: ${entry.file.name} !!!\n`;
      }
    })
  );

  return contents.join('\n');
};
