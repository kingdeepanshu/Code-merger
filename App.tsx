import React, { useState, useCallback, useMemo } from 'react';
import { Download, AlertCircle, Settings2, Github, CheckCircle2 } from 'lucide-react';
import DropZone from './components/DropZone';
import FileList from './components/FileList';
import { FileEntry, MergeOptions, SortMethod } from './types';
import { generateId, mergeFiles } from './utils/fileProcessing';

const MAX_FILES = 40;

function App() {
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [mergeOptions, setMergeOptions] = useState<MergeOptions>({
    includeSeparator: true,
    separatorStyle: 'dash'
  });
  const [sortMethod, setSortMethod] = useState<SortMethod>('none');

  const handleFilesAdded = useCallback((newFiles: File[]) => {
    setError(null);
    if (files.length + newFiles.length > MAX_FILES) {
      setError(`Maximum limit of ${MAX_FILES} files exceeded. Please select fewer files.`);
      return;
    }

    const newEntries: FileEntry[] = newFiles.map(f => ({
      id: generateId(),
      file: f
    }));

    setFiles(prev => {
      // Filter duplicates by name if needed, currently allowing duplicates if they are different files with same name? 
      // Better to check for exact file object equality or name+size
      // For now simple append with ID
      return [...prev, ...newEntries];
    });
  }, [files.length]);

  const removeFile = useCallback((id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
    if (files.length <= 1) setError(null);
  }, [files.length]);

  const clearFiles = useCallback(() => {
    setFiles([]);
    setError(null);
  }, []);

  const sortedFiles = useMemo(() => {
    const list = [...files];
    if (sortMethod === 'name') {
      list.sort((a, b) => a.file.name.localeCompare(b.file.name));
    } else if (sortMethod === 'size') {
      list.sort((a, b) => a.file.size - b.file.size);
    } else if (sortMethod === 'type') {
      list.sort((a, b) => {
        const extA = a.file.name.split('.').pop() || '';
        const extB = b.file.name.split('.').pop() || '';
        return extA.localeCompare(extB);
      });
    }
    return list;
  }, [files, sortMethod]);

  const handleDownload = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    try {
      const mergedContent = await mergeFiles(sortedFiles, mergeOptions);
      const blob = new Blob([mergedContent], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `merged-code-${new Date().toISOString().slice(0, 10)}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError("An error occurred while merging files.");
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-6 md:p-12 font-sans selection:bg-indigo-500/30">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-800">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-2">
              CodeMerger
            </h1>
            <p className="text-slate-400 max-w-lg leading-relaxed">
              Combine up to <span className="text-indigo-400 font-semibold">{MAX_FILES} code files</span> into a single text file. 
              Perfect for feeding context to LLMs like Gemini or ChatGPT.
            </p>
          </div>
          <div className="flex items-center gap-2 text-slate-500">
             {/* Decorative or future links */}
             <div className="h-10 w-10 rounded-full bg-slate-900 flex items-center justify-center border border-slate-800">
                <Settings2 className="w-5 h-5" />
             </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left/Top: Uploader */}
          <div className="lg:col-span-3 space-y-6">
            <DropZone onFilesAdded={handleFilesAdded} disabled={isProcessing} />
            
            {error && (
              <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 animate-pulse">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p>{error}</p>
              </div>
            )}
          </div>

          {/* Settings & Controls */}
          <div className="lg:col-span-1 space-y-6">
             <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 sticky top-6">
                <div className="flex items-center gap-2 mb-2">
                  <Settings2 className="w-5 h-5 text-indigo-400" />
                  <h3 className="font-semibold text-slate-200">Merge Options</h3>
                </div>

                {/* Sort Toggle */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Sort Order</label>
                  <select 
                    value={sortMethod}
                    onChange={(e) => setSortMethod(e.target.value as SortMethod)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-indigo-500 transition-colors"
                  >
                    <option value="none">As Added (Default)</option>
                    <option value="name">File Name (A-Z)</option>
                    <option value="type">File Extension</option>
                    <option value="size">File Size (Smallest)</option>
                  </select>
                </div>

                {/* Separator Style */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Separator Style</label>
                  <div className="grid grid-cols-3 gap-2">
                     {(['dash', 'hash', 'slash'] as const).map((style) => (
                       <button
                        key={style}
                        onClick={() => setMergeOptions(prev => ({ ...prev, separatorStyle: style }))}
                        className={`
                          px-2 py-2 text-xs rounded-md border transition-all
                          ${mergeOptions.separatorStyle === style 
                            ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20' 
                            : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}
                        `}
                       >
                         {style === 'dash' ? '---' : style === 'hash' ? '###' : '///'}
                       </button>
                     ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800">
                  <button
                    onClick={handleDownload}
                    disabled={files.length === 0 || isProcessing}
                    className={`
                      w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-bold text-white transition-all duration-200
                      ${files.length > 0 && !isProcessing
                        ? 'bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-500/25 translate-y-0 active:translate-y-0.5' 
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'}
                    `}
                  >
                    {isProcessing ? (
                       <span className="animate-pulse">Processing...</span>
                    ) : (
                      <>
                        <Download className="w-5 h-5" />
                        <span>Download Merged</span>
                      </>
                    )}
                  </button>
                  <p className="text-center text-xs text-slate-600 mt-3">
                    {files.length} file{files.length !== 1 ? 's' : ''} ready to merge
                  </p>
                </div>
             </div>
          </div>

          {/* File List */}
          <div className="lg:col-span-2">
            <FileList 
              files={sortedFiles} 
              onRemove={removeFile}
              onClear={clearFiles}
            />
            {files.length === 0 && (
               <div className="h-64 flex flex-col items-center justify-center text-slate-600 border border-slate-800/50 border-dashed rounded-xl bg-slate-900/30">
                  <div className="p-4 bg-slate-900 rounded-full mb-4">
                    <CheckCircle2 className="w-8 h-8 opacity-20" />
                  </div>
                  <p>No files selected yet</p>
               </div>
            )}
          </div>

        </main>
      </div>
    </div>
  );
}

export default App;
