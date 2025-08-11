import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  BarChart3, 
  BookOpen, 
  Plus, 
  Menu, 
  X, 
  Home,
  Code2,
  Building2,
  Sun,
  Moon
} from 'lucide-react';
import { cn } from '../utils/helpers';
import { useTheme } from '../contexts/ThemeContext';

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home, color: 'text-blue-600' },
  { name: 'Questions', href: '/questions', icon: BookOpen, color: 'text-green-600' },
  { name: 'Topics', href: '/topics', icon: Code2, color: 'text-purple-600' },
  { name: 'Add Question', href: '/questions/add', icon: Plus, color: 'text-orange-600' },
  { name: 'Companies', href: '/companies', icon: Building2, color: 'text-indigo-600' },
];

function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const location = useLocation();
  const { isDark, toggleTheme } = useTheme();

  const NavigationItems = ({ isMobile = false }) => (
    <>
      {navigation.map((item) => {
        const isActive = location.pathname === item.href || 
                        (item.href !== '/' && location.pathname.startsWith(item.href));
        return (
          <Link
            key={item.name}
            to={item.href}
            className={cn(
              "group flex items-center px-4 py-3 mx-2 my-1 rounded-xl transition-all duration-300 relative overflow-hidden",
              isActive 
                ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg transform scale-105" 
                : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:scale-102 hover:shadow-md"
            )}
            onClick={() => isMobile && setSidebarOpen(false)}
          >
            {/* Animated background effect */}
            <div className={cn(
              "absolute inset-0 bg-gradient-to-r transition-all duration-500 opacity-0 group-hover:opacity-10",
              isActive ? "opacity-0" : "from-blue-500 to-indigo-500"
            )} />
            
            {/* Icon with enhanced styling */}
            <div className={cn(
              "relative z-10 p-2 rounded-lg mr-3 transition-all duration-300",
              isActive 
                ? "bg-white/20 shadow-inner" 
                : "bg-gray-100 dark:bg-gray-700 group-hover:bg-gray-200 dark:group-hover:bg-gray-600"
            )}>
              <item.icon className={cn(
                "h-5 w-5 transition-all duration-300",
                isActive 
                  ? "text-white drop-shadow-sm" 
                  : `${item.color} group-hover:scale-110`
              )} />
            </div>
            
            {/* Navigation text */}
            <span className={cn(
              "font-semibold transition-all duration-300 relative z-10",
              isActive 
                ? "text-white" 
                : "group-hover:text-gray-900 dark:group-hover:text-white"
            )}>
              {item.name}
            </span>
            
            {/* Active indicator */}
            {isActive && (
              <div className="ml-auto relative z-10">
                <div className="w-2 h-2 bg-white rounded-full shadow-sm animate-pulse"></div>
              </div>
            )}
            
            {/* Hover arrow effect */}
            <div className={cn(
              "ml-auto opacity-0 transform translate-x-4 transition-all duration-300 relative z-10",
              !isActive && "group-hover:opacity-100 group-hover:translate-x-0"
            )}>
              <div className="w-1 h-4 bg-gradient-to-b from-blue-400 to-indigo-500 rounded-full"></div>
            </div>
          </Link>
        );
      })}
    </>
  );

  return (
    <div className="min-h-screen bg-theme-secondary transition-colors duration-300">
      {/* Mobile sidebar overlay */}
      <div className={cn(
        "fixed inset-0 z-50 lg:hidden transition-opacity duration-300",
        sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      )}>
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm" 
          onClick={() => setSidebarOpen(false)} 
        />
        <div className={cn(
          "relative flex w-full max-w-xs flex-col sidebar transition-transform duration-300",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          {/* Mobile Header */}
          <div className="flex h-16 items-center justify-between px-4 border-b border-theme-primary">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
                <Code2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <span className="text-lg font-bold text-theme-primary">DSA Tracker</span>
                <div className="text-xs text-theme-tertiary">Mobile</div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={toggleTheme}
                className="theme-toggle"
                title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
              <button
                type="button"
                className="p-2 text-theme-secondary hover:text-theme-primary rounded-lg transition-colors"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
          
          {/* Mobile Navigation */}
          <nav className="flex-1 flex flex-col min-h-0">
            <div className="flex-shrink-0 px-2 py-4 space-y-1">
              <NavigationItems isMobile={true} />
            </div>

          </nav>

        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col">
        <div className="flex flex-col flex-grow sidebar">
          {/* Desktop Header */}
          <div className="flex h-16 items-center px-6 border-b border-theme-primary">
            <div className="flex items-center space-x-3 w-full">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg">
                <Code2 className="h-7 w-7 text-white" />
              </div>
              <div className="flex-1">
                <span className="text-xl font-bold text-gradient">DSA Tracker</span>
                <div className="text-xs text-theme-tertiary font-medium">Progress Dashboard</div>
              </div>
              <button
                onClick={toggleTheme}
                className="theme-toggle"
                title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
            </div>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="flex-1 flex flex-col min-h-0">
            <div className="flex-shrink-0 px-3 py-4 space-y-1">
              <NavigationItems />
            </div>

          </nav>
          

        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Top header */}
        <div className="sticky top-0 z-40 flex h-16 bg-theme-elevated border-b border-theme-primary backdrop-blur-sm">
          <button
            type="button"
            className="border-r border-theme-primary px-4 text-theme-secondary hover:text-theme-primary focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 lg:hidden transition-colors"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex flex-1 justify-between px-4 lg:px-6">
            <div className="flex items-center">
              <div>
                <h1 className="text-lg font-bold text-theme-primary">
                  {navigation.find(nav => {
                    if (nav.href === '/') return location.pathname === '/';
                    return location.pathname.startsWith(nav.href);
                  })?.name || 'DSA Tracker'}
                </h1>
                <div className="text-xs text-theme-tertiary font-medium">
                  Build your programming skills
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-2 text-sm text-theme-secondary">
                <BarChart3 className="h-4 w-4" />
                <span>Track Progress</span>
              </div>
              <button
                onClick={toggleTheme}
                className="theme-toggle lg:hidden"
                title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 transition-colors duration-300">
          <div className="py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default Layout;