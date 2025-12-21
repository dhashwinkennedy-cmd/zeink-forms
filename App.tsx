
import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Editor from './pages/Editor';
import Viewer from './pages/Viewer';

const App: React.FC = () => {
  const [currentPath, setCurrentPath] = useState(window.location.hash);

  useEffect(() => {
    const handleHashChange = () => setCurrentPath(window.location.hash);
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const renderContent = () => {
    const path = currentPath || '#/';
    
    if (path === '#/editor') return <Editor />;
    if (path.startsWith('#/view/')) {
      const formId = path.split('/view/')[1];
      return <Viewer formId={formId} />;
    }
    if (path === '#/summary') return <div className="pt-20 text-center">Form Summary Page (Coming Soon)</div>;
    
    return <Dashboard />;
  };

  return (
    <div className="antialiased font-sans text-secondary min-h-screen">
      <Navbar />
      {renderContent()}
    </div>
  );
};

export default App;
