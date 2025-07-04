import React, { useState } from 'react';
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertTriangle, 
  User, 
  Github, 
  Linkedin, 
  Briefcase,
  Download,
  Loader2,
  Star,
  Target,
  TrendingUp,
  Eye,
  RefreshCw
} from 'lucide-react';
import { FileUpload } from './FileUpload';
import { ResumePreview } from './ResumePreview';
import { ExportButtons } from './ExportButtons';
import { ResumeData, UserType } from '../types/resume';
import { optimizeResume } from '../services/geminiService';
import { getMatchScore } from '../services/scoringService';
import { useAuth } from '../contexts/AuthContext';
import { paymentService } from '../services/paymentService';

interface ATSAnalysis {
  score: number;
  missingSections: string[];
  suggestions: string[];
  strengths: string[];
  improvements: string[];
}

interface UserInputs {
  githubUrl: string;
  linkedinUrl: string;
  targetRole: string;
  userType: UserType;
}

export const ATSResumeBuilder: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [resumeText, setResumeText] = useState('');
  const [userInputs, setUserInputs] = useState<UserInputs>({
    githubUrl: '',
    linkedinUrl: '',
    targetRole: '',
    userType: 'experienced'
  });
  const [atsAnalysis, setAtsAnalysis] = useState<ATSAnalysis | null>(null);
  const [optimizedResume, setOptimizedResume] = useState<ResumeData | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [currentStep, setCurrentStep] = useState<'upload' | 'analyze' | 'inputs' | 'optimize' | 'result'>('upload');
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleFileUpload = (text: string) => {
    setResumeText(text);
    if (text.trim()) {
      setCurrentStep('analyze');
    }
  };

  const analyzeResume = async () => {
    if (!resumeText.trim()) return;

    setIsAnalyzing(true);
    try {
      // Analyze resume for ATS compliance and missing sections
      const analysis = await analyzeResumeForATS(resumeText);
      setAtsAnalysis(analysis);
      setCurrentStep('inputs');
    } catch (error) {
      console.error('Error analyzing resume:', error);
      alert('Failed to analyze resume. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleOptimize = async () => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

    if (!resumeText.trim() || !userInputs.targetRole.trim()) {
      alert('Please provide your resume and target role.');
      return;
    }

    setIsOptimizing(true);
    try {
      // Check subscription
      const canOptimize = await paymentService.canOptimize(user!.id);
      if (!canOptimize.canOptimize) {
        alert('You have no remaining optimizations. Please upgrade your subscription.');
        return;
      }

      // Create job description from target role
      const jobDescription = `Position: ${userInputs.targetRole}\n\nWe are looking for a qualified ${userInputs.targetRole} to join our team. The ideal candidate should have relevant experience and skills in this field.`;

      // Optimize resume
      const optimized = await optimizeResume(
        resumeText,
        jobDescription,
        userInputs.userType,
        userInputs.linkedinUrl,
        userInputs.githubUrl
      );

      // Use optimization count
      await paymentService.useOptimization(user!.id);

      setOptimizedResume(optimized);
      setCurrentStep('result');
    } catch (error) {
      console.error('Error optimizing resume:', error);
      alert('Failed to optimize resume. Please try again.');
    } finally {
      setIsOptimizing(false);
    }
  };

  const analyzeResumeForATS = async (resumeText: string): Promise<ATSAnalysis> => {
    // Simulate ATS analysis - in real implementation, this would use AI
    const sections = {
      contact: /(?:phone|email|linkedin|github)/i.test(resumeText),
      summary: /(?:summary|objective|profile)/i.test(resumeText),
      experience: /(?:experience|work|employment|job)/i.test(resumeText),
      education: /(?:education|degree|university|college)/i.test(resumeText),
      skills: /(?:skills|technologies|technical)/i.test(resumeText),
      projects: /(?:projects|portfolio)/i.test(resumeText),
      certifications: /(?:certification|certificate|certified)/i.test(resumeText)
    };

    const missingSections = [];
    const suggestions = [];
    const strengths = [];
    const improvements = [];

    // Check for missing sections
    if (!sections.contact) {
      missingSections.push('Contact Information');
      suggestions.push('Add complete contact details including phone, email, and professional profiles');
    } else {
      strengths.push('Complete contact information provided');
    }

    if (!sections.summary) {
      missingSections.push('Professional Summary');
      suggestions.push('Add a compelling professional summary highlighting your key achievements');
    } else {
      strengths.push('Professional summary included');
    }

    if (!sections.experience) {
      missingSections.push('Work Experience');
      suggestions.push('Include detailed work experience with quantifiable achievements');
    } else {
      strengths.push('Work experience section present');
    }

    if (!sections.skills) {
      missingSections.push('Technical Skills');
      suggestions.push('Add a comprehensive skills section with relevant technologies');
    } else {
      strengths.push('Skills section included');
    }

    if (!sections.projects) {
      missingSections.push('Projects');
      suggestions.push('Include relevant projects to showcase your practical experience');
    }

    if (!sections.education) {
      missingSections.push('Education');
      suggestions.push('Add your educational background and qualifications');
    }

    // Calculate ATS score
    const presentSections = Object.values(sections).filter(Boolean).length;
    const totalSections = Object.keys(sections).length;
    const baseScore = (presentSections / totalSections) * 100;

    // Add improvements
    improvements.push('Use standard section headings (Experience, Education, Skills)');
    improvements.push('Include relevant keywords from job descriptions');
    improvements.push('Use bullet points for better readability');
    improvements.push('Ensure consistent formatting throughout');

    return {
      score: Math.round(baseScore),
      missingSections,
      suggestions,
      strengths,
      improvements
    };
  };

  const resetBuilder = () => {
    setResumeText('');
    setUserInputs({
      githubUrl: '',
      linkedinUrl: '',
      targetRole: '',
      userType: 'experienced'
    });
    setAtsAnalysis(null);
    setOptimizedResume(null);
    setCurrentStep('upload');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Target className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            ATS Resume Builder
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Upload your resume, get detailed ATS analysis, and generate an optimized version that passes through Applicant Tracking Systems
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            {[
              { id: 'upload', label: 'Upload', icon: <Upload className="w-5 h-5" /> },
              { id: 'analyze', label: 'Analyze', icon: <Eye className="w-5 h-5" /> },
              { id: 'inputs', label: 'Details', icon: <User className="w-5 h-5" /> },
              { id: 'optimize', label: 'Optimize', icon: <TrendingUp className="w-5 h-5" /> },
              { id: 'result', label: 'Result', icon: <CheckCircle className="w-5 h-5" /> }
            ].map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  currentStep === step.id 
                    ? 'bg-blue-600 text-white' 
                    : index < ['upload', 'analyze', 'inputs', 'optimize', 'result'].indexOf(currentStep)
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {step.icon}
                </div>
                <span className="ml-2 text-sm font-medium text-gray-700">{step.label}</span>
                {index < 4 && <div className="w-8 h-0.5 bg-gray-300 mx-4" />}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="max-w-4xl mx-auto">
          {/* Step 1: Upload Resume */}
          {currentStep === 'upload' && (
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <Upload className="w-6 h-6 mr-2 text-blue-600" />
                Upload Your Resume
              </h2>
              <FileUpload onFileUpload={handleFileUpload} />
              {resumeText && (
                <div className="mt-6">
                  <button
                    onClick={() => setCurrentStep('analyze')}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
                  >
                    Continue to Analysis
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Step 2: ATS Analysis */}
          {currentStep === 'analyze' && (
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <Eye className="w-6 h-6 mr-2 text-purple-600" />
                ATS Analysis
              </h2>
              
              {!atsAnalysis ? (
                <div className="text-center py-8">
                  <button
                    onClick={analyzeResume}
                    disabled={isAnalyzing}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors flex items-center space-x-2 mx-auto"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Analyzing Resume...</span>
                      </>
                    ) : (
                      <>
                        <Target className="w-5 h-5" />
                        <span>Analyze for ATS Compliance</span>
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* ATS Score */}
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 text-center">
                    <div className="text-4xl font-bold text-gray-900 mb-2">{atsAnalysis.score}%</div>
                    <div className="text-lg text-gray-600">ATS Compatibility Score</div>
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mt-2 ${
                      atsAnalysis.score >= 80 ? 'bg-green-100 text-green-800' :
                      atsAnalysis.score >= 60 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {atsAnalysis.score >= 80 ? 'Excellent' :
                       atsAnalysis.score >= 60 ? 'Good' : 'Needs Improvement'}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Missing Sections */}
                    {atsAnalysis.missingSections.length > 0 && (
                      <div className="bg-red-50 rounded-xl p-6 border border-red-200">
                        <h3 className="text-lg font-semibold text-red-900 mb-3 flex items-center">
                          <AlertTriangle className="w-5 h-5 mr-2" />
                          Missing Sections
                        </h3>
                        <ul className="space-y-2">
                          {atsAnalysis.missingSections.map((section, index) => (
                            <li key={index} className="text-red-700 text-sm flex items-center">
                              <div className="w-2 h-2 bg-red-500 rounded-full mr-2" />
                              {section}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Strengths */}
                    <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                      <h3 className="text-lg font-semibold text-green-900 mb-3 flex items-center">
                        <CheckCircle className="w-5 h-5 mr-2" />
                        Strengths
                      </h3>
                      <ul className="space-y-2">
                        {atsAnalysis.strengths.map((strength, index) => (
                          <li key={index} className="text-green-700 text-sm flex items-center">
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                            {strength}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Suggestions */}
                  <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                    <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center">
                      <Star className="w-5 h-5 mr-2" />
                      Improvement Suggestions
                    </h3>
                    <ul className="space-y-2">
                      {atsAnalysis.suggestions.map((suggestion, index) => (
                        <li key={index} className="text-blue-700 text-sm flex items-start">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mr-2 mt-2 flex-shrink-0" />
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex justify-center">
                    <button
                      onClick={() => setCurrentStep('inputs')}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
                    >
                      Continue to Optimization
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: User Inputs */}
          {currentStep === 'inputs' && (
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <User className="w-6 h-6 mr-2 text-green-600" />
                Additional Details
              </h2>
              
              <div className="space-y-6">
                {/* Target Role */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Target Role/Position *
                  </label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={userInputs.targetRole}
                      onChange={(e) => setUserInputs(prev => ({ ...prev, targetRole: e.target.value }))}
                      placeholder="e.g., Senior Software Engineer, Data Scientist, Product Manager"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </div>

                {/* User Type */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Experience Level
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setUserInputs(prev => ({ ...prev, userType: 'fresher' }))}
                      className={`p-4 rounded-xl border-2 transition-colors ${
                        userInputs.userType === 'fresher'
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-semibold">Fresher/New Graduate</div>
                      <div className="text-sm text-gray-600">0-2 years experience</div>
                    </button>
                    <button
                      onClick={() => setUserInputs(prev => ({ ...prev, userType: 'experienced' }))}
                      className={`p-4 rounded-xl border-2 transition-colors ${
                        userInputs.userType === 'experienced'
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-semibold">Experienced Professional</div>
                      <div className="text-sm text-gray-600">2+ years experience</div>
                    </button>
                  </div>
                </div>

                {/* LinkedIn URL */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    LinkedIn Profile (Optional)
                  </label>
                  <div className="relative">
                    <Linkedin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="url"
                      value={userInputs.linkedinUrl}
                      onChange={(e) => setUserInputs(prev => ({ ...prev, linkedinUrl: e.target.value }))}
                      placeholder="https://linkedin.com/in/yourprofile"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </div>

                {/* GitHub URL */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    GitHub Profile (Optional)
                  </label>
                  <div className="relative">
                    <Github className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="url"
                      value={userInputs.githubUrl}
                      onChange={(e) => setUserInputs(prev => ({ ...prev, githubUrl: e.target.value }))}
                      placeholder="https://github.com/yourusername"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </div>

                <div className="flex justify-center">
                  <button
                    onClick={handleOptimize}
                    disabled={!userInputs.targetRole.trim() || isOptimizing}
                    className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-xl transition-colors flex items-center space-x-2"
                  >
                    {isOptimizing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Optimizing Resume...</span>
                      </>
                    ) : (
                      <>
                        <TrendingUp className="w-5 h-5" />
                        <span>Generate ATS-Optimized Resume</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Results */}
          {currentStep === 'result' && optimizedResume && (
            <div className="space-y-6">
              {/* Success Message */}
              <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
                <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-green-900 mb-2">
                  ATS-Optimized Resume Generated!
                </h2>
                <p className="text-green-700">
                  Your resume has been optimized for ATS systems and is ready for download.
                </p>
              </div>

              {/* Resume Preview */}
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 border-b">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Your Optimized Resume
                  </h3>
                  <p className="text-gray-600">
                    ATS-friendly format with improved keyword optimization
                  </p>
                </div>
                <ResumePreview resumeData={optimizedResume} userType={userInputs.userType} />
              </div>

              {/* Export Options */}
              <ExportButtons resumeData={optimizedResume} />

              {/* Start Over */}
              <div className="text-center">
                <button
                  onClick={resetBuilder}
                  className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors flex items-center space-x-2 mx-auto"
                >
                  <RefreshCw className="w-5 h-5" />
                  <span>Build Another Resume</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};