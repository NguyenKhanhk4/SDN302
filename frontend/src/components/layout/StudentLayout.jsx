import React from 'react';
import { Outlet } from 'react-router-dom';
import StudentSidebar from './StudentSidebar';
import Header from './Header';

const StudentLayout = () => {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Student Sidebar */}
      <StudentSidebar />
      
      {/* Main Content Wrapper */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <Header />
        
        {/* Scrollable Main Area */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default StudentLayout;
