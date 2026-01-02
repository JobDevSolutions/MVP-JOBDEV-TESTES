
import React from 'react';
import { Iteration, AuthUser } from '../types';
import { History, Plus, ChevronRight, MessageSquare, LogOut } from 'lucide-react';
import { supabase } from '../services/supabase';

interface SidebarProps {
  history: Iteration[];
  onNewProject: () => void;
  onSelectIteration: (id: string) => void;
  currentIterationId: string | null;
  user: AuthUser | null;
}

const Sidebar: React.FC<SidebarProps> = ({ history, onNewProject, onSelectIteration, currentIterationId, user }) => {
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  return (
    <div className="w-64 flex flex-col border-r border-white/5 bg-[#0f0f13] h-screen">
      <div className="p-5 border-b border-white/5 flex items-center gap-3">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <MessageSquare className="text-white w-5 h-5 fill-current" />
        </div>
        <div className="flex flex-col">
          <h1 className="font-black text-xs tracking-tighter text-white uppercase leading-none">JOBDEV</h1>
          <h1 className="font-light text-[10px] tracking-widest text-blue-500 uppercase leading-none mt-0.5">SOLUTIONS</h1>
        </div>
      </div>

      <div className="p-4">
        <button 
          onClick={onNewProject}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl transition-all text-xs font-bold uppercase tracking-widest"
        >
          <Plus size={14} />
          Novo Chat App
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-4 scrollbar-none">
        <div className="px-3 py-4 flex items-center gap-2 text-gray-600 text-[10px] font-black uppercase tracking-[0.2em]">
          <History size={12} />
          Histórico de Versões
        </div>
        
        {history.length === 0 ? (
          <div className="px-4 py-8 text-center text-gray-700 text-[11px] italic">
            Nenhuma iteração
          </div>
        ) : (
          <div className="space-y-1">
            {history.slice().reverse().map((item) => (
              <button
                key={item.id}
                onClick={() => onSelectIteration(item.id)}
                className={`w-full text-left p-3 rounded-xl text-xs group transition-all relative border ${
                  currentIterationId === item.id 
                    ? 'bg-blue-600/10 text-blue-400 border-blue-600/30' 
                    : 'text-gray-500 hover:bg-white/5 hover:text-gray-300 border-transparent'
                }`}
              >
                <div className="font-bold truncate pr-4">{item.prompt}</div>
                <div className="text-[10px] opacity-50 mt-1 truncate">
                  {item.description}
                </div>
                <ChevronRight size={12} className={`absolute right-2 top-1/2 -translate-y-1/2 transition-opacity ${currentIterationId === item.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}`} />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 border-t border-white/5 bg-black/20">
        <div className="flex items-center justify-between group">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex-shrink-0 flex items-center justify-center text-[10px] font-bold">
              {user?.email?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold text-gray-300 truncate tracking-tight">{user?.email}</p>
              <p className="text-[9px] text-gray-600 uppercase font-black tracking-widest">Usuário Ativo</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="p-1.5 text-gray-600 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
            title="Sair"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
