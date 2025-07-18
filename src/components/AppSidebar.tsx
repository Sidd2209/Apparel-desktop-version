import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { useSidebar } from '@/components/ui/sidebar';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  Package,
  ClipboardList,
  Calculator,
  Search,
  Factory,
  Ship,
  Boxes,
} from 'lucide-react';
import { useDepartment, departmentConfig } from './DashboardLayout';

const coreModules = [
  // { key: 'dashboard', to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'orders', to: '/orders', label: 'Order Management', icon: Package },
  { key: 'product-dev', to: '/product-dev', label: 'Product Development', icon: ClipboardList },
  { key: 'costing', to: '/costing', label: 'Costing Calculator', icon: Calculator },
  // { key: 'sourcing', to: '/sourcing', label: 'Sourcing Management', icon: Search },
  { key: 'production', to: '/production', label: 'Production Scheduler', icon: Factory },
  // { key: 'quality', to: '/quality', label: 'Quality Control', icon: CheckSquare },
  // { key: 'shipping', to: '/shipping', label: 'Packing & Shipping', icon: Ship },
  { key: 'inventory', to: '/inventory', label: 'Inventory', icon: Boxes },
];

const AppSidebar: React.FC = () => {
  const { user } = useAuth();
  const { state: sidebarState } = useSidebar();
  const { setSelectedDepartment } = useDepartment();
  const collapsed = sidebarState === 'collapsed';

  if (!user) return null;

  return (
    <aside
      className={cn(
        'bg-sidebar border-r flex flex-col transition-all duration-300 ease-in-out',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      <div className="p-4 border-b flex items-center justify-center">
        {/* Logo or branding can go here */}
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="py-4">
          <SidebarGroup>
            <SidebarGroupLabel>
              {!collapsed && 'Departments'}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {Object.entries(departmentConfig).map(([key, department]) => {
                  const isActive = user.department === key;
                  return (
                    <SidebarMenuItem key={key}>
                      <SidebarMenuButton
                        onClick={() => setSelectedDepartment(department)}
                        className={cn(
                          'w-full justify-start rounded-md p-2 text-white hover:text-white dark:text-gray-300 dark:hover:text-white',
                          isActive && 'text-white dark:text-white font-medium'
                        )}
                      >
                        <span className="text-lg mr-2">{department.emoji}</span>
                        {!collapsed && <span>{department.name}</span>}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel>
              {!collapsed && 'Core Modules'}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {coreModules.map((module) => (
                  <SidebarMenuItem key={module.key}>
                    <SidebarMenuButton asChild className="w-full justify-start">
                      <NavLink
                        to={module.to}
                        end={module.to === '/'}
                        className={({ isActive }) =>
                          cn(
                            'flex items-center w-full p-2 rounded-md text-white hover:text-white dark:text-gray-300 dark:hover:text-white',
                            isActive && 'text-white dark:text-white font-medium'
                          )
                        }
                      >
                        <module.icon className="h-5 w-5 mr-2" />
                        {!collapsed && <span>{module.label}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </div>
      </div>
    </aside>
  );
};

export default AppSidebar;
