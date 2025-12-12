import React from 'react';
import { X, FileJson, FileType, FileCode2, FileText, GripVertical } from 'lucide-react';
import { FileEntry } from '../types';
import { formatFileSize } from '../utils/fileProcessing';

interface FileListProps {
  files: FileEntry[];
  onRemove: (id: string) => void;
  onClear: () => void;
}

const getFileIcon = (filename: string) => {
  const ext = filename.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'js':
    case 'jsx':
    case 'ts':
    case 'tsx':
    case 'java':
    case 'py':
    case 'c':
    case 'cpp':
      return <FileCode2 className="w-5 h-5 text-indigo-400" />;
    case 'json':
      return <FileJson className="w-5 h-5 text-amber-400" />;
    case 'html':
    case 'css':
      return <FileType className="w-5 h-5 text-cyan-400" />;
    case 'md':
    case 'txt':
      return <FileText className="w-5 h-5 text-emerald-400" />;
    default:
      return <FileText className="w-5 h-5 text-slate-400" />;
  }
};

const FileList: React.FC<FileListProps> = ({ files, onRemove, onClear }) => {
  if (files.length === 0) return null;

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between px-2">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
          Selected Files ({files.length})
        </h3>
        <button
          onClick={onClear}
          className="text-sm text-red-400 hover:text-red-300 hover:underline transition-colors"
        >
          Remove All
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto p-1 pr-2">
        {files.map((entry) => (
          <div
            key={entry.id}
            className="group flex items-center gap-3 bg-slate-900 border border-slate-800 p-3 rounded-lg hover:border-slate-600 transition-all duration-200 animate-in fade-in slide-in-from-bottom-2"
          >
            <div className="text-slate-600 cursor-grab active:cursor-grabbing hidden sm:block">
              <GripVertical className="w-4 h-4" />
            </div>
            
            <div className="shrink-0 p-2 bg-slate-800 rounded-md group-hover:bg-slate-750 transition-colors">
              {getFileIcon(entry.file.name)}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-200 truncate" title={entry.file.name}>
                {entry.file.name}
              </p>
              <p className="text-xs text-slate-500">
                {formatFileSize(entry.file.size)}
              </p>
            </div>

            <button
              onClick={() => onRemove(entry.id)}
              className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-full transition-colors"
              aria-label="Remove file"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FileList;
