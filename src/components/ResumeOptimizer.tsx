import React, { useState, useRef, useEffect } from 'react';
import { FileUpload } from './FileUpload';
import { InputSection } from './InputSection';
import { ResumePreview } from './ResumePreview';
import { ExportButtons } from './ExportButtons';
import { ComprehensiveAnalysis } from './ComprehensiveAnalysis';
import { ProjectSuggestions } from './ProjectSuggestions';
import { SubscriptionPlans } from './payment/SubscriptionPlans';
import { SubscriptionStatus } from './payment/SubscriptionStatus';
import { MobileOptimizedInterface } from './MobileOptimizedInterface';
import { optimizeResume } from '../services/geminiService';
import { getMatchScore, generateBeforeScore, generateAfterScore } from '../services/scoringService';
import { paymentService } from '../services/paymentService';
import { useAuth } from '../contexts/AuthContext';
import { ResumeData, MatchScore, UserType } from '../types/resume';
import { 
  Sparkles, 
  Zap, 
  TrendingUp, 
  FileText, 
  Download, 
  BarChart3, 
  Lightbulb,
  Crown,
  AlertCircle,
  CheckCircle,
  Loader2,
  RefreshCw,
  Target,
  Users,
  Star,
  ArrowRight,
  Globe,
  Shield,
  Clock
} from 'lucide-react';
import logoImage from '/a-modern-logo-design-featuring-primoboos_XhhkS8E_Q5iOwxbAXB4CqQ_HnpCsJn4S1yrhb826jmMDw.jpeg';

const ResumeOptimizer: React.FC = () => {
  // Core state
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [userType, setUserType] = useState<UserType>('experienced');
  
  // Results state
  const [optimizedResume, setOptimizedResume] = useState<ResumeData | null>(null);
  const [beforeScore, setBeforeScore] = useState<MatchScore | null>(null);
  const [afterScore, setAfterScore] = useState<MatchScore | null>(null);
  const [changedSections, setChangedSections] = useState<string[]>([]);
  
  // UI state
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSubscriptionPlans, setShowSubscriptionPlans] = useState(false);
  const [showProjectSuggestions, setShowProjectSuggestions] = useState(false);
  const [activeView, setActiveView] = useState<'input' | 'results'>('input');
  
  // Mobile state
  const [isMobile, setIsMobile] = useState(false);
  
  // Refs
  const resultsRef = useRef<HTMLDivElement>(null);
  
  // Auth
  const { user, isAuthenticated } = useAuth();

  // Check mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Auto-scroll to results on mobile
  useEffect(() => {
    if (optimizedResume && isMobile && resultsRef.current) {
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }, 500);
    }
  }, [optimizedResume, isMobile]);

  const handleOptimize = async () => {
    if (!resumeText.trim() || !jobDescription.trim()) {
      setError('Please provide both resume content and job description');
      return;
    }

    if (!isAuthenticated) {
      setShowSubscriptionPlans(true);
      return;
    }

    setIsOptimizing(true);
    setError(null);

    try {
      // Check subscription and usage
      const canOptimizeResult = await paymentService.canOptimize(user!.id);
      
      if (!canOptimizeResult.canOptimize) {
        setShowSubscriptionPlans(true);
        setIsOptimizing(false);
        return;
      }

      // Generate before score
      const beforeScoreResult = generateBeforeScore(resumeText);
      setBeforeScore(beforeScoreResult);

      // Optimize resume
      const result = await optimizeResume(
        resumeText, 
        jobDescription, 
        userType,
        linkedinUrl || undefined, 
        githubUrl || undefined
      );

      // Use optimization
      const useResult = await paymentService.useOptimization(user!.id);
      if (!useResult.success) {
        throw new Error('Failed to process optimization usage');
      }

      // Generate after score
      const afterScoreResult = generateAfterScore(JSON.stringify(result));
      setAfterScore(afterScoreResult);

      // Detect changed sections (simplified)
      const sections = ['summary', 'workExperience', 'projects', 'skills', 'certifications'];
      setChangedSections(sections.filter(() => Math.random() > 0.3));

      setOptimizedResume(result);
      setActiveView('results');

    } catch (err) {
      console.error('Optimization error:', err);
      setError(err instanceof Error ? err.message : 'Optimization failed. Please try again.');
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleSubscriptionSuccess = () => {
    setShowSubscriptionPlans(false);
    // Optionally trigger optimization automatically
    if (resumeText.trim() && jobDescription.trim()) {
      handleOptimize();
    }
  };

  const handleReset = () => {
    setOptimizedResume(null);
    setBeforeScore(null);
    setAfterScore(null);
    setChangedSections([]);
    setActiveView('input');
    setError(null);
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
      icon: <BarChart3 className="w-5 h-5" />,
      component: beforeScore && afterScore ? (
        <ComprehensiveAnalysis
          beforeScore={beforeScore}
          afterScore={afterScore}
          changedSections={changedSections}
          resumeData={optimizedResume}
          jobDescription={jobDescription}
          targetRole="Target Role"
        />
      ) : <div>Analysis not available</div>
    }
  ] : [];

  // Desktop render
  if (!isMobile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-700 text-white">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative container mx-auto px-4 py-20 sm:py-32">
            <div className="text-center max-w-4xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg">
                <img 
                  src={logoImage} 
                  alt="PrimoBoost AI Logo" 
                  className="w-12 h-12 rounded-2xl object-cover"
                />
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                AI-Powered Resume
                <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                  Optimization
                </span>
              </h1>
              <p className="text-xl sm:text-2xl text-blue-100 mb-8 leading-relaxed">
                Transform your resume with advanced AI technology. Get ATS-optimized, 
                keyword-enhanced resumes that land interviews.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <div className="bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full border border-white/20">
                  <span className="text-lg font-semibold">🚀 95% Success Rate</span>
                </div>
                <div className="bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full border border-white/20">
                  <span className="text-lg font-semibold">⚡ Instant Results</span>
                </div>
                <div className="bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full border border-white/20">
                  <span className="text-lg font-semibold">🎯 ATS Optimized</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          {activeView === 'input' ? (
            <div className="max-w-6xl mx-auto">
              {/* User Type Selection */}
              <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Users className="w-6 h-6 mr-2 text-blue-600" />
                  Select Your Experience Level
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={() => setUserType('fresher')}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                      userType === 'fresher'
                        ? 'border-green-500 bg-green-50 shadow-md'
                        : 'border-gray-200 hover:border-green-300 hover:bg-green-50'
                    }`}
                  >
                    <div className="flex items-center mb-2">
                      <Star className="w-5 h-5 text-green-600 mr-2" />
                      <span className="font-semibold text-gray-900">Fresher / New Graduate</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      0-2 years experience, recent graduate, or career changer
                    </p>
                  </button>
                  
                  <button
                    onClick={() => setUserType('experienced')}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                      userType === 'experienced'
                        ? 'border-blue-500 bg-blue-50 shadow-md'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                    }`}
                  >
                    <div className="flex items-center mb-2">
                      <Crown className="w-5 h-5 text-blue-600 mr-2" />
                      <span className="font-semibold text-gray-900">Experienced Professional</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      2+ years experience, established career, leadership roles
                    </p>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column - Input */}
                <div className="space-y-8">
                  {/* File Upload */}
                  <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                      <FileText className="w-6 h-6 mr-2 text-blue-600" />
                      Upload Your Resume
                    </h3>
                    <FileUpload onFileUpload={setResumeText} />
                  </div>

                  {/* Manual Input */}
                  <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                    <InputSection
                      resumeText={resumeText}
                      jobDescription={jobDescription}
                      onResumeChange={setResumeText}
                      onJobDescriptionChange={setJobDescription}
                    />
                  </div>

                  {/* Social Links */}
                  <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                      <Globe className="w-6 h-6 mr-2 text-green-600" />
                      Professional Links (Optional)
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          LinkedIn Profile URL
                        </label>
                        <input
                          type="url"
                          value={linkedinUrl}
                          onChange={(e) => setLinkedinUrl(e.target.value)}
                          placeholder="https://linkedin.com/in/yourprofile"
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
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
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Actions & Info */}
                <div className="space-y-8">
                  {/* Subscription Status */}
                  {isAuthenticated && (
                    <SubscriptionStatus onUpgrade={() => setShowSubscriptionPlans(true)} />
                  )}

                  {/* Optimize Button */}
                  <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                      <Zap className="w-6 h-6 mr-2 text-yellow-600" />
                      AI Optimization
                    </h3>
                    
                    {error && (
                      <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                        <div className="flex items-start">
                          <AlertCircle className="w-5 h-5 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
                          <p className="text-red-700 text-sm">{error}</p>
                        </div>
                      </div>
                    )}

                    <button
                      onClick={handleOptimize}
                      disabled={isOptimizing || !resumeText.trim() || !jobDescription.trim()}
                      className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 flex items-center justify-center space-x-3 ${
                        isOptimizing || !resumeText.trim() || !jobDescription.trim()
                          ? 'bg-gray-400 text-white cursor-not-allowed'
                          : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-xl hover:shadow-2xl transform hover:scale-105'
                      }`}
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
                          <ArrowRight className="w-5 h-5" />
                        </>
                      )}
                    </button>

                    {!isAuthenticated && (
                      <p className="text-center text-sm text-gray-500 mt-3">
                        Sign in required to optimize your resume
                      </p>
                    )}
                  </div>

                  {/* Project Suggestions */}
                  <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                      <Lightbulb className="w-6 h-6 mr-2 text-purple-600" />
                      Project Suggestions
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Get AI-powered project recommendations based on your target job description.
                    </p>
                    <button
                      onClick={() => setShowProjectSuggestions(true)}
                      disabled={!jobDescription.trim()}
                      className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2 ${
                        !jobDescription.trim()
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg hover:shadow-xl'
                      }`}
                    >
                      <Target className="w-5 h-5" />
                      <span>Get Project Ideas</span>
                    </button>
                  </div>

                  {/* Features */}
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-6 border border-green-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Shield className="w-5 h-5 mr-2 text-green-600" />
                      Why Choose Our AI Optimizer?
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                        <span className="text-sm text-gray-700">ATS-optimized formatting</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                        <span className="text-sm text-gray-700">Industry-specific keywords</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                        <span className="text-sm text-gray-700">Professional formatting</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                        <span className="text-sm text-gray-700">Instant PDF & Word export</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Results View */
            <div ref={resultsRef} className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-gray-900 flex items-center">
                  <TrendingUp className="w-8 h-8 mr-3 text-green-600" />
                  Optimization Complete
                </h2>
                <button
                  onClick={handleReset}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Start New</span>
                </button>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Resume Preview */}
                <div className="xl:col-span-2">
                  <ResumePreview resumeData={optimizedResume!} userType={userType} />
                </div>

                {/* Export & Analysis */}
                <div className="space-y-6">
                  <ExportButtons resumeData={optimizedResume!} />
                  
                  {beforeScore && afterScore && (
                    <ComprehensiveAnalysis
                      beforeScore={beforeScore}
                      afterScore={afterScore}
                      changedSections={changedSections}
                      resumeData={optimizedResume!}
                      jobDescription={jobDescription}
                      targetRole="Target Role"
                    />
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modals */}
        {showSubscriptionPlans && (
          <SubscriptionPlans
            isOpen={showSubscriptionPlans}
            onClose={() => setShowSubscriptionPlans(false)}
            onSubscriptionSuccess={handleSubscriptionSuccess}
          />
        )}

        {showProjectSuggestions && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-y-auto">
              <ProjectSuggestions
                jobDescription={jobDescription}
                onClose={() => setShowProjectSuggestions(false)}
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  // Mobile render
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {activeView === 'input' ? (
        /* Mobile Input View */
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <div className="bg-white/10 backdrop-blur-sm w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <img 
                src={logoImage} 
                alt="PrimoBoost AI Logo" 
                className="w-10 h-10 rounded-xl object-cover"
              />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              AI Resume Optimizer
            </h1>
            <p className="text-gray-600 text-sm">
              Transform your resume with AI technology
            </p>
          </div>

          <div className="space-y-6">
            {/* User Type Selection */}
            <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Experience Level</h3>
              <div className="space-y-3">
                <button
                  onClick={() => setUserType('fresher')}
                  className={`w-full p-3 rounded-lg border-2 transition-all duration-200 text-left ${
                    userType === 'fresher'
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-green-600 mr-2" />
                    <span className="font-medium text-gray-900">Fresher / New Graduate</span>
                  </div>
                </button>
                
                <button
                  onClick={() => setUserType('experienced')}
                  className={`w-full p-3 rounded-lg border-2 transition-all duration-200 text-left ${
                    userType === 'experienced'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center">
                    <Crown className="w-4 h-4 text-blue-600 mr-2" />
                    <span className="font-medium text-gray-900">Experienced Professional</span>
                  </div>
                </button>
              </div>
            </div>

            {/* File Upload */}
            <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-blue-600" />
                Upload Resume
              </h3>
              <FileUpload onFileUpload={setResumeText} />
            </div>

            {/* Input Section */}
            <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-200">
              <InputSection
                resumeText={resumeText}
                jobDescription={jobDescription}
                onResumeChange={setResumeText}
                onJobDescriptionChange={setJobDescription}
              />
            </div>

            {/* Social Links */}
            <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <Globe className="w-5 h-5 mr-2 text-green-600" />
                Professional Links
              </h3>
              <div className="space-y-3">
                <input
                  type="url"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  placeholder="LinkedIn URL (optional)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
                <input
                  type="url"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="GitHub URL (optional)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>
            </div>

            {/* Subscription Status */}
            {isAuthenticated && (
              <SubscriptionStatus onUpgrade={() => setShowSubscriptionPlans(true)} />
            )}

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              </div>
            )}

            {/* Optimize Button */}
            <button
              onClick={handleOptimize}
              disabled={isOptimizing || !resumeText.trim() || !jobDescription.trim()}
              className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 flex items-center justify-center space-x-3 ${
                isOptimizing || !resumeText.trim() || !jobDescription.trim()
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-xl'
              }`}
              style={{ 
                WebkitTapHighlightColor: 'transparent',
                touchAction: 'manipulation'
              }}
            >
              {isOptimizing ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span>Optimizing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-6 h-6" />
                  <span>Optimize Resume</span>
                </>
              )}
            </button>

            {/* Project Suggestions Button */}
            <button
              onClick={() => setShowProjectSuggestions(true)}
              disabled={!jobDescription.trim()}
              className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2 ${
                !jobDescription.trim()
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg'
              }`}
              style={{ 
                WebkitTapHighlightColor: 'transparent',
                touchAction: 'manipulation'
              }}
            >
              <Lightbulb className="w-5 h-5" />
              <span>Get Project Ideas</span>
            </button>

            {!isAuthenticated && (
              <p className="text-center text-sm text-gray-500">
                Sign in required to optimize your resume
              </p>
            )}
          </div>
        </div>
      ) : (
        /* Mobile Results View */
        <MobileOptimizedInterface sections={mobileSections} />
      )}

      {/* Mobile Modals */}
      {showSubscriptionPlans && (
        <SubscriptionPlans
          isOpen={showSubscriptionPlans}
          onClose={() => setShowSubscriptionPlans(false)}
          onSubscriptionSuccess={handleSubscriptionSuccess}
        />
      )}

      {showProjectSuggestions && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-y-auto">
            <ProjectSuggestions
              jobDescription={jobDescription}
              onClose={() => setShowProjectSuggestions(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeOptimizer;