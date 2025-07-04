import React, { useState } from 'react';
import Calendar from 'react-calendar';
import { format, isToday, isSameDay } from 'date-fns';
import { CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import 'react-calendar/dist/Calendar.css';

interface Activity {
  id: string;
  title: string;
  dueDate: Date;
  status: 'completed' | 'in-progress' | 'upcoming' | 'overdue';
}

interface CalendarViewProps {
  activities: Activity[];
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ 
  activities, 
  selectedDate, 
  onDateChange 
}) => {
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  
  // Get activities for the selected date
  const activitiesForSelectedDate = activities.filter(activity => 
    isSameDay(activity.dueDate, selectedDate)
  );
  
  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'in-progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'upcoming': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'overdue': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
        <h3 className="text-lg font-medium leading-6 text-gray-900 flex items-center">
          <CalendarIcon className="w-5 h-5 mr-2 text-indigo-600" />
          Calendar
        </h3>
        
        <div className="flex space-x-2">
          <button 
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              viewMode === 'month' 
                ? 'bg-indigo-100 text-indigo-700' 
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
            onClick={() => setViewMode('month')}
          >
            Month
          </button>
          <button 
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              viewMode === 'week' 
                ? 'bg-indigo-100 text-indigo-700' 
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
            onClick={() => setViewMode('week')}
          >
            Week
          </button>
          <button 
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              viewMode === 'day' 
                ? 'bg-indigo-100 text-indigo-700' 
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
            onClick={() => setViewMode('day')}
          >
            Day
          </button>
        </div>
      </div>
      
      <div className="p-4">
        {/* Calendar Component */}
        <Calendar
          onChange={onDateChange}
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
          navigationLabel={({ date }) => format(date, 'MMMM yyyy')}
          prevLabel={<ChevronLeft className="h-5 w-5" />}
          nextLabel={<ChevronRight className="h-5 w-5" />}
          view={viewMode === 'month' ? 'month' : viewMode === 'week' ? 'month' : 'month'}
        />
        
        {/* Selected Date Activities */}
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">
            Activities for {format(selectedDate, 'MMMM d, yyyy')}
          </h4>
          
          {activitiesForSelectedDate.length === 0 ? (
            <p className="text-sm text-gray-500">No activities scheduled for this date.</p>
          ) : (
            <ul className="space-y-2">
              {activitiesForSelectedDate.map(activity => (
                <li key={activity.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-900">{activity.title}</span>
                  <span className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(activity.status)}`}>
                    {activity.status.replace('-', ' ')}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default CalendarView;