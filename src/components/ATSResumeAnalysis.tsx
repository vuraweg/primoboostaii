import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  CheckCircle, 
  AlertTriangle, 
  Target, 
  TrendingUp,
  Zap,
  ArrowRight,
  RefreshCw,
  Edit,
  Eye,
  Upload,
  Download,
  Briefcase,
  GraduationCap,
  Code,
  Award,
  User,
  Sparkles,
  Github,
  Linkedin
} from 'lucide-react';
import { FileUpload } from './FileUpload';
import { ResumePreview } from './ResumePreview';
import { ExportButtons } from './ExportButtons';
import { ResumeData, UserType } from '../types/resume';
import { analyzeResumeForATS } from '../services/atsAnalysisService';
import { optimizeResume } from '../services/geminiService';

interface ATSResumeAnalysisProps {
  onBack?: () => void;
}

export const ATSResumeAnalysis: React.FC<ATSResumeAnalysisProps> = ({ onBack }) => {
  const [resumeText, setResumeText] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState<'upload' | 'analysis' | 'optimize' | 'result'>('upload');
  const [userType, setUserType] = useState<UserType>('experienced');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [optimizedResume, setOptimizedResume] = useState<ResumeData | null>(null);
  const [formData, setFormData] = useState({
    summary: '',
    experience: '',
    education: '',
    skills: '',
    certifications: '',
    additionalDetails: ''
  });
  const [showComparison, setShowComparison] = useState(false);

  const handleFileUpload = (text: string) => {
    setResumeText(text);
  };

  const analyzeResume = async () => {
    if (!resumeText.trim()) {
      alert('Please upload your resume first.');
      return;
    }

    setIsAnalyzing(true);
    try {
      const result = await analyzeResumeForATS(resumeText, targetRole);
      setAnalysisResult(result);
      setCurrentStep('analysis');
      
      // Pre-fill form data based on missing sections
      const newFormData = { ...formData };
      if (result.missingSections.includes('Professional Summary')) {
        newFormData.summary = '';
      }
      if (result.missingSections.includes('Work Experience')) {
        newFormData.experience = '';
      }
      if (result.missingSections.includes('Education')) {
        newFormData.education = '';
      }
      if (result.missingSections.includes('Technical Skills')) {
        newFormData.skills = '';
      }
      if (result.missingSections.includes('Certifications')) {
        newFormData.certifications = '';
      }
      setFormData(newFormData);
      
    } catch (error) {
      console.error('Error analyzing resume:', error);
      alert('Failed to analyze resume. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleOptimize = async () => {
    if (!resumeText.trim()) {
      alert('Please upload your resume first.');
      return;
    }

    setIsOptimizing(true);
    setCurrentStep('optimize');
    
    try {
      // Create enhanced resume text with form data for missing sections
      let enhancedResumeText = resumeText;
      
      if (formData.summary.trim()) {
        enhancedResumeText = `PROFESSIONAL SUMMARY:\n${formData.summary}\n\n${enhancedResumeText}`;
      }
      
      if (formData.experience.trim()) {
        enhancedResumeText = `${enhancedResumeText}\n\nWORK EXPERIENCE:\n${formData.experience}`;
      }
      
      if (formData.education.trim()) {
        enhancedResumeText = `${enhancedResumeText}\n\nEDUCATION:\n${formData.education}`;
      }
      
      if (formData.skills.trim()) {
        enhancedResumeText = `${enhancedResumeText}\n\nSKILLS:\n${formData.skills}`;
      }
      
      if (formData.certifications.trim()) {
        enhancedResumeText = `${enhancedResumeText}\n\nCERTIFICATIONS:\n${formData.certifications}`;
      }
      
      if (formData.additionalDetails.trim()) {
        enhancedResumeText = `${enhancedResumeText}\n\nADDITIONAL INFORMATION:\n${formData.additionalDetails}`;
      }
      
      // Create job description from target role
      const jobDescription = `Position: ${targetRole}\n\nWe are looking for a qualified ${targetRole} to join our team. The ideal candidate should have relevant experience and skills in this field.`;
      
      // Optimize resume
      const optimized = await optimizeResume(
        enhancedResumeText,
        jobDescription,
        userType,
        linkedinUrl,
        githubUrl
      );
      
      setOptimizedResume(optimized);
      setCurrentStep('result');
      
      // Get updated ATS score
      const updatedAnalysis = await analyzeResumeForATS(JSON.stringify(optimized), targetRole);
      setAnalysisResult({
        ...analysisResult,
        originalScore: analysisResult.score,
        score: updatedAnalysis.score,
        originalMissingSections: [...analysisResult.missingSections],
        missingSections: updatedAnalysis.missingSections,
        improvements: updatedAnalysis.improvements
      });
      
    } catch (error) {
      console.error('Error optimizing resume:', error);
      alert('Failed to optimize resume. Please try again.');
      setCurrentStep('analysis');
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const resetAnalysis = () => {
    setResumeText('');
    setTargetRole('');
    setAnalysisResult(null);
    setOptimizedResume(null);
    setCurrentStep('upload');
    setFormData({
      summary: '',
      experience: '',
      education: '',
      skills: '',
      certifications: '',
      additionalDetails: ''
    });
    setShowComparison(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Target className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            ATS Resume Analysis
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Analyze and optimize your resume for Applicant Tracking Systems to increase your chances of getting interviews
          </p>
        </div>

        {/* Progress Steps */}
        <div className="hidden md:flex justify-center mb-8">
          <div className="flex items-center">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
              currentStep === 'upload' 
                ? 'bg-blue-600 text-white' 
                : currentStep !== 'upload'
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-gray-600'
            }`}>
              <Upload className="w-5 h-5" />
            </div>
            <span className="ml-2 text-sm font-medium text-gray-700">Upload</span>
            <div className="w-16 h-0.5 bg-gray-300 mx-4" />
            
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
              currentStep === 'analysis' 
                ? 'bg-blue-600 text-white' 
                : currentStep === 'optimize' || currentStep === 'result'
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-gray-600'
            }`}>
              <Eye className="w-5 h-5" />
            </div>
            <span className="ml-2 text-sm font-medium text-gray-700">Analysis</span>
            <div className="w-16 h-0.5 bg-gray-300 mx-4" />
            
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
              currentStep === 'optimize' 
                ? 'bg-blue-600 text-white' 
                : currentStep === 'result'
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-gray-600'
            }`}>
              <Edit className="w-5 h-5" />
            </div>
            <span className="ml-2 text-sm font-medium text-gray-700">Optimize</span>
            <div className="w-16 h-0.5 bg-gray-300 mx-4" />
            
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
              currentStep === 'result' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-600'
            }`}>
              <CheckCircle className="w-5 h-5" />
            </div>
            <span className="ml-2 text-sm font-medium text-gray-700">Result</span>
          </div>
        </div>

        {/* Mobile Progress Indicator */}
        <div className="md:hidden mb-6">
          <div className="bg-white rounded-xl shadow-md p-4">
            <div className="flex justify-between mb-2">
              {['upload', 'analysis', 'optimize', 'result'].map((step, index) => (
                <div 
                  key={step} 
                  className={`flex flex-col items-center ${
                    step === currentStep ? 'opacity-100' : 'opacity-60'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${
                    step === currentStep 
                      ? 'bg-blue-600 text-white' 
                      : index < ['upload', 'analysis', 'optimize', 'result'].indexOf(currentStep)
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {step === 'upload' && <Upload className="w-4 h-4" />}
                    {step === 'analysis' && <Eye className="w-4 h-4" />}
                    {step === 'optimize' && <Edit className="w-4 h-4" />}
                    {step === 'result' && <CheckCircle className="w-4 h-4" />}
                  </div>
                  <span className="text-xs font-medium text-gray-700 text-center">
                    {step === 'upload' && 'Upload'}
                    {step === 'analysis' && 'Analysis'}
                    {step === 'optimize' && 'Optimize'}
                    {step === 'result' && 'Result'}
                  </span>
                </div>
              ))}
            </div>
            
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-600 transition-all duration-300"
                style={{ width: `${
                  currentStep === 'upload' ? 25 :
                  currentStep === 'analysis' ? 50 :
                  currentStep === 'optimize' ? 75 : 100
                }%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Step Content */}
        {currentStep === 'upload' && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <FileText className="w-6 h-6 mr-2 text-blue-600" />
              Upload Resume & Enter Target Role
            </h2>
            
            <div className="space-y-6">
              {/* Resume Upload */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Upload Your Resume
                </h3>
                <FileUpload onFileUpload={handleFileUpload} />
              </div>
              
              {/* Target Role */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Enter Your Target Role
                </h3>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    placeholder="e.g., Senior Software Engineer, Data Scientist, Product Manager"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  This helps us analyze your resume against specific job requirements
                </p>
              </div>
              
              {/* Experience Level */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Experience Level
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setUserType('fresher')}
                    className={`p-4 rounded-xl border-2 transition-colors ${
                      userType === 'fresher'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-semibold">Fresher/New Graduate</div>
                    <div className="text-sm text-gray-600">0-2 years experience</div>
                  </button>
                  <button
                    onClick={() => setUserType('experienced')}
                    className={`p-4 rounded-xl border-2 transition-colors ${
                      userType === 'experienced'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-semibold">Experienced Professional</div>
                    <div className="text-sm text-gray-600">2+ years experience</div>
                  </button>
                </div>
              </div>
              
              {/* Action Button */}
              <div className="flex justify-center pt-4">
                <button
                  onClick={analyzeResume}
                  disabled={!resumeText.trim() || !targetRole.trim() || isAnalyzing}
                  className={`py-3 px-6 rounded-xl font-semibold transition-all duration-300 flex items-center space-x-2 ${
                    !resumeText.trim() || !targetRole.trim() || isAnalyzing
                      ? 'bg-gray-400 text-white cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                  }`}
                >
                  {isAnalyzing ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span>Analyzing Resume...</span>
                    </>
                  ) : (
                    <>
                      <Target className="w-5 h-5" />
                      <span>Analyze for ATS Compatibility</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {currentStep === 'analysis' && analysisResult && (
          <div className="space-y-8">
            {/* ATS Score Card */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">ATS Compatibility Score</h2>
                  <div className="bg-white text-blue-600 text-2xl font-bold w-16 h-16 rounded-full flex items-center justify-center">
                    {analysisResult.score}%
                  </div>
                </div>
                <p className="mt-2 text-blue-100">
                  {analysisResult.score >= 90 
                    ? 'Excellent! Your resume is highly ATS-compatible.' 
                    : analysisResult.score >= 70
                    ? 'Good, but there\'s room for improvement in ATS compatibility.'
                    : 'Your resume needs significant ATS optimization.'}
                </p>
              </div>
              
              <div className="p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Missing Sections */}
                  {analysisResult.missingSections.length > 0 && (
                    <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                      <h3 className="text-lg font-semibold text-red-800 mb-3 flex items-center">
                        <AlertTriangle className="w-5 h-5 mr-2" />
                        Missing Sections
                      </h3>
                      <ul className="space-y-2">
                        {analysisResult.missingSections.map((section: string, index: number) => (
                          <li key={index} className="flex items-center text-red-700">
                            <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                            {section}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {/* Strengths */}
                  <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                    <h3 className="text-lg font-semibold text-green-800 mb-3 flex items-center">
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Resume Strengths
                    </h3>
                    <ul className="space-y-2">
                      {analysisResult.strengths.map((strength: string, index: number) => (
                        <li key={index} className="flex items-center text-green-700">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                {/* Improvement Suggestions */}
                <div className="mt-6 bg-blue-50 rounded-xl p-4 border border-blue-200">
                  <h3 className="text-lg font-semibold text-blue-800 mb-3 flex items-center">
                    <Zap className="w-5 h-5 mr-2" />
                    Improvement Suggestions
                  </h3>
                  <ul className="space-y-2">
                    {analysisResult.suggestions.map((suggestion: string, index: number) => (
                      <li key={index} className="flex items-start text-blue-700">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-2 mt-2 flex-shrink-0"></div>
                        <span>{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                {/* Action Buttons */}
                <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
                  {analysisResult.score < 90 && (
                    <button
                      onClick={() => setCurrentStep('optimize')}
                      className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      <Sparkles className="w-5 h-5" />
                      <span>Optimize Resume</span>
                    </button>
                  )}
                  
                  <button
                    onClick={resetAnalysis}
                    className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors flex items-center justify-center space-x-2"
                  >
                    <RefreshCw className="w-5 h-5" />
                    <span>Start Over</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentStep === 'optimize' && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <Edit className="w-6 h-6 mr-2 text-green-600" />
              Complete Missing Information
            </h2>
            
            <div className="space-y-6">
              {/* Professional Summary */}
              {analysisResult.missingSections.includes('Professional Summary') && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <User className="w-5 h-5 mr-2 text-blue-600" />
                    Professional Summary
                  </h3>
                  <textarea
                    value={formData.summary}
                    onChange={(e) => handleInputChange('summary', e.target.value)}
                    placeholder="Write a compelling 2-3 sentence summary highlighting your key skills, experience, and value proposition..."
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-32"
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    A strong professional summary increases your resume's impact by 40%
                  </p>
                </div>
              )}
              
              {/* Work Experience */}
              {analysisResult.missingSections.includes('Work Experience') && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <Briefcase className="w-5 h-5 mr-2 text-blue-600" />
                    Work Experience
                  </h3>
                  <textarea
                    value={formData.experience}
                    onChange={(e) => handleInputChange('experience', e.target.value)}
                    placeholder="List your work experience with company names, job titles, dates, and key achievements..."
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-32"
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Format: Job Title at Company (Date Range) followed by bullet points of achievements
                  </p>
                </div>
              )}
              
              {/* Education */}
              {analysisResult.missingSections.includes('Education') && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <GraduationCap className="w-5 h-5 mr-2 text-blue-600" />
                    Education
                  </h3>
                  <textarea
                    value={formData.education}
                    onChange={(e) => handleInputChange('education', e.target.value)}
                    placeholder="List your educational background including degrees, institutions, and graduation dates..."
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-32"
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Format: Degree, Institution, Graduation Year (e.g., Bachelor of Science in Computer Science, University of California, 2020)
                  </p>
                </div>
              )}
              
              {/* Skills */}
              {analysisResult.missingSections.includes('Technical Skills') && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <Code className="w-5 h-5 mr-2 text-blue-600" />
                    Technical Skills
                  </h3>
                  <textarea
                    value={formData.skills}
                    onChange={(e) => handleInputChange('skills', e.target.value)}
                    placeholder="List your technical skills, programming languages, tools, and technologies..."
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-32"
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Group skills by category (e.g., Programming Languages: JavaScript, Python, Java)
                  </p>
                </div>
              )}
              
              {/* Certifications */}
              {analysisResult.missingSections.includes('Certifications') && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <Award className="w-5 h-5 mr-2 text-blue-600" />
                    Certifications
                  </h3>
                  <textarea
                    value={formData.certifications}
                    onChange={(e) => handleInputChange('certifications', e.target.value)}
                    placeholder="List relevant certifications, including name, issuing organization, and date..."
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-32"
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Format: Certification Name, Issuing Organization, Date (e.g., AWS Certified Solutions Architect, Amazon Web Services, 2022)
                  </p>
                </div>
              )}
              
              {/* Additional Details */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-blue-600" />
                  Additional Details
                </h3>
                <textarea
                  value={formData.additionalDetails}
                  onChange={(e) => handleInputChange('additionalDetails', e.target.value)}
                  placeholder="Any other information you'd like to include (projects, achievements, languages, etc.)..."
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-32"
                />
              </div>
              
              {/* Professional Links */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <Linkedin className="w-5 h-5 mr-2 text-blue-600" />
                    LinkedIn Profile (Optional)
                  </h3>
                  <input
                    type="url"
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    placeholder="https://linkedin.com/in/yourprofile"
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <Github className="w-5 h-5 mr-2 text-blue-600" />
                    GitHub Profile (Optional)
                  </h3>
                  <input
                    type="url"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    placeholder="https://github.com/yourusername"
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <button
                  onClick={handleOptimize}
                  disabled={isOptimizing}
                  className={`py-3 px-6 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2 ${
                    isOptimizing
                      ? 'bg-gray-400 text-white cursor-not-allowed'
                      : 'bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                  }`}
                >
                  {isOptimizing ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span>Optimizing Resume...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      <span>Generate ATS-Optimized Resume</span>
                    </>
                  )}
                </button>
                
                <button
                  onClick={() => setCurrentStep('analysis')}
                  className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors flex items-center justify-center space-x-2"
                >
                  <ArrowRight className="w-5 h-5 transform rotate-180" />
                  <span>Back to Analysis</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {currentStep === 'result' && optimizedResume && (
          <div className="space-y-8">
            {/* Success Message */}
            <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
              <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-green-900 mb-2">
                ATS-Optimized Resume Generated!
              </h2>
              <p className="text-green-700">
                Your resume has been optimized for ATS systems with a {analysisResult.score - analysisResult.originalScore}% improvement in compatibility score.
              </p>
            </div>
            
            {/* Score Comparison */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
                ATS Score Improvement
              </h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div className="text-center">
                    <div className="text-lg font-medium text-gray-500 mb-2">Original Score</div>
                    <div className="text-4xl font-bold text-gray-700 mb-2">{analysisResult.originalScore}%</div>
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      analysisResult.originalScore >= 90 ? 'bg-green-100 text-green-800' :
                      analysisResult.originalScore >= 70 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {analysisResult.originalScore >= 90 ? 'Excellent' :
                       analysisResult.originalScore >= 70 ? 'Good' : 'Needs Improvement'}
                    </div>
                  </div>
                </div>
                
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                  <div className="text-center">
                    <div className="text-lg font-medium text-blue-600 mb-2">Optimized Score</div>
                    <div className="text-4xl font-bold text-blue-700 mb-2">{analysisResult.score}%</div>
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      analysisResult.score >= 90 ? 'bg-green-100 text-green-800' :
                      analysisResult.score >= 70 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {analysisResult.score >= 90 ? 'Excellent' :
                       analysisResult.score >= 70 ? 'Good' : 'Needs Improvement'}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Improvements */}
              <div className="mt-6">
                <h4 className="font-semibold text-gray-900 mb-3">Key Improvements:</h4>
                <ul className="space-y-2">
                  {analysisResult.originalMissingSections.filter((section: string) => 
                    !analysisResult.missingSections.includes(section)
                  ).map((section: string, index: number) => (
                    <li key={index} className="flex items-center text-green-700">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Added missing {section} section
                    </li>
                  ))}
                  <li className="flex items-center text-green-700">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Enhanced keyword optimization for ATS compatibility
                  </li>
                  <li className="flex items-center text-green-700">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Improved formatting for better readability
                  </li>
                </ul>
              </div>
              
              {/* Comparison Toggle */}
              <div className="mt-6 flex justify-center">
                <button
                  onClick={() => setShowComparison(!showComparison)}
                  className="bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
                >
                  <Eye className="w-4 h-4" />
                  <span>{showComparison ? 'Hide Comparison' : 'Show Before/After Comparison'}</span>
                </button>
              </div>
            </div>
            
            {/* Before/After Comparison */}
            {showComparison && (
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                  <div className="bg-gray-100 p-4 border-b border-gray-200">
                    <h3 className="font-bold text-gray-900">Original Resume</h3>
                  </div>
                  <div className="p-4 max-h-96 overflow-y-auto">
                    <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono">
                      {resumeText}
                    </pre>
                  </div>
                </div>
                
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                  <div className="bg-blue-100 p-4 border-b border-blue-200">
                    <h3 className="font-bold text-blue-900">Optimized Resume</h3>
                  </div>
                  <ResumePreview resumeData={optimizedResume} userType={userType} />
                </div>
              </div>
            )}
            
            {/* Optimized Resume Preview */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 border-b">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Your ATS-Optimized Resume
                </h3>
                <p className="text-gray-600">
                  ATS-friendly format with enhanced keywords and professional structure
                </p>
              </div>
              <ResumePreview resumeData={optimizedResume} userType={userType} />
            </div>
            
            {/* Export Options */}
            <ExportButtons resumeData={optimizedResume} />
            
            {/* Action Buttons */}
            <div className="flex justify-center">
              <button
                onClick={resetAnalysis}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors flex items-center justify-center space-x-2"
              >
                <RefreshCw className="w-5 h-5" />
                <span>Start New Analysis</span>
              </button>
            </div>
          </div>
        )}
        
        {/* Back Button */}
        {onBack && (
          <div className="mt-8 text-center">
            <button
              onClick={onBack}
              className="text-gray-600 hover:text-gray-900 font-medium transition-colors flex items-center space-x-2 mx-auto"
            >
              <ArrowRight className="w-4 h-4 transform rotate-180" />
              <span>Back to Resume Optimizer</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};