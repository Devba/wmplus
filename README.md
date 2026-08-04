<div align="center">

# 🏢 W M+ Management System — Web Edition

<p align="center">
  <b>A modern, high-performance HOA & Property Management SPA built with React 18 & Vite.</b>
</p>

![React 18](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![CSS3](https://img.shields.io/badge/Styling-Vanilla%20CSS-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![Deployment](https://img.shields.io/badge/Deploy-Production%20Ready-2ea44f?style=for-the-badge&logo=nginx&logoColor=white)

---

</div>

## 🌟 Overview

**W M+ Web Edition** is the next-generation web application interface for HOA (Homeowners Association) management. Migrated into a lightning-fast Single Page Application (SPA) powered by **Vite** and **React 18**, it provides real-time community management, user form overlays, resident record tracking, and modular settings.

---

## ✨ Key Features

- ⚡ **Lightning Fast**: Built on Vite with instantaneous HMR and optimized production bundles.
- 🎨 **Global Overlay Engine**: Custom modal overlay system for dynamic form loading (`UF` components) without page reloads.
- 🗄️ **Dual-Mode Persistence Engine**: Effortlessly toggle between browser `localStorage` for offline/demo operation and remote `Server API` modes.
- 🧩 **Modular Architecture**: Component-based layout featuring a unified `MasterNavPanel`, dynamic `pageMap` navigation, and bottom tray controls.
- 🌐 **Sub-path Hosting Ready**: Configured out of the box for subdirectory deployments (e.g., `/managereactv1`).

---

## 🛠️ Tech Stack

| Category | Technology |
|---|---|
| **Frontend Core** | React 18.x |
| **Build Tooling** | Vite 5.x |
| **Styling System** | Custom Vanilla CSS Design System |
| **State & Navigation** | Dynamic Page Dictionary (`pageMap.js`) + State Hooks |
| **Data Persistence** | Dual Service Abstraction Layer (`localStorage` / `fetch`) |

---

## 📁 Project Structure

```text
wmplus/
├── public/                # Static assets, branding logos & picture files
│   ├── PICTURE FILES/     # UI banners, logos and assets
│   └── icons/             # Navigational tray icon set
├── src/
│   ├── components/        # Reusable UI components & Overlay Engine
│   │   └── Overlay/       # Global Modal / User Form (UF) Host
│   ├── pages/             # Main application views
│   │   ├── MasterNav/     # Core dashboard navigation panel
│   │   ├── Settings/      # System settings, profile & service layer
│   │   └── pageMap.js     # Master page routing dictionary
│   ├── App.jsx            # Application shell & state manager
│   ├── main.jsx           # React DOM root mounting point
│   └── index.css          # Global design system tokens & base CSS
├── deploy-managereact.sh  # Automated remote VPS deployment script
├── vite.config.js         # Subdirectory base configuration
└── package.json           # Project dependencies & build scripts
```

---

## 🚀 Quick Start

### Prerequisites

Ensure you have **Node.js** (v18.0 or higher) and **npm** installed.

```bash
node -v
npm -v
```

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Devba/wmplus.git
   cd wmplus
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start local development server:**
   ```bash
   npm run dev
   ```
   Open your browser at `http://localhost:5173/managereactv1/`.

---

## ⚙️ Persistence Configuration

The application features a flexible persistence model configurable in `src/pages/Settings/services/generalSystemService.js`:

```javascript
// Toggle between 'local' (localStorage) and 'server' (Remote API)
export const PERSISTENCE_MODE = 'local';
```

- **`local`**: Stores user profiles and form states directly in browser `localStorage`. Ideal for offline development and UI testing.
- **`server`**: Connects to the Express backend API for real-time MariaDB data sync.

---

## 📦 Building & Deployment

### Production Build

To build the static production assets:

```bash
npm run build
```

This generates an optimized `dist/` bundle tailored for hosting under sub-path `/managereactv1/`.

### Deployment to VPS

Run the included automated deployment script:

```bash
./deploy-managereact.sh
```

---

<div align="center">

Made with ❤️ by the **Devba** team.

</div>
