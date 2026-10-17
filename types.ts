
import React, { ReactNode } from 'react';

export enum AppType {
  FileExplorer = 'files',
  Settings = 'settings',
  Terminal = 'terminal',
  Notes = 'notes',
  TextEditor = 'texteditor',
  Calculator = 'calculator',
  MediaPlayer = 'media',
  PhotoViewer = 'photos',
  Camera = 'camera',
  VoiceRecorder = 'voice',
  Paint = 'paint',
  Browser = 'browser',
  GeminiAssistant = 'gemini',
  GameSnake = 'snake',
  GameTicTacToe = 'tictactoe',
  GameMinesweeper = 'minesweeper',
  SpaceApp = 'spaceapp',
  Clock = 'clock',
  TaskManager = 'taskmanager'
}

export interface DesktopSpace {
  id: string;
  name: string;
  createdAt: number;
}

export interface WindowBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type SnapState = 'left' | 'right' | null;

export interface WindowState {
  id: string;
  appId: AppType;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
  data?: any; // For opening specific files
  desktopId?: string; // ID of the DesktopSpace it belongs to, or 'all' for all desktops
  snapState?: SnapState;
  prevBounds?: WindowBounds;
}

export interface FileSystemItem {
  id: string;
  parentId: string | null;
  name: string;
  type: 'file' | 'folder';
  mimeType?: string;
  content?: Blob; // Stored in IndexedDB
  createdAt: number;
  size: number;
}

export interface AppDefinition {
  id: AppType;
  name: string;
  icon: string; // SVG path name
  category: 'Productivity' | 'Media' | 'Games' | 'System' | 'Creative' | 'Utilities';
  component: React.FC<AppProps>;
  defaultWidth: number;
  defaultHeight: number;
}

export interface AppProps {
  windowId: string;
  data?: any;
  onLaunchApp: (appId: AppType, data?: any) => void;
  showNotification: (msg: string) => void;
  // New props for Task Manager
  runningApps: WindowState[];
  onCloseApp: (windowId: string) => void;
  desktops?: DesktopSpace[];
  activeDesktopId?: string;
  onMoveWindowToDesktop?: (windowId: string, targetDesktopId: string) => void;
  onSwitchDesktop?: (desktopId: string) => void;
  onTileWindows?: () => void;
}

export interface ThemeColors {
  primary: string;
  secondary: string;
  surface: string;
  background: string;
  surfaceVariant: string;
}

export interface SystemSettings {
  darkMode: boolean;
  wallpaper: string | null; // base64 or blob url
  themeColor: string; // hex
  userName: string;
  clockFormat: '12h' | '24h';
  fontSize: 'small' | 'medium' | 'large';
  animations: boolean;
  profilePicture: string | null;
  glassEffect?: boolean;
  glassBlur?: number; // Blur intensity in px (e.g. 0 to 40)
  glassOpacity?: number; // Background opacity (e.g. 0.4 to 0.95)
  bootSound?: boolean; // Play startup chime
}

export interface ContextMenuState {
  isOpen: boolean;
  x: number;
  y: number;
  items: { label: string; action: () => void; danger?: boolean }[];
}

export interface NotificationItem {
    id: string;
    message: string;
    timestamp: number;
}
