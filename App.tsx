
import React, { useState, useEffect, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import { AppDefinition, AppType, WindowState, ContextMenuState, NotificationItem } from './types';
import { Icon, Taskbar, StartMenu, Window, ContextMenu, DesktopClock, DesktopCalendar, BootScreen, ToastNotification, LockScreen } from './components/SystemUI';
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
  const [nextZIndex, setNextZIndex] = useState(10);
  const [wallpaperUrl, setWallpaperUrl] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({ isOpen: false, x: 0, y: 0, items: [] });
  const [notification, setNotification] = useState<NotificationItem | null>(null);
  
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

  const launchApp = useCallback((appId: AppType, data?: any) => {
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
      data
    };

    setWindows(prev => [...prev, newWindow]);
    setNextZIndex(prev => prev + 1);
    setActiveWindowId(id);
    setStartOpen(false);
  }, [nextZIndex, windows.length]);

  const closeWindow = (id: string) => {
    setWindows(prev => prev.filter(w => w.id !== id));
    if (activeWindowId === id) setActiveWindowId(null);
  };

  const focusWindow = (id: string) => {
    setActiveWindowId(id);
    setWindows(prev => prev.map(w => w.id === id ? { ...w, zIndex: nextZIndex } : w));
    setNextZIndex(prev => prev + 1);
  };

  const updateWindow = (id: string, updates: Partial<WindowState>) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, ...updates } : w));
  };

  const toggleMinimize = (id: string) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, isMinimized: !w.isMinimized } : w));
  };
  
  const toggleMaximize = (id: string) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, isMaximized: !w.isMaximized } : w));
  };

  const handleDesktopClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
        setStartOpen(false);
        setActiveWindowId(null);
    }
  };

  const handleDesktopContextMenu = (e: React.MouseEvent) => {
      e.preventDefault();
      setContextMenu({
          isOpen: true,
          x: e.clientX,
          y: e.clientY,
          items: [
              { label: 'Refresh Wallpaper', action: loadWallpaper },
              { label: 'Settings', action: () => launchApp(AppType.Settings) },
              { label: 'New Text File', action: () => launchApp(AppType.Notes) },
              { label: 'Lock Screen', action: () => { setLocked(true); setStartOpen(false); } }
          ]
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

      {/* Windows Layer */}
      {windows.map(win => {
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
          >
            {AppComp && (
                <AppComp 
                    windowId={win.id} 
                    data={win.data} 
                    onLaunchApp={launchApp} 
                    showNotification={showNotification}
                    runningApps={windows}
                    onCloseApp={closeWindow}
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

      {/* Taskbar Container with Slide Animation */}
      <div className={`fixed bottom-0 left-0 right-0 z-[1000] transition-transform duration-500 ${locked ? 'translate-y-full' : 'translate-y-0'}`}>
        <Taskbar 
            apps={APPS}
            runningApps={windows}
            onLaunch={(id) => {
                const running = windows.find(w => w.appId === id);
                if (running) {
                    if (running.isMinimized) toggleMinimize(running.id);
                    focusWindow(running.id);
                } else {
                    launchApp(id);
                }
            }}
            onToggleStart={() => {
                setStartOpen(!startOpen); 
            }}
            isStartOpen={startOpen}
            onLock={() => { setLocked(true); setStartOpen(false); }}
        />
      </div>

      <ContextMenu state={contextMenu} onClose={() => setContextMenu({ ...contextMenu, isOpen: false })} />
      <ToastNotification notification={notification} />
    </div>
    </>
  );
};

export default App;
