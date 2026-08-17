import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { NotesProvider } from './hooks/useNotes';
import { ThemeProvider } from './hooks/useTheme';
import './index.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('找不到 #root 挂载节点');
}

createRoot(rootElement).render(
  <StrictMode>
    <ThemeProvider>
      <NotesProvider>
        <App />
      </NotesProvider>
    </ThemeProvider>
  </StrictMode>
);
