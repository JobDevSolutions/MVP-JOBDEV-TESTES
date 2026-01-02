
import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Loader2, Command } from 'lucide-react';

interface ChatInputProps {
  onSend: (prompt: string) => void;
  isLoading: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSend, isLoading }) => {
  const [prompt, setPrompt] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (prompt.trim() && !isLoading) {
      onSend(prompt);
      setPrompt('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [prompt]);

  return (
    <div className="max-w-4xl mx-auto w-full">
      <form onSubmit={handleSubmit} className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/30 to-indigo-600/30 rounded-2xl blur-lg opacity-0 group-focus-within:opacity-100 transition duration-1000"></div>
        <div className="relative flex items-end gap-2 bg-[#16161e] border border-white/5 p-2 rounded-2xl shadow-2xl focus-within:border-blue-500/40 transition-all">
          <div className="pl-4 pb-3">
             <Command size={16} className="text-gray-600" />
          </div>
          <textarea
            ref={textareaRef}
            rows={1}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Qual o próximo passo do projeto?"
            disabled={isLoading}
            className="flex-1 bg-transparent border-none focus:ring-0 text-gray-200 py-3 px-2 resize-none max-h-[200px] text-sm leading-relaxed placeholder:text-gray-600"
          />
          <button
            type="submit"
            disabled={!prompt.trim() || isLoading}
            className={`flex items-center justify-center p-3 rounded-xl transition-all ${
              !prompt.trim() || isLoading 
                ? 'bg-white/5 text-gray-700' 
                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20'
            }`}
          >
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </div>
        <div className="mt-3 flex items-center justify-center gap-6 text-[9px] text-gray-600 font-bold uppercase tracking-[0.2em]">
           <span className="flex items-center gap-1.5"><Sparkles size={10} className="text-blue-500" /> AI-Driven Architecture</span>
           <span className="flex items-center gap-1.5"><Command size={10} /> Enter to send</span>
        </div>
      </form>
    </div>
  );
};

export default ChatInput;
