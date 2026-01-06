
import React, { useState, useRef, useEffect } from 'react';
import { AppProps } from '../types';
import { Icon } from '../components/SystemUI';
import { saveFile, generateId } from '../services/system.ts';

export const PaintApp: React.FC<AppProps> = ({ showNotification }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [color, setColor] = useState('#000000');
  const [lineWidth, setLineWidth] = useState(5);
  const [tool, setTool] = useState<'pen' | 'eraser'>('pen');
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = canvas.parentElement?.clientWidth || 800;
      canvas.height = canvas.parentElement?.clientHeight || 600;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, []);

  const startDrawing = (e: React.MouseEvent) => {
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx?.beginPath();
    }
  };

  const draw = (e: React.MouseEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : color;

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const saveImage = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      canvas.toBlob(async (blob) => {
          if (blob) {
              await saveFile({
                  id: generateId(),
                  parentId: 'root',
                  name: `Drawing_${Date.now()}.png`,
                  type: 'file',
                  mimeType: 'image/png',
                  content: blob,
                  createdAt: Date.now(),
                  size: blob.size
              });
              showNotification("Artwork saved to Files");
          }
      });
  };

  const clearCanvas = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  return (
    <div className="h-full flex flex-col bg-surface">
      {/* Toolbar */}
      <div className="h-14 border-b border-black/10 flex items-center px-4 gap-4 bg-surfaceVariant/30">
        <div className="flex items-center gap-2 border-r border-black/10 pr-4">
             <button 
                onClick={() => setTool('pen')}
                className={`p-2 rounded-lg transition-colors ${tool === 'pen' ? 'bg-primary text-onPrimary' : 'hover:bg-black/5'}`}
             >
                 <Icon name="edit" size={20} />
             </button>
             <button 
                onClick={() => setTool('eraser')}
                className={`p-2 rounded-lg transition-colors ${tool === 'eraser' ? 'bg-primary text-onPrimary' : 'hover:bg-black/5'}`}
             >
                 <div className="w-5 h-5 border-2 border-current rounded-sm"></div>
             </button>
        </div>

        <div className="flex items-center gap-2 border-r border-black/10 pr-4">
            <input 
                type="color" 
                value={color} 
                onChange={e => setColor(e.target.value)}
                className="w-8 h-8 rounded-full cursor-pointer border-none bg-transparent"
            />
            <div className="flex gap-1">
                {['#000000', '#ff0000', '#00ff00', '#0000ff', '#ffff00'].map(c => (
                    <button 
                        key={c}
                        onClick={() => { setColor(c); setTool('pen'); }}
                        className="w-6 h-6 rounded-full border border-black/10 hover:scale-110 transition-transform"
                        style={{ backgroundColor: c }}
                    />
                ))}
            </div>
        </div>

        <div className="flex items-center gap-2 w-32">
             <div className="w-2 h-2 rounded-full bg-black"></div>
             <input 
                type="range" 
                min="1" 
                max="50" 
                value={lineWidth} 
                onChange={e => setLineWidth(Number(e.target.value))}
                className="flex-1 h-1 accent-primary"
             />
             <div className="w-5 h-5 rounded-full bg-black"></div>
        </div>

        <div className="flex-1"></div>

        <div className="flex gap-2">
            <button onClick={clearCanvas} className="px-3 py-1.5 text-sm text-red-500 hover:bg-red-50 rounded-lg">Clear</button>
            <button onClick={saveImage} className="px-4 py-1.5 text-sm bg-primary text-onPrimary rounded-full flex items-center gap-2 hover:shadow-lg">
                <Icon name="save" size={16} /> Save
            </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 bg-gray-200 overflow-hidden cursor-crosshair">
         <canvas 
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            className="bg-white shadow-xl mx-auto my-4"
         />
      </div>
    </div>
  );
};
