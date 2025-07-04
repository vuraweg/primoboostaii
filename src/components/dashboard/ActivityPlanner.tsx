import React, { useState } from 'react';
import { Plus, Calendar as CalendarIcon, Clock, Users, CheckCircle, Filter, ChevronDown, Search, X } from 'lucide-react';
import { format } from 'date-fns';

// Types
type ActivityStatus = 'completed' | 'in-progress' | 'upcoming' | 'overdue';
type ActivityPriority = 'high' | 'medium' | 'low';
type ActivityCategory = 'meeting' | 'task' | 'deadline' | 'other';

interface Activity {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  status: ActivityStatus;
  assignedTo: string[];
  priority: ActivityPriority;
  category: ActivityCategory;
}

interface User {
  id: string;
  name: string;
  avatar?: string;
}

interface ActivityPlannerProps {
  activities: Activity[];
  users: User[];
  onAddActivity: (activity: Omit<Activity, 'id'>) => void;
  onUpdateActivity: (id: string, updates: Partial<Activity>) => void;
  onDeleteActivity: (id: string) => void;
}

const ActivityPlanner: React.FC<ActivityPlannerProps> = ({
  activities,
  users,
  onAddActivity,
  onUpdateActivity,
  onDeleteActivity
}) => {
  // State
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ActivityStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<ActivityPriority | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<ActivityCategory | 'all'>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<string | 'all'>('all');
  
  // Form state
  const [newActivity, setNewActivity] = useState<Omit<Activity, 'id'>>({
    title: '',
    description: '',
    dueDate: new Date(),
    status: 'upcoming',
    assignedTo: [],
    priority: 'medium',
    category: 'task'
  });
  
  // Filter activities
  const filteredActivities = activities.filter(activity => {
    // Search term filter
    const matchesSearch = 
      activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Status filter
    const matchesStatus = statusFilter === 'all' || activity.status === statusFilter;
    
    // Priority filter
    const matchesPriority = priorityFilter === 'all' || activity.priority === priorityFilter;
    
    // Category filter
    const matchesCategory = categoryFilter === 'all' || activity.category === categoryFilter;
    
    // Assignee filter
    const matchesAssignee = assigneeFilter === 'all' || activity.assignedTo.includes(assigneeFilter);
    
    return matchesSearch && matchesStatus && matchesPriority && matchesCategory && matchesAssignee;
  });
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddActivity(newActivity);
    setNewActivity({
      title: '',
      description: '',
      dueDate: new Date(),
      status: 'upcoming',
      assignedTo: [],
      priority: 'medium',
      category: 'task'
    });
    setShowAddForm(false);
  };
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewActivity(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle date change
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = new Date(e.target.value);
    setNewActivity(prev => ({ ...prev, dueDate: date }));
  };
  
  // Handle assignee selection
  const handleAssigneeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const options = e.target.options;
    const selectedValues = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selectedValues.push(options[i].value);
      }
    }
    setNewActivity(prev => ({ ...prev, assignedTo: selectedValues }));
  };
  
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
  
  const getPriorityColor = (priority: ActivityPriority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  
  const getCategoryIcon = (category: ActivityCategory) => {
    switch (category) {
      case 'meeting': return <Users className="w-4 h-4" />;
      case 'task': return <CheckCircle className="w-4 h-4" />;
      case 'deadline': return <Clock className="w-4 h-4" />;
      default: return <CheckCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium leading-6 text-gray-900 flex items-center">
            <CalendarIcon className="w-5 h-5 mr-2 text-indigo-600" />
            Activity Planner
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Plan and manage your team's activities
          </p>
        </div>
        
        <button
          className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? (
            <>
              <X className="h-4 w-4 mr-1" />
              <span>Cancel</span>
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-1" />
              <span>Add Activity</span>
            </>
          )}
        </button>
      </div>
      
      {/* Add Activity Form */}
      {showAddForm && (
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
                <input
                  type="text"
                  name="title"
                  id="title"
                  required
                  value={newActivity.title}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">Due Date</label>
                <input
                  type="date"
                  name="dueDate"
                  id="dueDate"
                  required
                  value={format(newActivity.dueDate, 'yyyy-MM-dd')}
                  onChange={handleDateChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                name="description"
                id="description"
                rows={2}
                value={newActivity.description}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
                <select
                  name="category"
                  id="category"
                  value={newActivity.category}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="meeting">Meeting</option>
                  <option value="task">Task</option>
                  <option value="deadline">Deadline</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="priority" className="block text-sm font-medium text-gray-700">Priority</label>
                <select
                  name="priority"
                  id="priority"
                  value={newActivity.priority}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
                <select
                  name="status"
                  id="status"
                  value={newActivity.status}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="upcoming">Upcoming</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>
            </div>
            
            <div>
              <label htmlFor="assignedTo" className="block text-sm font-medium text-gray-700">Assign To</label>
              <select
                name="assignedTo"
                id="assignedTo"
                multiple
                value={newActivity.assignedTo}
                onChange={handleAssigneeChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                {users.map(user => (
                  <option key={user.id} value={user.id}>{user.name}</option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">Hold Ctrl/Cmd to select multiple users</p>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={() => setShowAddForm(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Add Activity
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Filters */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-grow max-w-xs">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search activities..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* Status Filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as ActivityStatus | 'all')}
              className="block w-full pl-3 pr-10 py-2 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All Statuses</option>
              <option value="upcoming">Upcoming</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
          
          {/* Priority Filter */}
          <div className="relative">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as ActivityPriority | 'all')}
              className="block w-full pl-3 pr-10 py-2 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          
          {/* Category Filter */}
          <div className="relative">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as ActivityCategory | 'all')}
              className="block w-full pl-3 pr-10 py-2 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All Categories</option>
              <option value="meeting">Meetings</option>
              <option value="task">Tasks</option>
              <option value="deadline">Deadlines</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          {/* Assignee Filter */}
          <div className="relative">
            <select
              value={assigneeFilter}
              onChange={(e) => setAssigneeFilter(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All Assignees</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>{user.name}</option>
              ))}
            </select>
          </div>
          
          {/* Clear Filters */}
          {(searchTerm || statusFilter !== 'all' || priorityFilter !== 'all' || categoryFilter !== 'all' || assigneeFilter !== 'all') && (
            <button
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setPriorityFilter('all');
                setCategoryFilter('all');
                setAssigneeFilter('all');
              }}
            >
              <X className="h-4 w-4 mr-1" />
              Clear Filters
            </button>
          )}
        </div>
      </div>
      
      {/* Activity List */}
      <div className="p-4">
        {filteredActivities.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto h-12 w-12 text-gray-400">
              <CalendarIcon className="h-12 w-12" />
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No activities found</h3>
            <p className="mt-1 text-sm text-gray-500">
              No activities match your current filters.
            </p>
            <div className="mt-6">
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={() => setShowAddForm(true)}
              >
                <Plus className="-ml-1 mr-2 h-5 w-5" />
                Add Activity
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-hidden">
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
                          const user = users.find(u => u.id === userId);
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
                          onClick={() => onDeleteActivity(activity.id)}
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
        )}
      </div>
    </div>
  );
};

export default ActivityPlanner;