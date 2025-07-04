import React from 'react';
import { Shield, Users, Settings, FileText, Database, Key, AlertTriangle, CheckCircle, HelpCircle } from 'lucide-react';

// Types
type UserRole = 'admin' | 'manager' | 'client';

interface Permission {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
}

interface RoleBasedControlsProps {
  currentUserRole: UserRole;
  onRoleChange?: (userId: string, newRole: UserRole) => void;
  onPermissionToggle?: (permissionId: string, enabled: boolean) => void;
}

const RoleBasedControls: React.FC<RoleBasedControlsProps> = ({ 
  currentUserRole,
  onRoleChange,
  onPermissionToggle
}) => {
  // Sample permissions data
  const adminPermissions: Permission[] = [
    { id: 'user_management', name: 'User Management', description: 'Add, edit, and remove users', enabled: true },
    { id: 'role_assignment', name: 'Role Assignment', description: 'Change user roles and permissions', enabled: true },
    { id: 'system_settings', name: 'System Settings', description: 'Configure system-wide settings', enabled: true },
    { id: 'data_management', name: 'Data Management', description: 'Manage and delete application data', enabled: true },
    { id: 'audit_logs', name: 'Audit Logs', description: 'View system audit logs', enabled: true }
  ];
  
  const managerPermissions: Permission[] = [
    { id: 'team_management', name: 'Team Management', description: 'Manage team members', enabled: true },
    { id: 'activity_assignment', name: 'Activity Assignment', description: 'Assign activities to team members', enabled: true },
    { id: 'reporting', name: 'Reporting', description: 'Generate and view reports', enabled: true },
    { id: 'client_management', name: 'Client Management', description: 'Manage client accounts', enabled: false }
  ];
  
  const clientPermissions: Permission[] = [
    { id: 'view_activities', name: 'View Activities', description: 'View assigned activities', enabled: true },
    { id: 'update_status', name: 'Update Status', description: 'Update activity status', enabled: true },
    { id: 'personal_settings', name: 'Personal Settings', description: 'Update personal settings', enabled: true }
  ];
  
  // Get permissions based on role
  const getPermissionsForRole = (role: UserRole): Permission[] => {
    switch (role) {
      case 'admin': return adminPermissions;
      case 'manager': return managerPermissions;
      case 'client': return clientPermissions;
      default: return [];
    }
  };
  
  // Get role icon
  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'admin': return <Shield className="w-5 h-5 text-purple-600" />;
      case 'manager': return <Users className="w-5 h-5 text-blue-600" />;
      case 'client': return <FileText className="w-5 h-5 text-green-600" />;
      default: return <HelpCircle className="w-5 h-5 text-gray-600" />;
    }
  };
  
  // Get permission icon
  const getPermissionIcon = (permissionId: string) => {
    switch (permissionId) {
      case 'user_management':
      case 'team_management':
        return <Users className="w-4 h-4" />;
      case 'role_assignment':
      case 'activity_assignment':
        return <Key className="w-4 h-4" />;
      case 'system_settings':
      case 'personal_settings':
        return <Settings className="w-4 h-4" />;
      case 'data_management':
        return <Database className="w-4 h-4" />;
      case 'audit_logs':
      case 'reporting':
        return <FileText className="w-4 h-4" />;
      case 'view_activities':
      case 'update_status':
        return <CheckCircle className="w-4 h-4" />;
      case 'client_management':
        return <Users className="w-4 h-4" />;
      default:
        return <HelpCircle className="w-4 h-4" />;
    }
  };
  
  // Handle permission toggle
  const handlePermissionToggle = (permissionId: string, currentValue: boolean) => {
    if (onPermissionToggle) {
      onPermissionToggle(permissionId, !currentValue);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200 bg-gray-50">
        <h3 className="text-lg font-medium leading-6 text-gray-900 flex items-center">
          <Shield className="w-5 h-5 mr-2 text-indigo-600" />
          Role & Permissions
        </h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Manage access controls based on user roles
        </p>
      </div>
      
      <div className="p-4">
        {/* Current Role */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Your Current Role</h4>
          <div className="flex items-center p-3 bg-indigo-50 rounded-lg border border-indigo-100">
            <div className="p-2 bg-white rounded-md mr-3">
              {getRoleIcon(currentUserRole)}
            </div>
            <div>
              <p className="font-medium text-gray-900 capitalize">{currentUserRole}</p>
              <p className="text-xs text-gray-600">
                {currentUserRole === 'admin' && 'Full system access with all permissions'}
                {currentUserRole === 'manager' && 'Team management and reporting capabilities'}
                {currentUserRole === 'client' && 'Limited access to assigned activities'}
              </p>
            </div>
          </div>
        </div>
        
        {/* Permissions List */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Your Permissions</h4>
          <div className="space-y-2">
            {getPermissionsForRole(currentUserRole).map(permission => (
              <div 
                key={permission.id} 
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center">
                  <div className={`p-1.5 rounded-md mr-3 ${permission.enabled ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>
                    {getPermissionIcon(permission.id)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{permission.name}</p>
                    <p className="text-xs text-gray-600">{permission.description}</p>
                  </div>
                </div>
                
                {/* Toggle switch - only visible to admins for their own permissions */}
                {currentUserRole === 'admin' && (
                  <div className="relative inline-block w-10 mr-2 align-middle select-none">
                    <input 
                      type="checkbox" 
                      id={`toggle-${permission.id}`} 
                      checked={permission.enabled}
                      onChange={() => handlePermissionToggle(permission.id, permission.enabled)}
                      className="sr-only"
                    />
                    <label 
                      htmlFor={`toggle-${permission.id}`}
                      className={`block overflow-hidden h-5 rounded-full cursor-pointer ${
                        permission.enabled ? 'bg-indigo-600' : 'bg-gray-300'
                      }`}
                    >
                      <span 
                        className={`block h-5 w-5 rounded-full bg-white shadow transform transition-transform ${
                          permission.enabled ? 'translate-x-5' : 'translate-x-0'
                        }`} 
                      />
                    </label>
                  </div>
                )}
                
                {/* Static indicator for non-admins */}
                {currentUserRole !== 'admin' && (
                  <div className={`text-xs px-2 py-1 rounded-full ${
                    permission.enabled 
                      ? 'bg-green-100 text-green-800 border border-green-200' 
                      : 'bg-gray-100 text-gray-800 border border-gray-200'
                  }`}>
                    {permission.enabled ? 'Enabled' : 'Disabled'}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* Admin-only section */}
        {currentUserRole === 'admin' && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-medium text-gray-700">Role Management</h4>
              <button className="text-xs px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                Manage Roles
              </button>
            </div>
            
            <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
              <div className="flex items-start">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">Admin Privileges</p>
                  <p className="text-xs text-yellow-700 mt-1">
                    As an admin, you have full control over user roles and permissions. 
                    Changes to system roles should be made with caution.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoleBasedControls;