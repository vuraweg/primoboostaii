import React from 'react';
import { Users, MoreHorizontal, Mail, Phone, Star } from 'lucide-react';

// Types
type UserRole = 'admin' | 'manager' | 'client';

interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  email?: string;
  phone?: string;
  avatar?: string;
  department?: string;
  status?: 'active' | 'away' | 'offline';
}

interface TeamMembersProps {
  users: UserProfile[];
  currentUserRole: UserRole;
  onViewProfile: (userId: string) => void;
}

const TeamMembers: React.FC<TeamMembersProps> = ({ 
  users, 
  currentUserRole, 
  onViewProfile 
}) => {
  // Get status color and icon
  const getStatusIndicator = (status?: string) => {
    switch (status) {
      case 'active':
        return <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-white" />;
      case 'away':
        return <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-yellow-500 ring-2 ring-white" />;
      case 'offline':
        return <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-gray-400 ring-2 ring-white" />;
      default:
        return null;
    }
  };

  // Get role badge color
  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'manager':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'client':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200 bg-gray-50">
        <h3 className="text-lg font-medium leading-6 text-gray-900 flex items-center">
          <Users className="w-5 h-5 mr-2 text-indigo-600" />
          Team Members
        </h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          {users.length} team members
        </p>
      </div>
      
      <div className="p-4">
        <ul className="divide-y divide-gray-200">
          {users.map(user => (
            <li key={user.id} className="py-4 flex items-center justify-between hover:bg-gray-50 px-2 rounded-lg transition-colors">
              <div className="flex items-center">
                <div className="relative">
                  <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-200">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-gray-500 font-medium">
                        {user.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  {getStatusIndicator(user.status)}
                </div>
                <div className="ml-3">
                  <div className="flex items-center">
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    {user.role === 'admin' && (
                      <Star className="ml-1 h-3 w-3 text-yellow-500" />
                    )}
                  </div>
                  <div className="flex items-center mt-1">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getRoleBadgeColor(user.role)}`}>
                      {user.role}
                    </span>
                    {user.department && (
                      <span className="ml-2 text-xs text-gray-500">
                        {user.department}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {/* Contact buttons - only visible to admins and managers */}
                {(currentUserRole === 'admin' || currentUserRole === 'manager') && (
                  <>
                    {user.email && (
                      <button 
                        className="p-1 rounded-full text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                        title={`Email ${user.name}`}
                      >
                        <Mail className="h-4 w-4" />
                      </button>
                    )}
                    {user.phone && (
                      <button 
                        className="p-1 rounded-full text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                        title={`Call ${user.name}`}
                      >
                        <Phone className="h-4 w-4" />
                      </button>
                    )}
                  </>
                )}
                
                <button 
                  className="p-1 rounded-full text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                  onClick={() => onViewProfile(user.id)}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
        
        {/* Admin controls - only visible to admins */}
        {currentUserRole === 'admin' && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <button className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              Manage Team Members
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamMembers;