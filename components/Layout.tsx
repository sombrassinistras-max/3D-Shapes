import React from 'react';
import { Box, Image, MessageSquare, Menu, X } from 'lucide-react';
import { View } from '../App';

interface LayoutProps {
  children: React.ReactNode;
  currentView: View;
  onNavigate: (view: View) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentView, onNavigate }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const NavItem = ({ view, icon: Icon, label }: { view: View; icon: React.ElementType; label: string }) => (
    <button
      onClick={() => {
        onNavigate(view);
        setIsMobileMenuOpen(false);
      }}
      className={`flex items-center w-full space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
        currentView === view
          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
          : 'text-slate-400 hover:bg-slate-800 hover:text-white'
      }`}
    >
      <Icon size={20} />
      <span className="font-medium">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row overflow-hidden">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-slate-900 border-b border-slate-800 z-50">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Box className="text-white" size={18} />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">NeuroShape</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-slate-300">
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 border-r border-slate-800 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 border-b border-slate-800 hidden md:flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Box className="text-white" size={24} />
          </div>
          <span className="text-2xl font-bold text-white tracking-tight">NeuroShape</span>
        </div>

        <nav className="p-4 space-y-2 mt-4">
          <div className="px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Core Features
          </div>
          <NavItem view={View.IMAGE_TO_3D} icon={Box} label="Image to 3D" />
          <NavItem view={View.IMAGE_GEN} icon={Image} label="Image Generator" />
          <NavItem view={View.CHAT} icon={MessageSquare} label="Fast Assistant" />
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
            <h4 className="text-sm font-medium text-white mb-1">Pro Tip</h4>
            <p className="text-xs text-slate-400">
              Use high-contrast images for better 3D model generation results.
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black">
        <div className="max-w-5xl mx-auto p-4 md:p-8 pb-24">
           {children}
        </div>
      </main>
    </div>
  );
};
