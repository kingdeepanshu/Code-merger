import React, { useCallback, useState } from 'react';
import { UploadCloud, FileCode } from 'lucide-react';

interface DropZoneProps {
  onFilesAdded: (files: File[]) => void;
  disabled?: boolean;
}

const DropZone: React.FC<DropZoneProps> = ({ onFilesAdded, disabled }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFilesAdded(Array.from(e.dataTransfer.files));
    }
  }, [onFilesAdded, disabled]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesAdded(Array.from(e.target.files));
    }
    // Reset value so the same file can be selected again if needed
    e.target.value = '';
  }, [onFilesAdded]);

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        relative group border-2 border-dashed rounded-xl p-10 transition-all duration-300 ease-in-out cursor-pointer
        flex flex-col items-center justify-center gap-4
        ${isDragging 
          ? 'border-indigo-500 bg-indigo-500/10 scale-[1.01]' 
          : 'border-slate-700 hover:border-indigo-400 hover:bg-slate-800/50 bg-slate-900'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed grayscale' : ''}
      `}
    >
      <input
        type="file"
        multiple
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        onChange={handleFileInput}
        disabled={disabled}
      />
      
      <div className={`p-4 rounded-full bg-slate-800 transition-colors group-hover:bg-slate-700 ${isDragging ? 'bg-indigo-500/20' : ''}`}>
        {isDragging ? (
          <UploadCloud className="w-10 h-10 text-indigo-400 animate-bounce" />
        ) : (
          <FileCode className="w-10 h-10 text-slate-400 group-hover:text-indigo-400" />
        )}
      </div>

      <div className="text-center space-y-2">
        <h3 className="text-xl font-semibold text-slate-200">
          {isDragging ? 'Drop files here' : 'Drag & drop text files here'}
        </h3>
        <p className="text-sm text-slate-400 max-w-sm">
          Supports JS, TS, Java, Py, TXT, MD, HTML, JSON, CSS and more.
          <br />
          <span className="text-slate-500">(Max 40 files)</span>
        </p>
      </div>
    </div>
  );
};

export default DropZone;
