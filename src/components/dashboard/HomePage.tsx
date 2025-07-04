import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, CheckCircle, AlertCircle, Users, Briefcase, BarChart2, Settings, Bell, Search, Filter, ChevronDown, Plus, MoreHorizontal, ArrowRight, HelpCircle, User, LogOut, Home, FileText, Menu, X } from 'lucide-react';
import Calendar from 'react-calendar';
import { format, isToday, isPast, isFuture, addDays } from 'date-fns';
import { useAuth } from '../../contexts/AuthContext';
import 'react-calendar/dist/Calendar.css';

// Types
type UserRole = 'admin' | 'manager' | 'client';
type ActivityStatus = 'completed' | 'in-progress' | 'upcoming' | 'overdue';

interface Activity {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  status: ActivityStatus;
  assignedTo: string[];
  priority: 'high' | 'medium' | 'low';
  category: 'meeting' | 'task' | 'deadline' | 'other';
}

interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  avatar?: string;
}

// Sample data
const sampleActivities: Activity[] = [
  {
    id: '1',
    title: 'Weekly Team Meeting',
    description: 'Discuss project progress and upcoming milestones',
    dueDate: new Date(),
    status: 'upcoming',
    assignedTo: ['1', '2', '3'],
    priority: 'medium',
    category: 'meeting'
  },
  {
    id: '2',
    title: 'Client Presentation',
    description: 'Present the latest project updates to the client',
    dueDate: addDays(new Date(), 2),
    status: 'upcoming',
    assignedTo: ['1', '4'],
    priority: 'high',
    category: 'meeting'
  },
  {
    id: '3',
    title: 'Review Resume Optimization Feature',
    description: 'Review and provide feedback on the new resume optimization feature',
    dueDate: addDays(new Date(), -1),
    status: 'overdue',
    assignedTo: ['1'],
    priority: 'high',
    category: 'task'
  },
  {
    id: '4',
    title: 'Update Documentation',
    description: 'Update the user documentation with the latest features',
    dueDate: addDays(new Date(), 5),
    status: 'in-progress',
    assignedTo: ['2', '3'],
    priority: 'medium',
    category: 'task'
  },
  {
    id: '5',
    title: 'Project Milestone Deadline',
    description: 'Complete all assigned tasks for the current sprint',
    dueDate: addDays(new Date(), 7),
    status: 'upcoming',
    assignedTo: ['1', '2', '3', '4'],
    priority: 'high',
    category: 'deadline'
  },
  {
    id: '6',
    title: 'Resume Template Design',
    description: 'Create new professional resume templates for the platform',
    dueDate: addDays(new Date(), 3),
    status: 'in-progress',
    assignedTo: ['2'],
    priority: 'medium',
    category: 'task'
  },
  {
    id: '7',
    title: 'User Feedback Review',
    description: 'Analyze recent user feedback and identify improvement areas',
    dueDate: addDays(new Date(), 4),
    status: 'upcoming',
    assignedTo: ['1', '3'],
    priority: 'low',
    category: 'task'
  },
  {
    id: '8',
    title: 'Monthly Performance Review',
    description: 'Review team performance metrics and set goals for next month',
    dueDate: addDays(new Date(), 10),
    status: 'upcoming',
    assignedTo: ['1', '2', '3', '4'],
    priority: 'medium',
    category: 'meeting'
  }
];

const sampleUsers: UserProfile[] = [
  { id: '1', name: 'John Doe', role: 'admin', avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100' },
  { id: '2', name: 'Jane Smith', role: 'manager', avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=100' },
  { id: '3', name: 'Mike Johnson', role: 'client', avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=100' },
  { id: '4', name: 'Sarah Williams', role: 'client', avatar: 'https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=100' }
];

// Helper functions
const getStatusColor = (status: ActivityStatus) => {
  switch (status) {
    case 'completed': return 'bg-green-100 text-green-800 border-green-200';
    case 'in-progress': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'upcoming': return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'overdue': return 'bg-red-100 text-red-800 border-red-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high': return 'bg-red-100 text-red-800 border-red-200';
    case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'low': return 'bg-green-100 text-green-800 border-green-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'meeting': return <Users className="w-4 h-4" />;
    case 'task': return <CheckCircle className="w-4 h-4" />;
    case 'deadline': return <Clock className="w-4 h-4" />;
    default: return <BarChart2 className="w-4 h-4" />;
  }
};

// Main component
const HomePage: React.FC = () => {
  const { user, logout } = useAuth();
  const [activities, setActivities] = useState<Activity[]>(sampleActivities);
  const [filteredActivities, setFilteredActivities] = useState<Activity[]>(sampleActivities);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ActivityStatus | 'all'>('all');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAddActivity, setShowAddActivity] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'activities' | 'team' | 'calendar'>('dashboard');
  
  // Current user role (would come from auth context in a real app)
  const currentUserRole: UserRole = 'admin';

  // Check if mobile
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Filter activities based on search, status, and date
  useEffect(() => {
    let filtered = activities;
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(activity => 
        activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(activity => activity.status === statusFilter);
    }
    
    // Filter by selected date
    if (selectedDate) {
      filtered = filtered.filter(activity => 
        format(activity.dueDate, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
      );
    }
    
    setFilteredActivities(filtered);
  }, [activities, searchTerm, statusFilter, selectedDate]);

  // Update activity status
  const updateActivityStatus = (id: string, newStatus: ActivityStatus) => {
    const updatedActivities = activities.map(activity => 
      activity.id === id ? { ...activity, status: newStatus } : activity
    );
    setActivities(updatedActivities);
  };

  // Add new activity
  const addActivity = (activity: Omit<Activity, 'id'>) => {
    const newActivity: Activity = {
      ...activity,
      id: Math.random().toString(36).substring(2, 9)
    };
    setActivities([...activities, newActivity]);
  };

  // Get user by ID
  const getUserById = (id: string): UserProfile | undefined => {
    return sampleUsers.find(user => user.id === id);
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Render activity tile
  const renderActivityTile = (activity: Activity) => {
    const statusClass = getStatusColor(activity.status);
    const priorityClass = getPriorityColor(activity.priority);
    const categoryIcon = getCategoryIcon(activity.category);
    
    return (
      <div key={activity.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-indigo-100 text-indigo-600 mr-3">
              {categoryIcon}
            </div>
            <h3 className="font-semibold text-gray-900">{activity.title}</h3>
          </div>
          <div className="flex items-center">
            <span className={`text-xs px-2 py-1 rounded-full border ${statusClass}`}>
              {activity.status.replace('-', ' ')}
            </span>
          </div>
        </div>
        
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{activity.description}</p>
        
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Clock className="w-4 h-4 text-gray-500 mr-1" />
            <span className="text-xs text-gray-500">
              {format(activity.dueDate, 'MMM d, yyyy')}
            </span>
          </div>
          
          <div className="flex items-center">
            <span className={`text-xs px-2 py-1 rounded-full border mr-2 ${priorityClass}`}>
              {activity.priority}
            </span>
            
            <div className="flex -space-x-2">
              {activity.assignedTo.slice(0, 3).map(userId => {
                const user = getUserById(userId);
                return user ? (
                  <div 
                    key={userId} 
                    className="w-6 h-6 rounded-full border-2 border-white overflow-hidden bg-gray-200"
                    title={user.name}
                  >
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs font-bold text-gray-600">
                        {user.name.charAt(0)}
                      </div>
                    )}
                  </div>
                ) : null;
              })}
              
              {activity.assignedTo.length > 3 && (
                <div className="w-6 h-6 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                  +{activity.assignedTo.length - 3}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Action buttons based on status */}
        <div className="mt-3 pt-3 border-t border-gray-100 flex justify-end space-x-2">
          {activity.status === 'upcoming' && (
            <button 
              onClick={() => updateActivityStatus(activity.id, 'in-progress')}
              className="text-xs px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Start
            </button>
          )}
          
          {activity.status === 'in-progress' && (
            <button 
              onClick={() => updateActivityStatus(activity.id, 'completed')}
              className="text-xs px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Complete
            </button>
          )}
          
          {activity.status === 'overdue' && (
            <button 
              onClick={() => updateActivityStatus(activity.id, 'in-progress')}
              className="text-xs px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Start Now
            </button>
          )}
          
          <button className="text-xs px-3 py-1 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors">
            Details
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo and Mobile Menu Button */}
            <div className="flex items-center">
              <button 
                className="p-2 rounded-md text-gray-400 lg:hidden"
                onClick={() => setShowMobileSidebar(!showMobileSidebar)}
              >
                <Menu className="h-6 w-6" />
              </button>
              
              <div className="flex-shrink-0 flex items-center">
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 w-10 h-10 rounded-lg flex items-center justify-center text-white">
                  <Briefcase className="w-6 h-6" />
                </div>
                <span className="ml-2 text-xl font-bold text-gray-900">WorkHub</span>
              </div>
            </div>
            
            {/* Search Bar */}
            <div className="hidden md:flex items-center flex-1 max-w-md mx-4">
              <div className="w-full relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search activities..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            {/* Right Navigation Items */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <div className="relative">
                <button 
                  className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  onClick={() => setShowNotifications(!showNotifications)}
                >
                  <span className="sr-only">View notifications</span>
                  <Bell className="h-6 w-6" />
                  <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
                </button>
                
                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                    <div className="py-1">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <h3 className="text-sm font-medium text-gray-900">Notifications</h3>
                      </div>
                      <div className="max-h-60 overflow-y-auto">
                        <div className="px-4 py-3 hover:bg-gray-50 transition-colors">
                          <div className="flex items-start">
                            <div className="flex-shrink-0">
                              <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                                <CheckCircle className="h-4 w-4 text-indigo-600" />
                              </div>
                            </div>
                            <div className="ml-3 w-0 flex-1">
                              <p className="text-sm font-medium text-gray-900">Task completed</p>
                              <p className="text-xs text-gray-500">Jane Smith completed "Update Documentation"</p>
                              <p className="text-xs text-gray-400 mt-1">2 hours ago</p>
                            </div>
                          </div>
                        </div>
                        <div className="px-4 py-3 hover:bg-gray-50 transition-colors">
                          <div className="flex items-start">
                            <div className="flex-shrink-0">
                              <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                                <AlertCircle className="h-4 w-4 text-red-600" />
                              </div>
                            </div>
                            <div className="ml-3 w-0 flex-1">
                              <p className="text-sm font-medium text-gray-900">Overdue task</p>
                              <p className="text-xs text-gray-500">Task "Review Resume Optimization Feature" is overdue</p>
                              <p className="text-xs text-gray-400 mt-1">1 day ago</p>
                            </div>
                          </div>
                        </div>
                        <div className="px-4 py-3 hover:bg-gray-50 transition-colors">
                          <div className="flex items-start">
                            <div className="flex-shrink-0">
                              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                                <Users className="h-4 w-4 text-blue-600" />
                              </div>
                            </div>
                            <div className="ml-3 w-0 flex-1">
                              <p className="text-sm font-medium text-gray-900">New team member</p>
                              <p className="text-xs text-gray-500">Sarah Williams joined the team</p>
                              <p className="text-xs text-gray-400 mt-1">3 days ago</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="px-4 py-2 border-t border-gray-100 text-center">
                        <button className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">
                          View all notifications
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* User Menu */}
              <div className="relative">
                <button 
                  className="flex items-center space-x-2 p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                >
                  <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-medium">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                  <span className="hidden md:block text-sm font-medium text-gray-700">{user?.name || 'User'}</span>
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </button>
                
                {/* User Menu Dropdown */}
                {showUserMenu && (
                  <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                    <div className="py-1">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">{user?.name || 'User'}</p>
                        <p className="text-xs text-gray-500">{user?.email || 'user@example.com'}</p>
                      </div>
                      <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-2 text-gray-500" />
                          <span>Your Profile</span>
                        </div>
                      </a>
                      <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                        <div className="flex items-center">
                          <Settings className="h-4 w-4 mr-2 text-gray-500" />
                          <span>Settings</span>
                        </div>
                      </a>
                      <button 
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 transition-colors border-t border-gray-100"
                      >
                        <div className="flex items-center">
                          <LogOut className="h-4 w-4 mr-2 text-red-500" />
                          <span>Sign out</span>
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-4rem)]">
        {/* Sidebar - Desktop */}
        <aside className="hidden lg:block w-64 bg-white border-r border-gray-200 overflow-y-auto">
          <div className="p-4">
            <nav className="space-y-1">
              <button 
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center w-full px-3 py-2 text-sm font-medium rounded-lg ${
                  activeTab === 'dashboard' 
                    ? 'bg-indigo-50 text-indigo-700' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <BarChart2 className="mr-3 h-5 w-5 text-indigo-500" />
                <span>Dashboard</span>
              </button>
              <button 
                onClick={() => setActiveTab('activities')}
                className={`flex items-center w-full px-3 py-2 text-sm font-medium rounded-lg ${
                  activeTab === 'activities' 
                    ? 'bg-indigo-50 text-indigo-700' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <CheckCircle className="mr-3 h-5 w-5 text-gray-400" />
                <span>Activities</span>
              </button>
              <button 
                onClick={() => setActiveTab('team')}
                className={`flex items-center w-full px-3 py-2 text-sm font-medium rounded-lg ${
                  activeTab === 'team' 
                    ? 'bg-indigo-50 text-indigo-700' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Users className="mr-3 h-5 w-5 text-gray-400" />
                <span>Team</span>
              </button>
              <button 
                onClick={() => setActiveTab('calendar')}
                className={`flex items-center w-full px-3 py-2 text-sm font-medium rounded-lg ${
                  activeTab === 'calendar' 
                    ? 'bg-indigo-50 text-indigo-700' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <CalendarIcon className="mr-3 h-5 w-5 text-gray-400" />
                <span>Calendar</span>
              </button>
              <a href="#" className="flex items-center px-3 py-2 text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900">
                <Settings className="mr-3 h-5 w-5 text-gray-400" />
                <span>Settings</span>
              </a>
            </nav>
          </div>
          
          {/* Role-based section */}
          {currentUserRole === 'admin' && (
            <div className="mt-6 p-4 border-t border-gray-200">
              <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Admin Controls
              </h3>
              <nav className="mt-2 space-y-1">
                <a href="#" className="flex items-center px-3 py-2 text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900">
                  <Users className="mr-3 h-5 w-5 text-gray-400" />
                  <span>User Management</span>
                </a>
                <a href="#" className="flex items-center px-3 py-2 text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900">
                  <Settings className="mr-3 h-5 w-5 text-gray-400" />
                  <span>System Settings</span>
                </a>
              </nav>
            </div>
          )}
          
          {/* Help section */}
          <div className="mt-6 p-4">
            <div className="rounded-lg bg-indigo-50 p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <HelpCircle className="h-6 w-6 text-indigo-600" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-indigo-800">Need help?</h3>
                  <div className="mt-1 text-xs text-indigo-700">
                    <a href="#" className="font-medium underline">Check our documentation</a> or <a href="#" className="font-medium underline">contact support</a>.
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Back to Home */}
          <div className="mt-6 p-4 border-t border-gray-200">
            <a href="/" className="flex items-center px-3 py-2 text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900">
              <Home className="mr-3 h-5 w-5 text-gray-400" />
              <span>Back to Home</span>
            </a>
          </div>
        </aside>

        {/* Mobile Sidebar */}
        {showMobileSidebar && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setShowMobileSidebar(false)}></div>
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
              <div className="absolute top-0 right-0 -mr-12 pt-2">
                <button 
                  className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                  onClick={() => setShowMobileSidebar(false)}
                >
                  <span className="sr-only">Close sidebar</span>
                  <X className="h-6 w-6 text-white" />
                </button>
              </div>
              
              <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
                <div className="flex-shrink-0 flex items-center px-4">
                  <div className="bg-gradient-to-r from-indigo-600 to-purple-600 w-10 h-10 rounded-lg flex items-center justify-center text-white">
                    <Briefcase className="w-6 h-6" />
                  </div>
                  <span className="ml-2 text-xl font-bold text-gray-900">WorkHub</span>
                </div>
                <nav className="mt-5 px-2 space-y-1">
                  <button 
                    onClick={() => {
                      setActiveTab('dashboard');
                      setShowMobileSidebar(false);
                    }}
                    className={`flex items-center w-full px-3 py-2 text-base font-medium rounded-md ${
                      activeTab === 'dashboard' 
                        ? 'bg-indigo-50 text-indigo-700' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <BarChart2 className="mr-3 h-6 w-6 text-indigo-500" />
                    <span>Dashboard</span>
                  </button>
                  <button 
                    onClick={() => {
                      setActiveTab('activities');
                      setShowMobileSidebar(false);
                    }}
                    className={`flex items-center w-full px-3 py-2 text-base font-medium rounded-md ${
                      activeTab === 'activities' 
                        ? 'bg-indigo-50 text-indigo-700' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <CheckCircle className="mr-3 h-6 w-6 text-gray-400" />
                    <span>Activities</span>
                  </button>
                  <button 
                    onClick={() => {
                      setActiveTab('team');
                      setShowMobileSidebar(false);
                    }}
                    className={`flex items-center w-full px-3 py-2 text-base font-medium rounded-md ${
                      activeTab === 'team' 
                        ? 'bg-indigo-50 text-indigo-700' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Users className="mr-3 h-6 w-6 text-gray-400" />
                    <span>Team</span>
                  </button>
                  <button 
                    onClick={() => {
                      setActiveTab('calendar');
                      setShowMobileSidebar(false);
                    }}
                    className={`flex items-center w-full px-3 py-2 text-base font-medium rounded-md ${
                      activeTab === 'calendar' 
                        ? 'bg-indigo-50 text-indigo-700' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <CalendarIcon className="mr-3 h-6 w-6 text-gray-400" />
                    <span>Calendar</span>
                  </button>
                  <a href="#" className="flex items-center px-3 py-2 text-base font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900">
                    <Settings className="mr-3 h-6 w-6 text-gray-400" />
                    <span>Settings</span>
                  </a>
                </nav>
              </div>
              
              {/* Mobile user profile */}
              <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-medium">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                  <div className="ml-3">
                    <p className="text-base font-medium text-gray-700">{user?.name || 'User'}</p>
                    <p className="text-sm font-medium text-gray-500 group-hover:text-gray-700">{currentUserRole}</p>
                  </div>
                </div>
              </div>
              
              {/* Back to Home */}
              <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
                <a href="/" className="flex items-center px-3 py-2 text-base font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900 w-full">
                  <Home className="mr-3 h-6 w-6 text-gray-400" />
                  <span>Back to Home</span>
                </a>
              </div>
            </div>
            <div className="flex-shrink-0 w-14"></div>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6 lg:p-8">
          {/* Page Header */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {activeTab === 'dashboard' && 'Dashboard'}
                  {activeTab === 'activities' && 'Activities'}
                  {activeTab === 'team' && 'Team Members'}
                  {activeTab === 'calendar' && 'Calendar'}
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  {activeTab === 'dashboard' && `Welcome back, ${user?.name || 'User'}! Here's what's happening today.`}
                  {activeTab === 'activities' && 'Manage and track all your team activities'}
                  {activeTab === 'team' && 'View and manage your team members'}
                  {activeTab === 'calendar' && 'Schedule and plan your activities'}
                </p>
              </div>
              
              <div className="mt-4 sm:mt-0 flex space-x-3">
                {activeTab === 'activities' && (
                  <>
                    <div className="relative">
                      <button 
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        onClick={() => {}}
                      >
                        <Filter className="h-4 w-4 mr-2 text-gray-500" />
                        <span>Filter</span>
                        <ChevronDown className="ml-1 h-4 w-4 text-gray-500" />
                      </button>
                    </div>
                    
                    <button 
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      onClick={() => setShowAddActivity(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      <span>Add Activity</span>
                    </button>
                  </>
                )}
                
                {activeTab === 'team' && (
                  <button 
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    <span>Add Team Member</span>
                  </button>
                )}
              </div>
            </div>
            
            {/* Mobile Search */}
            <div className="mt-4 sm:hidden">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search activities..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            {/* Status Filters - Only show on activities tab */}
            {activeTab === 'activities' && (
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    statusFilter === 'all' 
                      ? 'bg-indigo-100 text-indigo-800 border border-indigo-200' 
                      : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => setStatusFilter('all')}
                >
                  All
                </button>
                <button
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    statusFilter === 'upcoming' 
                      ? 'bg-purple-100 text-purple-800 border border-purple-200' 
                      : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => setStatusFilter('upcoming')}
                >
                  Upcoming
                </button>
                <button
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    statusFilter === 'in-progress' 
                      ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                      : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => setStatusFilter('in-progress')}
                >
                  In Progress
                </button>
                <button
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    statusFilter === 'completed' 
                      ? 'bg-green-100 text-green-800 border border-green-200' 
                      : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => setStatusFilter('completed')}
                >
                  Completed
                </button>
                <button
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    statusFilter === 'overdue' 
                      ? 'bg-red-100 text-red-800 border border-red-200' 
                      : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => setStatusFilter('overdue')}
                >
                  Overdue
                </button>
              </div>
            )}
          </div>
          
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Activities List */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="px-4 py-5 sm:px-6 border-b border-gray-200 bg-gray-50">
                    <h3 className="text-lg font-medium leading-6 text-gray-900 flex items-center">
                      <CheckCircle className="w-5 h-5 mr-2 text-indigo-600" />
                      Today's Activities
                    </h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">
                      {filteredActivities.length} activities for {format(selectedDate, 'MMMM d, yyyy')}
                    </p>
                  </div>
                  
                  <div className="px-4 py-5 sm:p-6">
                    {filteredActivities.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="mx-auto h-12 w-12 text-gray-400">
                          <CalendarIcon className="h-12 w-12" />
                        </div>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No activities</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          No activities found for the selected date and filters.
                        </p>
                        <div className="mt-6">
                          <button
                            type="button"
                            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            onClick={() => setShowAddActivity(true)}
                          >
                            <Plus className="-ml-1 mr-2 h-5 w-5" />
                            Add Activity
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-4">
                        {filteredActivities.map(activity => renderActivityTile(activity))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Calendar and Stats */}
              <div className="space-y-6">
                {/* Calendar */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="px-4 py-5 sm:px-6 border-b border-gray-200 bg-gray-50">
                    <h3 className="text-lg font-medium leading-6 text-gray-900 flex items-center">
                      <CalendarIcon className="w-5 h-5 mr-2 text-indigo-600" />
                      Calendar
                    </h3>
                  </div>
                  <div className="p-4">
                    <Calendar
                      onChange={setSelectedDate}
                      value={selectedDate}
                      className="w-full border-0"
                      tileClassName={({ date }) => {
                        // Check if there are activities on this date
                        const hasActivities = activities.some(
                          activity => format(activity.dueDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
                        );
                        
                        // Check if this is today
                        const isCurrentDay = isToday(date);
                        
                        // Check if this is the selected date
                        const isSelected = format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
                        
                        if (isSelected) return 'bg-indigo-600 text-white rounded-full';
                        if (isCurrentDay) return 'bg-indigo-100 text-indigo-800 rounded-full';
                        if (hasActivities) return 'bg-green-100 text-green-800 rounded-full';
                        return '';
                      }}
                    />
                  </div>
                </div>
                
                {/* Activity Stats */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="px-4 py-5 sm:px-6 border-b border-gray-200 bg-gray-50">
                    <h3 className="text-lg font-medium leading-6 text-gray-900 flex items-center">
                      <BarChart2 className="w-5 h-5 mr-2 text-indigo-600" />
                      Activity Stats
                    </h3>
                  </div>
                  <div className="p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-green-800">Completed</p>
                            <p className="text-2xl font-bold text-green-900">
                              {activities.filter(a => a.status === 'completed').length}
                            </p>
                          </div>
                          <div className="bg-green-200 rounded-full p-2">
                            <CheckCircle className="h-6 w-6 text-green-700" />
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-blue-800">In Progress</p>
                            <p className="text-2xl font-bold text-blue-900">
                              {activities.filter(a => a.status === 'in-progress').length}
                            </p>
                          </div>
                          <div className="bg-blue-200 rounded-full p-2">
                            <Clock className="h-6 w-6 text-blue-700" />
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-purple-800">Upcoming</p>
                            <p className="text-2xl font-bold text-purple-900">
                              {activities.filter(a => a.status === 'upcoming').length}
                            </p>
                          </div>
                          <div className="bg-purple-200 rounded-full p-2">
                            <CalendarIcon className="h-6 w-6 text-purple-700" />
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-red-50 rounded-lg p-4 border border-red-100">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-red-800">Overdue</p>
                            <p className="text-2xl font-bold text-red-900">
                              {activities.filter(a => a.status === 'overdue').length}
                            </p>
                          </div>
                          <div className="bg-red-200 rounded-full p-2">
                            <AlertCircle className="h-6 w-6 text-red-700" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Team Members */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="px-4 py-5 sm:px-6 border-b border-gray-200 bg-gray-50">
                    <h3 className="text-lg font-medium leading-6 text-gray-900 flex items-center">
                      <Users className="w-5 h-5 mr-2 text-indigo-600" />
                      Team Members
                    </h3>
                  </div>
                  <div className="p-4">
                    <ul className="divide-y divide-gray-200">
                      {sampleUsers.map(user => (
                        <li key={user.id} className="py-3 flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-200">
                              {user.avatar ? (
                                <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center text-gray-500 font-medium">
                                  {user.name.charAt(0)}
                                </div>
                              )}
                            </div>
                            <div className="ml-3">
                              <p className="text-sm font-medium text-gray-900">{user.name}</p>
                              <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                            </div>
                          </div>
                          <button className="text-gray-400 hover:text-gray-500">
                            <MoreHorizontal className="h-5 w-5" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Activities Tab */}
          {activeTab === 'activities' && (
            <div className="space-y-6">
              {/* Activities List */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-4 py-5 sm:px-6 border-b border-gray-200 bg-gray-50">
                  <h3 className="text-lg font-medium leading-6 text-gray-900 flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2 text-indigo-600" />
                    All Activities
                  </h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">
                    {activities.length} total activities
                  </p>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Activity
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Due Date
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Priority
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Assignees
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredActivities.map(activity => (
                        <tr key={activity.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className={`p-1.5 rounded-md mr-3 ${
                                activity.category === 'meeting' ? 'bg-blue-100 text-blue-700' :
                                activity.category === 'task' ? 'bg-green-100 text-green-700' :
                                activity.category === 'deadline' ? 'bg-purple-100 text-purple-700' :
                                'bg-gray-100 text-gray-700'
                              }`}>
                                {getCategoryIcon(activity.category)}
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900">{activity.title}</div>
                                <div className="text-xs text-gray-500 truncate max-w-xs">{activity.description}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(activity.status)}`}>
                              {activity.status.replace('-', ' ')}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {format(activity.dueDate, 'MMM d, yyyy')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs rounded-full border ${getPriorityColor(activity.priority)}`}>
                              {activity.priority}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex -space-x-2">
                              {activity.assignedTo.slice(0, 3).map(userId => {
                                const user = getUserById(userId);
                                return user ? (
                                  <div 
                                    key={userId} 
                                    className="w-6 h-6 rounded-full border-2 border-white overflow-hidden bg-gray-200"
                                    title={user.name}
                                  >
                                    {user.avatar ? (
                                      <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center text-xs font-bold text-gray-600">
                                        {user.name.charAt(0)}
                                      </div>
                                    )}
                                  </div>
                                ) : null;
                              })}
                              
                              {activity.assignedTo.length > 3 && (
                                <div className="w-6 h-6 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                                  +{activity.assignedTo.length - 3}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex space-x-2">
                              <button 
                                className="text-indigo-600 hover:text-indigo-900 text-xs font-medium"
                                onClick={() => {/* View details */}}
                              >
                                View
                              </button>
                              <button 
                                className="text-gray-600 hover:text-gray-900 text-xs font-medium"
                                onClick={() => {/* Edit activity */}}
                              >
                                Edit
                              </button>
                              <button 
                                className="text-red-600 hover:text-red-900 text-xs font-medium"
                                onClick={() => {/* Delete activity */}}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
          
          {/* Team Tab */}
          {activeTab === 'team' && (
            <div className="space-y-6">
              {/* Team Members */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-4 py-5 sm:px-6 border-b border-gray-200 bg-gray-50">
                  <h3 className="text-lg font-medium leading-6 text-gray-900 flex items-center">
                    <Users className="w-5 h-5 mr-2 text-indigo-600" />
                    Team Members
                  </h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">
                    {sampleUsers.length} team members
                  </p>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Role
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Activities
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {sampleUsers.map(user => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-200">
                                {user.avatar ? (
                                  <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                                ) : (
                                  <div className="h-full w-full flex items-center justify-center text-gray-500 font-medium">
                                    {user.name.charAt(0)}
                                  </div>
                                )}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                <div className="text-xs text-gray-500">user{user.id}@example.com</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs rounded-full border ${
                              user.role === 'admin' ? 'bg-purple-100 text-purple-800 border-purple-200' :
                              user.role === 'manager' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                              'bg-green-100 text-green-800 border-green-200'
                            }`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-2.5 w-2.5 rounded-full bg-green-500 mr-2"></div>
                              <span className="text-sm text-gray-500">Active</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {activities.filter(a => a.assignedTo.includes(user.id)).length} activities
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex space-x-2">
                              <button 
                                className="text-indigo-600 hover:text-indigo-900 text-xs font-medium"
                                onClick={() => {/* View profile */}}
                              >
                                View
                              </button>
                              <button 
                                className="text-gray-600 hover:text-gray-900 text-xs font-medium"
                                onClick={() => {/* Edit user */}}
                              >
                                Edit
                              </button>
                              {currentUserRole === 'admin' && (
                                <button 
                                  className="text-red-600 hover:text-red-900 text-xs font-medium"
                                  onClick={() => {/* Delete user */}}
                                >
                                  Delete
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
          
          {/* Calendar Tab */}
          {activeTab === 'calendar' && (
            <div className="space-y-6">
              {/* Calendar View */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-4 py-5 sm:px-6 border-b border-gray-200 bg-gray-50">
                  <h3 className="text-lg font-medium leading-6 text-gray-900 flex items-center">
                    <CalendarIcon className="w-5 h-5 mr-2 text-indigo-600" />
                    Calendar View
                  </h3>
                </div>
                <div className="p-4">
                  <Calendar
                    onChange={setSelectedDate}
                    value={selectedDate}
                    className="w-full border-0"
                    tileClassName={({ date }) => {
                      // Check if there are activities on this date
                      const hasActivities = activities.some(
                        activity => format(activity.dueDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
                      );
                      
                      // Check if this is today
                      const isCurrentDay = isToday(date);
                      
                      // Check if this is the selected date
                      const isSelected = format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
                      
                      if (isSelected) return 'bg-indigo-600 text-white rounded-full';
                      if (isCurrentDay) return 'bg-indigo-100 text-indigo-800 rounded-full';
                      if (hasActivities) return 'bg-green-100 text-green-800 rounded-full';
                      return '';
                    }}
                  />
                </div>
              </div>
              
              {/* Activities for Selected Date */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-4 py-5 sm:px-6 border-b border-gray-200 bg-gray-50">
                  <h3 className="text-lg font-medium leading-6 text-gray-900 flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2 text-indigo-600" />
                    Activities for {format(selectedDate, 'MMMM d, yyyy')}
                  </h3>
                </div>
                
                <div className="p-4">
                  {filteredActivities.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="mx-auto h-12 w-12 text-gray-400">
                        <CalendarIcon className="h-12 w-12" />
                      </div>
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No activities</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        No activities found for the selected date.
                      </p>
                      <div className="mt-6">
                        <button
                          type="button"
                          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          onClick={() => setShowAddActivity(true)}
                        >
                          <Plus className="-ml-1 mr-2 h-5 w-5" />
                          Add Activity
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4">
                      {filteredActivities.map(activity => renderActivityTile(activity))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Add Activity Modal */}
      {showAddActivity && (
        <div className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={() => setShowAddActivity(false)}></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 sm:mx-0 sm:h-10 sm:w-10">
                    <Plus className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Add New Activity</h3>
                    <div className="mt-4 space-y-4">
                      <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
                        <input
                          type="text"
                          id="title"
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          placeholder="Activity title"
                        />
                      </div>
                      <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea
                          id="description"
                          rows={3}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          placeholder="Activity description"
                        ></textarea>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">Due Date</label>
                          <input
                            type="date"
                            id="dueDate"
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          />
                        </div>
                        <div>
                          <label htmlFor="priority" className="block text-sm font-medium text-gray-700">Priority</label>
                          <select
                            id="priority"
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
                        <select
                          id="category"
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        >
                          <option value="meeting">Meeting</option>
                          <option value="task">Task</option>
                          <option value="deadline">Deadline</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label htmlFor="assignedTo" className="block text-sm font-medium text-gray-700">Assign To</label>
                        <select
                          id="assignedTo"
                          multiple
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        >
                          {sampleUsers.map(user => (
                            <option key={user.id} value={user.id}>{user.name}</option>
                          ))}
                        </select>
                        <p className="mt-1 text-xs text-gray-500">Hold Ctrl/Cmd to select multiple users</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Add Activity
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setShowAddActivity(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;