
import React, { useMemo } from 'react';
import { FileSystem } from '../types';
import { Monitor, RefreshCcw, ExternalLink } from 'lucide-react';

interface PreviewProps {
  files: FileSystem;
}

const Preview: React.FC<PreviewProps> = ({ files }) => {
  const previewUrl = useMemo(() => {
    // Basic logic to find entry point. Prefer index.html.
    let html = files['index.html'] || files['public/index.html'];
    
    if (!html) {
      // If no HTML, create a wrapper for a standard JS/App approach
      const script = files['app.js'] || files['src/App.js'] || files['index.js'] || '';
      html = `
        <!DOCTYPE html>
        <html>
          <head>
            <script src="https://cdn.tailwindcss.com"></script>
            <style>${files['styles.css'] || ''}</style>
          </head>
          <body>
            <div id="root"></div>
            <script>${script}</script>
          </body>
        </html>
      `;
    } else {
      // Inject script/css if they exist and are not in HTML
      const script = files['app.js'] || files['src/App.js'] || files['index.js'];
      const style = files['styles.css'] || files['src/styles.css'];
      
      if (style && !html.includes(style)) {
         html = html.replace('</head>', `<style>${style}</style></head>`);
      }
      if (script && !html.includes(script)) {
         html = html.replace('</body>', `<script>${script}</script></body>`);
      }
    }

    const blob = new Blob([html], { type: 'text/html' });
    return URL.createObjectURL(blob);
  }, [files]);

  return (
    <div className="h-full flex flex-col bg-white rounded-xl overflow-hidden shadow-2xl border border-gray-800">
      <div className="h-10 bg-gray-100 border-b flex items-center px-4 justify-between">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5 mr-4">
            <div className="w-3 h-3 rounded-full bg-red-400"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
            <div className="w-3 h-3 rounded-full bg-green-400"></div>
          </div>
          <div className="bg-white border rounded px-3 py-1 text-[11px] text-gray-500 font-medium flex items-center gap-2 w-64 shadow-sm">
            <span className="opacity-50">https://</span>
            app-preview.internal
          </div>
        </div>
        <div className="flex items-center gap-2 text-gray-400">
           <button className="p-1 hover:bg-gray-200 rounded transition-colors"><RefreshCcw size={14} /></button>
           <button className="p-1 hover:bg-gray-200 rounded transition-colors"><ExternalLink size={14} /></button>
        </div>
      </div>
      <div className="flex-1 bg-white relative">
        <iframe 
          src={previewUrl} 
          className="w-full h-full border-none"
          title="App Preview"
        />
      </div>
    </div>
  );
};

export default Preview;
