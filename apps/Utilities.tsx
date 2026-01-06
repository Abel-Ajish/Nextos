
import React, { useState, useEffect, useRef } from 'react';
import { AppProps, WindowState } from '../types';
import { saveFile, getFile, generateId } from '../services/system.ts';
import { Icon } from '../components/SystemUI';

// --- Text Editor (DevTools) ---
export const TextEditor: React.FC<AppProps> = ({ data, showNotification }) => {
    const [content, setContent] = useState('');
    const [fileId, setFileId] = useState<string | null>(null);
    const [fileName, setFileName] = useState('Untitled.txt');
    const [lines, setLines] = useState(1);

    useEffect(() => {
        if (data && data.fileId) {
            getFile(data.fileId).then(async (file) => {
                if (file && file.content) {
                    setFileId(file.id);
                    setFileName(file.name);
                    const text = await file.content.text();
                    setContent(text);
                }
            });
        }
    }, [data]);

    useEffect(() => {
        setLines(content.split('\n').length);
    }, [content]);

    const handleSave = async () => {
        const blob = new Blob([content], { type: 'text/plain' });
        
        let id = fileId;
        if (!id) id = generateId();

        // If fileId exists, we overwrite. If not, we create new (parentId logic simplified here to root if new)
        await saveFile({
            id: id,
            parentId: fileId ? (await getFile(fileId))?.parentId || 'root' : 'root',
            name: fileName,
            type: 'file',
            mimeType: 'text/plain',
            content: blob,
            createdAt: Date.now(),
            size: blob.size
        });
        setFileId(id);
        showNotification("File Saved");
    };

    return (
        <div className="h-full flex flex-col bg-[#1e1e1e] text-[#d4d4d4] font-mono text-sm">
            {/* Toolbar */}
            <div className="h-10 bg-[#252526] flex items-center px-4 gap-4 border-b border-[#333]">
                <input 
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    className="bg-transparent border-none outline-none text-white w-48"
                />
                <button onClick={handleSave} className="flex items-center gap-1 hover:bg-[#333] px-2 py-1 rounded">
                    <Icon name="save" size={14} /> Save
                </button>
            </div>
            
            <div className="flex-1 flex overflow-hidden">
                {/* Line Numbers */}
                <div className="w-10 bg-[#1e1e1e] text-[#858585] text-right pr-2 pt-2 border-r border-[#333] select-none leading-6">
                    {Array.from({ length: lines }).map((_, i) => (
                        <div key={i}>{i + 1}</div>
                    ))}
                </div>
                
                {/* Editor Area */}
                <textarea 
                    className="flex-1 bg-[#1e1e1e] text-[#d4d4d4] p-2 outline-none resize-none leading-6 border-none"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    spellCheck={false}
                />
            </div>
            
            {/* Status Bar */}
            <div className="h-6 bg-[#007acc] text-white flex items-center px-2 text-xs justify-between">
                <div>UTF-8</div>
                <div>Ln {lines}, Col {content.length}</div>
            </div>
        </div>
    );
};

// --- Clock App ---
export const ClockApp: React.FC<AppProps> = () => {
    const [tab, setTab] = useState<'clock' | 'stopwatch' | 'timer'>('clock');

    return (
        <div className="h-full flex flex-col bg-surface">
            <div className="flex justify-center p-2 bg-surfaceVariant/30 gap-2">
                {['clock', 'stopwatch', 'timer'].map(t => (
                    <button 
                        key={t}
                        onClick={() => setTab(t as any)}
                        className={`px-4 py-2 rounded-full capitalize text-sm font-medium transition-colors ${tab === t ? 'bg-primary text-onPrimary' : 'hover:bg-black/5'}`}
                    >
                        {t}
                    </button>
                ))}
            </div>
            <div className="flex-1 p-6 flex flex-col items-center justify-center">
                {tab === 'clock' && <ClockView />}
                {tab === 'stopwatch' && <StopwatchView />}
                {tab === 'timer' && <TimerView />}
            </div>
        </div>
    );
};

const ClockView = () => {
    const [time, setTime] = useState(new Date());
    useEffect(() => {
        const t = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(t);
    }, []);

    return (
        <div className="text-center">
             <div className="text-6xl font-thin tracking-wider mb-2">
                {time.toLocaleTimeString([], { hour12: false })}
             </div>
             <div className="text-xl opacity-50 uppercase tracking-widest">
                {time.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
             </div>
        </div>
    );
};

const StopwatchView = () => {
    const [time, setTime] = useState(0);
    const [running, setRunning] = useState(false);
    
    useEffect(() => {
        let interval: any;
        if(running) {
            interval = setInterval(() => setTime(t => t + 10), 10);
        }
        return () => clearInterval(interval);
    }, [running]);

    const format = (ms: number) => {
        const min = Math.floor(ms / 60000);
        const sec = Math.floor((ms % 60000) / 1000);
        const mil = Math.floor((ms % 1000) / 10);
        return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}.${mil.toString().padStart(2, '0')}`;
    };

    return (
        <div className="text-center">
            <div className="text-6xl font-mono mb-8 tabular-nums">{format(time)}</div>
            <div className="flex gap-4 justify-center">
                <button 
                    onClick={() => setRunning(!running)}
                    className={`w-16 h-16 rounded-full flex items-center justify-center ${running ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}
                >
                    <Icon name={running ? 'pause' : 'play'} />
                </button>
                <button 
                    onClick={() => { setRunning(false); setTime(0); }}
                    className="w-16 h-16 rounded-full bg-secondary/20 flex items-center justify-center"
                >
                    <Icon name="stop" />
                </button>
            </div>
        </div>
    );
};

const TimerView = () => {
    const [duration, setDuration] = useState(60); // seconds
    const [left, setLeft] = useState(60);
    const [running, setRunning] = useState(false);

    useEffect(() => {
        let interval: any;
        if(running && left > 0) {
            interval = setInterval(() => setLeft(l => l - 1), 1000);
        } else if (left === 0 && running) {
            setRunning(false);
            // Play alarm sound simulated
            const audio = new Audio('https://codeskulptor-demos.commondatastorage.googleapis.com/pang/pop.mp3');
            audio.play().catch(() => {});
            alert("Timer Finished!");
        }
        return () => clearInterval(interval);
    }, [running, left]);

    const format = (s: number) => {
        const m = Math.floor(s / 60);
        const sec = s % 60;
        return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
    };

    return (
        <div className="text-center">
            <div className="text-6xl font-mono mb-8 tabular-nums">{format(left)}</div>
             
             {!running && (
                 <div className="mb-8 flex gap-2 justify-center">
                     {[1, 5, 10, 30].map(m => (
                         <button 
                            key={m}
                            onClick={() => { setDuration(m * 60); setLeft(m * 60); }}
                            className="px-3 py-1 bg-surfaceVariant rounded-full text-xs"
                         >
                             {m} min
                         </button>
                     ))}
                 </div>
             )}

            <div className="flex gap-4 justify-center">
                <button 
                    onClick={() => setRunning(!running)}
                    className={`w-16 h-16 rounded-full flex items-center justify-center ${running ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}
                >
                    <Icon name={running ? 'pause' : 'play'} />
                </button>
                <button 
                    onClick={() => { setRunning(false); setLeft(duration); }}
                    className="w-16 h-16 rounded-full bg-secondary/20 flex items-center justify-center"
                >
                    <Icon name="refresh" />
                </button>
            </div>
        </div>
    );
};

// --- Task Manager ---
export const TaskManager: React.FC<AppProps> = ({ runningApps, onCloseApp, showNotification }) => {
    
    // Simulate resource usage
    const getRandomUsage = () => Math.floor(Math.random() * 20) + 1;

    return (
        <div className="h-full flex flex-col bg-surface">
            <div className="p-4 border-b border-black/10 flex justify-between items-center bg-surfaceVariant/20">
                <h2 className="font-bold">Processes</h2>
                <div className="text-xs opacity-50">{runningApps.length} active</div>
            </div>
            
            <div className="flex-1 overflow-auto">
                <table className="w-full text-left text-sm border-collapse">
                    <thead className="bg-surfaceVariant/50 sticky top-0">
                        <tr>
                            <th className="p-3 font-medium">Name</th>
                            <th className="p-3 font-medium">CPU</th>
                            <th className="p-3 font-medium">Memory</th>
                            <th className="p-3 font-medium text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {runningApps.map(app => (
                            <tr key={app.id} className="border-b border-black/5 hover:bg-black/5">
                                <td className="p-3 flex items-center gap-2">
                                    <span className="font-medium">{app.title}</span>
                                    <span className="text-xs opacity-50 font-mono">ID: {app.id.substring(0, 4)}</span>
                                </td>
                                <td className="p-3 font-mono">{getRandomUsage()}%</td>
                                <td className="p-3 font-mono">{getRandomUsage() * 10 + 20} MB</td>
                                <td className="p-3 text-right">
                                    <button 
                                        onClick={() => { onCloseApp(app.id); showNotification(`Terminated ${app.title}`); }}
                                        className="px-3 py-1 bg-red-500/10 text-red-600 rounded hover:bg-red-500/20 text-xs font-medium"
                                    >
                                        End Task
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {runningApps.length === 0 && (
                            <tr><td colSpan={4} className="p-8 text-center opacity-50">No apps running</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
            
            <div className="p-2 border-t border-black/10 bg-surfaceVariant/10 text-xs flex gap-4 opacity-70">
                <span>Total CPU: {Math.floor(Math.random() * 30) + 5}%</span>
                <span>Total Memory: {Math.floor(Math.random() * 40) + 30}%</span>
            </div>
        </div>
    );
};
