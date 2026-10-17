
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { AppDefinition, AppType, WindowState, ContextMenuState, NotificationItem, DesktopSpace } from './types';
import { Icon, Taskbar, StartMenu, Window, ContextMenu, DesktopClock, DesktopCalendar, BootScreen, ToastNotification, LockScreen, CalendarWidget, TaskViewOverlay, DesktopSwitcherHUD, SnapGhostPreview } from './components/SystemUI';
import { applyTheme, loadSettings, getFile } from './services/system';

// Apps
import { FileExplorer, Settings, Terminal, Notes, Browser, SpaceApp } from './apps/Productivity';
import { Calculator, MediaPlayer, PhotoViewer, CameraApp, VoiceRecorder } from './apps/Media';
import { TicTacToeGame, SnakeGame, MinesweeperGame } from './apps/Games';
import { GeminiAssistant } from './apps/AI';
import { PaintApp } from './apps/Creative';
import { TextEditor, ClockApp, TaskManager } from './apps/Utilities';

const APPS: AppDefinition[] = [
  // Productivity
  { id: AppType.FileExplorer, name: 'Files', icon: 'files', category: 'Productivity', component: FileExplorer, defaultWidth: 600, defaultHeight: 400 },
  { id: AppType.Browser, name: 'Browser', icon: 'browser', category: 'Productivity', component: Browser, defaultWidth: 800, defaultHeight: 600 },
  { id: AppType.Notes, name: 'Notes', icon: 'notes', category: 'Productivity', component: Notes, defaultWidth: 500, defaultHeight: 400 },
  { id: AppType.TextEditor, name: 'Text Editor', icon: 'code', category: 'Productivity', component: TextEditor, defaultWidth: 600, defaultHeight: 500 },
  { id: AppType.Terminal, name: 'Terminal', icon: 'terminal', category: 'System', component: Terminal, defaultWidth: 500, defaultHeight: 350 },
  { id: AppType.GeminiAssistant, name: 'Assistant', icon: 'spark', category: 'Productivity', component: GeminiAssistant, defaultWidth: 400, defaultHeight: 600 },
  { id: AppType.SpaceApp, name: 'SpaceApp', icon: 'rocket', category: 'Productivity', component: SpaceApp, defaultWidth: 900, defaultHeight: 600 },
  
  // Creative
  { id: AppType.Paint, name: 'Paint', icon: 'palette', category: 'Creative', component: PaintApp, defaultWidth: 800, defaultHeight: 600 },

  // Media
  { id: AppType.Calculator, name: 'Calculator', icon: 'calculator', category: 'Productivity', component: Calculator, defaultWidth: 300, defaultHeight: 400 },
  { id: AppType.MediaPlayer, name: 'Media', icon: 'media', category: 'Media', component: MediaPlayer, defaultWidth: 600, defaultHeight: 400 },
  { id: AppType.PhotoViewer, name: 'Photos', icon: 'photos', category: 'Media', component: PhotoViewer, defaultWidth: 600, defaultHeight: 500 },
  { id: AppType.Camera, name: 'Camera', icon: 'camera', category: 'Media', component: CameraApp, defaultWidth: 640, defaultHeight: 520 },
  { id: AppType.VoiceRecorder, name: 'Voice Recorder', icon: 'mic', category: 'Media', component: VoiceRecorder, defaultWidth: 400, defaultHeight: 400 },
  
  // Games
  { id: AppType.GameSnake, name: 'Snake', icon: 'snake', category: 'Games', component: SnakeGame, defaultWidth: 340, defaultHeight: 400 },
  { id: AppType.GameTicTacToe, name: 'Tic Tac Toe', icon: 'tictactoe', category: 'Games', component: TicTacToeGame, defaultWidth: 320, defaultHeight: 440 },
  { id: AppType.GameMinesweeper, name: 'Minesweeper', icon: 'minesweeper', category: 'Games', component: MinesweeperGame, defaultWidth: 400, defaultHeight: 400 },

  // Utilities
  { id: AppType.Clock, name: 'Clock', icon: 'clock', category: 'Utilities', component: ClockApp, defaultWidth: 350, defaultHeight: 450 },
  { id: AppType.TaskManager, name: 'Task Manager', icon: 'activity', category: 'System', component: TaskManager, defaultWidth: 500, defaultHeight: 400 },

  // System
  { id: AppType.Settings, name: 'Settings', icon: 'settings', category: 'System', component: Settings, defaultWidth: 500, defaultHeight: 600 },
];

const App: React.FC = () => {
  const [booting, setBooting] = useState(true);
  const [locked, setLocked] = useState(false);
  const [windows, setWindows] = useState<WindowState[]>([]);
  const [activeWindowId, setActiveWindowId] = useState<string | null>(null);
  const [startOpen, setStartOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [nextZIndex, setNextZIndex] = useState(10);
  const [wallpaperUrl, setWallpaperUrl] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({ isOpen: false, x: 0, y: 0, items: [] });
  const [notification, setNotification] = useState<NotificationItem | null>(null);
  
  // Virtual Desktops State
  const [desktops, setDesktops] = useState<DesktopSpace[]>(() => {
    const saved = localStorage.getItem('webos_virtual_desktops');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error("Failed to parse saved virtual desktops", e);
      }
    }
    return [{ id: 'desktop-1', name: 'Desktop 1', createdAt: 1 }];
  });

  const [activeDesktopId, setActiveDesktopId] = useState<string>(() => {
    const savedActive = localStorage.getItem('webos_active_desktop');
    return savedActive || 'desktop-1';
  });

  const [isTaskViewOpen, setIsTaskViewOpen] = useState(false);
  const [hudDesktopName, setHudDesktopName] = useState<string | null>(null);
  const [hudWindowCount, setHudWindowCount] = useState<number | undefined>(undefined);
  const [snapPreviewTarget, setSnapPreviewTarget] = useState<'left' | 'right' | 'top' | null>(null);
  const hudTimerRef = useRef<any>(null);

  // Sync virtual desktops to localStorage
  useEffect(() => {
    localStorage.setItem('webos_virtual_desktops', JSON.stringify(desktops));
  }, [desktops]);

  useEffect(() => {
    localStorage.setItem('webos_active_desktop', activeDesktopId);
  }, [activeDesktopId]);

  // Ensure activeDesktopId is valid
  useEffect(() => {
    if (desktops.length > 0 && !desktops.some(d => d.id === activeDesktopId)) {
      setActiveDesktopId(desktops[0].id);
    }
  }, [desktops, activeDesktopId]);

  // Desktop Apps Persistence
  const [desktopApps, setDesktopApps] = useState<AppType[]>(() => {
    const saved = localStorage.getItem('webos_desktop_apps');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    // Default: All apps
    return APPS.map(a => a.id);
  });

  useEffect(() => {
    localStorage.setItem('webos_desktop_apps', JSON.stringify(desktopApps));
  }, [desktopApps]);

  const loadWallpaper = useCallback(async () => {
      try {
          const file = await getFile('sys_wallpaper');
          if (file && file.content) {
              const url = URL.createObjectURL(file.content);
              setWallpaperUrl(url);
          } else {
              setWallpaperUrl(null);
          }
      } catch (e) {
          console.error("Failed to load wallpaper", e);
      }
  }, []);

  useEffect(() => {
    // Init theme
    const settings = loadSettings();
    applyTheme(settings);
    loadWallpaper();
  }, [loadWallpaper]);

  const showNotification = useCallback((msg: string) => {
      const id = Date.now().toString();
      setNotification({ id, message: msg, timestamp: Date.now() });
      setTimeout(() => setNotification(curr => curr?.id === id ? null : curr), 3000);
  }, []);

  const triggerDesktopHUD = useCallback((name: string, count?: number) => {
    if (hudTimerRef.current) clearTimeout(hudTimerRef.current);
    setHudDesktopName(name);
    setHudWindowCount(count);
    hudTimerRef.current = setTimeout(() => {
      setHudDesktopName(null);
    }, 1300);
  }, []);

  // Desktop Management Methods
  const switchDesktop = useCallback((targetId: string) => {
    const target = desktops.find(d => d.id === targetId);
    if (!target) return;
    setActiveDesktopId(targetId);
    const winCount = windows.filter(w => (w.desktopId || activeDesktopId) === targetId || w.desktopId === 'all').length;
    triggerDesktopHUD(target.name, winCount);
  }, [desktops, windows, activeDesktopId, triggerDesktopHUD]);

  const createDesktop = useCallback((customName?: string): string => {
    const newId = `desktop-${Date.now()}`;
    const name = customName || `Desktop ${desktops.length + 1}`;
    const newSpace: DesktopSpace = {
      id: newId,
      name,
      createdAt: Date.now()
    };

    setDesktops(prev => [...prev, newSpace]);
    setActiveDesktopId(newId);
    showNotification(`Created and switched to ${name}`);
    triggerDesktopHUD(name, 0);
    return newId;
  }, [desktops.length, showNotification, triggerDesktopHUD]);

  const removeDesktop = useCallback((targetId: string) => {
    if (desktops.length <= 1) {
      showNotification("Cannot remove the only virtual desktop");
      return;
    }

    const targetIdx = desktops.findIndex(d => d.id === targetId);
    if (targetIdx === -1) return;
    const targetName = desktops[targetIdx].name;

    // Pick fallback desktop
    const fallbackIdx = targetIdx > 0 ? targetIdx - 1 : targetIdx + 1;
    const fallbackSpace = desktops[fallbackIdx];

    // Reassign all windows of the removed desktop to the fallback
    setWindows(prev => prev.map(w => {
      if ((w.desktopId || activeDesktopId) === targetId) {
        return { ...w, desktopId: fallbackSpace.id };
      }
      return w;
    }));

    // Update desktops list
    setDesktops(prev => prev.filter(d => d.id !== targetId));

    // If active desktop was removed, switch to fallback
    if (activeDesktopId === targetId) {
      setActiveDesktopId(fallbackSpace.id);
      triggerDesktopHUD(fallbackSpace.name);
    }

    showNotification(`Removed ${targetName}. Open windows moved to ${fallbackSpace.name}.`);
  }, [desktops, activeDesktopId, showNotification, triggerDesktopHUD]);

  const renameDesktop = useCallback((id: string, newName: string) => {
    setDesktops(prev => prev.map(d => d.id === id ? { ...d, name: newName } : d));
    showNotification(`Renamed to "${newName}"`);
  }, [showNotification]);

  const moveWindowToDesktop = useCallback((windowId: string, targetDesktopId: string) => {
    const target = desktops.find(d => d.id === targetDesktopId);
    setWindows(prev => prev.map(w => w.id === windowId ? { ...w, desktopId: targetDesktopId } : w));
    if (target) {
      showNotification(`Moved window to ${target.name}`);
    }
  }, [desktops, showNotification]);

  const toggleWindowOnAllDesktops = useCallback((windowId: string) => {
    setWindows(prev => prev.map(w => {
      if (w.id === windowId) {
        const isAll = w.desktopId === 'all';
        const newDesktopId = isAll ? activeDesktopId : 'all';
        showNotification(isAll ? "Window unpinned from all desktops" : "Window pinned to all desktops");
        return { ...w, desktopId: newDesktopId };
      }
      return w;
    }));
  }, [activeDesktopId, showNotification]);

  const createDesktopAndMove = useCallback((windowId: string) => {
    const newId = `desktop-${Date.now()}`;
    const name = `Desktop ${desktops.length + 1}`;
    const newSpace: DesktopSpace = {
      id: newId,
      name,
      createdAt: Date.now()
    };

    setDesktops(prev => [...prev, newSpace]);
    setWindows(prev => prev.map(w => w.id === windowId ? { ...w, desktopId: newId } : w));
    setActiveDesktopId(newId);
    showNotification(`Created ${name} and moved window`);
    triggerDesktopHUD(name, 1);
  }, [desktops.length, showNotification, triggerDesktopHUD]);

  // Tile all non-minimized windows on active desktop into a balanced grid
  const tileWindows = useCallback(() => {
    const currentDesktopWindows = windows.filter(win => 
      (!win.desktopId || win.desktopId === 'all' || win.desktopId === activeDesktopId) && !win.isMinimized
    );

    if (currentDesktopWindows.length === 0) {
      showNotification("No open windows to tile on this desktop");
      return;
    }

    const count = currentDesktopWindows.length;
    const taskbarHeight = 48;
    const padding = 10;
    const gap = 8;
    const availableW = window.innerWidth - (padding * 2);
    const availableH = window.innerHeight - taskbarHeight - (padding * 2);

    const layout: { id: string; x: number; y: number; width: number; height: number }[] = [];

    if (count === 1) {
      layout.push({
        id: currentDesktopWindows[0].id,
        x: padding + Math.floor(availableW * 0.08),
        y: padding + Math.floor(availableH * 0.04),
        width: Math.floor(availableW * 0.84),
        height: Math.floor(availableH * 0.92)
      });
    } else if (count === 2) {
      const colW = Math.floor((availableW - gap) / 2);
      layout.push({ id: currentDesktopWindows[0].id, x: padding, y: padding, width: colW, height: availableH });
      layout.push({ id: currentDesktopWindows[1].id, x: padding + colW + gap, y: padding, width: colW, height: availableH });
    } else if (count === 3) {
      const colW = Math.floor((availableW - gap) / 2);
      const rowH = Math.floor((availableH - gap) / 2);
      layout.push({ id: currentDesktopWindows[0].id, x: padding, y: padding, width: colW, height: availableH });
      layout.push({ id: currentDesktopWindows[1].id, x: padding + colW + gap, y: padding, width: colW, height: rowH });
      layout.push({ id: currentDesktopWindows[2].id, x: padding + colW + gap, y: padding + rowH + gap, width: colW, height: availableH - rowH - gap });
    } else if (count === 4) {
      const colW = Math.floor((availableW - gap) / 2);
      const rowH = Math.floor((availableH - gap) / 2);
      layout.push({ id: currentDesktopWindows[0].id, x: padding, y: padding, width: colW, height: rowH });
      layout.push({ id: currentDesktopWindows[1].id, x: padding + colW + gap, y: padding, width: colW, height: rowH });
      layout.push({ id: currentDesktopWindows[2].id, x: padding, y: padding + rowH + gap, width: colW, height: rowH });
      layout.push({ id: currentDesktopWindows[3].id, x: padding + colW + gap, y: padding + rowH + gap, width: colW, height: rowH });
    } else {
      const cols = Math.ceil(Math.sqrt(count));
      const rows = Math.ceil(count / cols);
      const colW = Math.floor((availableW - (cols - 1) * gap) / cols);
      const rowH = Math.floor((availableH - (rows - 1) * gap) / rows);

      currentDesktopWindows.forEach((win, index) => {
        const col = index % cols;
        const row = Math.floor(index / cols);
        const itemsInThisRow = (row === rows - 1) ? (count - row * cols) : cols;
        let currentX = padding + col * (colW + gap);
        let currentW = colW;

        if (itemsInThisRow < cols && row === rows - 1) {
          const expandedW = Math.floor((availableW - (itemsInThisRow - 1) * gap) / itemsInThisRow);
          currentX = padding + col * (expandedW + gap);
          currentW = expandedW;
        }

        layout.push({
          id: win.id,
          x: currentX,
          y: padding + row * (rowH + gap),
          width: currentW,
          height: rowH
        });
      });
    }

    setWindows(prev => prev.map(w => {
      const item = layout.find(l => l.id === w.id);
      if (item) {
        return {
          ...w,
          x: item.x,
          y: item.y,
          width: item.width,
          height: item.height,
          isMaximized: false,
          snapState: null,
          prevBounds: (w.snapState || w.isMaximized) ? w.prevBounds : { x: w.x, y: w.y, width: w.width, height: w.height }
        };
      }
      return w;
    }));

    showNotification(`Tiled ${count} windows in grid layout`);
  }, [windows, activeDesktopId, showNotification]);

  const launchApp = useCallback((appId: AppType, data?: any, targetDesktopId?: string) => {
    const appDef = APPS.find(a => a.id === appId);
    if (!appDef) return;

    const id = Date.now().toString();
    const newWindow: WindowState = {
      id,
      appId,
      title: appDef.name,
      x: 50 + (windows.length * 20),
      y: 50 + (windows.length * 20),
      width: appDef.defaultWidth,
      height: appDef.defaultHeight,
      isMinimized: false,
      isMaximized: false,
      zIndex: nextZIndex,
      data,
      desktopId: targetDesktopId || activeDesktopId
    };

    setWindows(prev => [...prev, newWindow]);
    setNextZIndex(prev => prev + 1);
    setActiveWindowId(id);
    setStartOpen(false);
    setCalendarOpen(false);
  }, [nextZIndex, windows.length, activeDesktopId]);

  const closeWindow = (id: string) => {
    setWindows(prev => prev.filter(w => w.id !== id));
    if (activeWindowId === id) setActiveWindowId(null);
  };

  const focusWindow = (id: string) => {
    setActiveWindowId(id);
    setWindows(prev => prev.map(w => w.id === id ? { ...w, zIndex: nextZIndex, isMinimized: false } : w));
    setNextZIndex(prev => prev + 1);
  };

  const updateWindow = (id: string, updates: Partial<WindowState>) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, ...updates } : w));
  };

  const toggleMinimize = (id: string) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, isMinimized: !w.isMinimized } : w));
  };
  
  const toggleMaximize = (id: string) => {
    setWindows(prev => prev.map(w => {
      if (w.id === id) {
        if (w.isMaximized) {
          return {
            ...w,
            isMaximized: false,
            snapState: null,
            ...(w.prevBounds || { x: 50, y: 50, width: 600, height: 450 })
          };
        } else {
          const prev = (w.snapState || w.isMaximized)
            ? w.prevBounds
            : { x: w.x, y: w.y, width: w.width, height: w.height };
          return {
            ...w,
            isMaximized: true,
            snapState: null,
            prevBounds: prev
          };
        }
      }
      return w;
    }));
  };

  // Global Keyboard Shortcuts for Virtual Desktops
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in form controls
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }

      // Alt + D: Toggle Task View / Virtual Desktop overview
      if (e.altKey && !e.shiftKey && (e.key === 'd' || e.key === 'D')) {
        e.preventDefault();
        setIsTaskViewOpen(prev => !prev);
        return;
      }

      // Alt + T: Tile Windows in Grid
      if (e.altKey && !e.shiftKey && (e.key === 't' || e.key === 'T')) {
        e.preventDefault();
        tileWindows();
        return;
      }

      // Alt + Shift + D: Create new desktop space
      if (e.altKey && e.shiftKey && (e.key === 'd' || e.key === 'D')) {
        e.preventDefault();
        createDesktop();
        return;
      }

      // Alt + LeftArrow: Previous desktop
      if (e.altKey && e.key === 'ArrowLeft') {
        e.preventDefault();
        const curIdx = desktops.findIndex(d => d.id === activeDesktopId);
        if (curIdx > 0) {
          switchDesktop(desktops[curIdx - 1].id);
        } else if (desktops.length > 1) {
          switchDesktop(desktops[desktops.length - 1].id);
        }
        return;
      }

      // Alt + RightArrow: Next desktop
      if (e.altKey && e.key === 'ArrowRight') {
        e.preventDefault();
        const curIdx = desktops.findIndex(d => d.id === activeDesktopId);
        if (curIdx < desktops.length - 1) {
          switchDesktop(desktops[curIdx + 1].id);
        } else if (desktops.length > 1) {
          switchDesktop(desktops[0].id);
        }
        return;
      }

      // Alt + 1..9: Jump directly to desktop space
      if (e.altKey && !e.shiftKey && e.key >= '1' && e.key <= '9') {
        const num = parseInt(e.key, 10);
        if (num <= desktops.length) {
          e.preventDefault();
          switchDesktop(desktops[num - 1].id);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [desktops, activeDesktopId, switchDesktop, createDesktop, tileWindows]);

  const handleDesktopClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
        setStartOpen(false);
        setCalendarOpen(false);
        setActiveWindowId(null);
    }
  };

  const handleDesktopContextMenu = (e: React.MouseEvent) => {
      e.preventDefault();
      
      const desktopItems = [
          { label: '🪟 Task View (Desktops)', action: () => setIsTaskViewOpen(true) },
          { label: '⊞ Tile Windows (Alt + T)', action: tileWindows },
          { label: '➕ New Desktop Space', action: () => createDesktop() },
          ...desktops.map((d) => ({
              label: `${d.id === activeDesktopId ? '✓ ' : '   '}${d.name}`,
              action: () => switchDesktop(d.id)
          })),
          { label: 'Refresh Wallpaper', action: loadWallpaper },
          { label: 'Settings', action: () => launchApp(AppType.Settings) },
          { label: 'New Text File', action: () => launchApp(AppType.Notes) },
          { label: 'Lock Screen', action: () => { setLocked(true); setStartOpen(false); setCalendarOpen(false); } }
      ];

      setContextMenu({
          isOpen: true,
          x: e.clientX,
          y: e.clientY,
          items: desktopItems
      });
  };

  const addToDesktop = (appId: AppType) => {
    if (!desktopApps.includes(appId)) {
        setDesktopApps(prev => [...prev, appId]);
        showNotification("Added to home screen");
    } else {
        showNotification("Already on home screen");
    }
  };

  const removeFromDesktop = (appId: AppType) => {
    setDesktopApps(prev => prev.filter(id => id !== appId));
    showNotification("Removed from home screen");
  };

  const handleDesktopIconContext = (e: React.MouseEvent, appId: AppType) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
        isOpen: true,
        x: e.clientX,
        y: e.clientY,
        items: [
             { label: 'Open', action: () => launchApp(appId) },
             { label: 'Remove from Home Screen', action: () => removeFromDesktop(appId), danger: true }
        ]
    });
  };

  const handleStartMenuIconContext = (e: React.MouseEvent, appId: AppType) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
        isOpen: true,
        x: e.clientX,
        y: e.clientY,
        items: [
            { label: 'Open', action: () => launchApp(appId) },
            { label: 'Add to Home Screen', action: () => addToDesktop(appId) }
        ]
    });
  };

  const handleBootComplete = () => {
      setBooting(false);
      setLocked(true); // Default to locked after boot for realism
      setStartOpen(false);
      setCalendarOpen(false);
  };

  return (
    <>
    {booting && <BootScreen onComplete={handleBootComplete} />}
    
    {/* Always render LockScreen to allow animations. It handles its own visibility via CSS. */}
    {!booting && <LockScreen isLocked={locked} onUnlock={() => setLocked(false)} />}
    
    <div 
      className={`relative w-screen h-screen overflow-hidden bg-cover bg-center transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] 
        ${booting ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}
        ${locked ? 'blur-sm scale-105 grayscale-[0.3]' : 'blur-0 scale-100 grayscale-0'}
      `}
      style={{ 
          backgroundImage: wallpaperUrl 
            ? `url(${wallpaperUrl})` 
            : 'linear-gradient(135deg, rgb(var(--color-primary)) 0%, rgb(var(--color-surface)) 100%)' 
      }}
      onClick={handleDesktopClick}
      onContextMenu={handleDesktopContextMenu}
    >
      <DesktopClock />
      <DesktopCalendar />

      {/* Desktop Icons Area */}
      <div className={`absolute top-4 left-4 bottom-20 flex flex-col flex-wrap content-start gap-4 pointer-events-none z-[1] p-2 transition-opacity duration-300 ${locked ? 'opacity-0' : 'opacity-100'}`}>
        {desktopApps.map(appId => {
            const app = APPS.find(a => a.id === appId);
            if (!app) return null;
            return (
                <button 
                    key={app.id}
                    onClick={(e) => { e.stopPropagation(); launchApp(app.id); }}
                    onContextMenu={(e) => handleDesktopIconContext(e, app.id)}
                    className="pointer-events-auto flex flex-col items-center gap-1 p-2 rounded hover:bg-white/10 active:bg-white/20 active:scale-95 w-20 group transition-all duration-150"
                >
                    <div className="w-12 h-12 bg-surface/50 backdrop-blur rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform text-primary ring-1 ring-white/10 group-active:scale-90">
                        <Icon name={app.icon} size={28} />
                    </div>
                    <span className="text-xs text-white font-medium shadow-black drop-shadow-md text-center line-clamp-2 leading-tight bg-black/20 rounded px-1">{app.name}</span>
                </button>
            );
        })}
      </div>

      {/* Desktop Switcher Floating HUD */}
      <DesktopSwitcherHUD desktopName={hudDesktopName} windowCount={hudWindowCount} />

      {/* Snap Ghost Preview Overlay for edge dragging */}
      <SnapGhostPreview snapTarget={snapPreviewTarget} />

      {/* Windows Layer (Filtered to active desktop and 'all') */}
      {windows
        .filter(win => !win.desktopId || win.desktopId === 'all' || win.desktopId === activeDesktopId)
        .map(win => {
          const AppComp = APPS.find(a => a.id === win.appId)?.component;
          return (
            <Window 
              key={win.id}
              windowState={win}
              isActive={activeWindowId === win.id}
              onClose={closeWindow}
              onFocus={focusWindow}
              onMinimize={toggleMinimize}
              onMaximize={toggleMaximize}
              onUpdate={updateWindow}
              onSnapPreview={setSnapPreviewTarget}
              showNotification={showNotification}
              desktops={desktops}
              activeDesktopId={activeDesktopId}
              onMoveToDesktop={moveWindowToDesktop}
              onToggleAllDesktops={toggleWindowOnAllDesktops}
              onCreateDesktopAndMove={createDesktopAndMove}
              onTileWindows={tileWindows}
            >
              {AppComp && (
                  <AppComp 
                      windowId={win.id} 
                      data={win.data} 
                      onLaunchApp={launchApp} 
                      showNotification={showNotification}
                      runningApps={windows}
                      onCloseApp={closeWindow}
                      desktops={desktops}
                      activeDesktopId={activeDesktopId}
                      onMoveWindowToDesktop={moveWindowToDesktop}
                      onSwitchDesktop={switchDesktop}
                      onTileWindows={tileWindows}
                  />
              )}
            </Window>
          );
      })}

      <StartMenu 
        apps={APPS} 
        isOpen={startOpen} 
        onLaunch={launchApp} 
        onClose={() => setStartOpen(false)}
        onAppContextMenu={handleStartMenuIconContext}
      />
      
      <CalendarWidget 
        isOpen={calendarOpen}
        onClose={() => setCalendarOpen(false)}
      />

      {/* Virtual Desktop Task View / Mission Control Overlay */}
      <TaskViewOverlay 
        isOpen={isTaskViewOpen}
        onClose={() => setIsTaskViewOpen(false)}
        desktops={desktops}
        activeDesktopId={activeDesktopId}
        onSwitchDesktop={switchDesktop}
        onCreateDesktop={createDesktop}
        onRemoveDesktop={removeDesktop}
        onRenameDesktop={renameDesktop}
        windows={windows}
        apps={APPS}
        onFocusWindow={focusWindow}
        onCloseWindow={closeWindow}
        onMoveWindowToDesktop={moveWindowToDesktop}
        onToggleAllDesktops={toggleWindowOnAllDesktops}
        onTileWindows={tileWindows}
      />

      {/* Taskbar Container with Slide Animation */}
      <div className={`fixed bottom-0 left-0 right-0 z-[1000] transition-transform duration-500 ${locked ? 'translate-y-full' : 'translate-y-0'}`}>
        <Taskbar 
            apps={APPS}
            runningApps={windows.filter(win => !win.desktopId || win.desktopId === 'all' || win.desktopId === activeDesktopId)}
            allWindows={windows}
            desktops={desktops}
            activeDesktopId={activeDesktopId}
            onSwitchDesktop={switchDesktop}
            onCreateDesktop={createDesktop}
            onToggleTaskView={() => setIsTaskViewOpen(prev => !prev)}
            isTaskViewOpen={isTaskViewOpen}
            onTileWindows={tileWindows}
            onLaunch={(id) => {
                const currentDesktopWindows = windows.filter(win => !win.desktopId || win.desktopId === 'all' || win.desktopId === activeDesktopId);
                const runningInCurrent = currentDesktopWindows.find(w => w.appId === id);
                if (runningInCurrent) {
                    if (runningInCurrent.isMinimized) toggleMinimize(runningInCurrent.id);
                    focusWindow(runningInCurrent.id);
                    return;
                }
                const runningOther = windows.find(w => w.appId === id);
                if (runningOther) {
                    if (runningOther.desktopId && runningOther.desktopId !== 'all') {
                        switchDesktop(runningOther.desktopId);
                    }
                    if (runningOther.isMinimized) toggleMinimize(runningOther.id);
                    focusWindow(runningOther.id);
                    return;
                }
                launchApp(id);
            }}
            onToggleStart={() => {
                setStartOpen(!startOpen);
                setCalendarOpen(false);
            }}
            isStartOpen={startOpen}
            onLock={() => { setLocked(true); setStartOpen(false); setCalendarOpen(false); }}
            onToggleCalendar={() => {
                setCalendarOpen(!calendarOpen);
                setStartOpen(false);
            }}
        />
      </div>

      <ContextMenu state={contextMenu} onClose={() => setContextMenu({ ...contextMenu, isOpen: false })} />
      <ToastNotification notification={notification} />
    </div>
    </>
  );
};

export default App;
