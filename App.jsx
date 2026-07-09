import { useState } from 'react';
import NDOWebsite from './NDOWebsite';
import NDOProductManager from './NDOProductManager';

export default function App() {
  const [adminMode, setAdminMode] = useState(false);

  if (adminMode) {
    return (
      <div>
        <NDOProductManager />
        <button
          onClick={() => setAdminMode(false)}
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            padding: '10px 20px',
            background: '#f5f5f5',
            border: '1px solid #ccc',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px',
            zIndex: 9999,
          }}
        >
          View Website
        </button>
      </div>
    );
  }

  return (
    <div>
      <NDOWebsite />
      <button
        onClick={() => setAdminMode(true)}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          padding: '10px 20px',
          background: '#e91e8c',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '12px',
          zIndex: 9999,
          fontWeight: 'bold',
        }}
        title="Admin Panel Access"
      >
        Admin
      </button>
    </div>
  );
}
