import { useState, useEffect } from 'react';
import MooWebsite from './MooWebsite';
import MooProductManager from './MooProductManager';

export default function App() {
  const [adminMode, setAdminMode] = useState(false);

  // Secret keyboard shortcut to open admin: Ctrl + Shift + M
  // No visible button - nothing for bots or visitors to find
  useEffect(() => {
    const handler = e => {
      if (e.ctrlKey && e.shiftKey && e.key === 'M') {
        setAdminMode(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  if (adminMode) {
    return (
      <div>
        <MooProductManager />
        <button
          onClick={() => setAdminMode(false)}
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            padding: '10px 20px',
            background: '#1a1a1a',
            border: '1px solid #333',
            borderRadius: '20px',
            cursor: 'pointer',
            fontSize: '12px',
            color: '#888',
            zIndex: 9999,
          }}
        >
          View Website
        </button>
      </div>
    );
  }

  return <MooWebsite />;
}
