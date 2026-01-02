
import React, { useState, useEffect } from 'react';
import { FileSystem } from '../types';
import { File, Folder, Code, Terminal, ClipboardCheck, Clipboard } from 'lucide-react';

interface CodeEditorProps {
  files: FileSystem;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ files }) => {
  const filePaths = Object.keys(files);
  const [selectedFile, setSelectedFile] = useState<string | null>(filePaths[0] || null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!selectedFile && filePaths.length > 0) {
      setSelectedFile(filePaths[0]);
    }
  }, [filePaths, selectedFile]);

  const handleCopy = () => {
    if (selectedFile) {
      navigator.clipboard.writeText(files[selectedFile]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex h-full bg-[#1e1e2e] overflow-hidden rounded-xl border border-gray-800 shadow-2xl">
      {/* File Tree */}
      <div className="w-56 border-r border-gray-800 bg-[#1a1b26] flex flex-col">
        <div className="p-3 text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2 border-b border-gray-800/50">
          <Folder size={14} /> EXPLORER
        </div>
        <div className="flex-1 overflow-y-auto py-2">
          {filePaths.map((path) => (
            <button
              key={path}
              onClick={() => setSelectedFile(path)}
              className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 transition-colors ${
                selectedFile === path 
                  ? 'bg-blue-600/20 text-blue-300 border-l-2 border-blue-500' 
                  : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
              }`}
            >
              <File size={16} className={selectedFile === path ? 'text-blue-400' : 'text-gray-500'} />
              <span className="truncate">{path}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Code Viewer */}
      <div className="flex-1 flex flex-col relative overflow-hidden bg-[#1e1e2e]">
        <div className="h-10 border-b border-gray-800 flex items-center justify-between px-4 bg-[#1e1e2e]">
          <div className="flex items-center gap-2 text-xs font-medium text-gray-400">
            <Code size={14} />
            {selectedFile}
          </div>
          <button 
            onClick={handleCopy}
            className="p-1.5 hover:bg-white/10 rounded transition-colors text-gray-500 hover:text-gray-300"
          >
            {copied ? <ClipboardCheck size={16} className="text-green-500" /> : <Clipboard size={16} />}
          </button>
        </div>
        <div className="flex-1 overflow-auto p-4 code-font text-[13px] leading-relaxed text-blue-50/90 whitespace-pre">
          {selectedFile ? files[selectedFile] : (
            <div className="h-full flex items-center justify-center text-gray-600 italic">
              Selecione um arquivo para ver o código
            </div>
          )}
        </div>
        
        {/* Fake Status Bar */}
        <div className="h-6 bg-[#16161e] border-t border-gray-800 flex items-center px-4 justify-between">
          <div className="flex items-center gap-4 text-[10px] text-gray-500 uppercase font-bold tracking-widest">
            <span className="flex items-center gap-1"><Terminal size={10} /> UTF-8</span>
            <span>TypeScript / React</span>
          </div>
          <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
            Ready
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;
