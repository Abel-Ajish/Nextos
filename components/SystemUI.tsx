
import React, { useState, useEffect, useRef } from 'react';
import { AppDefinition, AppType, WindowState, ContextMenuState, NotificationItem } from '../types';
import { loadSettings } from '../services/system';

// --- Icons ---
export const Icon: React.FC<{ name: string; className?: string; size?: number }> = ({ name, className, size = 24 }) => {
  const icons: Record<string, string> = {
    'menu': 'M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z',
    'close': 'M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z',
    'maximize': 'M18 4H6c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H6V6h12v12z',
    'minimize': 'M6 19h12v-2H6v2z',
    'settings': 'M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0 .59-.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z',
    'files': 'M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z',
    'terminal': 'M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zM4 18V6h16v12H4zM7.5 17l-1.41-1.41L9.67 12l-3.59-3.59L7.5 7l5 5-5 5zm5.5-1h7v2h-7z',
    'notes': 'M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z',
    'calculator': 'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V7h2v2zm-5 8H7v-2h2v2zm0-4H7v-2h2v2zm0-4H7V7h2v2zm7-2h5v2h-5V7zm5 8h-2v-2h2v2zm0 4h-2v-2h2v2z',
    'media': 'M12 3v9.28c-.47-.17-.97-.28-1.5-.28C8.01 12 6 14.01 6 16.5S8.01 21 10.5 21c2.31 0 4.2-1.75 4.45-4H15V6h4V3h-7z',
    'photos': 'M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z',
    'camera': 'M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z',
    'browser': 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z',
    'snake': 'M7 15h3a1 1 0 001-1v-1a2 2 0 012-2h2a1 1 0 001-1v-1a1 1 0 00-1-1h-2a1 1 0 00-1 1v1a2 2 0 01-2 2H7a1 1 0 00-1 1v1a1 1 0 001 1z',
    'tictactoe': 'M7 11v2h10v-2H7zm5-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z',
    'minesweeper': 'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zM12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm-1 9h2v2h-2v-2zm0-6h2v4h-2V9z',
    'sysinfo': 'M2 9v2h19V9H2zm0 6h5v-2H2v2zm7 0h5v-2H9v2zm7 0h5v-2h-5v2zM2 7h19V5H2v2z',
    'search': 'M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z',
    'home': 'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z',
    'refresh': 'M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z',
    'spark': 'M12 2L9.19 8.63 2.56 11.44 9.19 14.25 12 20.88 14.81 14.25 21.44 11.44 14.81 8.63z',
    'edit': 'M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z',
    'save': 'M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z',
    'check': 'M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z',
    'cancel': 'M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z',
    'crop': 'M17 15h2V7c0-1.1-.9-2-2-2H9v2h8v8zM7 17V1H5v4H1v2h4v10c0 1.1.9 2 2 2h10v4h2v-4h4v-2H7z',
    'sliders': 'M3 17v2h6v-2H3zM3 5v2h10V5H3zm10 16v-2h8v-2h-8v-2h-2v6h2zM7 9v2H3v2h4v2h2V9H7zm14 4v-2H11v2h10zm-6-4h2V7h4V5h-4V3h-2v6z',
    'rocket': 'M12 2.5c4.97 0 9 4.03 9 9s-4.03 9-9 9-9-4.03-9-9 4.03-9 9-9m0-2C5.37.5.5 5.37.5 12S5.37 23.5 12 23.5 23.5 18.63 23.5 12 18.63.5 12.5.5h-.5z',
    'mic': 'M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zM17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z',
    'palette': 'M12 3a9 9 0 0 0 0 18c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-.99 0-.83.67-1.5 1.5-1.5H16c2.76 0 5-2.24 5-5 0-4.42-4.03-8-9-8zm-5.5 9c-.83 0-1.5-.67-1.5-1.5S5.67 9 6.5 9 8 9.67 8 10.5 7.33 12 6.5 12zm3-4C8.67 8 8 7.33 8 6.5S8.67 5 9.5 5s1.5.67 1.5 1.5S10.33 8 9.5 8zm5 0c-.83 0-1.5-.67-1.5-1.5S13.67 5 14.5 5s1.5.67 1.5 1.5S15.33 8 14.5 8zm3 4c-.83 0-1.5-.67-1.5-1.5S16.67 9 17.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z',
    'lock': 'M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3 3.1-3 1.71 0 3.1 1.29 3.1 3v2z',
    'code': 'M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z',
    'clock': 'M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z',
    'activity': 'M22 11h-4.17l-3.24-6.48L9.17 21 5 11H2v2h3.83l3.24 6.48L14.83 3 19 11h3z',
    'play': 'M8 5v14l11-7z',
    'pause': 'M6 19h4V5H6v14zm8-14v14h4V5h-4z',
    'stop': 'M6 6h12v12H6z',
    'power': 'M13 3h-2v10h2V3zm4.83 2.17l-1.42 1.42C17.99 7.86 19 9.81 19 12c0 3.87-3.13 7-7 7s-7-3.13-7-7c0-2.19 1.01-4.14 2.58-5.42L6.17 5.17C4.23 6.82 3 9.26 3 12c0 4.97 4.03 9 9 9s9-4.03 9-9c0-2.74-1.23-5.18-3.17-6.83z',
    'grid': 'M4 4h4v4H4zm6 0h4v4h-4zm6 0h4v4h-4zM4 10h4v4H4zm6 0h4v4h-4zm6 0h4v4h-4zM4 16h4v4H4zm6 0h4v4h-4zm6 0h4v4h-4z'
  };

  return (
    <svg viewBox="0 0 24 24" className={className} width={size} height={size} fill="currentColor">
      <path d={icons[name] || icons['menu']} />
    </svg>
  );
};

// --- ContextMenu ---
export const ContextMenu: React.FC<{ state: ContextMenuState; onClose: () => void }> = ({ state, onClose }) => {
  const ref = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClose();
      }
    };
    if (state.isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [state.isOpen, onClose]);

  if (!state.isOpen) return null;

  return (
    <div 
        ref={ref}
        className="fixed z-[9999] bg-surfaceVariant/90 backdrop-blur-md shadow-lg border border-white/10 rounded-lg py-1 min-w-[160px] animate-in fade-in zoom-in-95 duration-100"
        style={{ top: state.y, left: state.x }}
    >
      {state.items.map((item, idx) => (
        <button
          key={idx}
          onClick={() => { item.action(); onClose(); }}
          className={`w-full text-left px-4 py-2 text-sm hover:bg-white/10 flex items-center gap-2 active:bg-white/20 transition-colors
            ${item.danger ? 'text-red-400' : 'text-onSurface'}
          `}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
};

// --- Window ---
export const Window: React.FC<{
  windowState: WindowState;
  isActive: boolean;
  onClose: (id: string) => void;
  onFocus: (id: string) => void;
  onMinimize: (id: string) => void;
  onMaximize: (id: string) => void;
  onUpdate: (id: string, updates: Partial<WindowState>) => void;
  children: React.ReactNode;
}> = ({ windowState, isActive, onClose, onFocus, onMinimize, onMaximize, onUpdate, children }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const startPos = useRef({ x: 0, y: 0, wx: 0, wy: 0, ww: 0, wh: 0 });

  if (windowState.isMinimized) return null;

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent focusing underlying elements
    onFocus(windowState.id);
  };

  const startDrag = (e: React.MouseEvent) => {
    if (windowState.isMaximized) return;
    e.preventDefault();
    setIsDragging(true);
    startPos.current = { x: e.clientX, y: e.clientY, wx: windowState.x, wy: windowState.y, ww: 0, wh: 0 };
  };

  const startResize = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    startPos.current = { x: e.clientX, y: e.clientY, wx: 0, wy: 0, ww: windowState.width, wh: windowState.height };
  };

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      if (isDragging) {
        const dx = e.clientX - startPos.current.x;
        const dy = e.clientY - startPos.current.y;
        onUpdate(windowState.id, { x: startPos.current.wx + dx, y: startPos.current.wy + dy });
      }
      if (isResizing) {
        const dx = e.clientX - startPos.current.x;
        const dy = e.clientY - startPos.current.y;
        onUpdate(windowState.id, { width: Math.max(200, startPos.current.ww + dx), height: Math.max(150, startPos.current.wh + dy) });
      }
    };
    const handleUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      window.addEventListener('mousemove', handleMove);
      window.addEventListener('mouseup', handleUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };
  }, [isDragging, isResizing, windowState.id, onUpdate]);

  return (
    <div
      onMouseDown={handleMouseDown}
      className={`absolute flex flex-col rounded-lg overflow-hidden shadow-2xl border border-white/10
        ${isActive ? 'ring-1 ring-primary/50 z-50' : 'z-0'}
        ${windowState.isMaximized ? 'inset-0 !transform-none !w-full !h-[calc(100vh-48px)] !rounded-none' : ''}
        ${isDragging || isResizing ? 'transition-none' : 'transition-all duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)]'}
      `}
      style={{
        transform: windowState.isMaximized ? undefined : `translate(${windowState.x}px, ${windowState.y}px)`,
        width: windowState.isMaximized ? '100%' : windowState.width,
        height: windowState.isMaximized ? '100%' : windowState.height,
        zIndex: windowState.zIndex,
        backgroundColor: 'rgb(var(--color-surface))',
        color: 'rgb(var(--color-on-surface))'
      }}
    >
      {/* Title Bar */}
      <div 
        onDoubleClick={() => onMaximize(windowState.id)}
        onMouseDown={startDrag}
        className={`h-9 flex items-center justify-between px-3 select-none ${isActive ? 'bg-surfaceVariant' : 'bg-surfaceVariant/50'}`}
      >
        <div className="flex items-center gap-2 text-sm font-medium opacity-80">
           <Icon name={getIconForApp(windowState.appId)} size={16} />
           <span className="truncate max-w-[200px]">{windowState.title}</span>
        </div>
        <div className="flex items-center gap-2">
           <button onClick={(e) => { e.stopPropagation(); onMinimize(windowState.id); }} className="p-1 hover:bg-black/5 active:bg-black/10 active:scale-90 transition-transform rounded"><Icon name="minimize" size={14} /></button>
           <button onClick={(e) => { e.stopPropagation(); onMaximize(windowState.id); }} className="p-1 hover:bg-black/5 active:bg-black/10 active:scale-90 transition-transform rounded"><Icon name="maximize" size={14} /></button>
           <button onClick={(e) => { e.stopPropagation(); onClose(windowState.id); }} className="p-1 hover:bg-red-500 hover:text-white active:scale-90 transition-all rounded"><Icon name="close" size={14} /></button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 relative overflow-hidden bg-surface">
        {children}
        {!isActive && <div className="absolute inset-0 bg-transparent" />}
      </div>

      {/* Resize Handle */}
      {!windowState.isMaximized && (
        <div 
          onMouseDown={startResize}
          className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize z-50 hover:bg-black/10 rounded-tl"
        />
      )}
    </div>
  );
};

// Helper for icons
function getIconForApp(id: AppType): string {
    const map: Record<string, string> = {
        'files': 'files', 'settings': 'settings', 'terminal': 'terminal', 'notes': 'notes',
        'texteditor': 'code', 'calculator': 'calculator', 'media': 'media', 'photos': 'photos',
        'camera': 'camera', 'voice': 'mic', 'paint': 'palette', 'browser': 'browser',
        'gemini': 'spark', 'snake': 'snake', 'tictactoe': 'tictactoe', 'minesweeper': 'minesweeper',
        'clock': 'clock', 'taskmanager': 'activity'
    };
    return map[id] || 'menu';
}

// --- Taskbar ---
export const Taskbar: React.FC<{
  apps: AppDefinition[];
  runningApps: WindowState[];
  onLaunch: (id: AppType) => void;
  onToggleStart: () => void;
  isStartOpen: boolean;
  onLock: () => void;
}> = ({ apps, runningApps, onLaunch, onToggleStart, isStartOpen, onLock }) => {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="h-12 bg-surfaceVariant/90 backdrop-blur-md flex items-center px-2 gap-2 border-t border-white/10 shadow-2xl z-[1000]">
      <button 
        onClick={onToggleStart}
        className={`p-2 rounded hover:bg-white/10 transition-all duration-100 active:scale-90 ${isStartOpen ? 'bg-white/10 ring-2 ring-primary/50' : ''}`}
      >
        <Icon name="menu" className="text-primary" />
      </button>

      <div className="w-px h-6 bg-white/10 mx-1"></div>

      <div className="flex-1 flex gap-1 overflow-x-auto no-scrollbar">
         {runningApps.map(win => {
            const app = apps.find(a => a.id === win.appId);
            return (
                <button
                    key={win.id}
                    onClick={() => onLaunch(win.appId)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded min-w-[120px] max-w-[200px] border-b-2 transition-all duration-200 active:scale-95
                        ${!win.isMinimized ? 'bg-white/10 border-primary shadow-sm' : 'hover:bg-white/5 border-transparent opacity-70'}
                    `}
                >
                    <Icon name={app?.icon || 'menu'} size={18} />
                    <span className="truncate text-sm">{win.title}</span>
                </button>
            );
         })}
      </div>

      <div className="flex items-center gap-4 px-2 text-xs font-medium opacity-80 cursor-default select-none">
          <button onClick={onLock} className="hover:bg-white/10 p-1 rounded active:scale-90 transition-transform" title="Lock Screen">
            <Icon name="lock" size={16} />
          </button>
          <div className="flex flex-col items-end leading-tight">
              <span>{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              <span className="text-[10px] opacity-70">{time.toLocaleDateString()}</span>
          </div>
      </div>
    </div>
  );
};

// --- Start Menu ---
export const StartMenu: React.FC<{
  apps: AppDefinition[];
  isOpen: boolean;
  onLaunch: (id: AppType) => void;
  onClose: () => void;
  onAppContextMenu: (e: React.MouseEvent, appId: AppType) => void;
}> = ({ apps, isOpen, onLaunch, onClose, onAppContextMenu }) => {
  const [search, setSearch] = useState('');
  const settings = loadSettings();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
      if(!isOpen) setSearch('');
      
      const handleClick = (e: MouseEvent) => {
          if(ref.current && !ref.current.contains(e.target as Node)) {
              onClose();
          }
      };
      if(isOpen) setTimeout(() => document.addEventListener('click', handleClick), 100);
      return () => document.removeEventListener('click', handleClick);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredApps = apps.filter(a => a.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div 
        ref={ref}
        className="fixed bottom-14 left-2 w-[380px] h-[550px] bg-surfaceVariant/95 backdrop-blur-xl rounded-xl shadow-2xl border border-white/10 flex flex-col overflow-hidden z-[1001] animate-[pop-up-start_0.3s_cubic-bezier(0.16,1,0.3,1)_forwards] origin-bottom-left"
    >
        <div className="p-4">
            <div className="relative">
                <Icon name="search" size={16} className="absolute left-3 top-3 opacity-50" />
                <input 
                    autoFocus
                    placeholder="Search apps..."
                    className="w-full bg-black/10 rounded-full py-2.5 pl-10 pr-4 outline-none focus:ring-2 ring-primary/50 text-sm transition-all focus:bg-white/5"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 pt-0 custom-scrollbar">
            {search ? (
                <div className="flex flex-col gap-1">
                    <div className="text-xs font-bold opacity-50 mb-2 uppercase">Search Results</div>
                    {filteredApps.map(app => (
                        <button 
                            key={app.id} 
                            onClick={() => onLaunch(app.id)}
                            onContextMenu={(e) => onAppContextMenu(e, app.id)}
                            className="flex items-center gap-3 p-2 hover:bg-white/10 active:bg-white/20 active:scale-95 transition-all rounded-lg text-left group"
                        >
                            <div className="p-2 bg-surface rounded-lg shadow-sm group-hover:scale-110 transition-transform">
                                <Icon name={app.icon} className="text-primary" />
                            </div>
                            <span>{app.name}</span>
                        </button>
                    ))}
                    {filteredApps.length === 0 && <div className="text-center opacity-50 py-8">No results found</div>}
                </div>
            ) : (
                <div className="grid grid-cols-4 gap-4">
                     <div className="col-span-4 text-xs font-bold opacity-50 mb-1 uppercase">Pinned</div>
                     {apps.filter(a => ['files','browser','gemini','photos'].includes(a.id as string)).map(app => (
                         <button 
                            key={app.id}
                            onClick={() => onLaunch(app.id)}
                            onContextMenu={(e) => onAppContextMenu(e, app.id)}
                            className="flex flex-col items-center gap-2 p-2 hover:bg-white/5 active:bg-white/10 active:scale-90 transition-all rounded-lg group"
                         >
                             <div className="w-12 h-12 bg-surface rounded-xl shadow flex items-center justify-center text-primary group-hover:-translate-y-1 transition-transform duration-200">
                                 <Icon name={app.icon} size={24} />
                             </div>
                             <span className="text-xs text-center truncate w-full">{app.name}</span>
                         </button>
                     ))}

                     <div className="col-span-4 text-xs font-bold opacity-50 mt-4 mb-1 uppercase">All Apps</div>
                     {apps.map(app => (
                         <button 
                            key={app.id}
                            onClick={() => onLaunch(app.id)}
                            onContextMenu={(e) => onAppContextMenu(e, app.id)}
                            className="flex flex-col items-center gap-2 p-2 hover:bg-white/5 active:bg-white/10 active:scale-95 transition-all rounded-lg group"
                         >
                             <div className="w-10 h-10 bg-surface/50 rounded-lg flex items-center justify-center text-primary/80 group-hover:text-primary transition-colors">
                                 <Icon name={app.icon} size={20} />
                             </div>
                             <span className="text-[10px] text-center truncate w-full opacity-80">{app.name}</span>
                         </button>
                     ))}
                </div>
            )}
        </div>

        <div className="p-4 bg-black/5 flex items-center justify-between border-t border-white/5">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-onPrimary font-bold text-sm">
                    {settings.userName.charAt(0).toUpperCase()}
                </div>
                <div className="text-sm font-medium">{settings.userName}</div>
            </div>
            <button className="p-2 hover:bg-white/10 active:bg-white/20 active:scale-90 transition-all rounded-full" onClick={() => window.location.reload()}>
                <Icon name="power" />
            </button>
        </div>
    </div>
  );
};

// --- Desktop Widgets ---
export const DesktopClock: React.FC = () => {
    const [time, setTime] = useState(new Date());
    useEffect(() => {
        const t = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(t);
    }, []);

    return (
        <div className="absolute top-8 left-1/2 -translate-x-1/2 text-center pointer-events-none drop-shadow-lg z-0 opacity-80 hover:opacity-100 transition-opacity duration-500">
            <div className="text-8xl font-thin text-white tracking-tighter drop-shadow-2xl">
                {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
            </div>
            <div className="text-xl text-white/90 font-light uppercase tracking-widest mt-1 drop-shadow-md">
                {time.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
            </div>
        </div>
    );
};

export const DesktopCalendar: React.FC = () => {
    // A simplified widget
    return null; // Integrated into clock for cleaner UI above
};

// --- Boot Screen ---
export const BootScreen: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
    const [started, setStarted] = useState(false);
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState("Initializing System...");

    useEffect(() => {
        if (!started) return;

        // Play boot sound
        const audio = new Audio('https://reactos-boot-85864.tiiny.site/reactos-boot-85864.mp3');
        audio.volume = 0.5;
        audio.play().catch(e => console.log("Audio autoplay blocked", e));

        const steps = [
            { p: 10, s: "Checking Memory..." },
            { p: 30, s: "Loading Kernel..." },
            { p: 50, s: "Mounting File System..." },
            { p: 70, s: "Loading Drivers..." },
            { p: 90, s: "Starting User Interface..." },
            { p: 100, s: "Ready" }
        ];

        let currentStep = 0;
        const interval = setInterval(() => {
            if (currentStep >= steps.length) {
                clearInterval(interval);
                setTimeout(onComplete, 500);
                return;
            }
            const step = steps[currentStep];
            setProgress(step.p);
            setStatus(step.s);
            currentStep++;
        }, 400); // Boot duration

        return () => clearInterval(interval);
    }, [started, onComplete]);

    if (!started) {
        return (
             <div className="fixed inset-0 bg-black z-[99999] flex flex-col items-center justify-center text-white cursor-pointer" onClick={() => setStarted(true)}>
                <div className="flex flex-col items-center gap-4 group transition-all duration-300 hover:scale-105 active:scale-95">
                    <div className="w-20 h-20 rounded-full border-2 border-primary/50 flex items-center justify-center group-hover:border-primary group-hover:shadow-[0_0_30px_rgba(var(--color-primary),0.5)] transition-all">
                         <svg className="w-10 h-10 text-primary" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M13 1.07V9h7.93C19.86 4.67 16.73 1.54 13 1.07zm-2 0C7.27 1.54 4.14 4.67 3.07 9H11V1.07zm-2 10H1.07C1.54 14.73 4.67 17.86 9 18.93V11.07zM11 20.93v7.93h2V21h-2v-.07zM13 11.07v7.86c4.33-1.07 7.46-4.2 7.93-7.93H13z" />
                        </svg>
                    </div>
                    <span className="text-sm font-light tracking-[0.2em] uppercase opacity-70 group-hover:opacity-100">Click to Boot</span>
                </div>
             </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black z-[99999] flex flex-col items-center justify-center text-white cursor-none">
            <div className="w-24 h-24 bg-primary rounded-full mb-8 animate-pulse flex items-center justify-center">
                 <svg viewBox="0 0 24 24" fill="white" width="64" height="64"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" /></svg>
            </div>
            <h1 className="text-3xl font-light mb-8 tracking-widest">NextOS <span className="font-bold">Local</span></h1>
            
            <div className="w-64 h-1 bg-gray-800 rounded-full overflow-hidden mb-2">
                <div 
                    className="h-full bg-primary transition-all duration-300 ease-out" 
                    style={{ width: `${progress}%` }}
                />
            </div>
            <div className="text-xs text-gray-500 font-mono h-4">{status}</div>
        </div>
    );
};

// --- Notifications ---
export const ToastNotification: React.FC<{ notification: NotificationItem | null }> = ({ notification }) => {
    if (!notification) return null;
    return (
        <div className="fixed bottom-16 right-4 z-[9000] bg-surfaceVariant shadow-xl border border-white/10 p-4 rounded-lg flex items-center gap-3 max-w-sm animate-in slide-in-from-right duration-300">
            <div className="bg-primary/20 p-2 rounded-full text-primary">
                <Icon name="check" size={16} />
            </div>
            <div>
                <div className="font-bold text-sm">System Notification</div>
                <div className="text-sm opacity-80">{notification.message}</div>
            </div>
        </div>
    );
};

// --- Lock Screen ---
export const LockScreen: React.FC<{ isLocked: boolean; onUnlock: () => void }> = ({ isLocked, onUnlock }) => {
    const [time, setTime] = useState(new Date());
    const [password, setPassword] = useState('');
    const settings = loadSettings();

    useEffect(() => {
        const t = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(t);
    }, []);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // Any password works for demo
        onUnlock();
        setPassword('');
    };

    if (!isLocked) return null;

    return (
        <div className="fixed inset-0 z-[5000] bg-black/60 backdrop-blur-xl flex flex-col items-center justify-center text-white animate-in fade-in duration-500">
             <div className="text-6xl font-light mb-2 drop-shadow-xl">
                {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
             </div>
             <div className="text-xl opacity-70 mb-12 drop-shadow-md">
                {time.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
             </div>

             <div className="flex flex-col items-center gap-4 animate-in slide-in-from-bottom-10 duration-500">
                 <div className="w-24 h-24 rounded-full bg-surfaceVariant flex items-center justify-center text-4xl font-bold shadow-2xl border-4 border-white/10">
                     {settings.userName.charAt(0).toUpperCase()}
                 </div>
                 <div className="text-xl font-medium">{settings.userName}</div>
                 
                 <form onSubmit={handleLogin} className="mt-4 flex flex-col gap-2 w-64">
                     <input 
                        type="password" 
                        placeholder="Enter Password" 
                        className="bg-white/10 border border-white/20 rounded-full px-4 py-2 text-center outline-none focus:bg-white/20 focus:ring-2 ring-primary/50 transition-all placeholder:text-white/30"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        autoFocus
                     />
                     <button type="submit" className="text-sm opacity-50 hover:opacity-100 mt-2 transition-opacity">Click or Enter to unlock</button>
                 </form>
             </div>
        </div>
    );
};
