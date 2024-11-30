import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function Layout() {
  const [sidebarWidth, setSidebarWidth] = useState(320); // Default width
  const [isResizing, setIsResizing] = useState(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsResizing(true);
    e.preventDefault();
  };

  const handleMouseUp = () => {
    setIsResizing(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isResizing) return;
    
    const newWidth = e.clientX;
    if (newWidth >= 240 && newWidth <= 480) { // Min 240px, Max 480px
      setSidebarWidth(newWidth);
    }
  };

  return (
    <div 
      className="flex min-h-screen bg-gray-50"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div style={{ width: sidebarWidth }} className="flex-shrink-0">
        <Sidebar />
      </div>
      
      <div
        className="w-1 bg-gray-200 hover:bg-indigo-400 cursor-col-resize relative group"
        onMouseDown={handleMouseDown}
      >
        <div className="absolute inset-y-0 -left-1 -right-1 group-hover:bg-indigo-400/10" />
      </div>

      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
}