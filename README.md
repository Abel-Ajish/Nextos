
# NextOS 🖥️

**NextOS** is a sophisticated, fully functional web-based operating system that runs entirely in your browser. It mimics a modern desktop environment with a comprehensive window management system, a virtual file system backed by IndexedDB, and AI-powered productivity tools using Google's Gemini API.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?logo=vite&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-3.0-38B2AC?logo=tailwind-css&logoColor=white)
![Gemini](https://img.shields.io/badge/Google_Gemini-AI-8E75B2?logo=google&logoColor=white)

## ✨ Key Features

### 🖥️ Desktop Environment
- **Window Management:** draggable, resizable, minimizable, and maximizable windows with z-index stacking.
- **Taskbar & Start Menu:** Fully interactive taskbar with running app indicators and a searchable Start Menu.
- **System States:** Realistic Boot Screen animation and Lock Screen with password simulation.
- **Personalization:** Dark/Light mode, custom wallpapers, and accent color selection (Material You style).
- **Notifications:** Toast notification system for system events.

### 📂 Virtual File System
- **Persistence:** Uses **IndexedDB** to store files and folders locally within the browser. Data persists across reloads.
- **File Explorer:** 
  - Create folders and text files.
  - **Drag & Drop support** for moving files between folders.
  - **File Upload:** Upload real files from your computer into the virtual OS.
  - Context menus for file operations (Open, Delete, etc.).

### 🤖 AI Integration (Google Gemini)
- **Gemini Assistant:** A chat interface to interact with Google's Gemini 2.5 Flash Lite model for questions and assistance.
- **Smart Notes:** An AI-enhanced note-taking app that can:
  - **Fix Grammar:** Corrects spelling and grammar errors.
  - **Summarize:** Condenses long notes.
  - **Expand:** Generates more content based on existing text.

### 🛠️ Built-in Applications

#### Productivity
- **File Explorer:** Manage your virtual files.
- **Browser:** A sandboxed iframe browser for web surfing.
- **Text Editor:** Code/Text editor with line numbers.
- **Terminal:** Simulated command-line interface with commands like `ls`, `echo`, `date`.
- **SpaceApp:** Embed of an external space exploration tool.

#### Media
- **Photo Viewer & Editor:** View images and edit them (Brightness, Contrast, Saturation, Crop, Rotation).
- **Video/Audio Player:** Plays media files uploaded to the virtual system.
- **Camera:** Captures photos using your device's webcam.
- **Voice Recorder:** Records audio with a real-time visualizer spectrum.

#### Creative
- **Paint:** A full-featured drawing canvas with brush sizes, colors, and erasers.

#### Utilities
- **Calculator:** Standard mathematical operations.
- **Clock:** World clock, Stopwatch, and Timer.
- **Task Manager:** Monitor and kill active processes (windows).
- **Settings:** Configure system appearance, wallpaper, and user profile.

#### Games
- **Snake**
- **Tic Tac Toe**
- **Minesweeper**

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/nextos.git
   cd nextos
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory and add your Google Gemini API key:
   ```env
   API_KEY=your_google_gemini_api_key_here
   ```
   > You can get an API key from [Google AI Studio](https://aistudio.google.com/).

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to `http://localhost:5173`.

---

## 🏗️ Architecture

The project is built as a Single Page Application (SPA).

### Directory Structure
```
/
├── apps/               # Application components (Productivity, Media, Games, etc.)
├── components/         # Reusable UI components (Window, Taskbar, Icon, etc.)
├── services/           # System services (IndexedDB wrapper, Theme logic)
├── App.tsx             # Main Desktop Layout and Window Manager logic
├── index.html          # Entry HTML
├── index.tsx           # Entry Point
├── types.ts            # TypeScript interfaces
├── vite.config.ts      # Vite configuration
└── tailwind.config.js  # Tailwind styling config
```

### Core Concepts

1. **Window Manager (`App.tsx`):**
   - Manages an array of `WindowState` objects.
   - Handles focus logic (z-index) and rendering the specific App Component inside a generic `Window` wrapper.

2. **File System (`services/system.ts`):**
   - Abstracts `IndexedDB` operations (`saveFile`, `getFile`, `listFiles`).
   - Files are stored as Blobs, allowing support for images, audio, and video, not just text.

3. **System Reset:**
   - A logic hook checks for a "reset pending" flag in LocalStorage on boot.
   - If found, it wipes the IndexedDB and LocalStorage to factory reset the OS.

---

## 🎮 Usage Guide

- **Boot:** Click the screen to "Boot" the OS.
- **Unlock:** Press Enter or click the button (password is optional/simulated).
- **Right Click:** Right-click on the desktop to change wallpaper, access settings, or create files.
- **Upload Files:** Open **Files**, click "Upload" in the top bar to bring local files into the OS.
- **Install Apps:** Apps are pre-installed, but you can "Pin" them to the desktop via the Start Menu context menu.

---

## ⚠️ Browser Permissions

NextOS utilizes modern browser APIs that may request permissions:
- **Camera:** Required for the Camera app.
- **Microphone:** Required for the Voice Recorder app.
- **Storage:** Uses IndexedDB (persistent storage) to save your virtual files.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License.
