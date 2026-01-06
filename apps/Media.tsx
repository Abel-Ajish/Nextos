
import React, { useState, useEffect, useRef } from 'react';
import { AppProps, FileSystemItem } from '../types';
import { listFiles, getFile, saveFile, generateId } from '../services/system.ts';
import { Icon } from '../components/SystemUI';

// --- Calculator ---
export const Calculator: React.FC<AppProps> = () => {
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');

  const press = (key: string) => {
    if (key === 'C') {
        setDisplay('0');
        setEquation('');
    } else if (key === '=') {
        try {
            // eslint-disable-next-line no-eval
            const res = eval(equation + display); // Local calculator safe enough
            setDisplay(String(res));
            setEquation('');
        } catch {
            setDisplay('Error');
        }
    } else if (['+', '-', '*', '/'].includes(key)) {
        setEquation(equation + display + key);
        setDisplay('0');
    } else {
        setDisplay(display === '0' ? key : display + key);
    }
  };

  return (
    <div className="h-full flex flex-col bg-surface p-4">
        <div className="bg-surfaceVariant rounded-xl mb-4 p-4 text-right flex flex-col justify-end h-24 shadow-inner">
            <div className="text-xs opacity-50 h-4">{equation}</div>
            <div className="text-3xl font-light">{display}</div>
        </div>
        <div className="grid grid-cols-4 gap-2 flex-1">
            {['7','8','9','/', '4','5','6','*', '1','2','3','-', 'C','0','=','+'].map(k => (
                <button 
                    key={k} 
                    onClick={() => press(k)}
                    className={`rounded-full text-lg font-medium transition-all active:scale-90 duration-150 shadow-sm
                        ${['C','='].includes(k) ? 'bg-secondary text-white hover:bg-secondary/90' : 'bg-surfaceVariant hover:bg-black/10'}
                    `}
                >
                    {k}
                </button>
            ))}
        </div>
    </div>
  );
};

// --- Media Player ---
export const MediaPlayer: React.FC<AppProps> = ({ data }) => {
  const [mediaFiles, setMediaFiles] = useState<FileSystemItem[]>([]);
  const [currentFile, setCurrentFile] = useState<FileSystemItem | null>(null);
  const [objUrl, setObjUrl] = useState<string | null>(null);

  useEffect(() => {
    listFiles(null).then(files => {
        setMediaFiles(files.filter(f => f.mimeType?.startsWith('audio/') || f.mimeType?.startsWith('video/')));
    });
  }, []);

  // Handle opening file from Explorer
  useEffect(() => {
    if (data && data.fileId) {
        getFile(data.fileId).then(file => {
            if (file) play(file);
        });
    }
  }, [data]);

  const play = (file: FileSystemItem) => {
    if (objUrl) URL.revokeObjectURL(objUrl);
    if (file.content) {
        const url = URL.createObjectURL(file.content);
        setObjUrl(url);
        setCurrentFile(file);
    }
  };

  return (
    <div className="h-full flex flex-col bg-black text-white">
        <div className="flex-1 flex items-center justify-center bg-gray-900 relative overflow-hidden">
            {currentFile && objUrl ? (
                currentFile.mimeType?.startsWith('video/') ? (
                    <video src={objUrl} controls autoPlay className="max-w-full max-h-full" />
                ) : (
                    <div className="text-center">
                        <div className="w-24 h-24 bg-primary rounded-full mx-auto mb-4 animate-pulse"></div>
                        <h3 className="text-xl">{currentFile.name}</h3>
                        <audio src={objUrl} controls autoPlay className="mt-4" />
                    </div>
                )
            ) : (
                <div className="opacity-50">Select media to play</div>
            )}
        </div>
        <div className="h-1/3 bg-surface text-onSurface p-2 overflow-auto border-t border-white/10">
            <h4 className="text-xs font-bold uppercase opacity-50 mb-2">Library</h4>
            {mediaFiles.map(f => (
                <div 
                    key={f.id} 
                    onClick={() => play(f)}
                    className={`p-2 text-sm cursor-pointer rounded hover:bg-black/10 flex justify-between active:scale-98 transition-transform ${currentFile?.id === f.id ? 'bg-primary/10 text-primary' : ''}`}
                >
                    <span className="truncate">{f.name}</span>
                    <span className="opacity-50 text-xs uppercase">{f.mimeType?.split('/')[1]}</span>
                </div>
            ))}
            {mediaFiles.length === 0 && <div className="text-center text-sm opacity-50 mt-4">No media files found. Upload some via File Explorer.</div>}
        </div>
    </div>
  );
};

// --- Photo Editor & Viewer ---
const PhotoEditor: React.FC<{ 
    file: FileSystemItem; 
    src: string; 
    onSave: (blob: Blob) => void; 
    onCancel: () => void; 
}> = ({ file, src, onSave, onCancel }) => {
    const [brightness, setBrightness] = useState(100);
    const [contrast, setContrast] = useState(100);
    const [saturation, setSaturation] = useState(100);
    const [sepia, setSepia] = useState(0);
    
    // Crop State
    const [cropMode, setCropMode] = useState(false);
    const [cropRect, setCropRect] = useState({ x: 10, y: 10, w: 80, h: 80 }); // Percentages
    const [isDragging, setIsDragging] = useState(false);
    const [dragMode, setDragMode] = useState<'move' | 'resize' | null>(null);
    const dragStart = useRef({ x: 0, y: 0, rx: 0, ry: 0, rw: 0, rh: 0 });
    
    const imgRef = useRef<HTMLImageElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Apply filters string
    const filterStyle = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) sepia(${sepia}%)`;

    // Handle saving
    const handleSave = () => {
        if (!imgRef.current) return;
        
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const img = imgRef.current;
        const naturalWidth = img.naturalWidth;
        const naturalHeight = img.naturalHeight;

        canvas.width = naturalWidth;
        canvas.height = naturalHeight;
        
        // Apply filters
        ctx.filter = filterStyle;
        ctx.drawImage(img, 0, 0, naturalWidth, naturalHeight);

        // Handle Crop if active and valid
        if (cropMode) {
             const croppedCanvas = document.createElement('canvas');
             const cCtx = croppedCanvas.getContext('2d');
             
             // Convert percentage rect to pixel rect
             const cx = (cropRect.x / 100) * naturalWidth;
             const cy = (cropRect.y / 100) * naturalHeight;
             const cw = (cropRect.w / 100) * naturalWidth;
             const ch = (cropRect.h / 100) * naturalHeight;

             croppedCanvas.width = cw;
             croppedCanvas.height = ch;
             
             if (cCtx) {
                 cCtx.drawImage(canvas, cx, cy, cw, ch, 0, 0, cw, ch);
                 cCtx.canvas.toBlob(blob => {
                     if (blob) onSave(blob);
                 }, file.mimeType || 'image/png');
                 return;
             }
        }

        canvas.toBlob(blob => {
            if (blob) onSave(blob);
        }, file.mimeType || 'image/png');
    };

    // Crop Interaction Handlers
    const handleMouseDown = (e: React.MouseEvent, mode: 'move' | 'resize') => {
        e.stopPropagation();
        e.preventDefault();
        setIsDragging(true);
        setDragMode(mode);
        dragStart.current = { 
            x: e.clientX, 
            y: e.clientY, 
            rx: cropRect.x, 
            ry: cropRect.y, 
            rw: cropRect.w, 
            rh: cropRect.h 
        };
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging || !containerRef.current) return;
            e.preventDefault();
            
            const containerRect = containerRef.current.getBoundingClientRect();
            const dxPct = ((e.clientX - dragStart.current.x) / containerRect.width) * 100;
            const dyPct = ((e.clientY - dragStart.current.y) / containerRect.height) * 100;

            if (dragMode === 'move') {
                let nx = dragStart.current.rx + dxPct;
                let ny = dragStart.current.ry + dyPct;
                
                // Constrain
                nx = Math.max(0, Math.min(100 - cropRect.w, nx));
                ny = Math.max(0, Math.min(100 - cropRect.h, ny));

                setCropRect(prev => ({ ...prev, x: nx, y: ny }));
            } else if (dragMode === 'resize') {
                 let nw = dragStart.current.rw + dxPct;
                 let nh = dragStart.current.rh + dyPct;
                 
                 // Constrain min size 10% and bounds
                 nw = Math.max(10, Math.min(100 - dragStart.current.rx, nw));
                 nh = Math.max(10, Math.min(100 - dragStart.current.ry, nh));

                 setCropRect(prev => ({ ...prev, w: nw, h: nh }));
            }
        };

        const handleMouseUp = () => {
            setIsDragging(false);
            setDragMode(null);
        };

        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, dragMode, cropRect]);


    return (
        <div className="h-full flex flex-col bg-black">
            {/* Top Toolbar */}
            <div className="h-12 flex items-center justify-between px-4 bg-surface/10 backdrop-blur border-b border-white/10 shrink-0">
                <button onClick={onCancel} className="text-white hover:bg-white/10 p-2 rounded-full active:scale-90 transition-transform"><Icon name="cancel" /></button>
                <div className="text-white font-medium">Edit Image</div>
                <button onClick={handleSave} className="text-primary bg-white p-2 rounded-full hover:bg-gray-200 active:scale-90 transition-transform"><Icon name="save" /></button>
            </div>

            {/* Editor Canvas */}
            <div className="flex-1 relative overflow-hidden flex items-center justify-center p-4 bg-black/80">
                <div ref={containerRef} className="relative inline-block max-w-full max-h-full">
                    {/* Background Image */}
                    <img 
                        ref={imgRef}
                        src={src} 
                        className="max-w-full max-h-[70vh] object-contain block select-none"
                        style={{ filter: filterStyle }}
                        draggable={false}
                    />

                    {/* Crop Overlay */}
                    {cropMode && (
                        <div className="absolute inset-0">
                             {/* Dimmed Areas */}
                             <div className="absolute bg-black/50" style={{ left: 0, top: 0, width: '100%', height: `${cropRect.y}%` }} />
                             <div className="absolute bg-black/50" style={{ left: 0, top: `${cropRect.y + cropRect.h}%`, width: '100%', height: `${100 - (cropRect.y + cropRect.h)}%` }} />
                             <div className="absolute bg-black/50" style={{ left: 0, top: `${cropRect.y}%`, width: `${cropRect.x}%`, height: `${cropRect.h}%` }} />
                             <div className="absolute bg-black/50" style={{ left: `${cropRect.x + cropRect.w}%`, top: `${cropRect.y}%`, width: `${100 - (cropRect.x + cropRect.w)}%`, height: `${cropRect.h}%` }} />

                             {/* Crop Box */}
                             <div 
                                className="absolute border-2 border-white shadow-sm cursor-move group"
                                style={{ left: `${cropRect.x}%`, top: `${cropRect.y}%`, width: `${cropRect.w}%`, height: `${cropRect.h}%` }}
                                onMouseDown={(e) => handleMouseDown(e, 'move')}
                             >
                                 {/* Grid Lines */}
                                 <div className="absolute top-1/3 left-0 right-0 h-px bg-white/30 pointer-events-none"></div>
                                 <div className="absolute top-2/3 left-0 right-0 h-px bg-white/30 pointer-events-none"></div>
                                 <div className="absolute left-1/3 top-0 bottom-0 w-px bg-white/30 pointer-events-none"></div>
                                 <div className="absolute left-2/3 top-0 bottom-0 w-px bg-white/30 pointer-events-none"></div>

                                 {/* Resize Handle */}
                                 <div 
                                    className="absolute bottom-[-6px] right-[-6px] w-4 h-4 bg-primary border-2 border-white rounded-full cursor-se-resize shadow-lg z-10"
                                    onMouseDown={(e) => handleMouseDown(e, 'resize')}
                                 />
                             </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom Controls */}
            <div className="bg-surface/10 backdrop-blur border-t border-white/10 p-4 shrink-0">
                <div className="flex justify-center gap-4 mb-4 overflow-x-auto pb-2">
                    <button 
                         onClick={() => setCropMode(!cropMode)}
                         className={`flex flex-col items-center gap-1 p-2 rounded-lg min-w-[60px] active:scale-95 transition-transform ${cropMode ? 'bg-primary text-white' : 'text-white hover:bg-white/10'}`}
                    >
                         <Icon name="crop" />
                         <span className="text-[10px]">Crop</span>
                    </button>
                    {/* Reset Button */}
                    <button 
                        onClick={() => { setBrightness(100); setContrast(100); setSaturation(100); setSepia(0); setCropMode(false); }}
                        className="flex flex-col items-center gap-1 p-2 rounded-lg min-w-[60px] text-red-400 hover:bg-white/10 active:scale-95 transition-transform"
                    >
                         <Icon name="refresh" />
                         <span className="text-[10px]">Reset</span>
                    </button>
                </div>

                {!cropMode && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto">
                        <div className="flex items-center gap-2">
                            <Icon name="sliders" size={16} className="text-white/50" />
                            <span className="text-xs text-white/70 w-16">Bright</span>
                            <input type="range" min="0" max="200" value={brightness} onChange={e => setBrightness(Number(e.target.value))} className="flex-1 accent-primary h-1" />
                        </div>
                        <div className="flex items-center gap-2">
                            <Icon name="sliders" size={16} className="text-white/50" />
                            <span className="text-xs text-white/70 w-16">Contrast</span>
                            <input type="range" min="0" max="200" value={contrast} onChange={e => setContrast(Number(e.target.value))} className="flex-1 accent-primary h-1" />
                        </div>
                        <div className="flex items-center gap-2">
                            <Icon name="sliders" size={16} className="text-white/50" />
                            <span className="text-xs text-white/70 w-16">Saturate</span>
                            <input type="range" min="0" max="200" value={saturation} onChange={e => setSaturation(Number(e.target.value))} className="flex-1 accent-primary h-1" />
                        </div>
                        <div className="flex items-center gap-2">
                            <Icon name="sliders" size={16} className="text-white/50" />
                            <span className="text-xs text-white/70 w-16">Sepia</span>
                            <input type="range" min="0" max="100" value={sepia} onChange={e => setSepia(Number(e.target.value))} className="flex-1 accent-primary h-1" />
                        </div>
                    </div>
                )}
                {cropMode && (
                    <div className="text-center text-xs text-white/50">Drag the box to crop. Drag bottom-right corner to resize.</div>
                )}
            </div>
        </div>
    );
};

export const PhotoViewer: React.FC<AppProps> = ({ data, showNotification }) => {
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [fileItem, setFileItem] = useState<FileSystemItem | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);

    const loadFile = (id: string) => {
        getFile(id).then(file => {
            if (file && file.content) {
                const url = URL.createObjectURL(file.content);
                setImageSrc(url);
                setFileItem(file);
            }
        });
    };

    useEffect(() => {
        if (data && data.fileId) {
            loadFile(data.fileId);
        }
        return () => {
            if (imageSrc) URL.revokeObjectURL(imageSrc);
        };
    }, [data]);

    const handleSave = async (blob: Blob) => {
        if (!fileItem) return;
        const newName = `Edited_${fileItem.name}`;
        await saveFile({
            id: generateId(),
            parentId: fileItem.parentId,
            name: newName,
            type: 'file',
            mimeType: blob.type,
            content: blob,
            createdAt: Date.now(),
            size: blob.size
        });
        showNotification(`Saved as ${newName}`);
        setIsEditing(false);
    };

    if (!imageSrc || !fileItem) return (
        <div className="h-full flex items-center justify-center bg-black text-white opacity-50">
            No image selected. Open from Files.
        </div>
    );

    if (isEditing) {
        return <PhotoEditor file={fileItem} src={imageSrc} onSave={handleSave} onCancel={() => setIsEditing(false)} />;
    }

    return (
        <div className="h-full flex flex-col bg-black relative overflow-hidden group">
            <div className="flex-1 flex items-center justify-center overflow-hidden">
                 <img 
                    src={imageSrc} 
                    style={{ transform: `scale(${zoom}) rotate(${rotation}deg)`, transition: 'transform 0.2s' }}
                    className="max-w-full max-h-full object-contain pointer-events-none select-none"
                 />
            </div>
            
            {/* View Controls */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur rounded-full px-4 py-2 flex items-center gap-4 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => setZoom(z => Math.max(0.1, z - 0.1))} className="active:scale-90 transition-transform"><Icon name="minimize" size={20} /></button>
                <span className="text-sm w-12 text-center">{Math.round(zoom * 100)}%</span>
                <button onClick={() => setZoom(z => z + 0.1)} className="active:scale-90 transition-transform"><Icon name="maximize" size={20} /></button>
                <div className="w-px h-6 bg-white/20"></div>
                <button onClick={() => setRotation(r => r - 90)} className="text-lg leading-none active:scale-90 transition-transform">↺</button>
                <button onClick={() => setRotation(r => r + 90)} className="text-lg leading-none active:scale-90 transition-transform">↻</button>
                <div className="w-px h-6 bg-white/20"></div>
                <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 bg-primary px-3 py-1 rounded-full text-sm font-medium hover:bg-white/20 active:scale-95 transition-transform">
                    <Icon name="edit" size={16} /> Edit
                </button>
            </div>
        </div>
    );
};

// --- Camera App ---
export const CameraApp: React.FC<AppProps> = ({ showNotification }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const initCamera = async () => {
            try {
                const s = await navigator.mediaDevices.getUserMedia({ 
                    video: { 
                        width: { ideal: 1920 }, 
                        height: { ideal: 1080 } 
                    } 
                });
                setStream(s);
                if (videoRef.current) {
                    videoRef.current.srcObject = s;
                }
            } catch (err) {
                console.error(err);
                setError("Camera access denied or unavailable.");
                showNotification("Failed to access camera");
            }
        };

        initCamera();

        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const capturePhoto = () => {
        if (!videoRef.current || !stream) return;
        
        setIsSaving(true);
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.drawImage(videoRef.current, 0, 0);
            
            // Create sound effect
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            const osc = audioContext.createOscillator();
            const gain = audioContext.createGain();
            osc.connect(gain);
            gain.connect(audioContext.destination);
            osc.frequency.setValueAtTime(800, audioContext.currentTime);
            gain.gain.setValueAtTime(0.1, audioContext.currentTime);
            osc.start();
            gain.gain.exponentialRampToValueAtTime(0.00001, audioContext.currentTime + 0.1);
            osc.stop(audioContext.currentTime + 0.1);

            canvas.toBlob(async (blob) => {
                if (blob) {
                    const fileName = `Photo_${new Date().toISOString().replace(/[:.]/g, '-')}.png`;
                    await saveFile({
                        id: generateId(),
                        parentId: 'root', // Save to root for now
                        name: fileName,
                        type: 'file',
                        mimeType: 'image/png',
                        content: blob,
                        createdAt: Date.now(),
                        size: blob.size
                    });
                    showNotification("Photo saved to Files!");
                }
                setIsSaving(false);
            }, 'image/png');
        } else {
            setIsSaving(false);
        }
    };

    if (error) {
        return (
            <div className="h-full flex items-center justify-center bg-black text-white p-4 text-center">
                <div>
                    <div className="text-4xl mb-4">📷❌</div>
                    <p>{error}</p>
                    <p className="text-sm opacity-50 mt-2">Check your browser permissions.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-black relative">
            <div className="flex-1 flex items-center justify-center overflow-hidden bg-black">
                {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    className="w-full h-full object-contain" 
                />
            </div>
            
            {/* Camera Controls Overlay */}
            <div className="absolute bottom-6 left-0 right-0 flex justify-center items-center gap-8">
                <button 
                    onClick={capturePhoto} 
                    disabled={isSaving || !stream}
                    className="w-16 h-16 rounded-full border-4 border-white bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/40 active:scale-95 transition-all disabled:opacity-50"
                >
                    <div className="w-12 h-12 rounded-full bg-white"></div>
                </button>
            </div>
        </div>
    );
};

// --- Voice Recorder ---
export const VoiceRecorder: React.FC<AppProps> = ({ showNotification }) => {
    const [recording, setRecording] = useState(false);
    const [audioURL, setAudioURL] = useState<string | null>(null);
    const [timer, setTimer] = useState(0);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<number | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const animationFrameRef = useRef<number | null>(null);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            // Audio Visualizer Setup
            const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const analyser = audioCtx.createAnalyser();
            const source = audioCtx.createMediaStreamSource(stream);
            source.connect(analyser);
            analyser.fftSize = 256;
            
            audioContextRef.current = audioCtx;
            analyserRef.current = analyser;
            sourceRef.current = source;
            drawVisualizer();

            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };

            mediaRecorder.onstop = async () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
                const url = URL.createObjectURL(blob);
                setAudioURL(url);
                
                // Cleanup Audio Context
                if (sourceRef.current) sourceRef.current.disconnect();
                if (audioContextRef.current) audioContextRef.current.close();
                if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
                
                // Save File
                await saveFile({
                    id: generateId(),
                    parentId: 'root',
                    name: `Recording_${Date.now()}.webm`,
                    type: 'file',
                    mimeType: 'audio/webm',
                    content: blob,
                    createdAt: Date.now(),
                    size: blob.size
                });
                showNotification("Recording saved!");
                
                // Stop tracks
                stream.getTracks().forEach(t => t.stop());
            };

            mediaRecorder.start();
            setRecording(true);
            setTimer(0);
            timerRef.current = window.setInterval(() => setTimer(t => t + 1), 1000);
        } catch (err) {
            console.error(err);
            showNotification("Microphone access denied");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && recording) {
            mediaRecorderRef.current.stop();
            setRecording(false);
            if (timerRef.current) clearInterval(timerRef.current);
        }
    };

    const drawVisualizer = () => {
        if (!analyserRef.current || !canvasRef.current) return;
        
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const draw = () => {
            animationFrameRef.current = requestAnimationFrame(draw);
            analyserRef.current!.getByteFrequencyData(dataArray);

            ctx.fillStyle = 'rgb(30, 30, 30)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const barWidth = (canvas.width / bufferLength) * 2.5;
            let barHeight;
            let x = 0;

            for(let i = 0; i < bufferLength; i++) {
                barHeight = dataArray[i] / 2;
                ctx.fillStyle = `rgb(${barHeight + 100}, 50, 200)`;
                ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
                x += barWidth + 1;
            }
        };
        draw();
    };

    const formatTime = (sec: number) => {
        const m = Math.floor(sec / 60);
        const s = sec % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <div className="h-full flex flex-col bg-surface p-6 items-center justify-center gap-6">
            <div className="w-full h-32 bg-black rounded-xl overflow-hidden shadow-inner">
                <canvas ref={canvasRef} className="w-full h-full" width={300} height={128} />
            </div>
            
            <div className="text-4xl font-mono text-primary font-bold">
                {formatTime(timer)}
            </div>

            <button 
                onClick={recording ? stopRecording : startRecording}
                className={`w-20 h-20 rounded-full flex items-center justify-center shadow-xl transition-all hover:scale-105 active:scale-95 ${recording ? 'bg-red-500 animate-pulse' : 'bg-primary'}`}
            >
                <div className={`rounded-sm bg-white ${recording ? 'w-8 h-8' : 'w-0 h-0'}`}></div>
                {!recording && <div className="w-6 h-6 rounded-full bg-white"></div>}
            </button>
            
            <div className="text-sm opacity-50">{recording ? 'Recording...' : 'Tap to Record'}</div>

            {audioURL && !recording && (
                <div className="w-full bg-surfaceVariant p-4 rounded-xl flex flex-col gap-2">
                    <span className="text-xs font-bold uppercase opacity-50">Last Recording</span>
                    <audio src={audioURL} controls className="w-full h-8" />
                </div>
            )}
        </div>
    );
};
