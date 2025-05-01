
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Upload, 
  FileText, 
  Home,
  Menu, 
  X, 
  LogOut,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type NavItem = {
  icon: React.ElementType;
  label: string;
  path: string;
  roles: string[];
};

const navItems: NavItem[] = [
  {
    icon: Upload,
    label: 'Upload',
    path: '/upload',
    roles: ['user', 'admin']
  },
  {
    icon: FileText,
    label: 'My Fonts',
    path: '/my-fonts',
    roles: ['user', 'admin']
  },
  {
    icon: Home,
    label: 'Admin Dashboard',
    path: '/admin',
    roles: ['admin']
  }
];

const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const filteredNavItems = navItems.filter(item => 
    item.roles.includes(user?.role || '')
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside 
        className={cn(
          "bg-white shadow-md transition-all duration-300 ease-in-out h-screen z-30",
          sidebarOpen ? "w-64" : "w-20"
        )}
      >
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className={cn(
            "flex items-center py-6 border-b",
            sidebarOpen ? "px-6 justify-between" : "px-4 justify-center"
          )}>
            {sidebarOpen ? (
              <>
                <span className="font-bold text-xl text-fontify-primary">Fontify</span>
                <Button variant="ghost" size="icon" onClick={toggleSidebar}>
                  <X className="h-5 w-5" />
                </Button>
              </>
            ) : (
              <Button variant="ghost" size="icon" onClick={toggleSidebar}>
                <Menu className="h-5 w-5" />
              </Button>
            )}
          </div>
          
          {/* Navigation items */}
          <nav className="flex-1 py-6">
            <ul className="space-y-1">
              {filteredNavItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={cn(
                      "flex items-center py-3 px-6 transition-colors",
                      location.pathname === item.path
                        ? "bg-fontify-light text-fontify-primary border-r-4 border-fontify-primary"
                        : "text-gray-500 hover:bg-gray-100",
                      !sidebarOpen && "justify-center px-0"
                    )}
                  >
                    <item.icon className={cn("h-5 w-5", location.pathname === item.path ? "text-fontify-primary" : "")} />
                    {sidebarOpen && <span className="ml-3">{item.label}</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          
          {/* User info */}
          <div className={cn(
            "border-t py-4",
            sidebarOpen ? "px-6" : "px-4"
          )}>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-fontify-secondary flex items-center justify-center">
                  <User className="h-4 w-4 text-fontify-primary" />
                </div>
              </div>
              {sidebarOpen && (
                <div className="ml-3">
                  <p className="text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-gray-500">{user?.role}</p>
                </div>
              )}
            </div>
            <Button 
              variant="ghost" 
              className={cn(
                "mt-4 text-red-500 hover:text-red-600 hover:bg-red-50 w-full justify-start",
                !sidebarOpen && "justify-center"
              )}
              onClick={logout}
            >
              <LogOut className="h-5 w-5" />
              {sidebarOpen && <span className="ml-2">Logout</span>}
            </Button>
          </div>
        </div>
      </aside>
      
      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-white border-b px-8 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-800">
            {filteredNavItems.find(item => item.path === location.pathname)?.label || 'Dashboard'}
          </h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-500">{user?.name}</span>
          </div>
        </header>
        
        {/* Content */}
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
