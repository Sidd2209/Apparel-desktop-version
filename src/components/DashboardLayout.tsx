import React, { createContext, useContext, useState } from 'react';
import AppSidebar from './AppSidebar';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Menu, User } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarProvider, useSidebar } from './ui/sidebar';
import { Link } from 'react-router-dom';

// --- Context and Providers ---
const departmentConfig: { [key: string]: { name: string; color: string; emoji: string } } = {
  merchandising: { name: 'Merchandising', color: 'bg-blue-500', emoji: '📋' },
  logistics: { name: 'Logistics', color: 'bg-green-500', emoji: '🚚' },
  procurement: { name: 'Procurement', color: 'bg-orange-500', emoji: '💰' },
  sampling: { name: 'Sampling', color: 'bg-purple-500', emoji: '🧵' },
  management: { name: 'Management', color: 'bg-yellow-500', emoji: '👔' },
};
type Department = typeof departmentConfig[keyof typeof departmentConfig];
interface DepartmentContextType {
  selectedDepartment: Department | null;
  setSelectedDepartment: (department: Department | null) => void;
}
const DepartmentContext = createContext<DepartmentContextType | undefined>(undefined);
export const useDepartment = () => {
  const context = useContext(DepartmentContext);
  if (!context) throw new Error('useDepartment must be used within a DepartmentProvider');
  return context;
};
const DepartmentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  return <DepartmentContext.Provider value={{ selectedDepartment, setSelectedDepartment }}>{children}</DepartmentContext.Provider>;
};

// --- Main Layout Components ---
interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardHeader: React.FC = () => {
  const { user, logout } = useAuth();
  const { toggleSidebar } = useSidebar();
  const { selectedDepartment } = useDepartment();

  return (
    <header className="bg-white shadow-sm border-b z-10 sticky top-0 flex-shrink-0">
      <div className="flex justify-between items-center h-16 px-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={toggleSidebar}>
            <Menu className="h-6 w-6" />
          </Button>
          <Link to="/" className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent hover:underline focus:outline-none">
            ApparelOS
          </Link>
          {selectedDepartment && (
            <div className={`hidden md:flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium text-white ${selectedDepartment.color}`}>
              {selectedDepartment.emoji}
              <span>{selectedDepartment.name}</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2 transition-transform hover:scale-105 hover:shadow-lg"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.avatar} alt={user?.name} />
                  <AvatarFallback
                    className={`bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 text-white font-bold shadow-md ring-2 ring-offset-2 ring-pink-400 ${selectedDepartment ? selectedDepartment.color : ''}`}
                  >
                    {user?.name
                      ? user.name.charAt(0).toUpperCase()
                      : <User className="inline h-5 w-5" />}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:block text-left">
                  <div className="text-sm font-medium">{user?.name}</div>
                  <div className="text-xs text-gray-500">{user?.role}</div>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <SidebarProvider>
      <DepartmentProvider>
        <div className="bg-gray-50 flex h-screen overflow-hidden">
          <AppSidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            <DashboardHeader />
            <main className="flex-1 h-full overflow-y-auto p-6">
              {children}
            </main>
          </div>
        </div>
      </DepartmentProvider>
    </SidebarProvider>
  );
};

export default DashboardLayout;
export { departmentConfig };
