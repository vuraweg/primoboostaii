import React, { useState, useEffect, useRef } from 'react';
import { 
  Upload, 
  FileText, 
  Briefcase, 
  Sparkles, 
  Download, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle, 
  Loader2, 
  RefreshCw, 
  Crown,
  ArrowRight,
  X,
  Menu,
  User,
  LogOut,
  Eye,
  EyeOff,
  Share2,
  ArrowDown
} from 'lucide-react';
import { FileUpload } from './FileUpload';
import { InputSection } from './InputSection';
import { ResumePreview } from './ResumePreview';
import { ExportButtons } from './ExportButtons';
import { ComprehensiveAnalysis } from './ComprehensiveAnalysis';
import { MobileOptimizedInterface } from './MobileOptimizedInterface';
import { SubscriptionPlans } from './payment/SubscriptionPlans';
import { SubscriptionStatus } from './payment/SubscriptionStatus';
import { optimizeResume } from '../services/geminiService';
import { getMatchScore, generateBeforeScore, generateAfterScore } from '../services/scoringService';
import { paymentService } from '../services/paymentService';
import { useAuth } from '../contexts/AuthContext';
import { ResumeData, MatchScore, UserType } from '../types/resume';
import { exportToPDF, exportToWord } from '../utils/exportUtils';
import logoImage from '/a-modern-logo-design-featuring-primoboos_XhhkS8E_Q5iOwxbAXB4CqQ_HnpCsJn4S1yrhb826jmMDw.jpeg';

export default function ResumeOptimizer() {
  const { user, isAuthenticated } = useAuth();
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [userType, setUserType] = useState<UserType>('experienced');
  const [optimizedResume, setOptimizedResume] = useState<ResumeData | null>(null);
  const [beforeScore, setBeforeScore] = useState<MatchScore | null>(null);
  const [afterScore, setAfterScore] = useState<MatchScore | null>(null);
  const [changedSections, setChangedSections] = useState<string[]>([]);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSubscriptionPlans, setShowSubscriptionPlans] = useState(false);
  const [canOptimize, setCanOptimize] = useState(false);
  const [remainingOptimizations, setRemainingOptimizations] = useState(0);
  const [currentStep, setCurrentStep] = useState(1);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [isExportingWord, setIsExportingWord] = useState(false);
  const [exportStatus, setExportStatus] = useState<{
    type: 'pdf' | 'word' | null;
    status: 'success' | 'error' | null;
    message: string;
  }>({ type: null, status: null, message: '' });

  const exportMenuRef = useRef<HTMLDivElement>(null);

  // Check subscription status on component mount and user change
  useEffect(() => {
    if (user) {
      checkSubscriptionStatus();
    }
  }, [user]);

  // Close export menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setShowExportMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const checkSubscriptionStatus = async () => {
    if (!user) return;

    try {
      const result = await paymentService.canOptimize(user.id);
      setCanOptimize(result.canOptimize);
      setRemainingOptimizations(result.remaining);
    } catch (error) {
      console.error('Error checking subscription:', error);
      setCanOptimize(false);
      setRemainingOptimizations(0);
    }
  };

  const handleOptimize = async () => {
    if (!resumeText.trim() || !jobDescription.trim()) {
      setError('Please provide both resume content and job description.');
      return;
    }

    if (!isAuthenticated) {
      setError('Please sign in to optimize your resume.');
      return;
    }

    if (!canOptimize) {
      setShowSubscriptionPlans(true);
      return;
    }

    setIsOptimizing(true);
    setError(null);

    try {
      // Check IP restriction before proceeding
      const ipRestriction = await paymentService.checkIpRestriction(user!.id);
      if (ipRestriction.blocked) {
        setError('Your account has been blocked due to multiple account creation from the same IP address.');
        setIsOptimizing(false);
        return;
      }

      // Use optimization count
      const usageResult = await paymentService.useOptimization(user!.id);
      if (!usageResult.success) {
        setError('No optimizations remaining. Please upgrade your subscription.');
        setShowSubscriptionPlans(true);
        setIsOptimizing(false);
        return;
      }

      // Generate before score
      const beforeScoreResult = generateBeforeScore(resumeText);
      setBeforeScore(beforeScoreResult);

      // Optimize resume
      const result = await optimizeResume(resumeText, jobDescription, userType, linkedinUrl, githubUrl);
      setOptimizedResume(result);

      // Generate after score
      const afterScoreResult = generateAfterScore(JSON.stringify(result));
      setAfterScore(afterScoreResult);

      // Simulate changed sections (in a real app, this would be calculated)
      setChangedSections(['summary', 'workExperience', 'skills', 'projects']);

      // Update remaining count
      setRemainingOptimizations(usageResult.remaining);

      // Move to results step
      setCurrentStep(3);

    } catch (error) {
      console.error('Optimization error:', error);
      setError(error instanceof Error ? error.message : 'An error occurred during optimization. Please try again.');
      
      // Restore optimization count on error by checking status again
      await checkSubscriptionStatus();
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleSubscriptionSuccess = () => {
    setShowSubscriptionPlans(false);
    checkSubscriptionStatus();
  };

  const toggleExportMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowExportMenu(!showExportMenu);
  };

  const handleExportPDF = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!optimizedResume || isExportingPDF || isExportingWord) return;
    
    setIsExportingPDF(true);
    setExportStatus({ type: null, status: null, message: '' });
    
    try {
      await exportToPDF(optimizedResume);
      setExportStatus({
        type: 'pdf',
        status: 'success',
        message: 'PDF exported successfully!'
      });
      
      setTimeout(() => {
        setExportStatus({ type: null, status: null, message: '' });
      }, 3000);
    } catch (error) {
      console.error('PDF export failed:', error);
      setExportStatus({
        type: 'pdf',
        status: 'error',
        message: 'PDF export failed. Please try again.'
      });
      
      setTimeout(() => {
        setExportStatus({ type: null, status: null, message: '' });
      }, 5000);
    } finally {
      setIsExportingPDF(false);
      setShowExportMenu(false);
    }
  };

  const handleExportWord = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!optimizedResume || isExportingWord || isExportingPDF) return;
    
    setIsExportingWord(true);
    setExportStatus({ type: null, status: null, message: '' });
    
    try {
      exportToWord(optimizedResume);
      setExportStatus({
        type: 'word',
        status: 'success',
        message: 'Word document exported successfully!'
      });
      
      setTimeout(() => {
        setExportStatus({ type: null, status: null, message: '' });
      }, 3000);
    } catch (error) {
      console.error('Word export failed:', error);
      setExportStatus({
        type: 'word',
        status: 'error',
        message: 'Word export failed. Please try again.'
      });
      
      setTimeout(() => {
        setExportStatus({ type: null, status: null, message: '' });
      }, 5000);
    } finally {
      setIsExportingWord(false);
      setShowExportMenu(false);
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!optimizedResume) return;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${optimizedResume.name}'s Resume`,
          text: 'Check out my optimized resume!',
        });
        
        setExportStatus({
          type: 'pdf',
          status: 'success',
          message: 'Shared successfully!'
        });
        
        setTimeout(() => {
          setExportStatus({ type: null, status: null, message: '' });
        }, 3000);
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          setExportStatus({
            type: 'pdf',
            status: 'error',
            message: 'Sharing failed. Please try again.'
          });
          
          setTimeout(() => {
            setExportStatus({ type: null, status: null, message: '' });
          }, 5000);
        }
      }
    } else {
      setExportStatus({
        type: 'pdf',
        status: 'error',
        message: 'Sharing not supported on this device'
      });
      
      setTimeout(() => {
        setExportStatus({ type: null, status: null, message: '' });
      }, 5000);
    }
    
    setShowExportMenu(false);
  };

  const resetToStart = () => {
    setCurrentStep(1);
    setOptimizedResume(null);
    setBeforeScore(null);
    setAfterScore(null);
    setChangedSections([]);
    setError(null);
  };

  const isMobile = window.innerWidth < 768;

  // Mobile view - single step display
  if (isMobile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 pb-20">
        {/* Mobile Header */}
        <div className="bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-200 sticky top-0 z-40">
          <div className="px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg">
                  <img 
                    src={logoImage} 
                    alt="PrimoBoost AI Logo" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">PrimoBoost AI</h1>
                  <p className="text-xs text-gray-500">Resume Optimizer</p>
                </div>
              </div>
              
              {currentStep > 1 && (
                <button
                  onClick={resetToStart}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-2 rounded-lg transition-colors"
                >
                  <ArrowRight className="w-5 h-5 rotate-180" />
                </button>
              )}
            </div>
            
            {/* Progress indicator */}
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                <span>Step {currentStep} of 3</span>
                <span>{Math.round((currentStep / 3) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-600 to-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(currentStep / 3) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Step Content */}
        <div className="px-4 py-6">
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload Your Resume</h2>
                <p className="text-gray-600">Start by uploading your current resume</p>
              </div>
              
              <FileUpload onFileUpload={setResumeText} />
              
              {resumeText && (
                <div className="mt-6">
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-xl transition-colors flex items-center justify-center space-x-2"
                  >
                    <span>Continue to Job Details</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Job Details</h2>
                <p className="text-gray-600">Add job description and optional links</p>
              </div>
              
              <InputSection
                resumeText={resumeText}
                jobDescription={jobDescription}
                onResumeChange={setResumeText}
                onJobDescriptionChange={setJobDescription}
              />
              
              {/* User Type Selection */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Experience Level</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setUserType('fresher')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      userType === 'fresher'
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-green-300'
                    }`}
                  >
                    <div className="text-center">
                      <div className="font-semibold">Fresher</div>
                      <div className="text-sm opacity-75">0-2 years</div>
                    </div>
                  </button>
                  <button
                    onClick={() => setUserType('experienced')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      userType === 'experienced'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-blue-300'
                    }`}
                  >
                    <div className="text-center">
                      <div className="font-semibold">Experienced</div>
                      <div className="text-sm opacity-75">2+ years</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Optional Links */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Optional Links</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      LinkedIn Profile
                    </label>
                    <input
                      type="url"
                      value={linkedinUrl}
                      onChange={(e) => setLinkedinUrl(e.target.value)}
                      placeholder="https://linkedin.com/in/yourprofile"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      GitHub Profile
                    </label>
                    <input
                      type="url"
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                      placeholder="https://github.com/yourusername"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Optimize Button */}
              {resumeText && jobDescription && (
                <div className="space-y-4">
                  {!isAuthenticated && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                      <div className="flex items-start space-x-3">
                        <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                        <div className="text-sm text-amber-800">
                          <p className="font-medium">Sign in required</p>
                          <p>Please sign in to optimize your resume.</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {isAuthenticated && !canOptimize && (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                      <div className="flex items-start space-x-3">
                        <Crown className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div className="text-sm text-blue-800">
                          <p className="font-medium">Subscription required</p>
                          <p>Subscribe to start optimizing your resume.</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleOptimize}
                    disabled={isOptimizing || !isAuthenticated}
                    className={`w-full font-semibold py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 ${
                      isOptimizing || !isAuthenticated
                        ? 'bg-gray-400 text-white cursor-not-allowed'
                        : 'bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl'
                    }`}
                  >
                    {isOptimizing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Optimizing Resume...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        <span>Optimize My Resume</span>
                      </>
                    )}
                  </button>

                  {isAuthenticated && canOptimize && (
                    <div className="text-center text-sm text-gray-600">
                      {remainingOptimizations} optimization{remainingOptimizations !== 1 ? 's' : ''} remaining
                    </div>
                  )}
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                    <div className="text-sm text-red-800">
                      <p className="font-medium">Error</p>
                      <p>{error}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {currentStep === 3 && optimizedResume && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Optimized Resume</h2>
                <p className="text-gray-600">Your resume has been optimized!</p>
              </div>

              {/* Mobile Export Buttons */}
              <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Download className="w-5 h-5 mr-2 text-blue-600" />
                  Export Resume
                </h3>
                
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <button
                    onClick={handleExportPDF}
                    disabled={isExportingPDF || isExportingWord}
                    className={`flex items-center justify-center space-x-2 font-medium py-3 px-3 rounded-xl transition-all duration-200 text-sm ${
                      isExportingPDF || isExportingWord
                        ? 'bg-gray-400 text-white cursor-not-allowed'
                        : 'bg-red-600 hover:bg-red-700 text-white shadow-md'
                    }`}
                  >
                    {isExportingPDF ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <FileText className="w-4 h-4" />
                    )}
                    <span>PDF</span>
                  </button>
                  
                  <button
                    onClick={handleExportWord}
                    disabled={isExportingWord || isExportingPDF}
                    className={`flex items-center justify-center space-x-2 font-medium py-3 px-3 rounded-xl transition-all duration-200 text-sm ${
                      isExportingWord || isExportingPDF
                        ? 'bg-gray-400 text-white cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md'
                    }`}
                  >
                    {isExportingWord ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <FileText className="w-4 h-4" />
                    )}
                    <span>Word</span>
                  </button>
                </div>

                {navigator.share && (
                  <button
                    onClick={handleShare}
                    disabled={isExportingPDF || isExportingWord}
                    className={`w-full flex items-center justify-center space-x-2 font-medium py-3 px-4 rounded-xl transition-all duration-200 text-sm ${
                      isExportingPDF || isExportingWord
                        ? 'bg-gray-400 text-white cursor-not-allowed'
                        : 'bg-green-600 hover:bg-green-700 text-white shadow-md'
                    }`}
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Share Resume</span>
                  </button>
                )}

                {/* Export Status Message */}
                {exportStatus.status && (
                  <div className={`mt-3 p-3 rounded-lg border text-xs ${
                    exportStatus.status === 'success' 
                      ? 'bg-green-50 border-green-200 text-green-800' 
                      : 'bg-red-50 border-red-200 text-red-800'
                  }`}>
                    <div className="flex items-center">
                      {exportStatus.status === 'success' ? (
                        <CheckCircle className="w-3 h-3 mr-1 flex-shrink-0" />
                      ) : (
                        <AlertCircle className="w-3 h-3 mr-1 flex-shrink-0" />
                      )}
                      <span>{exportStatus.message}</span>
                    </div>
                  </div>
                )}
              </div>

              <ResumePreview resumeData={optimizedResume} userType={userType} />

              {beforeScore && afterScore && (
                <ComprehensiveAnalysis
                  beforeScore={beforeScore}
                  afterScore={afterScore}
                  changedSections={changedSections}
                  resumeData={optimizedResume}
                  jobDescription={jobDescription}
                  targetRole="Target Role"
                />
              )}

              <div className="text-center">
                <button
                  onClick={resetToStart}
                  className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
                >
                  Optimize Another Resume
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Desktop view - all steps visible
  return (
    <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 lg:py-8 max-w-7xl">
      <div className="space-y-4 sm:space-y-6">
        {/* Header Section */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex items-center justify-center mb-4 sm:mb-6">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 w-12 h-12 sm:w-16 sm:h-16 rounded-2xl sm:rounded-3xl flex items-center justify-center shadow-lg">
              <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 sm:mb-3">
            AI-Powered Resume Optimizer
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Transform your resume with AI to match job requirements and pass ATS systems
          </p>
          
          {isAuthenticated && (
            <div className="mt-4 sm:mt-6">
              <SubscriptionStatus onUpgrade={() => setShowSubscriptionPlans(true)} />
            </div>
          )}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          {/* Left Column - Input */}
          <div className="space-y-4 sm:space-y-6">
            {/* File Upload */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-100">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center">
                <Upload className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-600" />
                Upload Resume
              </h2>
              <FileUpload onFileUpload={setResumeText} />
            </div>

            {/* Input Section */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-100">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center">
                <FileText className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-green-600" />
                Resume & Job Details
              </h2>
              <InputSection
                resumeText={resumeText}
                jobDescription={jobDescription}
                onResumeChange={setResumeText}
                onJobDescriptionChange={setJobDescription}
              />
            </div>

            {/* User Type Selection */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-100">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">Experience Level</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <button
                  onClick={() => setUserType('fresher')}
                  className={`p-3 sm:p-4 rounded-xl border-2 transition-all duration-200 ${
                    userType === 'fresher'
                      ? 'border-green-500 bg-green-50 text-green-700 shadow-md'
                      : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-green-300 hover:bg-green-50'
                  }`}
                >
                  <div className="text-center">
                    <div className="font-semibold text-sm sm:text-base">Fresher</div>
                    <div className="text-xs sm:text-sm opacity-75">0-2 years experience</div>
                  </div>
                </button>
                <button
                  onClick={() => setUserType('experienced')}
                  className={`p-3 sm:p-4 rounded-xl border-2 transition-all duration-200 ${
                    userType === 'experienced'
                      ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md'
                      : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-blue-300 hover:bg-blue-50'
                  }`}
                >
                  <div className="text-center">
                    <div className="font-semibold text-sm sm:text-base">Experienced</div>
                    <div className="text-xs sm:text-sm opacity-75">2+ years experience</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Optional Links */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-100">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">Optional Profile Links</h3>
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    LinkedIn Profile URL
                  </label>
                  <input
                    type="url"
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    placeholder="https://linkedin.com/in/yourprofile"
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm sm:text-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    GitHub Profile URL
                  </label>
                  <input
                    type="url"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    placeholder="https://github.com/yourusername"
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm sm:text-base"
                  />
                </div>
              </div>
            </div>

            {/* Optimize Button */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-100">
              <div className="space-y-3 sm:space-y-4">
                {!isAuthenticated && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 sm:p-4">
                    <div className="flex items-start space-x-3">
                      <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-amber-800">
                        <p className="font-medium">Sign in required</p>
                        <p>Please sign in to optimize your resume with AI.</p>
                      </div>
                    </div>
                  </div>
                )}

                {isAuthenticated && !canOptimize && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 sm:p-4">
                    <div className="flex items-start space-x-3">
                      <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-blue-800">
                        <p className="font-medium">Subscription required</p>
                        <p>Subscribe to start optimizing your resume with AI.</p>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleOptimize}
                  disabled={isOptimizing || !resumeText.trim() || !jobDescription.trim() || !isAuthenticated}
                  className={`w-full font-semibold py-3 sm:py-4 px-4 sm:px-6 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 text-sm sm:text-base ${
                    isOptimizing || !resumeText.trim() || !jobDescription.trim() || !isAuthenticated
                      ? 'bg-gray-400 text-white cursor-not-allowed'
                      : 'bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl active:scale-[0.98]'
                  }`}
                >
                  {isOptimizing ? (
                    <>
                      <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                      <span>Optimizing Resume...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span>Optimize My Resume</span>
                    </>
                  )}
                </button>

                {isAuthenticated && canOptimize && (
                  <div className="text-center text-xs sm:text-sm text-gray-600">
                    {remainingOptimizations} optimization{remainingOptimizations !== 1 ? 's' : ''} remaining
                  </div>
                )}
              </div>

              {error && (
                <div className="mt-3 sm:mt-4 bg-red-50 border border-red-200 rounded-xl p-3 sm:p-4">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-red-800">
                      <p className="font-medium">Error</p>
                      <p>{error}</p>
                      <button
                        onClick={handleOptimize}
                        className="mt-2 text-red-600 hover:text-red-700 font-medium underline"
                      >
                        Try Again
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Results */}
          <div className="space-y-4 sm:space-y-6">
            {optimizedResume ? (
              <>
                {/* Desktop Export Buttons with Fixed Dropdown */}
                <div className="fixed top-20 right-4 z-40 hidden md:block">
                  <div className="relative" ref={exportMenuRef}>
                    <button
                      onClick={toggleExportMenu}
                      className="bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                      aria-label="Export Resume"
                    >
                      <Download className="w-6 h-6" />
                    </button>
                    
                    {/* Export Menu Dropdown */}
                    {showExportMenu && (
                      <div className="absolute top-14 right-0 bg-white rounded-xl shadow-xl border border-gray-200 p-3 w-48 animate-fadeIn">
                        <div className="text-sm font-medium text-gray-700 mb-2">Export Options:</div>
                        <div className="space-y-2">
                          <button
                            onClick={handleExportPDF}
                            disabled={isExportingPDF || isExportingWord}
                            className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                              isExportingPDF || isExportingWord
                                ? 'bg-gray-400 text-white cursor-not-allowed'
                                : 'bg-red-600 hover:bg-red-700 text-white'
                            }`}
                          >
                            {isExportingPDF ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <FileText className="w-4 h-4" />
                            )}
                            <span>{isExportingPDF ? 'Exporting...' : 'Export as PDF'}</span>
                          </button>
                          
                          <button
                            onClick={handleExportWord}
                            disabled={isExportingWord || isExportingPDF}
                            className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                              isExportingWord || isExportingPDF
                                ? 'bg-gray-400 text-white cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700 text-white'
                            }`}
                          >
                            {isExportingWord ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <FileText className="w-4 h-4" />
                            )}
                            <span>{isExportingWord ? 'Exporting...' : 'Export as Word'}</span>
                          </button>
                          
                          {navigator.share && (
                            <button
                              onClick={handleShare}
                              disabled={isExportingPDF || isExportingWord}
                              className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                isExportingPDF || isExportingWord
                                  ? 'bg-gray-400 text-white cursor-not-allowed'
                                  : 'bg-green-600 hover:bg-green-700 text-white'
                              }`}
                            >
                              <Share2 className="w-4 h-4" />
                              <span>Share</span>
                            </button>
                          )}
                        </div>
                        
                        {/* Export Status Message */}
                        {exportStatus.status && (
                          <div className={`mt-3 p-2 rounded-lg border text-xs ${
                            exportStatus.status === 'success' 
                              ? 'bg-green-50 border-green-200 text-green-800' 
                              : 'bg-red-50 border-red-200 text-red-800'
                          }`}>
                            <div className="flex items-center">
                              {exportStatus.status === 'success' ? (
                                <CheckCircle className="w-3 h-3 mr-1 flex-shrink-0" />
                              ) : (
                                <AlertCircle className="w-3 h-3 mr-1 flex-shrink-0" />
                              )}
                              <span>{exportStatus.message}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <ResumePreview resumeData={optimizedResume} userType={userType} />
                
                {beforeScore && afterScore && (
                  <ComprehensiveAnalysis
                    beforeScore={beforeScore}
                    afterScore={afterScore}
                    changedSections={changedSections}
                    resumeData={optimizedResume}
                    jobDescription={jobDescription}
                    targetRole="Target Role"
                  />
                )}

                <div className="text-center">
                  <button
                    onClick={resetToStart}
                    className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
                  >
                    Optimize Another Resume
                  </button>
                </div>
              </>
            ) : (
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-6 sm:p-8 border border-gray-100 text-center">
                <div className="bg-gray-100 w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <TrendingUp className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">
                  Your Optimized Resume Will Appear Here
                </h3>
                <p className="text-gray-600 text-sm sm:text-base">
                  Upload your resume and job description, then click "Optimize My Resume" to see the AI-enhanced version.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Subscription Plans Modal */}
      <SubscriptionPlans
        isOpen={showSubscriptionPlans}
        onClose={() => setShowSubscriptionPlans(false)}
        onSubscriptionSuccess={handleSubscriptionSuccess}
      />
    </div>
  );
}