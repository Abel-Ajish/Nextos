
import React, { useState, useEffect, useRef } from 'react';
import { AppDefinition, AppType, WindowState, ContextMenuState, NotificationItem, DesktopSpace, SystemSettings } from '../types';
import { loadSettings, getFile, playBootSound } from '../services/system';

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
    'file-text': 'M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z',
    'desktop': 'M21 2H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h7v2H8v2h8v-2h-2v-2h7c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H3V4h18v12z',
    'virtual-desktop': 'M4 4h16a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2zm0 2v10h16V6H4zm-2 13h20v2H2v-2z',
    'plus': 'M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z',
    'trash': 'M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z',
    'layers': 'M11.99 18.54l-7.37-5.73L3 14.07l9 7 9-7-1.63-1.27-7.38 5.74zM12 16l7.36-5.73L21 9.07l-9-7-9 7 1.63 1.2L12 16z',
    'move': 'M10 9h4V6h3l-5-5-5 5h3v3zm-1 1H6V7l-5 5 5 5v-3h3v-4zm14 2l-5-5v3h-3v4h3v3l5-5zm-9 3h-4v3H7l5 5 5-5h-3v-3z',
    'pin': 'M16 9V4l1 0c.55 0 1-.45 1-1s-.45-1-1-1H7c-.55 0-1 .45-1 1s.45 1 1 1l1 0v5c0 1.66-1.34 3-3 3v2h5.97v7l1 1 1-1v-7H19v-2c-1.66 0-3-1.34-3-3z',
    'more-vertical': 'M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z',
    'snap-left': 'M3 4h18v16H3V4zm2 2v12h6V6H5z',
    'snap-right': 'M3 4h18v16H3V4zm8 2v12h8V6h-8z',
    'tile': 'M4 4h7v7H4V4zm9 0h7v7h-7V4zm-9 9h7v7H4v-7zm9 0h7v7h-7v-7z',
    'volume': 'M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z',
    'volume-off': 'M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z',
    'glass': 'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zM7 10h2v7H7zm4-3h2v10h-2zm4 6h2v4h-2z'
  };

  return (
    <svg viewBox="0 0 24 24" className={className} width={size} height={size} fill="currentColor">
      <path d={icons[name] || icons['menu']} />
    </svg>
  );
};

// --- Boot Screen ---
export const BootScreen: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
    const [progress, setProgress] = useState(0);
    const [statusIndex, setStatusIndex] = useState(0);
    const [soundPlayed, setSoundPlayed] = useState(false);
    const [soundBlocked, setSoundBlocked] = useState(false);

    const stages = [
        "Initializing NextOS Kernel...",
        "Mounting Virtual File System & Storage...",
        "Synthesizing Audio Engine & Visual Shaders...",
        "Calibrating Glassmorphism Engine & Spaces...",
        "Starting NextOS Desktop..."
    ];

    useEffect(() => {
        const settings = loadSettings();
        if (settings.bootSound !== false && !soundPlayed) {
            playBootSound().then(played => {
                if (played) {
                    setSoundPlayed(true);
                } else {
                    setSoundBlocked(true);
                }
            });
        }
    }, [soundPlayed]);

    const triggerUserSound = () => {
        if (!soundPlayed) {
            playBootSound().then(played => {
                if (played) {
                    setSoundPlayed(true);
                    setSoundBlocked(false);
                }
            });
        }
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            triggerUserSound();
            if (e.code === 'Space' || e.key === 'Escape') {
                onComplete();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onComplete]);

    useEffect(() => {
        const progressInterval = setInterval(() => {
            setProgress(prev => {
                const next = prev + 1;
                if (next >= 100) {
                    clearInterval(progressInterval);
                    setTimeout(onComplete, 350);
                    return 100;
                }
                const stage = Math.min(stages.length - 1, Math.floor((next / 100) * stages.length));
                setStatusIndex(stage);
                return next;
            });
        }, 30); // ~3s total boot time

        return () => clearInterval(progressInterval);
    }, [onComplete, stages.length]);

    return (
        <div 
            onClick={triggerUserSound}
            className="fixed inset-0 z-[9999] bg-[#07080c] text-white flex flex-col items-center justify-center font-mono select-none overflow-hidden"
        >
            {/* Ambient Background Aura */}
            <div className="absolute w-[500px] h-[500px] rounded-full bg-primary/25 blur-[120px] pointer-events-none animate-pulse"></div>
            <div className="absolute w-[350px] h-[350px] rounded-full bg-secondary/20 blur-[100px] pointer-events-none -translate-y-20"></div>

            {/* Skip & Sound Hint in corner */}
            <div className="absolute top-6 right-6 flex items-center gap-3 text-xs text-white/50 z-20">
                {soundBlocked && (
                    <button 
                        onClick={triggerUserSound}
                        className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center gap-1.5 transition-colors border border-white/15 animate-bounce shadow-lg"
                    >
                        <Icon name="volume" size={14} />
                        <span>Tap to Play Sound</span>
                    </button>
                )}
                <button 
                    onClick={onComplete}
                    className="hover:text-white px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 transition-colors flex items-center gap-1"
                >
                    <span>Skip</span>
                    <kbd className="font-mono bg-white/15 px-1.5 py-0.5 rounded text-[10px] text-white/80">Space</kbd>
                </button>
            </div>

            {/* Glowing OS Emblem with Orbital Animation */}
            <div className="relative mb-8 flex items-center justify-center">
                {/* Rotating Outer Gradient Ring */}
                <div className="w-36 h-36 rounded-full border border-primary/30 border-t-primary border-r-transparent animate-[spin_3s_linear_infinite] absolute"></div>
                
                {/* Secondary Counter-rotating Ring */}
                <div className="w-28 h-28 rounded-full border border-secondary/30 border-b-secondary border-l-transparent animate-[spin_4.5s_linear_infinite_reverse] absolute"></div>

                {/* Central Glowing Orb & Brand Mark */}
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-primary to-secondary backdrop-blur-md flex items-center justify-center text-white shadow-[0_0_60px_rgba(var(--color-primary),0.7)] animate-pulse ring-1 ring-white/30">
                    <Icon name="spark" size={44} className="text-white drop-shadow-[0_2px_12px_rgba(255,255,255,0.8)]" />
                </div>
            </div>

            {/* Title & Tagline */}
            <div className="flex flex-col items-center gap-1 mb-8 text-center z-10">
                <h1 className="text-3xl font-light tracking-[0.35em] text-white/95">NextOS</h1>
                <span className="text-[11px] uppercase tracking-[0.25em] text-primary font-semibold">Web Operating System</span>
            </div>

            {/* Sleek Progress Bar */}
            <div className="w-72 sm:w-80 h-1.5 bg-white/10 rounded-full overflow-hidden p-0.5 border border-white/10 shadow-inner z-10">
                <div 
                    className="h-full bg-gradient-to-r from-primary via-secondary to-primary rounded-full transition-all duration-75 shadow-[0_0_12px_rgba(var(--color-primary),0.8)]"
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/* Dynamic Status Log and Percentage */}
            <div className="w-72 sm:w-80 flex items-center justify-between text-xs text-white/60 mt-4 font-mono z-10">
                <span className="truncate pr-2">{stages[statusIndex]}</span>
                <span className="tabular-nums font-semibold text-primary">{progress}%</span>
            </div>
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

// --- Snap Ghost Preview Overlay ---
export const SnapGhostPreview: React.FC<{ snapTarget: 'left' | 'right' | 'top' | null }> = ({ snapTarget }) => {
    if (!snapTarget) return null;

    let posStyles = '';
    let label = '';
    let iconName = '';

    if (snapTarget === 'left') {
        posStyles = 'top-2 left-2 bottom-14 w-[calc(50%-16px)]';
        label = 'Snap Left (50%)';
        iconName = 'snap-left';
    } else if (snapTarget === 'right') {
        posStyles = 'top-2 right-2 bottom-14 w-[calc(50%-16px)]';
        label = 'Snap Right (50%)';
        iconName = 'snap-right';
    } else if (snapTarget === 'top') {
        posStyles = 'top-2 inset-x-2 bottom-14';
        label = 'Maximize (100%)';
        iconName = 'maximize';
    }

    return (
        <div 
            className={`fixed ${posStyles} z-[8500] pointer-events-none rounded-2xl bg-primary/20 backdrop-blur-md border-2 border-primary/70 shadow-2xl flex flex-col items-center justify-center transition-all duration-200 animate-pulse`}
        >
            <div className="bg-surface/90 backdrop-blur border border-white/20 text-onSurface px-4 py-2 rounded-xl shadow-lg flex items-center gap-2">
                <Icon name={iconName} size={20} className="text-primary" />
                <span className="text-xs font-semibold">{label}</span>
            </div>
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
  onSnapPreview?: (snap: 'left' | 'right' | 'top' | null) => void;
  showNotification?: (msg: string) => void;
  desktops?: DesktopSpace[];
  activeDesktopId?: string;
  onMoveToDesktop?: (windowId: string, desktopId: string) => void;
  onToggleAllDesktops?: (windowId: string) => void;
  onCreateDesktopAndMove?: (windowId: string) => void;
  onTileWindows?: () => void;
  children: React.ReactNode;
}> = ({ 
  windowState, 
  isActive, 
  onClose, 
  onFocus, 
  onMinimize, 
  onMaximize, 
  onUpdate, 
  onSnapPreview,
  showNotification,
  desktops = [], 
  activeDesktopId, 
  onMoveToDesktop, 
  onToggleAllDesktops,
  onCreateDesktopAndMove,
  onTileWindows,
  children 
}) => {
    const windowRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [isResizing, setIsResizing] = useState(false);
    const [resizeStart, setResizeStart] = useState({ w: 0, h: 0, x: 0, y: 0 });
    const [isDesktopMenuOpen, setIsDesktopMenuOpen] = useState(false);
    const [isSnapMenuOpen, setIsSnapMenuOpen] = useState(false);
    const desktopMenuRef = useRef<HTMLDivElement>(null);
    const snapMenuRef = useRef<HTMLDivElement>(null);
    const currentSnapCandidateRef = useRef<'left' | 'right' | 'top' | null>(null);

    const [sysSettings, setSysSettings] = useState<SystemSettings>(() => loadSettings());

    useEffect(() => {
        const handleSettingsChange = () => {
            setSysSettings(loadSettings());
        };
        window.addEventListener('webos-settings-changed', handleSettingsChange);
        return () => window.removeEventListener('webos-settings-changed', handleSettingsChange);
    }, []);

    const isGlass = sysSettings.glassEffect !== false;
    const glassBlur = sysSettings.glassBlur ?? 16;
    const glassOpacity = sysSettings.glassOpacity ?? 0.82;

    const handleMouseDown = (e: React.MouseEvent) => {
        onFocus(windowState.id);

        // If the window is currently maximized or snapped, clicking and dragging the titlebar restores it
        if (windowState.isMaximized || windowState.snapState) {
            const normalWidth = windowState.prevBounds?.width || 600;
            const normalHeight = windowState.prevBounds?.height || 450;
            const newX = Math.max(10, Math.min(window.innerWidth - normalWidth - 10, e.clientX - normalWidth / 2));
            const newY = Math.max(10, Math.min(window.innerHeight - normalHeight - 50, e.clientY - 15));

            onUpdate(windowState.id, {
                isMaximized: false,
                snapState: null,
                x: newX,
                y: newY,
                width: normalWidth,
                height: normalHeight
            });

            setIsDragging(true);
            setDragOffset({
                x: e.clientX - newX,
                y: e.clientY - newY
            });
            return;
        }

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
        const handleClickOutside = (e: MouseEvent) => {
            if (desktopMenuRef.current && !desktopMenuRef.current.contains(e.target as Node)) {
                setIsDesktopMenuOpen(false);
            }
            if (snapMenuRef.current && !snapMenuRef.current.contains(e.target as Node)) {
                setIsSnapMenuOpen(false);
            }
        };
        if (isDesktopMenuOpen || isSnapMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isDesktopMenuOpen, isSnapMenuOpen]);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (isDragging) {
                const newX = e.clientX - dragOffset.x;
                const newY = Math.max(0, e.clientY - dragOffset.y);

                // Screen Edge Detection for Snapping
                let snapCandidate: 'left' | 'right' | 'top' | null = null;
                if (e.clientX <= 25) {
                    snapCandidate = 'left';
                } else if (e.clientX >= window.innerWidth - 25) {
                    snapCandidate = 'right';
                } else if (e.clientY <= 15) {
                    snapCandidate = 'top';
                }

                currentSnapCandidateRef.current = snapCandidate;
                if (onSnapPreview) {
                    onSnapPreview(snapCandidate);
                }

                onUpdate(windowState.id, {
                    x: newX,
                    y: newY
                });
            } else if (isResizing) {
                const updates: Partial<WindowState> = {
                    width: Math.max(300, resizeStart.w + (e.clientX - resizeStart.x)),
                    height: Math.max(200, resizeStart.h + (e.clientY - resizeStart.y))
                };
                if (windowState.snapState) {
                    updates.snapState = null;
                }
                onUpdate(windowState.id, updates);
            }
        };

        const handleMouseUp = () => {
            if (isDragging) {
                const candidate = currentSnapCandidateRef.current;
                if (candidate === 'left') {
                    const prev = (windowState.snapState || windowState.isMaximized)
                        ? windowState.prevBounds
                        : { x: windowState.x, y: windowState.y, width: windowState.width, height: windowState.height };

                    onUpdate(windowState.id, {
                        snapState: 'left',
                        isMaximized: false,
                        prevBounds: prev
                    });
                    showNotification?.(`Snapped ${windowState.title} to left half`);
                } else if (candidate === 'right') {
                    const prev = (windowState.snapState || windowState.isMaximized)
                        ? windowState.prevBounds
                        : { x: windowState.x, y: windowState.y, width: windowState.width, height: windowState.height };

                    onUpdate(windowState.id, {
                        snapState: 'right',
                        isMaximized: false,
                        prevBounds: prev
                    });
                    showNotification?.(`Snapped ${windowState.title} to right half`);
                } else if (candidate === 'top') {
                    onMaximize(windowState.id);
                }
            }

            setIsDragging(false);
            setIsResizing(false);
            currentSnapCandidateRef.current = null;
            if (onSnapPreview) {
                onSnapPreview(null);
            }
        };

        if (isDragging || isResizing) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, isResizing, dragOffset, resizeStart, windowState, onUpdate, onMaximize, onSnapPreview, showNotification]);

    if (windowState.isMinimized) return null;

    const currentDesktop = desktops.find(d => d.id === (windowState.desktopId || activeDesktopId));
    const isPinnedToAll = windowState.desktopId === 'all';

    let styles: React.CSSProperties;
    if (windowState.isMaximized) {
        styles = { 
            top: 0, 
            left: 0, 
            width: '100%', 
            height: 'calc(100% - 48px)', 
            borderRadius: 0,
            transition: isDragging ? 'none' : 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)'
        };
    } else if (windowState.snapState === 'left') {
        styles = { 
            top: 0, 
            left: 0, 
            width: '50%', 
            height: 'calc(100% - 48px)', 
            borderRadius: 0,
            transition: isDragging ? 'none' : 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)'
        };
    } else if (windowState.snapState === 'right') {
        styles = { 
            top: 0, 
            left: '50%', 
            width: '50%', 
            height: 'calc(100% - 48px)', 
            borderRadius: 0,
            transition: isDragging ? 'none' : 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)'
        };
    } else {
        styles = { 
            top: windowState.y, 
            left: windowState.x, 
            width: windowState.width, 
            height: windowState.height, 
            borderRadius: '0.75rem',
            transition: isDragging ? 'none' : 'all 0.22s cubic-bezier(0.16, 1, 0.3, 1)'
        };
    }

    return (
        <div 
            ref={windowRef}
            className={`fixed flex flex-col shadow-2xl overflow-hidden ${isGlass ? 'window-glass' : 'bg-surface border border-white/10'}
                ${isActive ? 'z-50 shadow-black/50 ring-1 ring-white/20' : 'z-0 opacity-95 grayscale-[0.05]'}
            `}
            style={{ 
                ...styles, 
                zIndex: windowState.zIndex,
                ...(isGlass ? {
                    backdropFilter: `blur(${glassBlur}px) saturate(180%)`,
                    WebkitBackdropFilter: `blur(${glassBlur}px) saturate(180%)`,
                    backgroundColor: sysSettings.darkMode 
                        ? `rgba(28, 28, 30, ${glassOpacity})` 
                        : `rgba(255, 255, 255, ${glassOpacity})`,
                    border: '1px solid rgba(255, 255, 255, 0.22)',
                    boxShadow: isActive 
                        ? '0 25px 60px -10px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.35)' 
                        : '0 15px 35px -5px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                } : {})
            }}
            onMouseDown={() => onFocus(windowState.id)}
        >
            {/* Title Bar */}
            <div 
                className={`h-9 flex items-center justify-between px-3 select-none shrink-0 relative
                    ${isGlass 
                        ? (isActive ? 'bg-black/10' : 'bg-black/5') 
                        : (isActive ? 'bg-surfaceVariant' : 'bg-surfaceVariant/50')}
                `}
                style={isGlass ? {
                    borderBottom: '1px solid rgba(255, 255, 255, 0.12)'
                } : {
                    borderBottom: '1px solid rgba(0, 0, 0, 0.05)'
                }}
                onDoubleClick={() => {
                    if (windowState.snapState) {
                        onUpdate(windowState.id, {
                            snapState: null,
                            ...(windowState.prevBounds || { width: 600, height: 450, x: 50, y: 50 })
                        });
                    } else {
                        onMaximize(windowState.id);
                    }
                }}
                onMouseDown={handleMouseDown}
            >
                <div className="flex items-center gap-2 text-sm font-medium opacity-80 min-w-0">
                    <span className="truncate">{windowState.title}</span>
                    {isPinnedToAll && (
                        <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded font-mono font-medium">All Desktops</span>
                    )}
                    {windowState.snapState && (
                        <span className="text-[10px] bg-surfaceVariant text-onSurface/70 px-1.5 py-0.5 rounded font-mono font-medium capitalize">
                            {windowState.snapState} 50%
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-1.5">
                    {/* Desktop Space Switcher Menu */}
                    {desktops.length > 0 && onMoveToDesktop && (
                        <div className="relative" ref={desktopMenuRef}>
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsDesktopMenuOpen(!isDesktopMenuOpen);
                                }}
                                className={`p-1 rounded hover:bg-black/10 transition-colors flex items-center gap-1 text-xs ${isDesktopMenuOpen ? 'bg-black/15 text-primary' : 'opacity-70 hover:opacity-100'}`}
                                title={`Desktop Space: ${isPinnedToAll ? 'All Desktops' : (currentDesktop?.name || 'Current')}`}
                            >
                                <Icon name="virtual-desktop" size={13} />
                            </button>

                            {isDesktopMenuOpen && (
                                <div 
                                    className="absolute right-0 top-8 w-52 bg-surface/95 backdrop-blur-md border border-white/20 shadow-2xl rounded-xl py-1.5 z-[200] animate-[scale-in_0.15s_ease-out] text-xs text-onSurface"
                                    onMouseDown={(e) => e.stopPropagation()}
                                >
                                    <div className="px-3 py-1 text-[11px] font-semibold text-primary/80 border-b border-black/5 mb-1">
                                        Space: {isPinnedToAll ? 'All Desktops' : (currentDesktop?.name || 'Default')}
                                    </div>
                                    
                                    <div className="px-3 py-1 text-[10px] uppercase font-bold opacity-40">Move to Space</div>
                                    {desktops.map(d => {
                                        const isCurrent = (windowState.desktopId || activeDesktopId) === d.id && !isPinnedToAll;
                                        return (
                                            <button
                                                key={d.id}
                                                onClick={() => {
                                                    onMoveToDesktop(windowState.id, d.id);
                                                    setIsDesktopMenuOpen(false);
                                                }}
                                                className={`w-full text-left px-3 py-1.5 flex items-center justify-between hover:bg-primary hover:text-white transition-colors
                                                    ${isCurrent ? 'font-medium bg-primary/10 text-primary' : ''}
                                                `}
                                            >
                                                <span className="truncate">{d.name}</span>
                                                {isCurrent && <Icon name="check" size={12} />}
                                            </button>
                                        );
                                    })}

                                    {onCreateDesktopAndMove && (
                                        <button
                                            onClick={() => {
                                                onCreateDesktopAndMove(windowState.id);
                                                setIsDesktopMenuOpen(false);
                                            }}
                                            className="w-full text-left px-3 py-1.5 flex items-center gap-2 hover:bg-primary hover:text-white transition-colors border-t border-black/5 mt-1"
                                        >
                                            <Icon name="plus" size={12} />
                                            <span>Move to New Desktop</span>
                                        </button>
                                    )}

                                    {onToggleAllDesktops && (
                                        <button
                                            onClick={() => {
                                                onToggleAllDesktops(windowState.id);
                                                setIsDesktopMenuOpen(false);
                                            }}
                                            className="w-full text-left px-3 py-1.5 flex items-center justify-between hover:bg-primary hover:text-white transition-colors border-t border-black/5 mt-1"
                                        >
                                            <span>Show on all desktops</span>
                                            {isPinnedToAll && <Icon name="check" size={12} />}
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Snap Layout Presets Flyout */}
                    <div className="relative" ref={snapMenuRef}>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsSnapMenuOpen(!isSnapMenuOpen);
                            }}
                            className={`p-1 rounded hover:bg-black/10 transition-colors ${isSnapMenuOpen ? 'bg-black/15 text-primary' : 'opacity-70 hover:opacity-100'}`}
                            title="Snap Layouts (50% Left / 50% Right / Maximize)"
                        >
                            <Icon name="grid" size={13} />
                        </button>

                        {isSnapMenuOpen && (
                            <div 
                                className="absolute right-0 top-8 w-44 bg-surface/95 backdrop-blur-md border border-white/20 shadow-2xl rounded-xl p-2 z-[250] animate-[scale-in_0.15s_ease-out] text-xs text-onSurface"
                                onMouseDown={(e) => e.stopPropagation()}
                            >
                                <div className="text-[10px] uppercase font-bold opacity-50 px-1 mb-1.5">Snap Layouts</div>
                                <div className="grid grid-cols-2 gap-1.5 mb-1.5">
                                    {/* Left 50% */}
                                    <button
                                        onClick={() => {
                                            const prev = windowState.snapState || windowState.isMaximized 
                                                ? windowState.prevBounds 
                                                : { x: windowState.x, y: windowState.y, width: windowState.width, height: windowState.height };
                                            onUpdate(windowState.id, {
                                                snapState: 'left',
                                                isMaximized: false,
                                                prevBounds: prev
                                            });
                                            showNotification?.(`Snapped ${windowState.title} to left half`);
                                            setIsSnapMenuOpen(false);
                                        }}
                                        className={`h-12 border rounded-lg p-1 flex flex-col justify-center items-center gap-1 hover:bg-primary hover:text-white hover:border-primary transition-colors
                                            ${windowState.snapState === 'left' ? 'bg-primary/10 border-primary text-primary font-semibold' : 'border-black/10'}
                                        `}
                                        title="Snap to Left 50%"
                                    >
                                        <Icon name="snap-left" size={16} />
                                        <span className="text-[10px] leading-none">Left 50%</span>
                                    </button>

                                    {/* Right 50% */}
                                    <button
                                        onClick={() => {
                                            const prev = windowState.snapState || windowState.isMaximized 
                                                ? windowState.prevBounds 
                                                : { x: windowState.x, y: windowState.y, width: windowState.width, height: windowState.height };
                                            onUpdate(windowState.id, {
                                                snapState: 'right',
                                                isMaximized: false,
                                                prevBounds: prev
                                            });
                                            showNotification?.(`Snapped ${windowState.title} to right half`);
                                            setIsSnapMenuOpen(false);
                                        }}
                                        className={`h-12 border rounded-lg p-1 flex flex-col justify-center items-center gap-1 hover:bg-primary hover:text-white hover:border-primary transition-colors
                                            ${windowState.snapState === 'right' ? 'bg-primary/10 border-primary text-primary font-semibold' : 'border-black/10'}
                                        `}
                                        title="Snap to Right 50%"
                                    >
                                        <Icon name="snap-right" size={16} />
                                        <span className="text-[10px] leading-none">Right 50%</span>
                                    </button>
                                </div>

                                <div className="border-t border-black/5 pt-1 flex flex-col gap-0.5">
                                    {onTileWindows && (
                                        <button
                                            onClick={() => {
                                                onTileWindows();
                                                setIsSnapMenuOpen(false);
                                            }}
                                            className="w-full text-left px-2 py-1 rounded hover:bg-primary hover:text-white transition-colors text-[11px] flex items-center justify-between text-onSurface/80"
                                            title="Tile all windows on this desktop into a grid (Alt + T)"
                                        >
                                            <div className="flex items-center gap-1.5">
                                                <Icon name="tile" size={12} />
                                                <span>Tile All Windows</span>
                                            </div>
                                            <kbd className="text-[9px] opacity-60 font-mono">Alt+T</kbd>
                                        </button>
                                    )}

                                    <button
                                        onClick={() => {
                                            onMaximize(windowState.id);
                                            setIsSnapMenuOpen(false);
                                        }}
                                        className="w-full text-left px-2 py-1 rounded hover:bg-primary hover:text-white transition-colors text-[11px] flex items-center justify-between"
                                    >
                                        <span>Maximize Full</span>
                                        <Icon name="maximize" size={12} />
                                    </button>

                                    {(windowState.snapState || windowState.isMaximized) && (
                                        <button
                                            onClick={() => {
                                                onUpdate(windowState.id, {
                                                    snapState: null,
                                                    isMaximized: false,
                                                    ...(windowState.prevBounds || { width: 600, height: 450, x: 50, y: 50 })
                                                });
                                                setIsSnapMenuOpen(false);
                                            }}
                                            className="w-full text-left px-2 py-1 rounded hover:bg-primary hover:text-white transition-colors text-[11px] flex items-center justify-between text-primary font-medium"
                                        >
                                            <span>Restore Floating</span>
                                            <Icon name="minimize" size={12} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="w-px h-3.5 bg-black/10 mx-0.5"></div>

                    <button onClick={(e) => { e.stopPropagation(); onMinimize(windowState.id); }} className="p-1 hover:bg-black/10 rounded" title="Minimize"><Icon name="minimize" size={14} /></button>
                    <button 
                        onClick={(e) => { 
                            e.stopPropagation(); 
                            if (windowState.snapState) {
                                onUpdate(windowState.id, {
                                    snapState: null,
                                    ...(windowState.prevBounds || { width: 600, height: 450, x: 50, y: 50 })
                                });
                            } else {
                                onMaximize(windowState.id);
                            }
                        }} 
                        className="p-1 hover:bg-black/10 rounded" 
                        title={windowState.isMaximized || windowState.snapState ? "Restore" : "Maximize"}
                    >
                        <Icon name={windowState.isMaximized || windowState.snapState ? "minimize" : "maximize"} size={14} />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); onClose(windowState.id); }} className="p-1 hover:bg-red-500 hover:text-white rounded transition-colors" title="Close"><Icon name="close" size={14} /></button>
                </div>
            </div>

            {/* Content - Fixes for Flexbox layouts */}
            <div className={`flex-1 relative overflow-hidden flex flex-col h-full min-h-0 window-content ${isGlass ? 'bg-transparent' : ''}`}>
                {children}
            </div>

            {/* Resize Handle (only shown when not maximized or snapped) */}
            {!windowState.isMaximized && !windowState.snapState && (
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

// --- Desktop Switcher HUD ---
export const DesktopSwitcherHUD: React.FC<{ desktopName: string | null; windowCount?: number }> = ({ desktopName, windowCount }) => {
    if (!desktopName) return null;

    return (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[4000] pointer-events-none animate-[scale-in_0.2s_ease-out]">
            <div className="bg-surface/90 backdrop-blur-xl border border-white/20 text-onSurface px-6 py-2.5 rounded-2xl shadow-2xl flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
                    <Icon name="virtual-desktop" size={18} />
                </div>
                <div className="flex flex-col">
                    <span className="font-semibold text-sm leading-tight">{desktopName}</span>
                    {windowCount !== undefined && (
                        <span className="text-[11px] opacity-60 font-mono leading-none mt-0.5">
                            {windowCount} {windowCount === 1 ? 'window open' : 'windows open'}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- Task View / Virtual Desktop Manager Overlay ---
export const TaskViewOverlay: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  desktops: DesktopSpace[];
  activeDesktopId: string;
  onSwitchDesktop: (desktopId: string) => void;
  onCreateDesktop: (name?: string) => void;
  onRemoveDesktop: (desktopId: string) => void;
  onRenameDesktop: (desktopId: string, name: string) => void;
  windows: WindowState[];
  apps: AppDefinition[];
  onFocusWindow: (windowId: string) => void;
  onCloseWindow: (windowId: string) => void;
  onMoveWindowToDesktop: (windowId: string, targetDesktopId: string) => void;
  onToggleAllDesktops: (windowId: string) => void;
  onTileWindows?: () => void;
}> = ({
  isOpen,
  onClose,
  desktops,
  activeDesktopId,
  onSwitchDesktop,
  onCreateDesktop,
  onRemoveDesktop,
  onRenameDesktop,
  windows,
  apps,
  onFocusWindow,
  onCloseWindow,
  onMoveWindowToDesktop,
  onToggleAllDesktops,
  onTileWindows
}) => {
    const [editingDesktopId, setEditingDesktopId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');
    const [filterDesktopId, setFilterDesktopId] = useState<string>(activeDesktopId);
    const [searchQuery, setSearchQuery] = useState('');
    const editInputRef = useRef<HTMLInputElement>(null);

    // Keep filter desktop in sync with active desktop when opened
    useEffect(() => {
        if (isOpen) {
            setFilterDesktopId(activeDesktopId);
            setSearchQuery('');
        }
    }, [isOpen, activeDesktopId]);

    // Handle Escape key to close
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return;
            if (e.key === 'Escape') {
                if (editingDesktopId) {
                    setEditingDesktopId(null);
                } else {
                    onClose();
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, editingDesktopId, onClose]);

    useEffect(() => {
        if (editingDesktopId && editInputRef.current) {
            editInputRef.current.focus();
            editInputRef.current.select();
        }
    }, [editingDesktopId]);

    if (!isOpen) return null;

    const startEditing = (desktop: DesktopSpace, e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingDesktopId(desktop.id);
        setEditName(desktop.name);
    };

    const commitRename = (id: string) => {
        const trimmed = editName.trim();
        if (trimmed) {
            onRenameDesktop(id, trimmed);
        }
        setEditingDesktopId(null);
    };

    // Filter windows for the selected preview desktop
    const desktopWindows = windows.filter(w => {
        const belongsToDesktop = (w.desktopId || activeDesktopId) === filterDesktopId || w.desktopId === 'all';
        if (!belongsToDesktop) return false;
        if (searchQuery.trim()) {
            return w.title.toLowerCase().includes(searchQuery.toLowerCase());
        }
        return true;
    });

    const activeDesktopObj = desktops.find(d => d.id === filterDesktopId) || desktops[0];

    return (
        <div 
            className="fixed inset-0 z-[3500] bg-black/75 backdrop-blur-2xl flex flex-col p-6 animate-[scale-in_0.2s_ease-out] select-none overflow-hidden"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            {/* Top Bar: Title & Desktop Shelf */}
            <div className="max-w-6xl w-full mx-auto flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/20 text-primary flex items-center justify-center">
                            <Icon name="virtual-desktop" size={22} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white tracking-tight">Virtual Desktops</h2>
                            <p className="text-xs text-white/60">
                                Switch between desktop spaces, organize workflows, or move application windows
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Search in Task View */}
                        <div className="relative">
                            <Icon name="search" size={15} className="absolute left-3 top-2 text-white/50" />
                            <input 
                                type="text"
                                placeholder="Search open windows..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="bg-white/10 text-white placeholder-white/40 text-xs rounded-full pl-8 pr-3 py-1.5 outline-none focus:bg-white/20 transition-all border border-white/10 w-52"
                            />
                        </div>

                        <button 
                            onClick={onClose}
                            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
                            title="Close (Esc)"
                        >
                            <Icon name="close" size={18} />
                        </button>
                    </div>
                </div>

                {/* Desktops Strip / Carousel */}
                <div className="flex items-center gap-3 overflow-x-auto pb-2 pt-1 scrollbar-none">
                    {desktops.map((desktop, idx) => {
                        const isCurrentActive = desktop.id === activeDesktopId;
                        const isSelectedPreview = desktop.id === filterDesktopId;
                        const count = windows.filter(w => (w.desktopId || activeDesktopId) === desktop.id || w.desktopId === 'all').length;
                        const desktopAppIcons = windows
                            .filter(w => (w.desktopId || activeDesktopId) === desktop.id || w.desktopId === 'all')
                            .map(w => apps.find(a => a.id === w.appId)?.icon)
                            .filter(Boolean)
                            .slice(0, 4);

                        return (
                            <div 
                                key={desktop.id}
                                onClick={() => {
                                    setFilterDesktopId(desktop.id);
                                    if (desktop.id !== activeDesktopId) {
                                        onSwitchDesktop(desktop.id);
                                    }
                                }}
                                className={`group relative w-56 h-36 rounded-2xl cursor-pointer p-3 flex flex-col justify-between transition-all duration-200 border text-left shrink-0
                                    ${isSelectedPreview 
                                        ? 'bg-white/20 border-primary ring-2 ring-primary/80 shadow-2xl scale-[1.02]' 
                                        : 'bg-white/10 border-white/10 hover:bg-white/15 hover:border-white/20'
                                    }
                                `}
                            >
                                {/* Header of Desktop Card */}
                                <div className="flex items-center justify-between">
                                    {editingDesktopId === desktop.id ? (
                                        <input
                                            ref={editInputRef}
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                            onBlur={() => commitRename(desktop.id)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') commitRename(desktop.id);
                                                if (e.key === 'Escape') setEditingDesktopId(null);
                                            }}
                                            onClick={(e) => e.stopPropagation()}
                                            className="bg-black/60 text-white text-xs px-2 py-0.5 rounded outline-none border border-primary w-28"
                                        />
                                    ) : (
                                        <div className="flex items-center gap-1.5 max-w-[140px]">
                                            <span className="font-semibold text-white text-xs truncate">{desktop.name}</span>
                                            <button 
                                                onClick={(e) => startEditing(desktop, e)} 
                                                className="opacity-0 group-hover:opacity-60 hover:opacity-100 p-0.5 rounded text-white transition-opacity"
                                                title="Rename Desktop"
                                            >
                                                <Icon name="edit" size={12} />
                                            </button>
                                        </div>
                                    )}

                                    {/* Delete Desktop Button */}
                                    {desktops.length > 1 && (
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onRemoveDesktop(desktop.id);
                                            }}
                                            className="opacity-0 group-hover:opacity-80 hover:!opacity-100 p-1 hover:bg-red-500/80 rounded-full text-white transition-all"
                                            title="Close desktop space (windows will be moved)"
                                        >
                                            <Icon name="close" size={12} />
                                        </button>
                                    )}
                                </div>

                                {/* Miniature Desktop Preview Content */}
                                <div className="flex-1 flex items-center justify-center my-1.5 bg-black/25 rounded-xl border border-white/5 relative overflow-hidden">
                                    {count > 0 ? (
                                        <div className="flex items-center gap-1.5 flex-wrap justify-center p-2">
                                            {desktopAppIcons.map((icon, iconIdx) => (
                                                <div key={iconIdx} className="w-6 h-6 rounded-md bg-white/20 text-white flex items-center justify-center shadow-sm">
                                                    <Icon name={icon as string} size={14} />
                                                </div>
                                            ))}
                                            {count > 4 && (
                                                <span className="text-[10px] text-white/70 font-mono">+{count - 4}</span>
                                            )}
                                        </div>
                                    ) : (
                                        <span className="text-[10px] text-white/40 italic">Empty Space</span>
                                    )}
                                </div>

                                {/* Footer of Desktop Card */}
                                <div className="flex items-center justify-between text-[11px] text-white/70">
                                    <span className="tabular-nums">{count} {count === 1 ? 'window' : 'windows'}</span>
                                    {isCurrentActive && (
                                        <span className="bg-primary/90 text-onPrimary px-1.5 py-0.5 rounded text-[10px] font-semibold">Active</span>
                                    )}
                                </div>
                            </div>
                        );
                    })}

                    {/* Add Desktop Button */}
                    <button
                        onClick={() => onCreateDesktop()}
                        className="w-36 h-36 rounded-2xl border border-dashed border-white/25 hover:border-primary/80 bg-white/5 hover:bg-primary/10 text-white/70 hover:text-white flex flex-col items-center justify-center gap-2 transition-all shrink-0 active:scale-95 group"
                        title="Create new virtual desktop (Alt + Shift + D)"
                    >
                        <div className="w-10 h-10 rounded-full bg-white/10 group-hover:bg-primary group-hover:text-white flex items-center justify-center transition-colors">
                            <Icon name="plus" size={20} />
                        </div>
                        <span className="text-xs font-medium">New Desktop</span>
                    </button>
                </div>
            </div>

            {/* Separator */}
            <div className="max-w-6xl w-full mx-auto my-3 border-b border-white/10 flex items-center justify-between pb-2">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white">
                        Windows in {activeDesktopObj.name}
                    </span>
                    <span className="text-xs text-white/50">({desktopWindows.length})</span>

                    {onTileWindows && desktopWindows.length > 0 && (
                        <button
                            onClick={() => {
                                onTileWindows();
                                onClose();
                            }}
                            className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium flex items-center gap-1.5 transition-colors border border-white/10 ml-2"
                            title="Arrange all windows in this space into a grid layout (Alt + T)"
                        >
                            <Icon name="tile" size={13} />
                            <span>Tile Windows</span>
                        </button>
                    )}
                </div>

                <div className="text-xs text-white/50 flex items-center gap-4">
                    <span>Shortcut: <kbd className="bg-white/15 px-1.5 py-0.5 rounded text-[10px] font-mono text-white">Alt + 1..9</kbd> switch</span>
                    <span><kbd className="bg-white/15 px-1.5 py-0.5 rounded text-[10px] font-mono text-white">Alt + ← / →</kbd> cycle</span>
                    <span><kbd className="bg-white/15 px-1.5 py-0.5 rounded text-[10px] font-mono text-white">Esc</kbd> exit</span>
                </div>
            </div>

            {/* Windows Grid */}
            <div className="max-w-6xl w-full mx-auto flex-1 overflow-y-auto pr-1">
                {desktopWindows.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-12">
                        {desktopWindows.map(win => {
                            const appDef = apps.find(a => a.id === win.appId);
                            const isPinned = win.desktopId === 'all';

                            return (
                                <div 
                                    key={win.id}
                                    className="bg-surfaceVariant/80 backdrop-blur-md rounded-2xl border border-white/15 shadow-xl flex flex-col overflow-hidden hover:ring-2 hover:ring-primary/80 transition-all duration-200 group"
                                >
                                    {/* Window Header */}
                                    <div className="p-3 bg-black/10 border-b border-white/10 flex items-center justify-between">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <div className="w-6 h-6 rounded-lg bg-primary/20 text-primary flex items-center justify-center shrink-0">
                                                <Icon name={appDef?.icon || 'spark'} size={14} />
                                            </div>
                                            <span className="text-xs font-semibold text-onSurface truncate">{win.title}</span>
                                        </div>
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onCloseWindow(win.id);
                                            }}
                                            className="w-6 h-6 rounded-full hover:bg-red-500 hover:text-white text-onSurface/60 flex items-center justify-center transition-colors shrink-0"
                                            title="Close Window"
                                        >
                                            <Icon name="close" size={12} />
                                        </button>
                                    </div>

                                    {/* Window Mini Mockup / Preview Body */}
                                    <div 
                                        onClick={() => {
                                            onFocusWindow(win.id);
                                            onClose();
                                        }}
                                        className="h-28 bg-black/15 p-3 flex flex-col justify-center items-center cursor-pointer group-hover:bg-black/25 transition-colors relative"
                                    >
                                        <div className="w-10 h-10 rounded-xl bg-white/20 text-onSurface/80 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                                            <Icon name={appDef?.icon || 'spark'} size={24} />
                                        </div>
                                        <span className="text-[11px] text-onSurface/70 font-medium">Click to switch to window</span>

                                        {isPinned && (
                                            <div className="absolute top-2 right-2 bg-primary text-onPrimary text-[10px] font-mono px-2 py-0.5 rounded-full font-bold">
                                                All Desktops
                                            </div>
                                        )}
                                    </div>

                                    {/* Action Bar */}
                                    <div className="p-2.5 bg-black/5 border-t border-white/10 flex flex-col gap-2">
                                        <div className="flex items-center gap-1.5">
                                            {/* Move to another desktop dropdown */}
                                            <label className="text-[11px] text-onSurface/60 shrink-0">Move to:</label>
                                            <select
                                                value={isPinned ? 'all' : (win.desktopId || activeDesktopId)}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    if (val === '__new__') {
                                                        onCreateDesktop();
                                                    } else if (val === 'all') {
                                                        onToggleAllDesktops(win.id);
                                                    } else {
                                                        onMoveWindowToDesktop(win.id, val);
                                                    }
                                                }}
                                                className="flex-1 bg-surface border border-black/10 rounded-lg px-2 py-1 text-xs text-onSurface outline-none focus:ring-1 ring-primary"
                                            >
                                                {desktops.map(d => (
                                                    <option key={d.id} value={d.id}>
                                                        {d.name} {(win.desktopId || activeDesktopId) === d.id && !isPinned ? '(Current)' : ''}
                                                    </option>
                                                ))}
                                                <option value="all">Pin on all desktops</option>
                                                <option value="__new__">+ New Desktop Space</option>
                                            </select>
                                        </div>

                                        <div className="flex items-center justify-between pt-1">
                                            <button
                                                onClick={() => onToggleAllDesktops(win.id)}
                                                className={`text-[11px] px-2 py-1 rounded transition-colors flex items-center gap-1
                                                    ${isPinned ? 'bg-primary text-onPrimary' : 'hover:bg-black/10 text-onSurface/70'}
                                                `}
                                                title="Toggle display across all spaces"
                                            >
                                                <Icon name="pin" size={11} />
                                                <span>{isPinned ? 'Unpin' : 'Pin to all'}</span>
                                            </button>

                                            <button
                                                onClick={() => {
                                                    onFocusWindow(win.id);
                                                    onClose();
                                                }}
                                                className="text-[11px] font-medium bg-primary text-onPrimary hover:bg-primary/90 px-3 py-1 rounded-lg transition-colors"
                                            >
                                                Open
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="h-64 flex flex-col items-center justify-center text-center text-white/50 border border-dashed border-white/15 rounded-3xl p-8">
                        <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-white/60 mb-3">
                            <Icon name="virtual-desktop" size={28} />
                        </div>
                        <h3 className="text-base font-semibold text-white mb-1">
                            {searchQuery ? 'No windows match your search' : `No windows open on ${activeDesktopObj.name}`}
                        </h3>
                        <p className="text-xs text-white/50 max-w-sm">
                            {searchQuery 
                                ? 'Try clearing your search query to see all windows on this desktop.' 
                                : 'Launch apps from the taskbar, or move existing windows from other spaces into this desktop.'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- Taskbar ---
export const Taskbar: React.FC<{
  apps: AppDefinition[];
  runningApps: WindowState[];
  allWindows?: WindowState[];
  desktops?: DesktopSpace[];
  activeDesktopId?: string;
  onSwitchDesktop?: (desktopId: string) => void;
  onCreateDesktop?: () => void;
  onToggleTaskView?: () => void;
  isTaskViewOpen?: boolean;
  onTileWindows?: () => void;
  onLaunch: (id: AppType) => void;
  onToggleStart: () => void;
  isStartOpen: boolean;
  onLock: () => void;
  onToggleCalendar: () => void;
}> = ({ 
  apps, 
  runningApps, 
  allWindows = runningApps,
  desktops = [],
  activeDesktopId = 'desktop-1',
  onSwitchDesktop,
  onCreateDesktop,
  onToggleTaskView,
  isTaskViewOpen = false,
  onTileWindows,
  onLaunch, 
  onToggleStart, 
  isStartOpen, 
  onLock, 
  onToggleCalendar 
}) => {
    const [time, setTime] = useState(new Date());
    const [isDesktopMenuOpen, setIsDesktopMenuOpen] = useState(false);
    const desktopBtnRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        const t = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(t);
    }, []);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (desktopBtnRef.current && !desktopBtnRef.current.contains(e.target as Node)) {
                setIsDesktopMenuOpen(false);
            }
        };
        if (isDesktopMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isDesktopMenuOpen]);

    // Unique running apps on ALL desktops
    const allRunningAppIds = Array.from(new Set(allWindows.map(w => w.appId)));
    const pinnedApps = [AppType.FileExplorer, AppType.Browser, AppType.GeminiAssistant, AppType.Settings];
    const displayedApps = Array.from(new Set([...pinnedApps, ...allRunningAppIds]));

    const currentDesktopIndex = desktops.findIndex(d => d.id === activeDesktopId);
    const activeDesktopObj = desktops[currentDesktopIndex] || desktops[0];

    const handlePrevDesktop = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!onSwitchDesktop || desktops.length <= 1) return;
        const newIdx = (currentDesktopIndex - 1 + desktops.length) % desktops.length;
        onSwitchDesktop(desktops[newIdx].id);
    };

    const handleNextDesktop = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!onSwitchDesktop || desktops.length <= 1) return;
        const newIdx = (currentDesktopIndex + 1) % desktops.length;
        onSwitchDesktop(desktops[newIdx].id);
    };

    return (
        <div className="h-12 bg-surface/80 backdrop-blur-md border-t border-white/10 flex items-center px-2 justify-between select-none relative z-[1000]">
            
            {/* Start, Virtual Desktop Switcher & Apps */}
            <div className="flex items-center gap-1 h-full">
                {/* Start Button */}
                <button 
                    id="start-button"
                    onClick={onToggleStart}
                    className={`h-10 w-10 rounded-lg flex items-center justify-center transition-all active:scale-95 group relative ${isStartOpen ? 'bg-white/10' : 'hover:bg-white/5'}`}
                    title="Start Menu"
                >
                    <Icon name="spark" size={24} className={`text-primary transition-transform duration-300 ${isStartOpen ? 'rotate-90 scale-110' : 'group-hover:scale-110'}`} />
                </button>

                {/* Virtual Desktop / Task View Button */}
                {desktops.length > 0 && onToggleTaskView && (
                    <div className="relative flex items-center" ref={desktopBtnRef}>
                        <button
                            onClick={onToggleTaskView}
                            onContextMenu={(e) => {
                                e.preventDefault();
                                setIsDesktopMenuOpen(!isDesktopMenuOpen);
                            }}
                            className={`h-10 px-2.5 rounded-lg flex items-center gap-2 transition-all active:scale-95 hover:bg-white/10 text-onSurface
                                ${isTaskViewOpen ? 'bg-primary/20 text-primary ring-1 ring-primary/40' : ''}
                            `}
                            title={`Task View & Virtual Desktops (Alt + D) - Active: ${activeDesktopObj?.name || 'Desktop 1'}`}
                        >
                            <Icon name="virtual-desktop" size={19} className={isTaskViewOpen ? 'text-primary' : 'opacity-85'} />
                            <span className="text-xs font-medium max-w-[85px] truncate hidden sm:inline-block">
                                {activeDesktopObj?.name || 'Desktop 1'}
                            </span>

                            {/* Desktops Indicator Dots */}
                            <div className="flex items-center gap-1 pl-0.5">
                                {desktops.slice(0, 5).map((d) => (
                                    <div 
                                        key={d.id} 
                                        className={`w-1.5 h-1.5 rounded-full transition-all
                                            ${d.id === activeDesktopId ? 'w-3 bg-primary' : 'bg-onSurface/30'}
                                        `}
                                    />
                                ))}
                            </div>
                        </button>

                        {/* Quick Previous/Next Space Cycling Buttons */}
                        {desktops.length > 1 && onSwitchDesktop && (
                            <div className="hidden md:flex items-center">
                                <button 
                                    onClick={handlePrevDesktop} 
                                    className="p-1 hover:bg-white/10 rounded text-onSurface/60 hover:text-onSurface transition-colors"
                                    title="Previous desktop (Alt + Left)"
                                >
                                    <Icon name="chevron-left" size={12} />
                                </button>
                                <button 
                                    onClick={handleNextDesktop} 
                                    className="p-1 hover:bg-white/10 rounded text-onSurface/60 hover:text-onSurface transition-colors"
                                    title="Next desktop (Alt + Right)"
                                >
                                    <Icon name="chevron-right" size={12} />
                                </button>
                            </div>
                        )}

                        {/* Virtual Desktops Quick Menu */}
                        {isDesktopMenuOpen && (
                            <div className="absolute bottom-12 left-0 w-56 bg-surface/95 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl py-1.5 z-[2100] animate-[scale-in_0.15s_ease-out] text-xs text-onSurface">
                                <div className="px-3 py-1 font-semibold text-primary/80 border-b border-black/5 flex items-center justify-between">
                                    <span>Virtual Desktops</span>
                                    <span className="text-[10px] opacity-60 font-mono">{desktops.length} spaces</span>
                                </div>
                                <div className="py-1">
                                    {desktops.map((d, i) => {
                                        const count = allWindows.filter(w => (w.desktopId || activeDesktopId) === d.id || w.desktopId === 'all').length;
                                        return (
                                            <button
                                                key={d.id}
                                                onClick={() => {
                                                    onSwitchDesktop?.(d.id);
                                                    setIsDesktopMenuOpen(false);
                                                }}
                                                className={`w-full text-left px-3 py-1.5 flex items-center justify-between hover:bg-primary hover:text-white transition-colors
                                                    ${d.id === activeDesktopId ? 'bg-primary/10 font-semibold text-primary' : ''}
                                                `}
                                            >
                                                <div className="flex items-center gap-2 truncate">
                                                    <span className="font-mono text-[10px] opacity-60">#{i + 1}</span>
                                                    <span className="truncate">{d.name}</span>
                                                </div>
                                                <span className="text-[10px] opacity-60">{count} {count === 1 ? 'app' : 'apps'}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                                <div className="border-t border-black/5 pt-1">
                                    {onCreateDesktop && (
                                        <button
                                            onClick={() => {
                                                onCreateDesktop();
                                                setIsDesktopMenuOpen(false);
                                            }}
                                            className="w-full text-left px-3 py-1.5 flex items-center gap-2 hover:bg-primary hover:text-white transition-colors text-primary font-medium"
                                        >
                                            <Icon name="plus" size={13} />
                                            <span>New Desktop Space</span>
                                        </button>
                                    )}
                                    {onTileWindows && (
                                        <button
                                            onClick={() => {
                                                onTileWindows();
                                                setIsDesktopMenuOpen(false);
                                            }}
                                            className="w-full text-left px-3 py-1.5 flex items-center gap-2 hover:bg-primary hover:text-white transition-colors"
                                        >
                                            <Icon name="tile" size={13} />
                                            <span>Tile Windows (Alt + T)</span>
                                        </button>
                                    )}
                                    <button
                                        onClick={() => {
                                            onToggleTaskView();
                                            setIsDesktopMenuOpen(false);
                                        }}
                                        className="w-full text-left px-3 py-1.5 flex items-center gap-2 hover:bg-primary hover:text-white transition-colors"
                                    >
                                        <Icon name="virtual-desktop" size={13} />
                                        <span>Open Task View (Alt + D)</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Tile Windows Quick Button */}
                {onTileWindows && (
                    <button
                        onClick={onTileWindows}
                        className="h-10 px-2 rounded-lg flex items-center justify-center transition-all active:scale-95 hover:bg-white/10 text-onSurface/75 hover:text-onSurface"
                        title="Tile Windows in Grid Layout (Alt + T)"
                    >
                        <Icon name="tile" size={17} />
                    </button>
                )}

                <div className="w-px h-6 bg-black/10 mx-1"></div>

                {/* App Icons */}
                {displayedApps.map(appId => {
                    const app = apps.find(a => a.id === appId);
                    const isOpenOnCurrentDesktop = runningApps.some(w => w.appId === appId);
                    const isOpenOnOtherDesktop = !isOpenOnCurrentDesktop && allWindows.some(w => w.appId === appId);
                    const isFocused = runningApps.some(w => w.appId === appId && !w.isMinimized && w.id === runningApps.reduce((prev, current) => (prev.zIndex > current.zIndex) ? prev : current).id);
                    
                    if (!app) return null;

                    return (
                        <button 
                            key={appId}
                            onClick={() => onLaunch(appId)}
                            className={`h-10 w-10 rounded-lg flex items-center justify-center transition-all relative active:scale-95 hover:bg-white/5
                                ${isOpenOnCurrentDesktop || isOpenOnOtherDesktop ? 'bg-white/5' : ''}
                            `}
                            title={
                                isOpenOnOtherDesktop 
                                    ? `${app.name} (Running on another desktop)` 
                                    : app.name
                            }
                        >
                            <Icon name={app.icon} size={22} className={isOpenOnCurrentDesktop ? 'text-onSurface' : isOpenOnOtherDesktop ? 'text-onSurface/70' : 'opacity-80'} />
                            
                            {/* Running Indicators */}
                            {isOpenOnCurrentDesktop && (
                                <div className={`absolute bottom-0.5 w-1.5 h-1.5 rounded-full transition-all duration-300 ${isFocused ? 'w-4 bg-primary' : 'bg-onSurface/40'}`}></div>
                            )}

                            {isOpenOnOtherDesktop && (
                                <div className="absolute bottom-0.5 flex gap-0.5 items-center">
                                    <div className="w-1 h-1 rounded-full bg-primary/70"></div>
                                    <div className="w-1 h-1 rounded-full bg-primary/70"></div>
                                </div>
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
