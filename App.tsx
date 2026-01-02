
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import CodeEditor from './components/CodeEditor';
import Preview from './components/Preview';
import ChatInput from './components/ChatInput';
import Login from './components/Login';
import { generateProjectUpdate } from './services/geminiService';
import { Iteration, FileSystem, Tab, AuthUser } from './types';
import { supabase } from './services/supabase';
import { Code, Eye, Layers, Settings, MessageSquare, AlertCircle, Sparkles, Wand2, ShieldAlert } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [history, setHistory] = useState<Iteration[]>([]);
  const [currentFiles, setCurrentFiles] = useState<FileSystem>({});
  const [activeTab, setActiveTab] = useState<Tab>(Tab.CODE);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scopeWarning, setScopeWarning] = useState<boolean>(false);
  const [currentIterationId, setCurrentIterationId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email || '' });
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email || '' });
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const isChatRelated = (prompt: string): boolean => {
    const chatKeywords = ['chat', 'mensag', 'bot', 'talk', 'conversa', 'suporte', 'messenger', 'widget', 'atendimento', 'zap', 'whatsapp', 'msg', 'contato', 'bubble'];
    return chatKeywords.some(keyword => prompt.toLowerCase().includes(keyword));
  };

  const handleSendPrompt = async (prompt: string) => {
    setScopeWarning(false);
    
    // REGRA: Só barramos se for o PRIMEIRO prompt (histórico vazio) e não for relacionado a chat.
    // Se o projeto já existe, permitimos correções e implementações livremente.
    if (history.length === 0 && !isChatRelated(prompt)) {
      setScopeWarning(true);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const result = await generateProjectUpdate(prompt, history, currentFiles);
      const updatedFiles = { ...currentFiles, ...result.files };

      const newIteration: Iteration = {
        id: Math.random().toString(36).substr(2, 9),
        prompt,
        description: result.description,
        files: updatedFiles,
        timestamp: Date.now()
      };

      setHistory(prev => [...prev, newIteration]);
      setCurrentFiles(updatedFiles);
      setCurrentIterationId(newIteration.id);
      setActiveTab(Tab.PREVIEW);
      
    } catch (err: any) {
      setError(err.message || 'Erro de conexão com a Engine JOBDEV. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const selectIteration = (id: string) => {
    const iteration = history.find(h => h.id === id);
    if (iteration) {
      setCurrentFiles(iteration.files);
      setCurrentIterationId(id);
    }
  };

  if (!user) {
    return <Login onLoginSuccess={() => {}} />;
  }

  return (
    <div className="flex h-screen w-full bg-[#0b0b0e] text-gray-100 font-sans selection:bg-blue-500/30">
      <Sidebar 
        history={history} 
        onNewProject={() => { setHistory([]); setCurrentFiles({}); setCurrentIterationId(null); }} 
        onSelectIteration={selectIteration}
        currentIterationId={currentIterationId}
        user={user}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-white/5 flex items-center justify-between px-6 bg-[#0f0f13]/80 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div className="flex bg-black/40 p-1 rounded-lg border border-white/5">
              <button
                onClick={() => setActiveTab(Tab.CODE)}
                className={`flex items-center gap-2 px-3 py-1 rounded-md text-[10px] font-bold transition-all uppercase tracking-widest ${
                  activeTab === Tab.CODE ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                <Code size={12} /> CODE
              </button>
              <button
                onClick={() => setActiveTab(Tab.PREVIEW)}
                className={`flex items-center gap-2 px-3 py-1 rounded-md text-[10px] font-bold transition-all uppercase tracking-widest ${
                  activeTab === Tab.PREVIEW ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                <Eye size={12} /> PREVIEW
              </button>
            </div>
          </div>
          <div className="text-[10px] font-black text-gray-700 uppercase tracking-[0.3em]">JOBDEV SOLUTIONS</div>
        </header>

        <main className="flex-1 overflow-hidden p-6 relative flex flex-col gap-4">
          {scopeWarning && (
            <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl flex items-start gap-4 text-orange-400 text-sm animate-in zoom-in duration-300 shadow-lg z-50">
              <ShieldAlert className="mt-1 flex-shrink-0" size={20} />
              <div>
                <p className="font-black uppercase text-xs tracking-widest mb-1">Criação Restrita</p>
                <p className="opacity-80">Novos projetos na JOBDEV devem ser obrigatoriamente ferramentas de chat ou mensageria.</p>
                <button onClick={() => setScopeWarning(false)} className="mt-3 text-[10px] font-bold bg-orange-500/20 px-3 py-1 rounded-lg hover:bg-orange-500/30 transition-all uppercase tracking-widest">Entendido</button>
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3 text-red-400 text-xs">
              <AlertCircle size={14} className="mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          <div className="flex-1 relative min-h-0">
            {Object.keys(currentFiles).length === 0 && !isLoading ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-8 max-w-xl mx-auto animate-in fade-in duration-1000">
                <div className="relative">
                  <div className="w-24 h-24 bg-gradient-to-tr from-blue-600 to-indigo-700 rounded-[2.5rem] flex items-center justify-center text-white shadow-2xl shadow-blue-600/30 rotate-3">
                    <MessageSquare size={48} className="fill-current" />
                  </div>
                </div>
                <div className="space-y-3">
                  <h2 className="text-4xl font-black tracking-tighter text-white uppercase italic">Chat Engine <span className="text-blue-600">Pro</span></h2>
                  <p className="text-gray-500 text-lg leading-relaxed font-medium">
                    Construa widgets, sistemas de suporte e interfaces de conversa personalizadas com a infraestrutura JOBDEV.
                  </p>
                </div>
                <div className="flex flex-wrap justify-center gap-3">
                   {['Chat Widget para Site', 'Painel de Atendimento', 'Interface estilo WhatsApp', 'Bot de Mensagens'].map(suggestion => (
                     <button 
                       key={suggestion}
                       onClick={() => handleSendPrompt(`Crie um ${suggestion} moderno e funcional`)}
                       className="px-5 py-2.5 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.1em] text-gray-500 hover:bg-blue-600 hover:text-white hover:border-blue-500 transition-all duration-300"
                     >
                       {suggestion}
                     </button>
                   ))}
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col">
                {activeTab === Tab.CODE ? <CodeEditor files={currentFiles} /> : <Preview files={currentFiles} />}
              </div>
            )}

            {isLoading && (
              <div className="absolute inset-0 bg-[#0b0b0e]/90 backdrop-blur-sm z-50 rounded-2xl flex flex-col items-center justify-center gap-8 animate-in fade-in">
                <div className="w-16 h-16 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
                <div className="text-center space-y-2">
                  <p className="font-black text-xl text-white uppercase tracking-tighter italic">Processando Requisição...</p>
                  <p className="text-gray-600 text-[10px] font-bold uppercase tracking-[0.3em]">JOBDEV Engine Ativa</p>
                </div>
              </div>
            )}
          </div>

          <ChatInput onSend={handleSendPrompt} isLoading={isLoading} />
        </main>
      </div>
    </div>
  );
};

export default App;
