import React from 'react';
import { BarChart2, CheckCircle, Clock, CalendarIcon, AlertCircle, TrendingUp, TrendingDown } from 'lucide-react';

// Types
type ActivityStatus = 'completed' | 'in-progress' | 'upcoming' | 'overdue';

interface Activity {
  id: string;
  status: ActivityStatus;
  dueDate: Date;
}

interface ActivityStatsProps {
  activities: Activity[];
  previousPeriodActivities?: Activity[];
  period?: 'day' | 'week' | 'month';
}

const ActivityStats: React.FC<ActivityStatsProps> = ({ 
  activities, 
  previousPeriodActivities = [],
  period = 'week'
}) => {
  // Count activities by status
  const completedCount = activities.filter(a => a.status === 'completed').length;
  const inProgressCount = activities.filter(a => a.status === 'in-progress').length;
  const upcomingCount = activities.filter(a => a.status === 'upcoming').length;
  const overdueCount = activities.filter(a => a.status === 'overdue').length;
  
  // Calculate previous period counts for comparison
  const prevCompletedCount = previousPeriodActivities.filter(a => a.status === 'completed').length;
  const prevInProgressCount = previousPeriodActivities.filter(a => a.status === 'in-progress').length;
  const prevUpcomingCount = previousPeriodActivities.filter(a => a.status === 'upcoming').length;
  const prevOverdueCount = previousPeriodActivities.filter(a => a.status === 'overdue').length;
  
  // Calculate percentage changes
  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  };
  
  const completedChange = calculateChange(completedCount, prevCompletedCount);
  const inProgressChange = calculateChange(inProgressCount, prevInProgressCount);
  const upcomingChange = calculateChange(upcomingCount, prevUpcomingCount);
  const overdueChange = calculateChange(overdueCount, prevOverdueCount);
  
  // Determine if change is positive or negative (for some metrics, negative is good)
  const isPositiveChange = (status: ActivityStatus, change: number) => {
    if (status === 'completed') return change > 0;
    if (status === 'overdue') return change < 0;
    return change >= 0; // For in-progress and upcoming, positive or no change is considered good
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200 bg-gray-50">
        <h3 className="text-lg font-medium leading-6 text-gray-900 flex items-center">
          <BarChart2 className="w-5 h-5 mr-2 text-indigo-600" />
          Activity Stats
        </h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Performance overview for this {period}
        </p>
      </div>
      
      <div className="p-4">
        <div className="grid grid-cols-2 gap-4">
          {/* Completed */}
          <div className="bg-green-50 rounded-lg p-4 border border-green-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-800">Completed</p>
                <p className="text-2xl font-bold text-green-900">{completedCount}</p>
                
                {previousPeriodActivities.length > 0 && (
                  <div className={`flex items-center mt-1 text-xs ${
                    isPositiveChange('completed', completedChange) 
                      ? 'text-green-600' 
                      : 'text-red-600'
                  }`}>
                    {isPositiveChange('completed', completedChange) ? (
                      <TrendingUp className="w-3 h-3 mr-1" />
                    ) : (
                      <TrendingDown className="w-3 h-3 mr-1" />
                    )}
                    <span>{Math.abs(completedChange)}% from last {period}</span>
                  </div>
                )}
              </div>
              <div className="bg-green-200 rounded-full p-2">
                <CheckCircle className="h-6 w-6 text-green-700" />
              </div>
            </div>
          </div>
          
          {/* In Progress */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-800">In Progress</p>
                <p className="text-2xl font-bold text-blue-900">{inProgressCount}</p>
                
                {previousPeriodActivities.length > 0 && (
                  <div className={`flex items-center mt-1 text-xs ${
                    isPositiveChange('in-progress', inProgressChange) 
                      ? 'text-green-600' 
                      : 'text-red-600'
                  }`}>
                    {isPositiveChange('in-progress', inProgressChange) ? (
                      <TrendingUp className="w-3 h-3 mr-1" />
                    ) : (
                      <TrendingDown className="w-3 h-3 mr-1" />
                    )}
                    <span>{Math.abs(inProgressChange)}% from last {period}</span>
                  </div>
                )}
              </div>
              <div className="bg-blue-200 rounded-full p-2">
                <Clock className="h-6 w-6 text-blue-700" />
              </div>
            </div>
          </div>
          
          {/* Upcoming */}
          <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-800">Upcoming</p>
                <p className="text-2xl font-bold text-purple-900">{upcomingCount}</p>
                
                {previousPeriodActivities.length > 0 && (
                  <div className={`flex items-center mt-1 text-xs ${
                    isPositiveChange('upcoming', upcomingChange) 
                      ? 'text-green-600' 
                      : 'text-red-600'
                  }`}>
                    {isPositiveChange('upcoming', upcomingChange) ? (
                      <TrendingUp className="w-3 h-3 mr-1" />
                    ) : (
                      <TrendingDown className="w-3 h-3 mr-1" />
                    )}
                    <span>{Math.abs(upcomingChange)}% from last {period}</span>
                  </div>
                )}
              </div>
              <div className="bg-purple-200 rounded-full p-2">
                <CalendarIcon className="h-6 w-6 text-purple-700" />
              </div>
            </div>
          </div>
          
          {/* Overdue */}
          <div className="bg-red-50 rounded-lg p-4 border border-red-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-800">Overdue</p>
                <p className="text-2xl font-bold text-red-900">{overdueCount}</p>
                
                {previousPeriodActivities.length > 0 && (
                  <div className={`flex items-center mt-1 text-xs ${
                    isPositiveChange('overdue', overdueChange) 
                      ? 'text-green-600' 
                      : 'text-red-600'
                  }`}>
                    {isPositiveChange('overdue', overdueChange) ? (
                      <TrendingUp className="w-3 h-3 mr-1" />
                    ) : (
                      <TrendingDown className="w-3 h-3 mr-1" />
                    )}
                    <span>{Math.abs(overdueChange)}% from last {period}</span>
                  </div>
                )}
              </div>
              <div className="bg-red-200 rounded-full p-2">
                <AlertCircle className="h-6 w-6 text-red-700" />
              </div>
            </div>
          </div>
        </div>
        
        {/* Completion Rate */}
        <div className="mt-4 bg-indigo-50 rounded-lg p-4 border border-indigo-100">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-indigo-800">Completion Rate</p>
            <p className="text-sm font-bold text-indigo-900">
              {activities.length > 0 
                ? Math.round((completedCount / activities.length) * 100) 
                : 0}%
            </p>
          </div>
          <div className="w-full bg-indigo-200 rounded-full h-2.5">
            <div 
              className="bg-indigo-600 h-2.5 rounded-full" 
              style={{ 
                width: `${activities.length > 0 
                  ? Math.round((completedCount / activities.length) * 100) 
                  : 0}%` 
              }}
            ></div>
          </div>
          <p className="mt-2 text-xs text-indigo-700">
            {completedCount} of {activities.length} activities completed
          </p>
        </div>
      </div>
    </div>
  );
};

export default ActivityStats;