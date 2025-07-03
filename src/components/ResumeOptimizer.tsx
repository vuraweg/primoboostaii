import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, 
  FileText, 
  Briefcase, 
  Sparkles, 
  Download, 
  TrendingUp, 
  Target, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  RefreshCw, 
  Crown, 
  Zap, 
  Star, 
  Clock, 
  User, 
  LogIn, 
  X,
  Menu,
  ArrowLeft,
  ChevronRight,
  ChevronLeft,
  Eye,
  EyeOff
} from 'lucide-react';
import { FileUpload } from './FileUpload';
import { InputSection } from './InputSection';
import { ResumePreview } from './ResumePreview';
import { ExportButtons } from './ExportButtons';
import { ComprehensiveAnalysis } from './ComprehensiveAnalysis';
import { MobileOptimizedInterface } from './MobileOptimizedInterface';
import { SubscriptionPlans } from './payment/SubscriptionPlans';
import { SubscriptionStatus } from './payment/SubscriptionStatus';
import { AuthModal } from './auth/AuthModal';
import { optimizeResume } from '../services/geminiService';
import { getMatchScore, generateBeforeScore, generateAfterScore } from '../services/scoringService';
import { paymentService } from '../services/paymentService';
import { useAuth } from '../contexts/AuthContext';
import { ResumeData, MatchScore, UserType } from '../types/resume';
import logoImage from '/a-modern-logo-design-featuring-primoboos_XhhkS8E_Q5iOwxbAXB4CqQ_HnpCsJn4S1yrhb826jmMDw.jpeg';

const ResumeOptimizer: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [optimizedResume, setOptimizedResume] = useState<ResumeData | null>(null);
  const [beforeScore, setBeforeScore] = useState<MatchScore | null>(null);
  const [afterScore, setAfterScore] = useState<MatchScore | null>(null);
  const [changedSections, setChangedSections] = useState<string[]>([]);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSubscriptionPlans, setShowSubscriptionPlans] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [userType, setUserType] = useState<UserType>('experienced');
  const [currentStep, setCurrentStep] = useState(1);
  const [showMobileSteps, setShowMobileSteps] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [lastOptimizationData, setLastOptimizationData] = useState<{
    resumeText: string;
    jobDescription: string;
    linkedinUrl: string;
    githubUrl: string;
    userType: UserType;
  } | null>(null);

  const fileUploadRef = useRef<HTMLDivElement>(null);

  // Auto-detect user type based on resume content
  useEffect(() => {
    if (resumeText) {
      const workExperienceKeywords = ['experience', 'worked', 'employed', 'position', 'role', 'company', 'years'];
      const fresherKeywords = ['student', 'graduate', 'fresher', 'internship', 'academic', 'university', 'college'];
      
      const lowerResumeText = resumeText.toLowerCase();
      const workScore = workExperienceKeywords.reduce((score, keyword) => 
        score + (lowerResumeText.includes(keyword) ? 1 : 0), 0);
      const fresherScore = fresherKeywords.reduce((score, keyword) => 
        score + (lowerResumeText.includes(keyword) ? 1 : 0), 0);
      
      // If resume has more work-related keywords and is longer, likely experienced
      if (workScore > fresherScore && resumeText.length > 1000) {
        setUserType('experienced');
      } else if (fresherScore > workScore || resumeText.length < 800) {
        setUserType('fresher');
      }
    }
  }, [resumeText]);

  const handleOptimize = async () => {
    if (!resumeText.trim() || !jobDescription.trim()) {
      setError('Please provide both resume content and job description.');
      return;
    }

    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

    setIsOptimizing(true);
    setError(null);

    try {
      // Check subscription before optimization
      const canOptimizeResult = await paymentService.canOptimize(user!.id);
      
      if (!canOptimizeResult.canOptimize) {
        setShowSubscriptionPlans(true);
        setIsOptimizing(false);
        return;
      }

      // Store optimization data for retry
      setLastOptimizationData({
        resumeText,
        jobDescription,
        linkedinUrl,
        githubUrl,
        userType
      });

      // Generate before score
      const beforeScoreData = generateBeforeScore(resumeText);
      setBeforeScore(beforeScoreData);

      // Optimize resume
      const optimizedData = await optimizeResume(
        resumeText, 
        jobDescription, 
        userType,
        linkedinUrl || undefined, 
        githubUrl || undefined
      );
      
      // Generate after score
      const afterScoreData = generateAfterScore(JSON.stringify(optimizedData));
      setAfterScore(afterScoreData);

      // Determine changed sections (simplified logic)
      const sections = ['summary', 'workExperience', 'projects', 'skills', 'certifications'];
      setChangedSections(sections);

      setOptimizedResume(optimizedData);

      // Use optimization count
      await paymentService.useOptimization(user!.id);
      
      // Reset retry count on success
      setRetryCount(0);

      // Move to results step
      setCurrentStep(3);

    } catch (error) {
      console.error('Optimization error:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.');
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleRetry = async () => {
    if (!lastOptimizationData) {
      setError('No previous optimization data found. Please try again.');
      return;
    }

    setRetryCount(prev => prev + 1);
    
    // Restore the last optimization data
    setResumeText(lastOptimizationData.resumeText);
    setJobDescription(lastOptimizationData.jobDescription);
    setLinkedinUrl(lastOptimizationData.linkedinUrl);
    setGithubUrl(lastOptimizationData.githubUrl);
    setUserType(lastOptimizationData.userType);
    
    // Clear error and retry
    setError(null);
    await handleOptimize();
  };

  const handleSubscriptionSuccess = () => {
    setShowSubscriptionPlans(false);
    // Automatically retry optimization after successful subscription
    if (lastOptimizationData) {
      handleRetry();
    }
  };

  const resetForm = () => {
    setResumeText('');
    setJobDescription('');
    setLinkedinUrl('');
    setGithubUrl('');
    setOptimizedResume(null);
    setBeforeScore(null);
    setAfterScore(null);
    setChangedSections([]);
    setError(null);
    setCurrentStep(1);
    setShowMobileSteps(false);
    setRetryCount(0);
    setLastOptimizationData(null);
  };

  const canProceedToStep2 = resumeText.trim().length > 0;
  const canOptimizeResume = resumeText.trim().length > 0 && jobDescription.trim().length > 0;

  // Mobile step navigation
  const goToStep = (step: number) => {
    setCurrentStep(step);
    setShowMobileSteps(false);
  };

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Mobile sections for MobileOptimizedInterface
  const mobileSections = optimizedResume ? [
    {
      id: 'resume',
      title: 'Resume',
      icon: <FileText className="w-5 h-5" />,
      component: <ResumePreview resumeData={optimizedResume} userType={userType} />,
      resumeData: optimizedResume
    },
    {
      id: 'analysis',
      title: 'Analysis',
      icon: <TrendingUp className="w-5 h-5" />,
      component: beforeScore && afterScore ? (
        <ComprehensiveAnalysis
          beforeScore={beforeScore}
          afterScore={afterScore}
          changedSections={changedSections}
          resumeData={optimizedResume}
          jobDescription={jobDescription}
          targetRole="Target Role"
        />
      ) : null
    }
  ] : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Mobile Header */}
      <div className="md:hidden bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            {currentStep > 1 && (
              <button
                onClick={prevStep}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg overflow-hidden shadow-md">
                <img 
                  src={logoImage} 
                  alt="PrimoBoost AI Logo" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">PrimoBoost AI</h1>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Step indicator */}
            <div className="flex items-center space-x-1">
              {[1, 2, 3].map((step) => (
                <div
                  key={step}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    step === currentStep
                      ? 'bg-blue-600'
                      : step < currentStep
                      ? 'bg-green-500'
                      : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
            
            {/* Auth button */}
            {!isAuthenticated ? (
              <button
                onClick={() => setShowAuthModal(true)}
                className="flex items-center space-x-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </button>
            ) : (
              <div className="flex items-center space-x-2">
                <div className="bg-blue-600 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                  {user?.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden md:block">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-6">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              AI Resume Optimizer
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Transform your resume with AI-powered optimization. Get past ATS systems and land more interviews.
            </p>
          </div>
        </div>
      </div>

      {/* Mobile Single-Step View */}
      <div className="md:hidden">
        {currentStep === 1 && (
          <div className="p-4 space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="text-center mb-6">
                <div className="bg-blue-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Upload className="w-8 h-8 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload Your Resume</h2>
                <p className="text-gray-600">Start by uploading your current resume</p>
              </div>
              
              <FileUpload onFileUpload={setResumeText} />
              
              {resumeText && (
                <div className="mt-6">
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <div className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                      <span className="text-green-800 font-medium">Resume uploaded successfully!</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={nextStep}
                    className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors flex items-center justify-center space-x-2"
                  >
                    <span>Continue to Job Description</span>
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="p-4 space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="text-center mb-6">
                <div className="bg-green-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Briefcase className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Job Description</h2>
                <p className="text-gray-600">Paste the job description you're targeting</p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Target Job Description *
                  </label>
                  <textarea
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste the complete job description here..."
                    className="w-full h-40 p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    LinkedIn URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    placeholder="https://linkedin.com/in/yourprofile"
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    GitHub URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    placeholder="https://github.com/yourusername"
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              {canOptimizeResume && (
                <button
                  onClick={handleOptimize}
                  disabled={isOptimizing}
                  className="w-full mt-6 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2"
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
              )}
            </div>
          </div>
        )}

        {currentStep === 3 && optimizedResume && (
          <MobileOptimizedInterface sections={mobileSections} />
        )}
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:block">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          {!optimizedResume ? (
            <div className="grid lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
              {/* Left Column - Input */}
              <div className="space-y-8">
                {/* Subscription Status */}
                {isAuthenticated && (
                  <SubscriptionStatus onUpgrade={() => setShowSubscriptionPlans(true)} />
                )}

                {/* File Upload */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                    <Upload className="w-6 h-6 mr-3 text-blue-600" />
                    Upload Resume
                  </h2>
                  <FileUpload onFileUpload={setResumeText} />
                </div>

                {/* Input Section */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                    <Target className="w-6 h-6 mr-3 text-green-600" />
                    Job Details
                  </h2>
                  <InputSection
                    resumeText={resumeText}
                    jobDescription={jobDescription}
                    onResumeChange={setResumeText}
                    onJobDescriptionChange={setJobDescription}
                  />
                  
                  {/* Social Links */}
                  <div className="mt-6 space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        LinkedIn URL (Optional)
                      </label>
                      <input
                        type="url"
                        value={linkedinUrl}
                        onChange={(e) => setLinkedinUrl(e.target.value)}
                        placeholder="https://linkedin.com/in/yourprofile"
                        className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        GitHub URL (Optional)
                      </label>
                      <input
                        type="url"
                        value={githubUrl}
                        onChange={(e) => setGithubUrl(e.target.value)}
                        placeholder="https://github.com/yourusername"
                        className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Optimize Button */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <button
                    onClick={handleOptimize}
                    disabled={!canOptimizeResume || isOptimizing}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
                  >
                    {isOptimizing ? (
                      <>
                        <Loader2 className="w-6 h-6 animate-spin" />
                        <span>Optimizing Your Resume...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-6 h-6" />
                        <span>Optimize My Resume</span>
                      </>
                    )}
                  </button>
                  
                  {!isAuthenticated && (
                    <p className="text-center text-sm text-gray-600 mt-3">
                      <button
                        onClick={() => setShowAuthModal(true)}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Sign in
                      </button>
                      {' '}to optimize your resume
                    </p>
                  )}
                </div>
              </div>

              {/* Right Column - Preview */}
              <div className="space-y-8">
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                    <Eye className="w-6 h-6 mr-3 text-purple-600" />
                    Resume Preview
                  </h2>
                  
                  {resumeText ? (
                    <div className="bg-gray-50 rounded-xl p-6 min-h-[400px]">
                      <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {resumeText.substring(0, 1000)}
                        {resumeText.length > 1000 && '...'}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-xl p-6 min-h-[400px] flex items-center justify-center">
                      <div className="text-center text-gray-500">
                        <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>Upload your resume to see a preview</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Results Layout */
            <div className="space-y-8 max-w-7xl mx-auto">
              {/* Header with Reset Button */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">Optimization Complete!</h2>
                  <p className="text-gray-600 mt-2">Your resume has been optimized and is ready for download.</p>
                </div>
                <button
                  onClick={resetForm}
                  className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-xl transition-colors flex items-center space-x-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Start Over</span>
                </button>
              </div>

              <div className="grid lg:grid-cols-3 gap-8">
                {/* Resume Preview */}
                <div className="lg:col-span-2">
                  <ResumePreview resumeData={optimizedResume} userType={userType} />
                </div>

                {/* Export and Analysis */}
                <div className="space-y-6">
                  <ExportButtons resumeData={optimizedResume} />
                  
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
                </div>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="fixed bottom-4 right-4 bg-red-600 text-white p-4 rounded-xl shadow-lg max-w-md z-50">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-medium">Optimization Failed</p>
                  <p className="text-sm opacity-90 mt-1">{error}</p>
                  {lastOptimizationData && (
                    <div className="mt-3 flex space-x-2">
                      <button
                        onClick={handleRetry}
                        className="bg-red-700 hover:bg-red-800 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
                      >
                        Try Again {retryCount > 0 && `(${retryCount})`}
                      </button>
                      <button
                        onClick={() => setError(null)}
                        className="text-red-200 hover:text-white px-3 py-1 rounded text-sm transition-colors"
                      >
                        Dismiss
                      </button>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setError(null)}
                  className="text-red-200 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <SubscriptionPlans
        isOpen={showSubscriptionPlans}
        onClose={() => setShowSubscriptionPlans(false)}
        onSubscriptionSuccess={handleSubscriptionSuccess}
      />

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  );
};

export default ResumeOptimizer;