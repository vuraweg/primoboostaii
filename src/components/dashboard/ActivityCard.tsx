import React from 'react';
import { Clock, CheckCircle, AlertCircle, Users, MoreHorizontal, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';

// Types
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
  avatar?: string;
}

interface ActivityCardProps {
  activity: Activity;
  users: UserProfile[];
  onStatusChange: (id: string, newStatus: ActivityStatus) => void;
  onViewDetails: (id: string) => void;
}

const ActivityCard: React.FC<ActivityCardProps> = ({ 
  activity, 
  users, 
  onStatusChange, 
  onViewDetails 
}) => {
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
      default: return <CheckCircle className="w-4 h-4" />;
    }
  };

  // Get assigned users
  const assignedUsers = users.filter(user => activity.assignedTo.includes(user.id));

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center">
          <div className="p-2 rounded-lg bg-indigo-100 text-indigo-600 mr-3">
            {getCategoryIcon(activity.category)}
          </div>
          <h3 className="font-semibold text-gray-900">{activity.title}</h3>
        </div>
        <div className="flex items-center">
          <span className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(activity.status)}`}>
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
          <span className={`text-xs px-2 py-1 rounded-full border mr-2 ${getPriorityColor(activity.priority)}`}>
            {activity.priority}
          </span>
          
          <div className="flex -space-x-2">
            {assignedUsers.slice(0, 3).map(user => (
              <div 
                key={user.id} 
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
            ))}
            
            {assignedUsers.length > 3 && (
              <div className="w-6 h-6 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                +{assignedUsers.length - 3}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Action buttons based on status */}
      <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between">
        <button 
          onClick={() => onViewDetails(activity.id)}
          className="text-xs px-3 py-1 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors flex items-center"
        >
          <span>Details</span>
          <ArrowRight className="w-3 h-3 ml-1" />
        </button>
        
        <div className="flex space-x-2">
          {activity.status === 'upcoming' && (
            <button 
              onClick={() => onStatusChange(activity.id, 'in-progress')}
              className="text-xs px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Start
            </button>
          )}
          
          {activity.status === 'in-progress' && (
            <button 
              onClick={() => onStatusChange(activity.id, 'completed')}
              className="text-xs px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Complete
            </button>
          )}
          
          {activity.status === 'overdue' && (
            <button 
              onClick={() => onStatusChange(activity.id, 'in-progress')}
              className="text-xs px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Start Now
            </button>
          )}
          
          <button className="text-gray-400 hover:text-gray-600 transition-colors">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActivityCard;