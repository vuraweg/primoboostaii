import React, { useState, useEffect } from 'react';
import { FileUpload } from './FileUpload';
import { InputSection } from './InputSection';
import { ResumePreview } from './ResumePreview';
import { ExportButtons } from './ExportButtons';
import { ComprehensiveAnalysis } from './ComprehensiveAnalysis';
import { MobileOptimizedInterface } from './MobileOptimizedInterface';
import { SubscriptionPlans } from './payment/SubscriptionPlans';
import { SubscriptionStatus } from './payment/SubscriptionStatus';
import { LoadingSpinner } from './LoadingSpinner';
import { AuthModal } from './auth/AuthModal';
import { optimizeResume } from '../services/geminiService';
import { getMatchScore, reconstructResumeText, generateBeforeScore, generateAfterScore } from '../services/scoringService';
import { paymentService } from '../services/paymentService';
import { authService } from '../services/authService';
import { ResumeData, UserType, MatchScore } from '../types/resume';
import { useAuth } from '../contexts/AuthContext';
import { FileText, Sparkles, Linkedin, Github, ArrowLeft, CheckCircle, Upload, Target, ChevronRight, BarChart3, ArrowDown, LogIn, User, Crown, AlertTriangle, Users, Briefcase, Shield, Download, Share2 } from 'lucide-react';

const ResumeOptimizer: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [userType, setUserType] = useState<UserType>('fresher');
  const [targetRole, setTargetRole] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [optimizedResume, setOptimizedResume] = useState<ResumeData | null>(null);
  const [beforeScore, setBeforeScore] = useState<MatchScore | null>(null);
  const [afterScore, setAfterScore] = useState<MatchScore | null>(null);
  const [changedSections, setChangedSections] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showInputSection, setShowInputSection] = useState(true);
  const [currentInputStep, setCurrentInputStep] = useState(1);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSubscriptionPlans, setShowSubscriptionPlans] = useState(false);
  const [canOptimize, setCanOptimize] = useState(false);
  const [remainingOptimizations, setRemainingOptimizations] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [ipBlocked, setIpBlocked] = useState(false);

  // Check if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Check subscription status
  useEffect(() => {
    checkSubscriptionStatus();
  }, [user]);

  const checkSubscriptionStatus = async () => {
    if (!user) {
      setCanOptimize(false);
      setRemainingOptimizations(0);
      return;
    }

    try {
      const status = await paymentService.canOptimize(user.id);
      setCanOptimize(status.canOptimize);
      setRemainingOptimizations(status.remaining);
    } catch (error) {
      console.error('Error checking subscription:', error);
      setCanOptimize(false);
      setRemainingOptimizations(0);
    }
  };

  // Handle file upload and move to next step
  const handleFileUpload = (text: string) => {
    setResumeText(text);
    if (text.trim()) {
      setCurrentInputStep(2);
    }
  };

  // Monitor job description to auto-advance to step 3
  useEffect(() => {
    if (currentInputStep === 2 && jobDescription.trim()) {
      setCurrentInputStep(3);
    }
  }, [jobDescription, currentInputStep]);

  const handleOptimize = async () => {
    if (!resumeText || !jobDescription) {
      setError('Please provide both resume and job description');
      return;
    }

    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

    // Check if user has active subscription
    if (!canOptimize) {
      setShowSubscriptionPlans(true);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('🚀 Starting resume optimization process...');

      // CRITICAL: Ensure valid session before starting long operation
      console.log('🔐 Validating session before optimization...');
      const sessionValid = await authService.ensureValidSession();
      
      if (!sessionValid) {
        console.error('❌ Session validation failed - user needs to re-authenticate');
        setError('Your session has expired. Please sign in again to continue.');
        setShowAuthModal(true);
        setLoading(false);
        return;
      }
      
      console.log('✅ Session validated successfully');

      // Step 1: Calculate before score (simulate low score for demonstration)
      console.log('📊 Calculating before score...');
      const beforeMatchScore = generateBeforeScore(resumeText);
      setBeforeScore(beforeMatchScore);

      // Step 2: Use optimization credit (requires auth) - refresh session again before DB operation
      console.log('💳 Using optimization credit...');
      
      // Double-check session before database operation
      const sessionStillValid = await authService.ensureValidSession();
      if (!sessionStillValid) {
        console.error('❌ Session expired during optimization process');
        setError('Your session expired during optimization. Please sign in again.');
        setShowAuthModal(true);
        setLoading(false);
        return;
      }

      // Check for IP blocking (multiple account creation)
      try {
        const ipCheckResult = await paymentService.checkIpRestriction(user!.id);
        if (ipCheckResult.blocked) {
          setIpBlocked(true);
          setError('Your account has been blocked due to multiple account creation from the same IP address');
          setLoading(false);
          return;
        }
      } catch (ipError) {
        console.error('IP check error:', ipError);
        // Continue with optimization even if IP check fails
      }

      const usageResult = await paymentService.useOptimization(user!.id);
      if (!usageResult.success) {
        setError('No optimizations remaining. Please upgrade your plan.');
        setShowSubscriptionPlans(true);
        setLoading(false);
        return;
      }

      // Update remaining count immediately
      setRemainingOptimizations(usageResult.remaining);

      // Step 3: Optimize resume (no auth required for AI call)
      console.log('🤖 Optimizing resume with AI...');
      const result = await optimizeResume(resumeText, jobDescription, userType, linkedinUrl, githubUrl);
      setOptimizedResume(result);

      // Step 4: Calculate after score (simulate high score for demonstration)
      console.log('📈 Calculating after score...');
      const optimizedResumeText = reconstructResumeText(result);
      const afterMatchScore = generateAfterScore(optimizedResumeText);
      setAfterScore(afterMatchScore);

      // Step 5: Determine changed sections
      const sections = [];
      if (result.summary) sections.push('summary');
      if (result.workExperience?.length > 0) sections.push('workExperience');
      if (result.projects?.length > 0) sections.push('projects');
      if (result.skills?.length > 0) sections.push('skills');
      if (result.education?.length > 0) sections.push('education');
      if (result.certifications?.length > 0) sections.push('certifications');
      if (result.achievements?.length > 0) sections.push('achievements');
      if (result.extraCurricularActivities?.length > 0) sections.push('extraCurricularActivities');
      
      setChangedSections(sections);
      setShowInputSection(false);

      console.log('✅ Resume optimization completed successfully!');
    } catch (err) {
      console.error('❌ Optimization error:', err);
      
      // Handle specific error types
      if (err instanceof Error) {
        if (err.message.includes('session') || err.message.includes('auth') || err.message.includes('JWT')) {
          setError('Your session has expired. Please sign in again to continue.');
          setShowAuthModal(true);
        } else if (err.message.includes('subscription') || err.message.includes('optimization')) {
          setError('Subscription issue. Please check your plan or contact support.');
          setShowSubscriptionPlans(true);
        } else if (err.message.includes('API') || err.message.includes('network')) {
          setError('Network error. Please check your connection and try again.');
        } else {
          setError(`Optimization failed: ${err.message}`);
        }
      } else {
        setError('Failed to optimize resume. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStartNewOptimization = () => {
    setOptimizedResume(null);
    setBeforeScore(null);
    setAfterScore(null);
    setChangedSections([]);
    setShowInputSection(true);
    setCurrentInputStep(1);
    setResumeText('');
    setJobDescription('');
    setUserType('experienced');
    setTargetRole('');
    setLinkedinUrl('');
    setGithubUrl('');
    setError(null);
    checkSubscriptionStatus(); // Refresh subscription status
  };

  const handleSubscriptionSuccess = () => {
    checkSubscriptionStatus();
  };

  const isFormComplete = resumeText.trim() && jobDescription.trim();

  // Mobile progress steps
  const getStepStatus = (step: number) => {
    if (currentInputStep > step) return 'completed';
    if (currentInputStep === step) return 'active';
    return 'pending';
  };

  // Mobile-optimized sections for navigation
  const mobileOptimizedSections = optimizedResume && !showInputSection ? [
    {
      id: 'resume',
      title: 'Resume',
      icon: <FileText className="w-5 h-5" />,
      component: (
        <div className="space-y-6">
          <ResumePreview resumeData={optimizedResume} userType={userType} />
          <ExportButtons resumeData={optimizedResume} />
        </div>
      ),
      resumeData: optimizedResume
    },
    {
      id: 'analysis',
      title: 'Analysis',
      icon: <BarChart3 className="w-5 h-5" />,
      component: beforeScore && afterScore ? (
        <ComprehensiveAnalysis 
          beforeScore={beforeScore}
          afterScore={afterScore}
          changedSections={changedSections}
          resumeData={optimizedResume}
          jobDescription={jobDescription}
          targetRole={targetRole || 'Software Engineer'}
        />
      ) : null,
      resumeData: optimizedResume
    }
  ] : [];

  // Floating Export Button for Mobile
  const FloatingExportButton = () => {
    if (!optimizedResume || showInputSection || isMobile) return null;
    
    return (
      <div className="fixed top-20 right-4 z-40 hidden md:block">
        <div className="relative">
          <button
            onClick={() => setShowExportOptions(!showExportOptions)}
            className="bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 active:bg-blue-800 transition-all duration-200 flex items-center justify-center space-x-2 min-h-[44px] min-w-[44px]"
            aria-label="Export Resume"
            style={{ WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}
          >
            <Download className="w-5 h-5" />
            <span className="hidden lg:inline text-sm font-medium">Export</span>
          </button>
          
          {showExportOptions && (
            <div className="absolute top-14 right-0 bg-white rounded-xl shadow-xl border border-gray-200 p-3 w-48 animate-fadeIn">
              <div className="text-sm font-medium text-gray-700 mb-2">Export Options:</div>
              <div className="space-y-2">
                <button
                  onClick={() => {
                    // Handle PDF export
                    setShowExportOptions(false);
                  }}
                  className="w-full flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm font-medium min-h-[44px]"
                  style={{ WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}
                >
                  <FileText className="w-4 h-4" />
                  <span>Export as PDF</span>
                </button>
                
                <button
                  onClick={() => {
                    // Handle Word export
                    setShowExportOptions(false);
                  }}
                  className="w-full flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium min-h-[44px]"
                  style={{ WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}
                >
                  <FileText className="w-4 h-4" />
                  <span>Export as Word</span>
                </button>
                
                {navigator.share && (
                  <button
                    onClick={() => {
                      // Handle share
                      setShowExportOptions(false);
                    }}
                    className="w-full flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm font-medium min-h-[44px]"
                    style={{ WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Share</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // IP Blocked Error Message
  if (ipBlocked) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-md">
        <div className="bg-red-50 border-2 border-red-300 rounded-xl p-6 text-center">
          <div className="bg-red-100 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-red-800 mb-3">Account Blocked</h2>
          <p className="text-red-700 mb-4">
            Your account has been blocked due to multiple account creation from the same IP address.
          </p>
          <p className="text-red-600 text-sm mb-4">
            This is a security measure to prevent abuse of our free trial and coupon system.
          </p>
          <p className="text-red-600 text-sm">
            If you believe this is an error, please contact our support team.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 lg:py-8 max-w-7xl">
      {/* Subscription Status for Authenticated Users */}
      {isAuthenticated && user && showInputSection && (
        <div className="mb-6 sm:mb-8">
          <SubscriptionStatus onUpgrade={() => setShowSubscriptionPlans(true)} />
        </div>
      )}

      {/* Welcome Message for Authenticated Users - Desktop Only */}
      {isAuthenticated && user && showInputSection && (
        <div className="mb-6 sm:mb-8 hidden sm:block">
          <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl p-4 sm:p-6 border border-blue-200">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                  Welcome back, {user.name.split(' ')[0]}! 👋
                </h2>
                <p className="text-sm sm:text-base text-gray-600">
                  {canOptimize 
                    ? `You have ${remainingOptimizations} optimization${remainingOptimizations !== 1 ? 's' : ''} remaining. Let's optimize your resume!`
                    : 'Subscribe to start optimizing your resume with AI-powered tools.'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile-First Header */}
      <div className="text-center mb-6 sm:mb-8 lg:mb-12">
        <div className="flex flex-col items-center mb-4 sm:mb-6">
          <div className="w-16 h-16 rounded-xl overflow-hidden mb-3 sm:mb-4 shadow-lg">
            <img 
              src={logoImage} 
              alt="PrimoBoost AI Logo" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-1 sm:mb-2">
             PrimoBoost AI
            </h1>
            <p className="text-base sm:text-lg text-gray-600">
            Upgrade Your Resume, Unlock Your Future
            </p>
          </div>
        </div>
        
        <div className="max-w-4xl mx-auto px-2 sm:px-0">
          <p className="text-base sm:text-lg lg:text-xl text-gray-700 mb-4 sm:mb-6 leading-relaxed">
           Transform. Optimize. Get Hired – With PrimoBoost.AI
          </p>
          
          {/* Mobile Progress Indicator */}
          {showInputSection && (
            <div className="block sm:hidden mb-6">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <div className="text-sm font-medium text-gray-600">
                  Step {currentInputStep} of 3
                </div>
                <div className="flex space-x-1">
                  {[1, 2, 3].map((step) => (
                    <div
                      key={step}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        getStepStatus(step) === 'completed'
                          ? 'bg-green-500'
                          : getStepStatus(step) === 'active'
                          ? 'bg-blue-500'
                          : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
              
              {/* Current Step Indicator */}
              <div className="bg-white rounded-xl p-4 shadow-md border border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    currentInputStep === 1 ? 'bg-blue-100' :
                    currentInputStep === 2 ? 'bg-green-100' : 'bg-purple-100'
                  }`}>
                    {currentInputStep === 1 ? (
                      <Upload className={`w-4 h-4 ${currentInputStep === 1 ? 'text-blue-600' : 'text-green-600'}`} />
                    ) : currentInputStep === 2 ? (
                      <Target className="w-4 h-4 text-green-600" />
                    ) : (
                      <Sparkles className="w-4 h-4 text-purple-600" />
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-semibold text-gray-900 text-sm">
                      {currentInputStep === 1 && 'Upload Your Resume'}
                      {currentInputStep === 2 && 'Add Job Details'}
                      {currentInputStep === 3 && 'Final Details & Optimize'}
                    </div>
                    <div className="text-xs text-gray-600">
                      {currentInputStep === 1 && 'Upload file or paste text'}
                      {currentInputStep === 2 && 'Paste target job description'}
                      {currentInputStep === 3 && 'Add links and optimize'}
                    </div>
                  </div>
                  {currentInputStep < 3 && (
                    <ArrowDown className="w-4 h-4 text-gray-400" />
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Desktop Process Steps - Hidden on mobile */}
          <div className="hidden sm:grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 sm:mb-8">
            <div className={`backdrop-blur-sm rounded-xl p-4 border transition-all duration-300 ${
              currentInputStep >= 1 ? 'bg-blue-100 border-blue-300' : 'bg-white/70 border-white/20'
            }`}>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 transition-colors ${
                currentInputStep >= 1 ? 'bg-blue-600' : 'bg-blue-100'
              }`}>
                {currentInputStep > 1 ? (
                  <CheckCircle className="w-6 h-6 text-white" />
                ) : (
                  <Upload className={`w-6 h-6 ${currentInputStep >= 1 ? 'text-white' : 'text-blue-600'}`} />
                )}
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">1. Upload Resume</h3>
              <p className="text-sm text-gray-600">Upload your current resume or paste the text</p>
            </div>
            <div className={`backdrop-blur-sm rounded-xl p-4 border transition-all duration-300 ${
              currentInputStep >= 2 ? 'bg-green-100 border-green-300' : 'bg-white/70 border-white/20'
            }`}>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 transition-colors ${
                currentInputStep >= 2 ? 'bg-green-600' : 'bg-green-100'
              }`}>
                {currentInputStep > 2 ? (
                  <CheckCircle className="w-6 h-6 text-white" />
                ) : (
                  <Target className={`w-6 h-6 ${currentInputStep >= 2 ? 'text-white' : 'text-green-600'}`} />
                )}
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">2. Add Job Details</h3>
              <p className="text-sm text-gray-600">Paste the job description you're targeting</p>
            </div>
            <div className={`backdrop-blur-sm rounded-xl p-4 border transition-all duration-300 ${
              currentInputStep >= 3 ? 'bg-purple-100 border-purple-300' : 'bg-white/70 border-white/20'
            }`}>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 transition-colors ${
                currentInputStep >= 3 ? 'bg-purple-600' : 'bg-purple-100'
              }`}>
                <Sparkles className={`w-6 h-6 ${currentInputStep >= 3 ? 'text-white' : 'text-purple-600'}`} />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">3. Get Optimized</h3>
              <p className="text-sm text-gray-600">Download your enhanced, ATS-ready resume</p>
            </div>
          </div>

          <div className="inline-flex items-center px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium bg-gradient-to-r from-green-100 to-blue-100 text-gray-800 border border-green-200">
            <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-green-600" />
            Powered by Advanced AI Technology
          </div>
        </div>
      </div>

      {/* Input Section */}
      {showInputSection && (
        <div className="max-w-4xl mx-auto">
          <div className="space-y-4 sm:space-y-6">
            {/* Step 1: Resume Upload */}
            {currentInputStep >= 1 && (
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl border border-gray-100 overflow-hidden transform transition-all duration-500 ease-out">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-4 sm:px-6 py-3 sm:py-4 border-b border-blue-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center mr-2 sm:mr-3 transition-colors ${
                        currentInputStep > 1 ? 'bg-green-600' : 'bg-blue-600'
                      }`}>
                        {currentInputStep > 1 ? (
                          <CheckCircle className="w-3 h-3 sm:w-5 sm:h-5 text-white" />
                        ) : (
                          <span className="text-white font-bold text-xs sm:text-sm">1</span>
                        )}
                      </div>
                      <div>
                        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center">
                          <FileText className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-600" />
                          <span className="hidden sm:inline">Upload Your Resume</span>
                          <span className="sm:hidden">Upload Resume</span>
                        </h2>
                        <p className="text-xs sm:text-sm text-gray-600 mt-1">
                          <span className="hidden sm:inline">Upload your current resume file or paste the text content below</span>
                          <span className="sm:hidden">Upload file or paste text</span>
                        </p>
                      </div>
                    </div>
                    {currentInputStep > 1 && (
                      <div className="flex items-center text-green-600 text-xs sm:text-sm font-medium">
                        <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                        <span className="hidden sm:inline">Completed</span>
                        <span className="sm:hidden">✓</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="p-4 sm:p-6">
                  <FileUpload onFileUpload={handleFileUpload} />
                </div>
              </div>
            )}

            {/* Step 2: Resume Text & Job Description */}
            {currentInputStep >= 2 && (
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl border border-gray-100 overflow-hidden transform transition-all duration-500 ease-out">
                <div className="bg-gradient-to-r from-green-50 to-green-100 px-4 sm:px-6 py-3 sm:py-4 border-b border-green-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center mr-2 sm:mr-3 transition-colors ${
                        currentInputStep > 2 ? 'bg-green-600' : 'bg-green-600'
                      }`}>
                        {currentInputStep > 2 ? (
                          <CheckCircle className="w-3 h-3 sm:w-5 sm:h-5 text-white" />
                        ) : (
                          <span className="text-white font-bold text-xs sm:text-sm">2</span>
                        )}
                      </div>
                      <div>
                        <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                          <span className="hidden sm:inline">Resume Content & Target Job</span>
                          <span className="sm:hidden">Add Job Details</span>
                        </h2>
                        <p className="text-xs sm:text-sm text-gray-600 mt-1">
                          <span className="hidden sm:inline">Review your resume text and add the job description you're targeting</span>
                          <span className="sm:hidden">Review text and add job description</span>
                        </p>
                      </div>
                    </div>
                    {currentInputStep > 2 && (
                      <div className="flex items-center text-green-600 text-xs sm:text-sm font-medium">
                        <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                        <span className="hidden sm:inline">Completed</span>
                        <span className="sm:hidden">✓</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="p-4 sm:p-6">
                  <InputSection
                    resumeText={resumeText}
                    jobDescription={jobDescription}
                    onResumeChange={setResumeText}
                    onJobDescriptionChange={setJobDescription}
                  />
                  
                  {/* User Type Selection */}
                  <div className="mt-4 sm:mt-6">
                    <div className="flex items-center mb-2 sm:mb-3">
                      <Users className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-purple-600" />
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900">Experience Level</h3>
                      <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full font-medium">
                        Required
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <button
                        onClick={() => setUserType('fresher')}
                        className={`p-3 sm:p-4 rounded-xl border-2 transition-all duration-200 text-left min-h-[44px] ${
                          userType === 'fresher'
                            ? 'border-green-500 bg-green-50 ring-2 ring-green-200'
                            : 'border-gray-200 bg-gray-50 hover:border-green-300 hover:bg-green-50'
                        }`}
                        style={{ WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}
                      >
                        <div className="flex items-center mb-2">
                          <Users className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-green-600" />
                          <span className="font-semibold text-gray-900 text-sm sm:text-base">Fresher/New Graduate</span>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-600">
                          Recent graduate or entry-level professional with limited work experience
                        </p>
                      </button>
                      
                      <button
                        onClick={() => setUserType('experienced')}
                        className={`p-3 sm:p-4 rounded-xl border-2 transition-all duration-200 text-left min-h-[44px] ${
                          userType === 'experienced'
                            ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                            : 'border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-blue-50'
                        }`}
                        style={{ WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}
                      >
                        <div className="flex items-center mb-2">
                          <Briefcase className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-600" />
                          <span className="font-semibold text-gray-900 text-sm sm:text-base">Experienced Professional</span>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-600">
                          Professional with 1+ years of relevant work experience
                        </p>
                      </button>
                    </div>
                  </div>
                  
                  {/* Target Role Input */}
                  <div className="mt-4 sm:mt-6">
                    <div className="flex items-center mb-2 sm:mb-3">
                      <Target className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-purple-600" />
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900">Target Role</h3>
                      <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full font-medium">
                        Optional
                      </span>
                    </div>
                    <input
                      type="text"
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                      placeholder="e.g., Senior Software Engineer, Product Manager..."
                      className="w-full p-3 sm:p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-gray-50 focus:bg-white text-sm sm:text-base min-h-[44px]"
                      style={{ fontSize: '16px' }}
                    />
                    <p className="text-xs sm:text-sm text-gray-500 mt-2">
                      Specify the exact role title for more targeted project recommendations
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Social Links & Optimize */}
            {currentInputStep >= 3 && (
              <div className="space-y-4 sm:space-y-6 transform transition-all duration-500 ease-out">
                {/* Professional Links */}
                <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl border border-gray-100 overflow-hidden">
                  <div className="bg-gradient-to-r from-purple-50 to-purple-100 px-4 sm:px-6 py-3 sm:py-4 border-b border-purple-200">
                    <div className="flex items-center">
                      <div className="bg-purple-600 w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center mr-2 sm:mr-3">
                        <span className="text-white font-bold text-xs sm:text-sm">3</span>
                      </div>
                      <div>
                        <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                          <span className="hidden sm:inline">Professional Links</span>
                          <span className="sm:hidden">Add Links</span>
                        </h2>
                        <div className="flex items-center">
                          <span className="ml-0 sm:ml-3 px-2 py-1 bg-purple-200 text-purple-800 text-xs rounded-full font-medium">
                            Optional
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-600 mt-1">
                          <span className="hidden sm:inline">Add your LinkedIn and GitHub profiles to enhance your resume</span>
                          <span className="sm:hidden">Add LinkedIn and GitHub profiles</span>
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 sm:p-6">
                    <div className="space-y-4 sm:space-y-0 sm:grid sm:grid-cols-1 md:grid-cols-2 sm:gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 sm:mb-3 flex items-center">
                          <Linkedin className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-600" />
                          LinkedIn Profile URL
                        </label>
                        <input
                          type="url"
                          value={linkedinUrl}
                          onChange={(e) => setLinkedinUrl(e.target.value)}
                          placeholder="https://linkedin.com/in/your-profile"
                          className="w-full p-3 sm:p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white text-sm sm:text-base min-h-[44px]"
                          style={{ fontSize: '16px' }}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 sm:mb-3 flex items-center">
                          <Github className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-gray-800" />
                          GitHub Profile URL
                        </label>
                        <input
                          type="url"
                          value={githubUrl}
                          onChange={(e) => setGithubUrl(e.target.value)}
                          placeholder="https://github.com/your-username"
                          className="w-full p-3 sm:p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white text-sm sm:text-base min-h-[44px]"
                          style={{ fontSize: '16px' }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Optimize Button */}
                <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl border border-gray-100 p-4 sm:p-6">
                  <div className="text-center">
                    <div className="mb-4">
                      <div className="flex items-center justify-center space-x-2 text-green-600 mb-2">
                        <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span className="font-medium text-sm sm:text-base">All steps completed!</span>
                      </div>
                      <p className="text-gray-600 text-xs sm:text-sm">
                        Your resume and job description are ready for optimization
                      </p>
                    </div>
                    
                    {/* Session Security Notice */}
                    {isAuthenticated && canOptimize && (
                      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-xl">
                        <div className="flex items-center justify-center space-x-2 text-blue-700 mb-1">
                          <Shield className="w-4 h-4" />
                          <span className="font-medium text-sm">Secure Session Active</span>
                        </div>
                        <p className="text-blue-600 text-xs">
                          Your session is validated and ready for optimization
                        </p>
                      </div>
                    )}
                    
                    {/* Subscription Warning for Non-Subscribers */}
                    {isAuthenticated && !canOptimize && (
                      <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-xl">
                        <div className="flex items-center justify-center space-x-2 text-orange-700 mb-2">
                          <Crown className="w-5 h-5" />
                          <span className="font-medium">Subscription Required</span>
                        </div>
                        <p className="text-orange-600 text-sm mb-3">
                          You need an active subscription to optimize your resume. Choose a plan to continue.
                        </p>
                        <button
                          onClick={() => setShowSubscriptionPlans(true)}
                          className="bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm min-h-[44px]"
                          style={{ WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}
                        >
                          View Plans
                        </button>
                      </div>
                    )}

                    {/* Low Optimizations Warning */}
                    {isAuthenticated && canOptimize && remainingOptimizations <= 2 && (
                      <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                        <div className="flex items-center justify-center space-x-2 text-yellow-700 mb-2">
                          <AlertTriangle className="w-5 h-5" />
                          <span className="font-medium">Running Low</span>
                        </div>
                        <p className="text-yellow-600 text-sm mb-3">
                          You have only {remainingOptimizations} optimization{remainingOptimizations !== 1 ? 's' : ''} left. Consider upgrading your plan.
                        </p>
                        <button
                          onClick={() => setShowSubscriptionPlans(true)}
                          className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm min-h-[44px]"
                          style={{ WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}
                        >
                          Upgrade Plan
                        </button>
                      </div>
                    )}
                    
                    <button
                      onClick={handleOptimize}
                      disabled={loading || !isFormComplete}
                      className={`w-full max-w-md mx-auto py-3 sm:py-4 px-6 sm:px-8 rounded-xl font-semibold text-base sm:text-lg transition-all duration-300 flex items-center justify-center space-x-2 sm:space-x-3 transform hover:scale-105 disabled:hover:scale-100 min-h-[44px] ${
                        isFormComplete && !loading
                          ? isAuthenticated && canOptimize
                            ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl'
                            : isAuthenticated
                            ? 'bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white shadow-lg hover:shadow-xl'
                            : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                      style={{ WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}
                    >
                      {loading ? (
                        <LoadingSpinner />
                      ) : !isAuthenticated ? (
                        <>
                          <LogIn className="w-5 h-5 sm:w-6 sm:h-6" />
                          <span>Sign In to Optimize</span>
                          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                        </>
                      ) : !canOptimize ? (
                        <>
                          <Crown className="w-5 h-5 sm:w-6 sm:h-6" />
                          <span>Subscribe to Optimize</span>
                          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
                          <span>Optimize My Resume ({remainingOptimizations} left)</span>
                          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                        </>
                      )}
                    </button>
                    
                    {/* Sign In Prompt for Non-Authenticated Users */}
                    {!isAuthenticated && isFormComplete && (
                      <div className="mt-4 p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-xl max-w-md mx-auto">
                        <div className="flex items-center justify-center space-x-2 text-blue-700 mb-2">
                          <User className="w-4 h-4 sm:w-5 sm:h-5" />
                          <span className="font-medium text-sm sm:text-base">Sign in required</span>
                        </div>
                        <p className="text-blue-600 text-xs sm:text-sm mb-3">
                          Please sign in to optimize your resume with our AI-powered tools
                        </p>
                        <button
                          onClick={() => setShowAuthModal(true)}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm min-h-[44px]"
                          style={{ WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}
                        >
                          Sign In Now
                        </button>
                      </div>
                    )}
                    
                    {error && (
                      <div className="mt-4 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-xl max-w-md mx-auto">
                        <p className="text-red-700 text-xs sm:text-sm font-medium">{error}</p>
                        <button
                          onClick={handleOptimize}
                          className="mt-2 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg text-xs"
                        >
                          Try Again
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Optimized Resume Section with Mobile-Optimized Interface */}
      {optimizedResume && !showInputSection && (
        <div className="space-y-4 sm:space-y-6">
          {/* Success Header */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl border border-gray-100 overflow-hidden">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 p-4 sm:p-6 border-b border-gray-200">
              <div className="flex items-center text-green-600">
                <div className="bg-green-100 p-2 rounded-full mr-3">
                  <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Resume Optimized Successfully!</h2>
                  <p className="text-xs sm:text-sm text-gray-600">
                    Your resume has been enhanced and is ready for download
                    {remainingOptimizations > 0 && ` • ${remainingOptimizations} optimization${remainingOptimizations !== 1 ? 's' : ''} remaining`}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 w-full sm:w-auto">
                {/* Mobile Export Button */}
                <div className="sm:hidden flex-1">
                  <button
                    onClick={handleStartNewOptimization}
                    className="w-1/2 flex items-center justify-center space-x-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2.5 px-3 rounded-xl transition-colors shadow-md hover:shadow-lg text-sm"
                    style={{ WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>New</span>
                  </button>
                </div>
                
                {/* Desktop Back Button */}
                <button
                  onClick={handleStartNewOptimization}
                  className="hidden sm:flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 sm:py-3 px-4 sm:px-6 rounded-xl transition-colors shadow-md hover:shadow-lg text-sm sm:text-base"
                  style={{ WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}
                >
                  <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline">Create New Resume</span>
                  <span className="sm:hidden">New</span>
                </button>
                
                {/* Mobile Export Button */}
                <div className="sm:hidden flex-1">
                  <button
                    onClick={() => {/* Export function */}}
                    className="w-full flex items-center justify-center space-x-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-3 rounded-xl transition-colors shadow-md hover:shadow-lg text-sm"
                    style={{ WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}
                  >
                    <Download className="w-4 h-4" />
                    <span>Export</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Floating Export Button for Desktop */}
          <FloatingExportButton />

          {/* Mobile-Optimized Interface or Desktop Layout */}
          {isMobile ? (
            <MobileOptimizedInterface sections={mobileOptimizedSections} />
          ) : (
            /* Desktop Side by Side Layout */
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Side - Resume */}
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-blue-600" />
                    Optimized Resume
                  </h3>
                  <ResumePreview resumeData={optimizedResume} userType={userType} />
                </div>
                
                <ExportButtons resumeData={optimizedResume} />
              </div>

              {/* Right Side - Score Analysis */}
              <div className="space-y-6">
                {beforeScore && afterScore && (
                  <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <BarChart3 className="w-5 h-5 mr-2 text-green-600" />
                      Score Analysis
                    </h3>
                    <ComprehensiveAnalysis 
                      beforeScore={beforeScore}
                      afterScore={afterScore}
                      changedSections={changedSections}
                      resumeData={optimizedResume}
                      jobDescription={jobDescription}
                      targetRole={targetRole || 'Software Engineer'}
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />

      <SubscriptionPlans
        isOpen={showSubscriptionPlans}
        onClose={() => setShowSubscriptionPlans(false)}
        onSubscriptionSuccess={handleSubscriptionSuccess}
      />

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-sm mx-auto text-center shadow-2xl">
            <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4 sm:mb-6"></div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">Optimizing Your Resume</h3>
            <p className="text-gray-600 mb-2 text-sm sm:text-base">Our AI is analyzing your resume and calculating match scores...</p>
            <p className="text-xs sm:text-sm text-gray-500">This may take a few moments</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeOptimizer;