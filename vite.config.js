import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { execSync } from 'child_process';

// Get git info at build time
function getGitInfo() {
  try {
    const branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf-8' }).trim();
    const commit = execSync('git rev-parse --short HEAD', { encoding: 'utf-8' }).trim();
    const message = execSync('git log -1 --pretty=%B', { encoding: 'utf-8' }).trim().split('\n')[0];
    return { branch, commit, message };
  } catch (e) {
    return { branch: 'unknown', commit: 'unknown', message: 'unknown' };
  }
}

const gitInfo = getGitInfo();

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE_PATH || '/managereactv1-backend/',
  server: {
    proxy: {
      '/api': 'http://localhost:3011'
    }
  },
  define: {
    'import.meta.env.VITE_GIT_BRANCH': JSON.stringify(gitInfo.branch),
    'import.meta.env.VITE_GIT_COMMIT': JSON.stringify(gitInfo.commit),
    'import.meta.env.VITE_GIT_MESSAGE': JSON.stringify(gitInfo.message),
  },
});
