import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  Calendar, 
  CheckCircle, 
  Clock, 
  Edit, 
  FileText, 
  Filter, 
  Loader2, 
  Plus, 
  RefreshCw, 
  Search, 
  Trash2, 
  X,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  BarChart3,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';

interface JobApplication {
  id: string;
  company_name: string;
  job_title: string;
  job_url?: string;
  application_date: string;
  status: 'applied' | 'interview_scheduled' | 'interviewed' | 'rejected' | 'offer_received';
  notes?: string;
  follow_up_date?: string;
  created_at: string;
  updated_at: string;
}

interface Interview {
  id: string;
  job_application_id: string;
  interview_date?: string;
  interview_stage?: 'screening' | 'technical' | 'behavioral' | 'final' | 'completed';
  interviewer_name?: string;
  interview_notes?: string;
  feedback?: string;
  result?: string;
  next_steps?: string;
  created_at: string;
  updated_at: string;
}

interface Stats {
  total_applications: number;
  active_applications: number;
  interviews_scheduled: number;
  offers_received: number;
  rejection_rate: number;
}

export const JobApplicationTracker: React.FC = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showInterviewForm, setShowInterviewForm] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<JobApplication | null>(null);
  const [editingApplication, setEditingApplication] = useState<JobApplication | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [expandedApplications, setExpandedApplications] = useState<Set<string>>(new Set());
  
  const [newApplication, setNewApplication] = useState({
    company_name: '',
    job_title: '',
    job_url: '',
    application_date: new Date().toISOString().split('T')[0],
    status: 'applied' as const,
    notes: '',
    follow_up_date: ''
  });
  
  const [newInterview, setNewInterview] = useState({
    job_application_id: '',
    interview_date: '',
    interview_stage: 'screening' as const,
    interviewer_name: '',
    interview_notes: ''
  });

  useEffect(() => {
    if (user) {
      loadApplications();
      loadStats();
    }
  }, [user]);

  const loadApplications = async () => {
    try {
      setLoading(true);
      
      // Get user profile ID
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('user_id', user!.id)
        .single();
        
      if (profileError) {
        console.error('Error fetching user profile:', profileError);
        return;
      }
      
      const clientId = profileData.id;
      
      // Get job applications
      const { data: applicationsData, error: applicationsError } = await supabase
        .from('job_applications')
        .select('*')
        .eq('client_id', clientId)
        .order('application_date', { ascending: false });
        
      if (applicationsError) {
        console.error('Error fetching applications:', applicationsError);
        return;
      }
      
      setApplications(applicationsData || []);
      
      // Get interviews for all applications
      if (applicationsData && applicationsData.length > 0) {
        const appIds = applicationsData.map(app => app.id);
        
        const { data: interviewsData, error: interviewsError } = await supabase
          .from('interviews')
          .select('*')
          .in('job_application_id', appIds)
          .order('interview_date', { ascending: true });
          
        if (interviewsError) {
          console.error('Error fetching interviews:', interviewsError);
          return;
        }
        
        setInterviews(interviewsData || []);
      }
    } catch (error) {
      console.error('Error loading applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const { data, error } = await supabase.rpc('get_job_application_stats', {
        user_uuid: user!.id
      });
      
      if (error) {
        console.error('Error fetching stats:', error);
        return;
      }
      
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleAddApplication = async () => {
    try {
      if (!newApplication.company_name || !newApplication.job_title || !newApplication.application_date) {
        alert('Please fill in all required fields');
        return;
      }
      
      // Get user profile ID
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('user_id', user!.id)
        .single();
        
      if (profileError) {
        console.error('Error fetching user profile:', profileError);
        return;
      }
      
      const clientId = profileData.id;
      
      const { data, error } = await supabase
        .from('job_applications')
        .insert({
          client_id: clientId,
          company_name: newApplication.company_name,
          job_title: newApplication.job_title,
          job_url: newApplication.job_url || null,
          application_date: newApplication.application_date,
          status: newApplication.status,
          notes: newApplication.notes || null,
          follow_up_date: newApplication.follow_up_date || null
        })
        .select();
        
      if (error) {
        console.error('Error adding application:', error);
        alert('Failed to add application');
        return;
      }
      
      setApplications([data[0], ...applications]);
      setShowAddForm(false);
      setNewApplication({
        company_name: '',
        job_title: '',
        job_url: '',
        application_date: new Date().toISOString().split('T')[0],
        status: 'applied',
        notes: '',
        follow_up_date: ''
      });
      
      // Refresh stats
      loadStats();
    } catch (error) {
      console.error('Error adding application:', error);
      alert('Failed to add application');
    }
  };

  const handleUpdateApplication = async () => {
    try {
      if (!editingApplication) return;
      
      const { data, error } = await supabase
        .from('job_applications')
        .update({
          company_name: editingApplication.company_name,
          job_title: editingApplication.job_title,
          job_url: editingApplication.job_url || null,
          application_date: editingApplication.application_date,
          status: editingApplication.status,
          notes: editingApplication.notes || null,
          follow_up_date: editingApplication.follow_up_date || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingApplication.id)
        .select();
        
      if (error) {
        console.error('Error updating application:', error);
        alert('Failed to update application');
        return;
      }
      
      setApplications(applications.map(app => app.id === editingApplication.id ? data[0] : app));
      setEditingApplication(null);
      
      // Refresh stats
      loadStats();
    } catch (error) {
      console.error('Error updating application:', error);
      alert('Failed to update application');
    }
  };

  const handleDeleteApplication = async (id: string) => {
    if (!confirm('Are you sure you want to delete this application?')) return;
    
    try {
      const { error } = await supabase
        .from('job_applications')
        .delete()
        .eq('id', id);
        
      if (error) {
        console.error('Error deleting application:', error);
        alert('Failed to delete application');
        return;
      }
      
      setApplications(applications.filter(app => app.id !== id));
      
      // Refresh stats
      loadStats();
    } catch (error) {
      console.error('Error deleting application:', error);
      alert('Failed to delete application');
    }
  };

  const handleAddInterview = async () => {
    try {
      if (!selectedApplication || !newInterview.interview_date || !newInterview.interview_stage) {
        alert('Please fill in all required fields');
        return;
      }
      
      const { data, error } = await supabase
        .from('interviews')
        .insert({
          job_application_id: selectedApplication.id,
          interview_date: new Date(newInterview.interview_date).toISOString(),
          interview_stage: newInterview.interview_stage,
          interviewer_name: newInterview.interviewer_name || null,
          interview_notes: newInterview.interview_notes || null
        })
        .select();
        
      if (error) {
        console.error('Error adding interview:', error);
        alert('Failed to add interview');
        return;
      }
      
      setInterviews([...interviews, data[0]]);
      
      // Update application status if it's still in 'applied' status
      if (selectedApplication.status === 'applied') {
        const { data: updatedApp, error: updateError } = await supabase
          .from('job_applications')
          .update({
            status: 'interview_scheduled',
            updated_at: new Date().toISOString()
          })
          .eq('id', selectedApplication.id)
          .select();
          
        if (!updateError && updatedApp) {
          setApplications(applications.map(app => app.id === selectedApplication.id ? updatedApp[0] : app));
        }
      }
      
      setShowInterviewForm(false);
      setNewInterview({
        job_application_id: '',
        interview_date: '',
        interview_stage: 'screening',
        interviewer_name: '',
        interview_notes: ''
      });
      
      // Refresh stats
      loadStats();
    } catch (error) {
      console.error('Error adding interview:', error);
      alert('Failed to add interview');
    }
  };

  const toggleApplicationExpand = (id: string) => {
    const newExpanded = new Set(expandedApplications);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedApplications(newExpanded);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'applied': return 'bg-blue-100 text-blue-800';
      case 'interview_scheduled': return 'bg-purple-100 text-purple-800';
      case 'interviewed': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'offer_received': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'applied': return 'Applied';
      case 'interview_scheduled': return 'Interview Scheduled';
      case 'interviewed': return 'Interviewed';
      case 'rejected': return 'Rejected';
      case 'offer_received': return 'Offer Received';
      default: return status;
    }
  };

  const getInterviewStageLabel = (stage: string) => {
    switch (stage) {
      case 'screening': return 'Screening';
      case 'technical': return 'Technical';
      case 'behavioral': return 'Behavioral';
      case 'final': return 'Final Round';
      case 'completed': return 'Completed';
      default: return stage;
    }
  };

  const getInterviewStageColor = (stage: string) => {
    switch (stage) {
      case 'screening': return 'bg-blue-100 text-blue-800';
      case 'technical': return 'bg-purple-100 text-purple-800';
      case 'behavioral': return 'bg-yellow-100 text-yellow-800';
      case 'final': return 'bg-orange-100 text-orange-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getApplicationInterviews = (applicationId: string) => {
    return interviews.filter(interview => interview.job_application_id === applicationId);
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = 
      app.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.job_title.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Briefcase className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Job Application Tracker
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Track your job applications, interviews, and offers in one place to stay organized during your job search
          </p>
        </div>

        {/* Stats Section */}
        {stats && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <BarChart3 className="w-6 h-6 mr-2 text-blue-600" />
              Application Statistics
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-blue-50 rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-blue-700 mb-1">{stats.total_applications}</div>
                <div className="text-sm text-blue-600">Total Applications</div>
              </div>
              
              <div className="bg-purple-50 rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-purple-700 mb-1">{stats.active_applications}</div>
                <div className="text-sm text-purple-600">Active Applications</div>
              </div>
              
              <div className="bg-yellow-50 rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-yellow-700 mb-1">{stats.interviews_scheduled}</div>
                <div className="text-sm text-yellow-600">Interviews Scheduled</div>
              </div>
              
              <div className="bg-green-50 rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-green-700 mb-1">{stats.offers_received}</div>
                <div className="text-sm text-green-600">Offers Received</div>
              </div>
              
              <div className="bg-red-50 rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-red-700 mb-1">{stats.rejection_rate.toFixed(1)}%</div>
                <div className="text-sm text-red-600">Rejection Rate</div>
              </div>
            </div>
          </div>
        )}

        {/* Actions Bar */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-4 flex-grow">
              {/* Search */}
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by company or job title..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              {/* Filter */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="pl-10 pr-8 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                >
                  <option value="all">All Statuses</option>
                  <option value="applied">Applied</option>
                  <option value="interview_scheduled">Interview Scheduled</option>
                  <option value="interviewed">Interviewed</option>
                  <option value="rejected">Rejected</option>
                  <option value="offer_received">Offer Received</option>
                </select>
              </div>
            </div>
            
            {/* Add Button */}
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors flex items-center justify-center space-x-2 shadow-md"
            >
              <Plus className="w-5 h-5" />
              <span>Add Application</span>
            </button>
          </div>
        </div>

        {/* Add Application Form */}
        {showAddForm && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Add New Application</h2>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Company Name *
                </label>
                <input
                  type="text"
                  value={newApplication.company_name}
                  onChange={(e) => setNewApplication({...newApplication, company_name: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Google, Microsoft, etc."
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Job Title *
                </label>
                <input
                  type="text"
                  value={newApplication.job_title}
                  onChange={(e) => setNewApplication({...newApplication, job_title: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Software Engineer, Product Manager, etc."
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Job URL
                </label>
                <input
                  type="url"
                  value={newApplication.job_url}
                  onChange={(e) => setNewApplication({...newApplication, job_url: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://example.com/job-posting"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Application Date *
                </label>
                <input
                  type="date"
                  value={newApplication.application_date}
                  onChange={(e) => setNewApplication({...newApplication, application_date: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={newApplication.status}
                  onChange={(e) => setNewApplication({...newApplication, status: e.target.value as any})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="applied">Applied</option>
                  <option value="interview_scheduled">Interview Scheduled</option>
                  <option value="interviewed">Interviewed</option>
                  <option value="rejected">Rejected</option>
                  <option value="offer_received">Offer Received</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Follow-up Date
                </label>
                <input
                  type="date"
                  value={newApplication.follow_up_date}
                  onChange={(e) => setNewApplication({...newApplication, follow_up_date: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  value={newApplication.notes}
                  onChange={(e) => setNewApplication({...newApplication, notes: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-32"
                  placeholder="Add any notes about the application, company, or position..."
                />
              </div>
            </div>
            
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowAddForm(false)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg transition-colors mr-4"
              >
                Cancel
              </button>
              <button
                onClick={handleAddApplication}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                Save Application
              </button>
            </div>
          </div>
        )}

        {/* Add Interview Form */}
        {showInterviewForm && selectedApplication && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Add Interview for {selectedApplication.company_name}</h2>
              <button
                onClick={() => {
                  setShowInterviewForm(false);
                  setSelectedApplication(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Interview Date & Time *
                </label>
                <input
                  type="datetime-local"
                  value={newInterview.interview_date}
                  onChange={(e) => setNewInterview({...newInterview, interview_date: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Interview Stage *
                </label>
                <select
                  value={newInterview.interview_stage}
                  onChange={(e) => setNewInterview({...newInterview, interview_stage: e.target.value as any})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="screening">Screening</option>
                  <option value="technical">Technical</option>
                  <option value="behavioral">Behavioral</option>
                  <option value="final">Final Round</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Interviewer Name
                </label>
                <input
                  type="text"
                  value={newInterview.interviewer_name}
                  onChange={(e) => setNewInterview({...newInterview, interviewer_name: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., John Smith, Hiring Manager"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Interview Notes
                </label>
                <textarea
                  value={newInterview.interview_notes}
                  onChange={(e) => setNewInterview({...newInterview, interview_notes: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-32"
                  placeholder="Add any notes about the interview, questions asked, or topics discussed..."
                />
              </div>
            </div>
            
            <div className="flex justify-end mt-6">
              <button
                onClick={() => {
                  setShowInterviewForm(false);
                  setSelectedApplication(null);
                }}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg transition-colors mr-4"
              >
                Cancel
              </button>
              <button
                onClick={handleAddInterview}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                Save Interview
              </button>
            </div>
          </div>
        )}

        {/* Edit Application Form */}
        {editingApplication && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Edit Application</h2>
              <button
                onClick={() => setEditingApplication(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Company Name *
                </label>
                <input
                  type="text"
                  value={editingApplication.company_name}
                  onChange={(e) => setEditingApplication({...editingApplication, company_name: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Job Title *
                </label>
                <input
                  type="text"
                  value={editingApplication.job_title}
                  onChange={(e) => setEditingApplication({...editingApplication, job_title: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Job URL
                </label>
                <input
                  type="url"
                  value={editingApplication.job_url || ''}
                  onChange={(e) => setEditingApplication({...editingApplication, job_url: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Application Date *
                </label>
                <input
                  type="date"
                  value={editingApplication.application_date.split('T')[0]}
                  onChange={(e) => setEditingApplication({...editingApplication, application_date: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={editingApplication.status}
                  onChange={(e) => setEditingApplication({...editingApplication, status: e.target.value as any})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="applied">Applied</option>
                  <option value="interview_scheduled">Interview Scheduled</option>
                  <option value="interviewed">Interviewed</option>
                  <option value="rejected">Rejected</option>
                  <option value="offer_received">Offer Received</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Follow-up Date
                </label>
                <input
                  type="date"
                  value={editingApplication.follow_up_date ? editingApplication.follow_up_date.split('T')[0] : ''}
                  onChange={(e) => setEditingApplication({...editingApplication, follow_up_date: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  value={editingApplication.notes || ''}
                  onChange={(e) => setEditingApplication({...editingApplication, notes: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-32"
                />
              </div>
            </div>
            
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setEditingApplication(null)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg transition-colors mr-4"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateApplication}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                Update Application
              </button>
            </div>
          </div>
        )}

        {/* Applications List */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">Your Applications</h2>
          </div>
          
          {loading ? (
            <div className="p-6 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading your applications...</p>
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="p-6 text-center">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No applications found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || statusFilter !== 'all' 
                  ? 'No applications match your search criteria. Try adjusting your filters.'
                  : 'Start tracking your job applications by clicking the "Add Application" button.'}
              </p>
              {(searchTerm || statusFilter !== 'all') && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                  }}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredApplications.map(application => (
                <div key={application.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-grow">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">{application.job_title}</h3>
                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                          {getStatusLabel(application.status)}
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2">
                        <div className="text-gray-700 font-medium">{application.company_name}</div>
                        <div className="text-gray-500 text-sm flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          Applied: {formatDate(application.application_date)}
                        </div>
                        {application.follow_up_date && (
                          <div className="text-blue-600 text-sm flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            Follow-up: {formatDate(application.follow_up_date)}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => toggleApplicationExpand(application.id)}
                        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        {expandedApplications.has(application.id) ? (
                          <ChevronUp className="w-5 h-5" />
                        ) : (
                          <ChevronDown className="w-5 h-5" />
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setSelectedApplication(application);
                          setShowInterviewForm(true);
                          setNewInterview({
                            ...newInterview,
                            job_application_id: application.id
                          });
                        }}
                        className="p-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors"
                        title="Add Interview"
                      >
                        <Calendar className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => setEditingApplication(application)}
                        className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit Application"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteApplication(application.id)}
                        className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Application"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Expanded Content */}
                  {expandedApplications.has(application.id) && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Application Details */}
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3">Application Details</h4>
                          
                          {application.job_url && (
                            <div className="mb-3">
                              <a 
                                href={application.job_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 flex items-center"
                              >
                                <ExternalLink className="w-4 h-4 mr-1" />
                                View Job Posting
                              </a>
                            </div>
                          )}
                          
                          {application.notes && (
                            <div className="bg-gray-50 rounded-xl p-4 mb-3">
                              <h5 className="font-medium text-gray-900 mb-2">Notes:</h5>
                              <p className="text-gray-700 whitespace-pre-line">{application.notes}</p>
                            </div>
                          )}
                          
                          {application.follow_up_date && (
                            <div className="flex items-center text-blue-600 mb-3">
                              <Clock className="w-5 h-5 mr-2" />
                              <div>
                                <span className="font-medium">Follow-up Date:</span> {formatDate(application.follow_up_date)}
                              </div>
                            </div>
                          )}
                          
                          <div className="text-sm text-gray-500">
                            Last updated: {new Date(application.updated_at).toLocaleString()}
                          </div>
                        </div>
                        
                        {/* Interviews */}
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold text-gray-900">Interviews</h4>
                            <button
                              onClick={() => {
                                setSelectedApplication(application);
                                setShowInterviewForm(true);
                                setNewInterview({
                                  ...newInterview,
                                  job_application_id: application.id
                                });
                              }}
                              className="text-purple-600 hover:text-purple-700 text-sm font-medium flex items-center"
                            >
                              <Plus className="w-4 h-4 mr-1" />
                              Add Interview
                            </button>
                          </div>
                          
                          {getApplicationInterviews(application.id).length === 0 ? (
                            <div className="bg-gray-50 rounded-xl p-4 text-center">
                              <p className="text-gray-500">No interviews scheduled yet</p>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {getApplicationInterviews(application.id).map(interview => (
                                <div key={interview.id} className="bg-gray-50 rounded-xl p-4">
                                  <div className="flex items-center justify-between mb-2">
                                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${getInterviewStageColor(interview.interview_stage || '')}`}>
                                      {getInterviewStageLabel(interview.interview_stage || '')}
                                    </div>
                                    <div className="text-gray-500 text-sm">
                                      {interview.interview_date ? formatDate(interview.interview_date) : 'No date set'}
                                    </div>
                                  </div>
                                  
                                  {interview.interviewer_name && (
                                    <div className="text-sm text-gray-700 mb-2">
                                      <span className="font-medium">Interviewer:</span> {interview.interviewer_name}
                                    </div>
                                  )}
                                  
                                  {interview.interview_notes && (
                                    <div className="text-sm text-gray-700 mb-2">
                                      <span className="font-medium">Notes:</span> {interview.interview_notes}
                                    </div>
                                  )}
                                  
                                  {interview.feedback && (
                                    <div className="text-sm text-gray-700 mb-2">
                                      <span className="font-medium">Feedback:</span> {interview.feedback}
                                    </div>
                                  )}
                                  
                                  {interview.result && (
                                    <div className="text-sm text-gray-700">
                                      <span className="font-medium">Result:</span> {interview.result}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Interviews */}
        <div className="mt-8 bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">Upcoming Interviews</h2>
          </div>
          
          {loading ? (
            <div className="p-6 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading interviews...</p>
            </div>
          ) : interviews.filter(i => i.interview_date && new Date(i.interview_date) > new Date()).length === 0 ? (
            <div className="p-6 text-center">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No upcoming interviews</h3>
              <p className="text-gray-600">
                When you schedule interviews, they will appear here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {interviews
                .filter(i => i.interview_date && new Date(i.interview_date) > new Date())
                .sort((a, b) => new Date(a.interview_date!).getTime() - new Date(b.interview_date!).getTime())
                .map(interview => {
                  const application = applications.find(app => app.id === interview.job_application_id);
                  if (!application) return null;
                  
                  const interviewDate = new Date(interview.interview_date!);
                  const today = new Date();
                  const diffTime = interviewDate.getTime() - today.getTime();
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                  
                  return (
                    <div key={interview.id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-grow">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900">{application.job_title}</h3>
                            <div className={`px-3 py-1 rounded-full text-xs font-medium ${getInterviewStageColor(interview.interview_stage || '')}`}>
                              {getInterviewStageLabel(interview.interview_stage || '')}
                            </div>
                          </div>
                          <div className="text-gray-700 font-medium">{application.company_name}</div>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2">
                            <div className="text-blue-600 font-medium flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              {interviewDate.toLocaleDateString('en-US', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </div>
                            <div className="text-purple-600 font-medium flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              {interviewDate.toLocaleTimeString('en-US', {
                                hour: 'numeric',
                                minute: '2-digit',
                                hour12: true
                              })}
                            </div>
                            {diffDays <= 3 && (
                              <div className="text-red-600 font-medium flex items-center">
                                <AlertTriangle className="w-4 h-4 mr-1" />
                                {diffDays === 0 ? 'Today!' : diffDays === 1 ? 'Tomorrow!' : `In ${diffDays} days!`}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};