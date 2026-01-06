
import React, { useState, useEffect, useRef } from 'react';
import { AppDefinition, AppType, WindowState, ContextMenuState, NotificationItem } from '../types';
import { loadSettings, getFile } from '../services/system';

// --- Icons ---
export const Icon: React.FC<{ name: string; className?: string; size?: number }> = ({ name, className, size = 24 }) => {
  const icons: Record<string, string> = {
    'menu': 'M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z',
    'close': 'M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 17.59 13.41 12z',
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
    'save': 'M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 1.34 3 3-1.34 3 3-3 3zm3-10H5V5h10v4z',
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
    'grid': 'M4 4h4v4H4zm6 0h4v4h-4zm6 0h4v4h-4zM4 10h4v4H4zm6 0h4v4h-4zm6 0h4v4h-4zM4 16h4v4H4zm6 0h4v4h-4zm6 0h4v4h-4z',
    'chevron-left': 'M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z',
    'chevron-right': 'M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z',
    'arrow-left': 'M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z',
    'arrow-right': 'M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z',
    'list': 'M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z',
    'folder': 'M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z',
    'image': 'M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z',
    'video': 'M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z',
    'music': 'M12 3v9.28c-.47-.17-.97-.28-1.5-.28C8.01 12 6 14.01 6 16.5S8.01 21 10.5 21c2.31 0 4.2-1.75 4.45-4H15V6h4V3h-7z',
    'file-text': 'M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z'
  };

  return (
    <svg viewBox="0 0 24 24" className={className} width={size} height={size} fill="currentColor">
      <path d={icons[name] || icons['menu']} />
    </svg>
  );
};

// --- Boot Screen ---
export const BootScreen: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
    useEffect(() => {
        const timer = setTimeout(onComplete, 3500);
        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <div className="fixed inset-0 z-[9999] bg-black text-white flex flex-col items-center justify-center font-mono select-none">
            <div className="w-24 h-24 mb-8 text-primary animate-pulse">
                <Icon name="spark" size={96} />
            </div>
            <h1 className="text-4xl font-light mb-2 tracking-widest">NextOS</h1>
            <div className="w-64 h-1 bg-white/20 rounded-full overflow-hidden mt-8">
                <div className="h-full bg-primary w-full animate-[progress_3s_ease-in-out]"></div>
            </div>
            <p className="mt-4 text-xs opacity-50 animate-pulse">Initializing System Components...</p>
            <style>{`@keyframes progress { 0% { width: 0% } 20% { width: 10% } 50% { width: 40% } 100% { width: 100% } }`}</style>
        </div>
    );
};

// --- Lock Screen ---
export const LockScreen: React.FC<{ isLocked: boolean; onUnlock: () => void }> = ({ isLocked, onUnlock }) => {
    const [time, setTime] = useState(new Date());
    const [password, setPassword] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);
    const [profilePic, setProfilePic] = useState<string | null>(null);

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if(isLocked) {
            setPassword('');
            setTimeout(() => inputRef.current?.focus(), 100);
            
            // Load profile picture
            if (loadSettings().profilePicture === 'custom') {
                getFile('sys_profile_pic').then(file => {
                    if (file && file.content) setProfilePic(URL.createObjectURL(file.content));
                });
            } else {
                setProfilePic(null);
            }
        }
    }, [isLocked]);

    const handleUnlock = (e: React.FormEvent) => {
        e.preventDefault();
        onUnlock();
    };

    return (
        <div 
            className={`fixed inset-0 z-[5000] bg-black/60 backdrop-blur-md flex flex-col items-center justify-center text-white transition-all duration-700
                ${isLocked ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none translate-y-[-100%]'}
            `}
        >
            <div className="mb-12 text-center">
                <div className="text-8xl font-thin mb-2">{time.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12: false})}</div>
                <div className="text-xl font-light opacity-80">{time.toLocaleDateString([], {weekday: 'long', month: 'long', day: 'numeric'})}</div>
            </div>

            <div className="flex flex-col items-center gap-4 w-64">
                {profilePic ? (
                    <img src={profilePic} alt="Profile" className="w-24 h-24 rounded-full object-cover shadow-2xl border-2 border-white/20" />
                ) : (
                    <div className="w-24 h-24 bg-surface rounded-full flex items-center justify-center text-4xl text-primary shadow-2xl">
                        {loadSettings().userName.charAt(0).toUpperCase()}
                    </div>
                )}
                <div className="text-xl font-medium">{loadSettings().userName}</div>
                
                <form onSubmit={handleUnlock} className="w-full flex gap-2">
                    <input 
                        ref={inputRef}
                        type="password" 
                        placeholder="Password" 
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="flex-1 bg-white/20 border border-white/10 rounded-full px-4 py-2 outline-none focus:bg-white/30 placeholder-white/50 text-center"
                    />
                    <button type="submit" className="w-10 h-10 bg-primary rounded-full flex items-center justify-center hover:bg-primary/80 transition-colors">
                        <Icon name="arrow-right" size={20} />
                    </button>
                </form>
                <div className="text-xs opacity-50 mt-4">Hint: Just press enter</div>
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
        <div className="absolute top-12 right-12 text-right pointer-events-none select-none z-0 mix-blend-overlay text-white opacity-80">
            <div className="text-8xl font-thin tracking-tighter">
                {time.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12: false})}
            </div>
            <div className="text-2xl font-light">
                {time.toLocaleDateString([], {weekday: 'long', month: 'long', day: 'numeric'})}
            </div>
        </div>
    );
};

export const DesktopCalendar: React.FC = () => {
    // Simplified placeholder widget
    return null;
};

// --- Context Menu ---
export const ContextMenu: React.FC<{ state: ContextMenuState; onClose: () => void }> = ({ state, onClose }) => {
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                onClose();
            }
        };
        if (state.isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [state.isOpen, onClose]);

    if (!state.isOpen) return null;

    // Boundary check logic could be added here
    return (
        <div 
            ref={menuRef}
            className="fixed z-[9999] bg-surface/90 backdrop-blur border border-white/20 shadow-2xl rounded-lg py-1 min-w-[160px] animate-[fadeIn_0.1s_ease-out]"
            style={{ left: state.x, top: state.y }}
        >
            {state.items.map((item, idx) => (
                <button
                    key={idx}
                    onClick={() => { item.action(); onClose(); }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-primary hover:text-white transition-colors flex items-center gap-2
                        ${item.danger ? 'text-red-500 hover:bg-red-500' : 'text-onSurface'}
                    `}
                >
                    {item.label}
                </button>
            ))}
        </div>
    );
};

// --- Window System ---
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
    const windowRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [isResizing, setIsResizing] = useState(false);
    const [resizeStart, setResizeStart] = useState({ w: 0, h: 0, x: 0, y: 0 });

    const handleMouseDown = (e: React.MouseEvent) => {
        if(windowState.isMaximized) return;
        onFocus(windowState.id);
        setIsDragging(true);
        setDragOffset({
            x: e.clientX - windowState.x,
            y: e.clientY - windowState.y
        });
    };

    const handleResizeStart = (e: React.MouseEvent) => {
        e.stopPropagation();
        onFocus(windowState.id);
        setIsResizing(true);
        setResizeStart({
            w: windowState.width,
            h: windowState.height,
            x: e.clientX,
            y: e.clientY
        });
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (isDragging) {
                onUpdate(windowState.id, {
                    x: e.clientX - dragOffset.x,
                    y: e.clientY - dragOffset.y
                });
            } else if (isResizing) {
                onUpdate(windowState.id, {
                    width: Math.max(300, resizeStart.w + (e.clientX - resizeStart.x)),
                    height: Math.max(200, resizeStart.h + (e.clientY - resizeStart.y))
                });
            }
        };

        const handleMouseUp = () => {
            setIsDragging(false);
            setIsResizing(false);
        };

        if (isDragging || isResizing) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, isResizing, dragOffset, resizeStart, windowState.id, onUpdate]);

    if (windowState.isMinimized) return null;

    const styles: React.CSSProperties = windowState.isMaximized 
        ? { top: 0, left: 0, width: '100%', height: 'calc(100% - 48px)', borderRadius: 0 }
        : { top: windowState.x, left: windowState.y, width: windowState.width, height: windowState.height, borderRadius: '0.75rem' };

    return (
        <div 
            ref={windowRef}
            className={`fixed flex flex-col bg-surface shadow-2xl border border-white/10 overflow-hidden transition-all duration-75
                ${isActive ? 'z-50 shadow-black/50 ring-1 ring-white/20' : 'z-0 opacity-95 grayscale-[0.1]'}
            `}
            style={{ ...styles, zIndex: windowState.zIndex }}
            onMouseDown={() => onFocus(windowState.id)}
        >
            {/* Title Bar */}
            <div 
                className={`h-9 flex items-center justify-between px-3 select-none shrink-0 border-b border-black/5
                    ${isActive ? 'bg-surfaceVariant' : 'bg-surfaceVariant/50'}
                `}
                onDoubleClick={() => onMaximize(windowState.id)}
                onMouseDown={handleMouseDown}
            >
                <div className="flex items-center gap-2 text-sm font-medium opacity-80">
                    {/* App Icon could go here */}
                    <span>{windowState.title}</span>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={(e) => { e.stopPropagation(); onMinimize(windowState.id); }} className="p-1 hover:bg-black/10 rounded"><Icon name="minimize" size={14} /></button>
                    <button onClick={(e) => { e.stopPropagation(); onMaximize(windowState.id); }} className="p-1 hover:bg-black/10 rounded"><Icon name={windowState.isMaximized ? "minimize" : "maximize"} size={14} /></button>
                    <button onClick={(e) => { e.stopPropagation(); onClose(windowState.id); }} className="p-1 hover:bg-red-500 hover:text-white rounded transition-colors"><Icon name="close" size={14} /></button>
                </div>
            </div>

            {/* Content - Fixes for Flexbox layouts */}
            <div className="flex-1 relative overflow-hidden flex flex-col h-full min-h-0">
                {children}
            </div>

            {/* Resize Handle */}
            {!windowState.isMaximized && (
                <div 
                    className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize z-50 flex items-end justify-end p-0.5 opacity-50 hover:opacity-100"
                    onMouseDown={handleResizeStart}
                >
                    <div className="w-1.5 h-1.5 border-r-2 border-b-2 border-black/30"></div>
                </div>
            )}
        </div>
    );
};

// --- Start Menu ---
export const StartMenu: React.FC<{
  apps: AppDefinition[];
  isOpen: boolean;
  onLaunch: (appId: AppType) => void;
  onClose: () => void;
  onAppContextMenu: (e: React.MouseEvent, appId: AppType) => void;
}> = ({ apps, isOpen, onLaunch, onClose, onAppContextMenu }) => {
    const [search, setSearch] = useState('');
    const menuRef = useRef<HTMLDivElement>(null);
    const [profilePic, setProfilePic] = useState<string | null>(null);

    useEffect(() => {
        if (!isOpen) setSearch('');
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node) && !(event.target as Element).closest('#start-button')) {
                onClose();
            }
        };
        if(isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            // Load profile picture
            if (loadSettings().profilePicture === 'custom') {
                getFile('sys_profile_pic').then(file => {
                    if (file && file.content) setProfilePic(URL.createObjectURL(file.content));
                });
            } else {
                setProfilePic(null);
            }
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, onClose]);

    const filteredApps = apps.filter(a => a.name.toLowerCase().includes(search.toLowerCase()));

    if (!isOpen) return null;

    return (
        <div 
            ref={menuRef}
            className="fixed bottom-14 left-2 w-[400px] h-[600px] max-h-[80vh] bg-surface/90 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl flex flex-col overflow-hidden z-[2000] animate-[slideUp_0.2s_cubic-bezier(0.16,1,0.3,1)]"
        >
            <div className="p-6 pb-2">
                <div className="relative">
                    <Icon name="search" className="absolute left-3 top-2.5 text-onSurface opacity-50" size={18} />
                    <input 
                        className="w-full bg-black/5 border border-black/5 rounded-full py-2 pl-10 pr-4 outline-none focus:bg-white focus:ring-2 ring-primary/50 transition-all placeholder:text-onSurface/40"
                        placeholder="Search for apps, settings, and files..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        autoFocus
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 pt-2">
                <div className="mb-2 text-xs font-bold opacity-50 uppercase tracking-wider">Pinned</div>
                <div className="grid grid-cols-4 gap-2 mb-6">
                    {filteredApps.map(app => (
                        <button 
                            key={app.id}
                            onClick={() => { onLaunch(app.id); onClose(); }}
                            onContextMenu={(e) => onAppContextMenu(e, app.id)}
                            className="flex flex-col items-center gap-2 p-2 rounded-xl hover:bg-white/10 active:scale-95 transition-all group"
                        >
                            <div className="w-12 h-12 bg-surfaceVariant rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-all text-primary">
                                <Icon name={app.icon} size={28} />
                            </div>
                            <span className="text-xs text-center font-medium leading-tight line-clamp-2 w-full">{app.name}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="p-4 bg-black/5 border-t border-black/5 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3 hover:bg-black/5 p-2 rounded-lg cursor-pointer transition-colors">
                     {profilePic ? (
                         <img src={profilePic} alt="Profile" className="w-8 h-8 rounded-full object-cover" />
                     ) : (
                         <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-onPrimary font-bold text-sm">
                            {loadSettings().userName.charAt(0).toUpperCase()}
                         </div>
                     )}
                     <div className="text-sm font-medium">{loadSettings().userName}</div>
                </div>
                <button onClick={() => window.location.reload()} className="p-2 hover:bg-black/10 rounded-full text-red-500 transition-colors" title="Power">
                    <Icon name="power" size={20} />
                </button>
            </div>
        </div>
    );
};

// --- Calendar Widget ---
export const CalendarWidget: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node) && !(event.target as Element).closest('#clock-btn')) {
                onClose();
            }
        };
        if(isOpen) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const today = new Date();
    const currentMonth = today.toLocaleString('default', { month: 'long', year: 'numeric' });
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).getDay();

    return (
        <div 
            ref={ref}
            className="fixed bottom-14 right-2 w-80 bg-surface/90 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-4 z-[2000] animate-[slideUp_0.2s_cubic-bezier(0.16,1,0.3,1)]"
        >
             <div className="flex justify-between items-center mb-4">
                 <h2 className="font-bold text-lg">{currentMonth}</h2>
                 <div className="flex gap-2">
                     <button className="p-1 hover:bg-black/10 rounded-full"><Icon name="chevron-left" size={16} /></button>
                     <button className="p-1 hover:bg-black/10 rounded-full"><Icon name="chevron-right" size={16} /></button>
                 </div>
             </div>
             <div className="grid grid-cols-7 gap-1 text-center text-sm mb-2 opacity-50 font-medium">
                 {['S','M','T','W','T','F','S'].map(d => <div key={d}>{d}</div>)}
             </div>
             <div className="grid grid-cols-7 gap-1 text-center text-sm">
                 {Array.from({length: firstDay}).map((_, i) => <div key={`empty-${i}`} />)}
                 {Array.from({length: daysInMonth}).map((_, i) => {
                     const d = i + 1;
                     const isToday = d === today.getDate();
                     return (
                         <div 
                            key={d} 
                            className={`w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/5 cursor-default
                                ${isToday ? 'bg-primary text-onPrimary font-bold hover:bg-primary' : ''}
                            `}
                        >
                            {d}
                        </div>
                     );
                 })}
             </div>
        </div>
    );
};

// --- Taskbar ---
export const Taskbar: React.FC<{
  apps: AppDefinition[];
  runningApps: WindowState[];
  onLaunch: (id: AppType) => void;
  onToggleStart: () => void;
  isStartOpen: boolean;
  onLock: () => void;
  onToggleCalendar: () => void;
}> = ({ apps, runningApps, onLaunch, onToggleStart, isStartOpen, onLock, onToggleCalendar }) => {
    const [time, setTime] = useState(new Date());
    
    useEffect(() => {
        const t = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(t);
    }, []);

    // Get unique running apps
    const runningAppIds = Array.from(new Set(runningApps.map(w => w.appId)));
    const pinnedApps = [AppType.FileExplorer, AppType.Browser, AppType.GeminiAssistant, AppType.Settings];
    
    // Combine pinned and running, unique
    const displayedApps = Array.from(new Set([...pinnedApps, ...runningAppIds]));

    return (
        <div className="h-12 bg-surface/80 backdrop-blur-md border-t border-white/10 flex items-center px-2 justify-between select-none relative z-[1000]">
            
            {/* Start & Apps */}
            <div className="flex items-center gap-1 h-full">
                <button 
                    id="start-button"
                    onClick={onToggleStart}
                    className={`h-10 w-10 rounded-lg flex items-center justify-center transition-all active:scale-95 group relative ${isStartOpen ? 'bg-white/10' : 'hover:bg-white/5'}`}
                >
                    <Icon name="spark" size={24} className={`text-primary transition-transform duration-300 ${isStartOpen ? 'rotate-90 scale-110' : 'group-hover:scale-110'}`} />
                </button>

                <div className="w-px h-6 bg-black/10 mx-1"></div>

                {displayedApps.map(appId => {
                    const app = apps.find(a => a.id === appId);
                    const isOpen = runningApps.some(w => w.appId === appId);
                    const isFocused = runningApps.some(w => w.appId === appId && !w.isMinimized && w.id === runningApps.reduce((prev, current) => (prev.zIndex > current.zIndex) ? prev : current).id);
                    
                    if (!app) return null;

                    return (
                        <button 
                            key={appId}
                            onClick={() => onLaunch(appId)}
                            className={`h-10 w-10 rounded-lg flex items-center justify-center transition-all relative active:scale-95 hover:bg-white/5
                                ${isOpen ? 'bg-white/5' : ''}
                            `}
                            title={app.name}
                        >
                            <Icon name={app.icon} size={22} className={isOpen ? 'text-onSurface' : 'opacity-80'} />
                            {isOpen && (
                                <div className={`absolute bottom-0.5 w-1.5 h-1.5 rounded-full transition-all duration-300 ${isFocused ? 'w-4 bg-primary' : 'bg-onSurface/40'}`}></div>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Tray */}
            <div className="flex items-center gap-2 h-full pl-2">
                <div className="flex items-center gap-1 px-2">
                     <Icon name="activity" size={16} className="opacity-50" />
                     <div className="w-4 h-2 border border-current rounded-sm flex opacity-50"><div className="w-full bg-current"></div></div>
                </div>
                
                <button 
                    id="clock-btn"
                    onClick={onToggleCalendar}
                    className="flex flex-col items-end justify-center px-3 py-1 hover:bg-white/10 rounded-lg h-10 transition-colors text-right cursor-default active:bg-white/20"
                >
                    <span className="text-xs font-medium leading-none mb-0.5">
                        {time.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: false })}
                    </span>
                    <span className="text-[10px] leading-none opacity-70">
                        {time.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                </button>

                <div className="w-1 h-full border-l border-white/10 mx-1"></div>
                
                <button onClick={onLock} className="w-2 h-full hover:bg-white/20 opacity-50 hover:opacity-100" title="Show Desktop"></button>
            </div>
        </div>
    );
};

// --- Toast Notification ---
export const ToastNotification: React.FC<{ notification: NotificationItem | null }> = ({ notification }) => {
    if (!notification) return null;

    return (
        <div className="fixed bottom-16 right-4 z-[3000] animate-[slideIn_0.3s_ease-out]">
            <div className="bg-surface/90 backdrop-blur border border-white/20 text-onSurface px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 min-w-[250px]">
                <div className="w-2 h-2 rounded-full bg-primary"></div>
                <span className="font-medium text-sm">{notification.message}</span>
            </div>
            <style>{`@keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`}</style>
        </div>
    );
};
