
import React, { useState, useEffect, useRef } from 'react';
import { AppProps, FileSystemItem, SystemSettings, ContextMenuState, AppType } from '../types';
import { listFiles, saveFile, deleteFile, loadSettings, saveSettings, formatSize, generateId, getFile, triggerSystemReset } from '../services/system';
import { Icon, ContextMenu } from '../components/SystemUI';
import { GoogleGenAI } from "@google/genai";

// Initialize AI for productivity tasks
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- File Explorer ---
export const FileExplorer: React.FC<AppProps> = ({ onLaunchApp, showNotification }) => {
  const [currentPath, setCurrentPath] = useState<string | null>(null);
  const [history, setHistory] = useState<(string | null)[]>([null]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [files, setFiles] = useState<FileSystemItem[]>([]);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({ isOpen: false, x: 0, y: 0, items: [] });
  const [draggedFile, setDraggedFile] = useState<FileSystemItem | null>(null);
  const [dragOverTarget, setDragOverTarget] = useState<string | null>(null);

  const refresh = () => listFiles(currentPath).then(setFiles);

  useEffect(() => { refresh(); }, [currentPath]);

  const navigate = (path: string | null) => {
      if (path === currentPath) return;
      
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(path);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
      setCurrentPath(path);
  };

  const goBack = () => {
      if (historyIndex > 0) {
          const newIndex = historyIndex - 1;
          setHistoryIndex(newIndex);
          setCurrentPath(history[newIndex]);
      }
  };

  const goForward = () => {
      if (historyIndex < history.length - 1) {
          const newIndex = historyIndex + 1;
          setHistoryIndex(newIndex);
          setCurrentPath(history[newIndex]);
      }
  };

  const goUp = async () => {
      if (currentPath) {
          const currentFile = await getFile(currentPath);
          navigate(currentFile && currentFile.parentId !== 'root' ? currentFile.parentId : null);
      }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const fileList = Array.from(e.target.files) as File[];
      for (const file of fileList) {
        await saveFile({
          id: generateId(),
          parentId: currentPath,
          name: file.name,
          type: 'file',
          mimeType: file.type,
          content: file,
          createdAt: Date.now(),
          size: file.size
        });
      }
      showNotification(`Uploaded ${fileList.length} files`);
      refresh();
    }
  };

  const createFolder = async () => {
    const name = prompt("Folder name:");
    if (name) {
      await saveFile({
        id: generateId(),
        parentId: currentPath,
        name,
        type: 'folder',
        createdAt: Date.now(),
        size: 0
      });
      refresh();
    }
  };

  const handleContextMenu = (e: React.MouseEvent, file: FileSystemItem) => {
      e.preventDefault();
      e.stopPropagation();
      setContextMenu({
          isOpen: true,
          x: e.clientX,
          y: e.clientY,
          items: [
              { label: 'Open', action: () => handleOpen(file) },
              { label: 'Delete', action: async () => { await deleteFile(file.id); refresh(); showNotification(`Deleted ${file.name}`); }, danger: true }
          ]
      });
  };

  const handleOpen = (file: FileSystemItem) => {
    if (file.type === 'folder') {
        navigate(file.id);
    } else if (file.mimeType?.startsWith('image/')) {
        onLaunchApp(AppType.PhotoViewer, { fileId: file.id });
    } else if (file.mimeType?.startsWith('audio/') || file.mimeType?.startsWith('video/')) {
        onLaunchApp(AppType.MediaPlayer, { fileId: file.id });
    } else if (file.mimeType?.startsWith('text/') || file.name.endsWith('.txt') || file.name.endsWith('.js') || file.name.endsWith('.json') || file.name.endsWith('.css') || file.name.endsWith('.md')) {
        onLaunchApp(AppType.TextEditor, { fileId: file.id });
    } else {
        showNotification('File type not supported for preview');
    }
  };

  // --- Drag and Drop Handlers ---
  const handleDragStart = (e: React.DragEvent, file: FileSystemItem) => {
      setDraggedFile(file);
      e.dataTransfer.setData('text/plain', file.id);
      e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, targetId: string | null) => {
      e.preventDefault();
      // Prevent dropping on itself or if no dragged file
      if (!draggedFile || draggedFile.id === targetId) return;
      
      e.dataTransfer.dropEffect = 'move';
      setDragOverTarget(targetId);
  };

  const handleDragLeave = () => {
      setDragOverTarget(undefined as any); // hack to clear state properly
      setDragOverTarget(null);
  };

  const handleDrop = async (e: React.DragEvent, targetId: string | null) => {
      e.preventDefault();
      setDragOverTarget(null);
      if (!draggedFile) return;

      // Basic cycle detection logic
      if (draggedFile.id === targetId) return;

      try {
          await saveFile({ ...draggedFile, parentId: targetId });
          setDraggedFile(null);
          refresh();
          showNotification(`Moved ${draggedFile.name}`);
      } catch (error) {
          console.error(error);
          showNotification("Failed to move file");
      }
  };

  // Helper for File Icons
  const getFileIcon = (file: FileSystemItem) => {
      if (file.type === 'folder') return { icon: 'folder', color: 'text-yellow-400' };
      if (file.mimeType?.startsWith('image/')) return { icon: 'image', color: 'text-purple-500' };
      if (file.mimeType?.startsWith('video/')) return { icon: 'video', color: 'text-red-500' };
      if (file.mimeType?.startsWith('audio/')) return { icon: 'music', color: 'text-pink-500' };
      if (file.mimeType?.startsWith('text/') || file.name.includes('json') || file.name.includes('js')) return { icon: 'file-text', color: 'text-blue-400' };
      return { icon: 'files', color: 'text-gray-500' };
  };
  
  return (
    <div className="h-full flex bg-surface text-onSurface" onClick={() => setContextMenu({ ...contextMenu, isOpen: false })}>
      
      {/* Sidebar - Quick Access */}
      <div className="w-48 bg-surfaceVariant/20 border-r border-black/10 flex flex-col p-2 shrink-0">
          <div className="text-xs font-bold opacity-50 px-2 py-2 uppercase">Quick Access</div>
          <button 
             onClick={() => navigate(null)}
             onDragOver={(e) => handleDragOver(e, null)}
             onDragLeave={handleDragLeave}
             onDrop={(e) => handleDrop(e, null)}
             className={`flex items-center gap-2 p-2 rounded-lg text-sm transition-colors text-left
                 ${currentPath === null ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-black/5'}
                 ${dragOverTarget === null ? 'ring-2 ring-primary bg-primary/20' : ''}
             `}
          >
              <Icon name="home" size={18} className="text-blue-500" />
              <span>Home</span>
          </button>
          {/* Visual placeholders for other common locations */}
          <button className="flex items-center gap-2 p-2 rounded-lg text-sm hover:bg-black/5 opacity-50 cursor-not-allowed text-left">
              <Icon name="clock" size={18} />
              <span>Recent</span>
          </button>
          <button className="flex items-center gap-2 p-2 rounded-lg text-sm hover:bg-black/5 opacity-50 cursor-not-allowed text-left">
              <Icon name="stop" size={18} />
              <span>Trash</span>
          </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
          
          {/* Toolbar */}
          <div className="h-12 border-b border-black/10 flex items-center px-4 gap-2 shrink-0">
              <div className="flex items-center gap-1">
                  <button onClick={goBack} disabled={historyIndex === 0} className="p-1.5 hover:bg-black/5 rounded-full disabled:opacity-30">
                      <Icon name="arrow-left" size={18} />
                  </button>
                  <button onClick={goForward} disabled={historyIndex === history.length - 1} className="p-1.5 hover:bg-black/5 rounded-full disabled:opacity-30">
                      <Icon name="arrow-right" size={18} />
                  </button>
                  <button onClick={goUp} disabled={!currentPath} className="p-1.5 hover:bg-black/5 rounded-full disabled:opacity-30">
                      <Icon name="chevron-left" size={18} className="rotate-90" />
                  </button>
              </div>

              {/* Breadcrumb Bar */}
              <div className="flex-1 mx-2 h-8 bg-black/5 rounded-md flex items-center px-3 text-sm overflow-hidden whitespace-nowrap border border-transparent focus-within:border-primary/50 transition-colors">
                  <Icon name="folder" size={14} className="mr-2 opacity-50" />
                  <span className="opacity-70">Home</span>
                  {currentPath && <span className="mx-1 opacity-40">/</span>}
                  {currentPath && <span className="font-medium truncate">{files.find(f => f.id === currentPath)?.name || currentPath.substring(0,8)}</span>}
              </div>

              <div className="flex items-center gap-1 border-l border-black/10 pl-2">
                   <button onClick={() => setView('grid')} className={`p-1.5 rounded ${view === 'grid' ? 'bg-black/10' : 'hover:bg-black/5'}`}>
                       <Icon name="grid" size={18} />
                   </button>
                   <button onClick={() => setView('list')} className={`p-1.5 rounded ${view === 'list' ? 'bg-black/10' : 'hover:bg-black/5'}`}>
                       <Icon name="list" size={18} />
                   </button>
              </div>

              <div className="flex items-center gap-2 border-l border-black/10 pl-2">
                 <label className="p-1.5 hover:bg-black/10 rounded cursor-pointer text-primary" title="Upload">
                     <Icon name="rocket" size={18} />
                     <input type="file" multiple className="hidden" onChange={handleUpload} />
                 </label>
                 <button onClick={createFolder} className="p-1.5 hover:bg-black/10 rounded text-yellow-600" title="New Folder">
                     <Icon name="folder" size={18} />
                 </button>
                 <button onClick={refresh} className="p-1.5 hover:bg-black/10 rounded" title="Refresh">
                     <Icon name="refresh" size={18} />
                 </button>
              </div>
          </div>

          {/* File View Area */}
          <div 
            className="flex-1 overflow-auto p-4"
            onDragOver={(e) => currentPath ? undefined : handleDragOver(e, null)} // Allow dropping in empty space of Home
            onDrop={(e) => currentPath ? undefined : handleDrop(e, null)}
          >
              {files.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full opacity-30 select-none">
                      <Icon name="folder" size={64} />
                      <span className="mt-2 text-sm">This folder is empty</span>
                  </div>
              )}

              {view === 'grid' ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
                      {files.map(file => {
                          const visual = getFileIcon(file);
                          return (
                            <div 
                                key={file.id} 
                                className={`group flex flex-col items-center p-3 rounded-xl cursor-pointer transition-all border border-transparent
                                    ${dragOverTarget === file.id ? 'bg-primary/20 border-primary scale-105 shadow-lg z-10' : 'hover:bg-black/5 hover:border-black/5'}
                                    ${draggedFile?.id === file.id ? 'opacity-40' : ''}
                                `}
                                onDoubleClick={() => handleOpen(file)}
                                onContextMenu={(e) => handleContextMenu(e, file)}
                                draggable
                                onDragStart={(e) => handleDragStart(e, file)}
                                onDragOver={(e) => file.type === 'folder' ? handleDragOver(e, file.id) : undefined}
                                onDragLeave={handleDragLeave}
                                onDrop={(e) => file.type === 'folder' ? handleDrop(e, file.id) : undefined}
                            >
                                <div className={`w-14 h-14 flex items-center justify-center mb-2 transition-transform group-hover:scale-110 ${visual.color}`}>
                                    <Icon name={visual.icon} size={48} />
                                </div>
                                <span className="text-xs text-center truncate w-full px-1 select-none font-medium leading-tight">{file.name}</span>
                                <span className="text-[10px] opacity-40 mt-0.5">{file.type === 'folder' ? 'Folder' : formatSize(file.size)}</span>
                            </div>
                          );
                      })}
                  </div>
              ) : (
                  <div className="flex flex-col select-none">
                      <div className="grid grid-cols-12 gap-4 px-4 py-2 text-xs font-bold opacity-50 border-b border-black/5 uppercase tracking-wider">
                          <div className="col-span-6">Name</div>
                          <div className="col-span-2">Type</div>
                          <div className="col-span-2">Size</div>
                          <div className="col-span-2">Date</div>
                      </div>
                      {files.map(file => {
                          const visual = getFileIcon(file);
                          return (
                             <div 
                                key={file.id}
                                className={`grid grid-cols-12 gap-4 px-4 py-2 items-center text-sm border-b border-black/5 cursor-pointer transition-colors
                                    ${dragOverTarget === file.id ? 'bg-primary/20 ring-1 ring-primary z-10' : 'hover:bg-black/5'}
                                    ${draggedFile?.id === file.id ? 'opacity-40' : ''}
                                `}
                                onDoubleClick={() => handleOpen(file)}
                                onContextMenu={(e) => handleContextMenu(e, file)}
                                draggable
                                onDragStart={(e) => handleDragStart(e, file)}
                                onDragOver={(e) => file.type === 'folder' ? handleDragOver(e, file.id) : undefined}
                                onDragLeave={handleDragLeave}
                                onDrop={(e) => file.type === 'folder' ? handleDrop(e, file.id) : undefined}
                             >
                                 <div className="col-span-6 flex items-center gap-3 overflow-hidden">
                                     <div className={visual.color}><Icon name={visual.icon} size={20} /></div>
                                     <span className="truncate">{file.name}</span>
                                 </div>
                                 <div className="col-span-2 opacity-60 text-xs truncate">{file.mimeType || 'Folder'}</div>
                                 <div className="col-span-2 opacity-60 text-xs font-mono">{file.type === 'folder' ? '--' : formatSize(file.size)}</div>
                                 <div className="col-span-2 opacity-60 text-xs">{new Date(file.createdAt).toLocaleDateString()}</div>
                             </div>
                          );
                      })}
                  </div>
              )}
          </div>

          {/* Status Bar */}
          <div className="h-6 bg-surfaceVariant/30 border-t border-black/10 flex items-center px-4 text-xs opacity-60 gap-4 shrink-0">
               <span>{files.length} item{files.length !== 1 && 's'}</span>
               {files.length > 0 && <span>|</span>}
               <span>{files.filter(f => f.type === 'folder').length} folders, {files.filter(f => f.type === 'file').length} files</span>
          </div>
      </div>
      
      <ContextMenu state={contextMenu} onClose={() => setContextMenu({ ...contextMenu, isOpen: false })} />
    </div>
  );
};

// --- Settings ---
export const Settings: React.FC<AppProps> = ({ showNotification }) => {
  const [settings, setSettings] = useState<SystemSettings>(loadSettings());
  const [activeTab, setActiveTab] = useState('general');
  const [stats, setStats] = useState({ cpu: 0, ram: 0 });
  const [profilePicUrl, setProfilePicUrl] = useState<string | null>(null);

  useEffect(() => {
      const interval = setInterval(() => {
          setStats({
              cpu: Math.floor(Math.random() * 30) + 10,
              ram: Math.floor(Math.random() * 40) + 20
          });
      }, 2000);
      return () => clearInterval(interval);
  }, []);

  useEffect(() => {
      if(settings.profilePicture === 'custom') {
          getFile('sys_profile_pic').then(file => {
              if (file && file.content) setProfilePicUrl(URL.createObjectURL(file.content));
          });
      } else {
          setProfilePicUrl(null);
      }
  }, [settings.profilePicture]);

  const update = (s: Partial<SystemSettings>) => {
    const newSettings = { ...settings, ...s };
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const handleWallpaperUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          await saveFile({
              id: 'sys_wallpaper',
              parentId: 'system',
              name: 'Wallpaper',
              type: 'file',
              mimeType: file.type,
              content: file,
              createdAt: Date.now(),
              size: file.size
          });
          update({ wallpaper: 'custom' });
          showNotification("Wallpaper updated. Refresh desktop to see.");
      }
  };

  const handleProfilePicUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          await saveFile({
              id: 'sys_profile_pic',
              parentId: 'system',
              name: 'Profile Picture',
              type: 'file',
              mimeType: file.type,
              content: file,
              createdAt: Date.now(),
              size: file.size
          });
          update({ profilePicture: 'custom' });
          showNotification("Profile picture updated.");
      }
  };

  const handleRemoveWallpaper = async () => {
    try {
      await deleteFile('sys_wallpaper');
      update({ wallpaper: null });
      showNotification("Wallpaper removed. Refresh desktop to see.");
    } catch (e) {
      console.error(e);
      showNotification("Failed to remove wallpaper");
    }
  };

  const handleRemoveProfilePic = async () => {
      try {
          await deleteFile('sys_profile_pic');
          update({ profilePicture: null });
          showNotification("Profile picture removed.");
      } catch (e) {
          console.error(e);
          showNotification("Failed to remove profile picture");
      }
  };

  const handleFactoryReset = () => {
      if (confirm("Are you sure you want to delete all files and settings? This cannot be undone and will restart the system immediately.")) {
          triggerSystemReset();
      }
  };

  const tabs = [
      { id: 'general', label: 'General', icon: 'settings' },
      { id: 'personalization', label: 'Personalization', icon: 'edit' },
      { id: 'display', label: 'Display', icon: 'media' },
      { id: 'system', label: 'System', icon: 'activity' },
      { id: 'about', label: 'About', icon: 'sysinfo' },
  ];

  return (
    <div className="h-full flex bg-surface">
      {/* Sidebar */}
      <div className="w-16 sm:w-48 border-r border-black/10 flex flex-col pt-4 bg-surfaceVariant/20">
          {tabs.map(tab => (
              <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-4 py-3 mx-2 rounded-xl transition-colors mb-1
                      ${activeTab === tab.id ? 'bg-primary text-onPrimary' : 'hover:bg-black/5 text-onSurface/70'}
                  `}
              >
                  <Icon name={tab.icon} size={20} />
                  <span className="hidden sm:inline text-sm font-medium">{tab.label}</span>
              </button>
          ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 sm:p-8">
        <h1 className="text-2xl font-light mb-6 capitalize">{activeTab}</h1>
        
        <div className="max-w-xl space-y-8">

        {activeTab === 'general' && (
            <div className="space-y-6">
                 <section>
                    <h2 className="text-sm font-bold opacity-50 uppercase mb-3">User Profile</h2>
                    <div className="bg-surfaceVariant/30 p-4 rounded-2xl flex items-center gap-4">
                        <div className="relative group cursor-pointer">
                            {profilePicUrl ? (
                                <img src={profilePicUrl} alt="Profile" className="w-16 h-16 rounded-full object-cover shadow-md" />
                            ) : (
                                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-onPrimary text-2xl font-bold">
                                    {settings.userName.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <label className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Icon name="camera" className="text-white" size={24} />
                                <input type="file" accept="image/*" className="hidden" onChange={handleProfilePicUpload} />
                            </label>
                        </div>
                        <div className="flex-1">
                            <label className="text-xs opacity-50 block mb-1">Username</label>
                            <input 
                                type="text" 
                                value={settings.userName} 
                                onChange={(e) => update({ userName: e.target.value })}
                                className="w-full bg-transparent border-b border-black/20 focus:border-primary outline-none py-1 text-lg font-medium"
                            />
                        </div>
                        {settings.profilePicture && (
                            <button onClick={handleRemoveProfilePic} className="text-xs text-red-500 hover:bg-red-500/10 px-2 py-1 rounded">Remove Pic</button>
                        )}
                    </div>
                 </section>

                 <section>
                    <h2 className="text-sm font-bold opacity-50 uppercase mb-3">Date & Time</h2>
                    <div className="bg-surfaceVariant/30 p-4 rounded-2xl flex items-center justify-between">
                        <div>
                            <div className="font-medium">24-Hour Clock</div>
                            <div className="text-xs opacity-50">Use 24-hour format on the taskbar</div>
                        </div>
                        <button 
                            onClick={() => update({ clockFormat: settings.clockFormat === '24h' ? '12h' : '24h' })}
                            className={`w-12 h-6 rounded-full p-1 transition-colors ${settings.clockFormat === '24h' ? 'bg-primary' : 'bg-gray-300'}`}
                        >
                            <div className={`w-4 h-4 bg-white rounded-full transition-transform ${settings.clockFormat === '24h' ? 'translate-x-6' : ''}`}></div>
                        </button>
                    </div>
                 </section>
            </div>
        )}

        {activeTab === 'personalization' && (
            <div className="space-y-6">
                <section>
                    <h2 className="text-sm font-bold opacity-50 uppercase mb-3">Appearance</h2>
                    <div className="bg-surfaceVariant/30 p-4 rounded-2xl mb-4 flex items-center justify-between">
                         <div>
                            <div className="font-medium">Dark Mode</div>
                            <div className="text-xs opacity-50">Switch system appearance to dark</div>
                        </div>
                         <button 
                            onClick={() => update({ darkMode: !settings.darkMode })}
                            className={`w-12 h-6 rounded-full p-1 transition-colors ${settings.darkMode ? 'bg-primary' : 'bg-gray-300'}`}
                         >
                            <div className={`w-4 h-4 bg-white rounded-full transition-transform ${settings.darkMode ? 'translate-x-6' : ''}`}></div>
                         </button>
                    </div>

                    <div className="bg-surfaceVariant/30 p-4 rounded-2xl">
                        <label className="block mb-3 font-medium">Accent Color</label>
                        <div className="flex gap-3 flex-wrap">
                            {['#6750a4', '#9c27b0', '#2196f3', '#009688', '#ff5722', '#795548', '#607d8b'].map(c => (
                                <button 
                                key={c}
                                onClick={() => update({ themeColor: c })}
                                className={`w-10 h-10 rounded-full border-2 transition-transform hover:scale-110 ${settings.themeColor === c ? 'border-primary ring-2 ring-primary/30' : 'border-transparent'}`}
                                style={{ backgroundColor: c }}
                                title={c}
                                />
                            ))}
                        </div>
                    </div>
                </section>

                <section>
                    <h2 className="text-sm font-bold opacity-50 uppercase mb-3">Wallpaper</h2>
                    <div className="bg-surfaceVariant/30 p-4 rounded-2xl">
                        <div className="flex gap-2">
                            <label className="px-4 py-2 bg-secondary text-white rounded-full text-sm cursor-pointer inline-block hover:shadow-lg transition-shadow">
                                Upload Image
                                <input type="file" accept="image/*" className="hidden" onChange={handleWallpaperUpload} />
                            </label>
                            <button 
                                onClick={handleRemoveWallpaper}
                                className="px-4 py-2 border border-secondary text-secondary rounded-full text-sm hover:bg-secondary/10 transition-colors"
                            >
                                Remove
                            </button>
                        </div>
                        <p className="text-xs opacity-50 mt-2">Recommended size: 1920x1080</p>
                    </div>
                </section>
            </div>
        )}

        {activeTab === 'display' && (
            <div className="space-y-6">
                <section>
                    <h2 className="text-sm font-bold opacity-50 uppercase mb-3">Scale & Layout</h2>
                    <div className="bg-surfaceVariant/30 p-4 rounded-2xl mb-4">
                        <label className="block mb-2 font-medium">Font Size</label>
                        <div className="flex gap-2 bg-black/5 p-1 rounded-lg">
                            {['small', 'medium', 'large'].map(s => (
                                <button
                                    key={s}
                                    onClick={() => update({ fontSize: s as any })}
                                    className={`flex-1 py-1.5 rounded-md text-sm capitalize transition-all ${settings.fontSize === s ? 'bg-surface shadow text-primary font-bold' : 'text-onSurface/70 hover:bg-white/10'}`}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>
                </section>

                <section>
                    <h2 className="text-sm font-bold opacity-50 uppercase mb-3">Motion</h2>
                    <div className="bg-surfaceVariant/30 p-4 rounded-2xl flex items-center justify-between">
                         <div>
                            <div className="font-medium">Animations</div>
                            <div className="text-xs opacity-50">Enable system window effects</div>
                        </div>
                         <button 
                            onClick={() => update({ animations: !settings.animations })}
                            className={`w-12 h-6 rounded-full p-1 transition-colors ${settings.animations ? 'bg-primary' : 'bg-gray-300'}`}
                         >
                            <div className={`w-4 h-4 bg-white rounded-full transition-transform ${settings.animations ? 'translate-x-6' : ''}`}></div>
                         </button>
                    </div>
                </section>
            </div>
        )}

        {activeTab === 'system' && (
            <div className="space-y-6">
                 <section className="bg-surfaceVariant/30 p-4 rounded-2xl">
                    <h2 className="font-bold mb-4">System Status</h2>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <div className="text-xs opacity-50 mb-1">CPU Load</div>
                            <div className="w-full h-2 bg-black/10 rounded-full overflow-hidden">
                                <div className="h-full bg-primary transition-all duration-500" style={{ width: `${stats.cpu}%` }}></div>
                            </div>
                            <div className="text-right text-xs mt-1">{stats.cpu}%</div>
                        </div>
                        <div>
                            <div className="text-xs opacity-50 mb-1">Memory Usage</div>
                            <div className="w-full h-2 bg-black/10 rounded-full overflow-hidden">
                                <div className="h-full bg-secondary transition-all duration-500" style={{ width: `${stats.ram}%` }}></div>
                            </div>
                            <div className="text-right text-xs mt-1">{stats.ram}%</div>
                        </div>
                    </div>
                </section>

                <section className="bg-surfaceVariant/30 p-4 rounded-2xl border border-red-500/20">
                    <h2 className="font-bold mb-2 text-red-500">Recovery</h2>
                    <p className="text-xs opacity-70 mb-4">If the system is unstable or you want to clear all data, perform a factory reset.</p>
                    <button 
                    onClick={handleFactoryReset}
                    className="w-full bg-red-500/10 text-red-500 px-4 py-2.5 rounded-lg text-sm font-bold hover:bg-red-500/20 flex items-center justify-center gap-2"
                    >
                        Factory Reset
                    </button>
                </section>
            </div>
        )}

        {activeTab === 'about' && (
            <div className="space-y-6">
                 <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
                     <div className="w-24 h-24 bg-primary rounded-3xl flex items-center justify-center text-onPrimary shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500">
                         <Icon name="spark" size={48} />
                     </div>
                     <div>
                         <h1 className="text-3xl font-light tracking-tight">NextOS</h1>
                         <p className="opacity-50 text-sm">Web-based Operating System</p>
                         <div className="mt-4 flex flex-col gap-1">
                            <p className="text-sm font-medium text-primary">Created by Abel Ajish</p>
                            <div className="flex items-center justify-center gap-1.5 text-xs opacity-70">
                                <Icon name="spark" size={12} />
                                <span>Vibe coded using Gemini</span>
                            </div>
                            <a 
                                href="https://github.com/Abel-Ajish/Nextos" 
                                target="_blank" 
                                rel="noreferrer"
                                className="flex items-center justify-center gap-1.5 text-xs opacity-60 hover:opacity-100 hover:text-primary transition-all mt-1 cursor-pointer"
                            >
                                <Icon name="code" size={12} />
                                <span>Source Code</span>
                            </a>
                         </div>
                     </div>
                 </div>

                 <section className="bg-surfaceVariant/30 p-4 rounded-2xl">
                    <h2 className="text-sm font-bold opacity-50 uppercase mb-3">Device Specifications</h2>
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between border-b border-black/5 pb-2">
                            <span className="opacity-70">Version</span>
                            <span className="font-mono">3.0.0 (Alpha)</span>
                        </div>
                        <div className="flex justify-between border-b border-black/5 pb-2">
                            <span className="opacity-70">Build ID</span>
                            <span className="font-mono">2026.NEXT.01</span>
                        </div>
                         <div className="flex justify-between border-b border-black/5 pb-2">
                            <span className="opacity-70">Kernel</span>
                            <span className="font-mono">React-Fiber-19</span>
                        </div>
                        <div className="flex justify-between border-b border-black/5 pb-2">
                            <span className="opacity-70">Resolution</span>
                            <span className="font-mono">{window.innerWidth} x {window.innerHeight}</span>
                        </div>
                         <div className="flex justify-between">
                            <span className="opacity-70">User Agent</span>
                            <span className="font-mono truncate max-w-[200px] text-xs">{navigator.userAgent}</span>
                        </div>
                    </div>
                 </section>

                 <div className="text-center text-xs opacity-40 pt-4">
                     &copy; 2026 NextOS Project. Created by Abel Ajish.
                 </div>
            </div>
        )}

        </div>
      </div>
    </div>
  );
};

// --- Terminal ---
export const Terminal: React.FC<AppProps> = () => {
  const [history, setHistory] = useState<string[]>(['Welcome to NextOS Terminal v1.0', 'Type "help" for commands.']);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [history]);

  const handleCommand = async (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      const cmd = input.trim();
      const args = cmd.split(' ');
      setHistory(prev => [...prev, `$ ${cmd}`]);
      
      switch(args[0]) {
        case 'help':
            setHistory(prev => [...prev, 'Available commands: help, clear, ls, echo, date, whoami']);
            break;
        case 'clear':
            setHistory([]);
            break;
        case 'ls':
            const files = await listFiles(null);
            setHistory(prev => [...prev, files.map(f => f.name).join('  ') || '(empty)']);
            break;
        case 'echo':
            setHistory(prev => [...prev, args.slice(1).join(' ')]);
            break;
        case 'date':
            setHistory(prev => [...prev, new Date().toString()]);
            break;
        case 'whoami':
            setHistory(prev => [...prev, loadSettings().userName || 'root']);
            break;
        default:
            if(cmd) setHistory(prev => [...prev, `Command not found: ${args[0]}`]);
      }
      setInput('');
    }
  };

  return (
    <div className="h-full bg-black text-green-400 p-4 font-mono text-sm overflow-hidden flex flex-col">
      <div className="flex-1 overflow-auto">
        {history.map((line, i) => <div key={i} className="mb-1">{line}</div>)}
        <div ref={bottomRef}></div>
      </div>
      <div className="flex gap-2 mt-2">
        <span>$</span>
        <input 
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleCommand}
          className="flex-1 bg-transparent outline-none text-green-400"
          autoFocus
        />
      </div>
    </div>
  );
};

// --- Notes ---
export const Notes: React.FC<AppProps> = ({ showNotification }) => {
  const [notes, setNotes] = useState<{id: number, text: string}[]>(() => {
    const s = localStorage.getItem('webos_notes');
    return s ? JSON.parse(s) : [];
  });
  const [activeNote, setActiveNote] = useState<number | null>(null);
  const [isAiThinking, setIsAiThinking] = useState(false);

  useEffect(() => {
    localStorage.setItem('webos_notes', JSON.stringify(notes));
  }, [notes]);

  const addNote = () => {
    const newNote = { id: Date.now(), text: 'New Note' };
    setNotes([newNote, ...notes]);
    setActiveNote(newNote.id);
  };

  const performAiAction = async (action: 'fix' | 'summarize' | 'expand') => {
      const note = notes.find(n => n.id === activeNote);
      if (!note || !note.text.trim()) return;

      setIsAiThinking(true);
      try {
          const promptMap = {
              'fix': 'Fix the grammar and spelling in the following text. Return only the corrected text:',
              'summarize': 'Summarize the following text in a concise manner:',
              'expand': 'Continue writing and expand upon the following text:'
          };

          const response = await ai.models.generateContent({
              model: 'gemini-2.5-flash-lite-latest',
              contents: `${promptMap[action]}\n\n${note.text}`
          });

          if (response.text) {
              const newText = action === 'expand' ? note.text + '\n' + response.text : response.text;
              setNotes(notes.map(n => n.id === activeNote ? { ...n, text: newText } : n));
              showNotification("AI update complete!");
          }
      } catch (e) {
          console.error(e);
          showNotification("AI request failed.");
      } finally {
          setIsAiThinking(false);
      }
  };

  return (
    <div className="h-full flex bg-surface">
        <div className="w-1/3 border-r border-black/10 flex flex-col bg-surfaceVariant/20">
            <button onClick={addNote} className="m-2 p-2 bg-primary text-onPrimary rounded-lg text-sm">+ New Note</button>
            <div className="overflow-auto flex-1">
                {notes.map(n => (
                    <div 
                        key={n.id} 
                        onClick={() => setActiveNote(n.id)}
                        className={`p-3 text-sm cursor-pointer border-b border-black/5 hover:bg-black/5 ${activeNote === n.id ? 'bg-primary/10' : ''}`}
                    >
                        {n.text.substring(0, 20) || 'Empty'}...
                    </div>
                ))}
            </div>
        </div>
        <div className="flex-1 flex flex-col">
            {activeNote ? (
                <>
                    <div className="p-2 flex gap-2 border-b border-black/5 bg-surfaceVariant/10">
                        <button onClick={() => performAiAction('fix')} disabled={isAiThinking} className="px-3 py-1 bg-surfaceVariant rounded text-xs hover:bg-black/10 flex items-center gap-1 disabled:opacity-50">
                            <Icon name="spark" size={14} /> Fix Grammar
                        </button>
                        <button onClick={() => performAiAction('summarize')} disabled={isAiThinking} className="px-3 py-1 bg-surfaceVariant rounded text-xs hover:bg-black/10 flex items-center gap-1 disabled:opacity-50">
                            <Icon name="spark" size={14} /> Summarize
                        </button>
                        <button onClick={() => performAiAction('expand')} disabled={isAiThinking} className="px-3 py-1 bg-surfaceVariant rounded text-xs hover:bg-black/10 flex items-center gap-1 disabled:opacity-50">
                            <Icon name="spark" size={14} /> Expand
                        </button>
                    </div>
                    <textarea 
                        className="flex-1 w-full h-full p-4 bg-transparent outline-none resize-none disabled:opacity-50"
                        value={notes.find(n => n.id === activeNote)?.text || ''}
                        disabled={isAiThinking}
                        onChange={(e) => {
                            setNotes(notes.map(n => n.id === activeNote ? { ...n, text: e.target.value } : n));
                        }}
                    />
                </>
            ) : (
                <div className="flex-1 flex items-center justify-center text-gray-400">Select a note</div>
            )}
        </div>
    </div>
  );
};

// --- Browser ---
export const Browser: React.FC<AppProps> = () => {
    const [url, setUrl] = useState('https://www.wikipedia.org');
    const [input, setInput] = useState('https://www.wikipedia.org');

    const go = (e: React.FormEvent) => {
        e.preventDefault();
        let target = input;
        if(!target.startsWith('http')) target = 'https://' + target;
        setUrl(target);
    };

    return (
        <div className="h-full flex flex-col bg-surface">
            <form onSubmit={go} className="p-2 border-b border-black/10 flex gap-2">
                <input 
                    className="flex-1 bg-black/5 px-3 py-1 rounded-full text-sm outline-none focus:ring-2 ring-primary/50"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                />
                <button type="submit" className="px-3 py-1 bg-primary text-onPrimary rounded-full text-sm">Go</button>
            </form>
            <div className="flex-1 bg-white relative">
                 <iframe 
                    src={url} 
                    className="w-full h-full border-0" 
                    title="browser"
                    sandbox="allow-scripts allow-same-origin allow-forms"
                 />
                 <div className="absolute inset-0 pointer-events-none flex items-center justify-center bg-black/5">
                     {/* Overlay to indicate it might be restricted by standard browser security */}
                     <span className="bg-black/80 text-white px-2 py-1 rounded text-xs opacity-50">External Content</span>
                 </div>
            </div>
        </div>
    );
};

// --- Space App ---
export const SpaceApp: React.FC<AppProps> = () => {
    // Basic iframe wrapper for spaceapp.rf.gd
    return (
        <div className="h-full flex flex-col bg-surface">
            <div className="p-2 border-b border-black/10 flex gap-2 items-center bg-surfaceVariant/20">
                <div className="text-xs font-bold px-2 text-primary">SpaceApp</div>
                <div className="flex-1"></div>
                <button onClick={() => { const f = document.querySelector('iframe[name="spaceapp-frame"]') as HTMLIFrameElement; if(f) f.src = f.src; }} className="p-1 hover:bg-black/5 rounded-full" title="Reload">
                    <Icon name="refresh" size={16} />
                </button>
                <a href="https://www.spaceapp.rf.gd" target="_blank" rel="noreferrer" className="p-1 hover:bg-black/5 rounded-full" title="Open in new tab">
                    <Icon name="browser" size={16} />
                </a>
            </div>
            <div className="flex-1 bg-white relative">
                 <iframe 
                    name="spaceapp-frame"
                    src="https://www.spaceapp.rf.gd" 
                    className="w-full h-full border-0" 
                    title="Space App"
                    sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                    onError={(e) => console.log('Iframe error', e)}
                 />
            </div>
        </div>
    );
};
