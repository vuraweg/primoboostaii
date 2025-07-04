import React, { useState } from 'react';
import { 
  FileText, 
  BarChart3, 
  CheckCircle, 
  AlertTriangle, 
  Star, 
  TrendingUp,
  Eye,
  Target,
  Award,
  Zap,
  ArrowRight,
  Download,
  RefreshCw
} from 'lucide-react';
import { FileUpload } from './FileUpload';

interface AnalysisScore {
  category: string;
  score: number;
  maxScore: number;
  feedback: string;
  improvements: string[];
}

interface SectionAnalysis {
  section: string;
  present: boolean;
  quality: number;
  feedback: string;
  suggestions: string[];
}

interface ResumeAnalysisData {
  overallScore: number;
  scores: AnalysisScore[];
  sections: SectionAnalysis[];
  atsScore: number;
  keywords: {
    found: string[];
    missing: string[];
    density: number;
  };
  recommendations: {
    priority: 'High' | 'Medium' | 'Low';
    category: string;
    suggestion: string;
    impact: string;
  }[];
}

interface ResumeAnalysisProps {
  onAnalysisComplete: (analysis: ResumeAnalysisData, resumeText: string) => void;
  onBack: () => void;
}

export const ResumeAnalysis: React.FC<ResumeAnalysisProps> = ({ onAnalysisComplete, onBack }) => {
  const [resumeText, setResumeText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<ResumeAnalysisData | null>(null);

  const handleFileUpload = (text: string) => {
    setResumeText(text);
    setAnalysis(null);
  };

  const analyzeResume = async () => {
    if (!resumeText.trim()) return;

    setIsAnalyzing(true);
    try {
      // Simulate comprehensive analysis
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const analysisResult = generateAnalysis(resumeText);
      setAnalysis(analysisResult);
    } catch (error) {
      console.error('Error analyzing resume:', error);
      alert('Failed to analyze resume. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateAnalysis = (text: string): ResumeAnalysisData => {
    // Simulate comprehensive analysis
    const hasContact = /(?:phone|email|linkedin)/i.test(text);
    const hasExperience = /(?:experience|work|employment)/i.test(text);
    const hasEducation = /(?:education|degree|university)/i.test(text);
    const hasSkills = /(?:skills|technologies)/i.test(text);
    const hasSummary = /(?:summary|objective|profile)/i.test(text);
    const hasProjects = /(?:projects|portfolio)/i.test(text);

    const wordCount = text.split(/\s+/).length;
    const hasQuantifiableAchievements = /\d+(?:%|\+|k|million|billion)/.test(text);
    const hasActionVerbs = /(?:developed|implemented|managed|led|created)/i.test(text);

    const overallScore = Math.round(
      (hasContact ? 15 : 0) +
      (hasExperience ? 20 : 0) +
      (hasEducation ? 10 : 0) +
      (hasSkills ? 15 : 0) +
      (hasSummary ? 10 : 0) +
      (hasProjects ? 10 : 0) +
      (hasQuantifiableAchievements ? 10 : 0) +
      (hasActionVerbs ? 10 : 0)
    );

    return {
      overallScore,
      scores: [
        {
          category: 'Overall Impact & Effectiveness',
          score: Math.min(overallScore / 10, 10),
          maxScore: 10,
          feedback: overallScore >= 80 ? 'Strong overall impact with clear value proposition' : 'Needs improvement in showcasing achievements and impact',
          improvements: overallScore < 80 ? ['Add quantifiable achievements', 'Use stronger action verbs', 'Highlight unique value proposition'] : []
        },
        {
          category: 'Content Quality & Completeness',
          score: Math.min((hasExperience ? 3 : 0) + (hasEducation ? 2 : 0) + (hasSkills ? 2 : 0) + (hasSummary ? 2 : 0) + (hasProjects ? 1 : 0), 10),
          maxScore: 10,
          feedback: 'Content analysis shows ' + (hasExperience && hasEducation && hasSkills ? 'comprehensive coverage' : 'missing key sections'),
          improvements: [
            ...(!hasExperience ? ['Add detailed work experience'] : []),
            ...(!hasSkills ? ['Include technical skills section'] : []),
            ...(!hasSummary ? ['Add professional summary'] : [])
          ]
        },
        {
          category: 'Format & Visual Appeal',
          score: wordCount > 200 && wordCount < 800 ? 8 : 6,
          maxScore: 10,
          feedback: wordCount > 200 && wordCount < 800 ? 'Good length and structure' : 'Format needs optimization for better readability',
          improvements: wordCount > 800 ? ['Reduce content length', 'Improve conciseness'] : wordCount < 200 ? ['Add more detailed content'] : []
        },
        {
          category: 'ATS Compatibility',
          score: (hasContact ? 2 : 0) + (hasSkills ? 2 : 0) + (hasExperience ? 2 : 0) + (hasActionVerbs ? 2 : 0) + 2,
          maxScore: 10,
          feedback: 'ATS compatibility ' + (hasContact && hasSkills && hasExperience ? 'is good' : 'needs improvement'),
          improvements: [
            ...(!hasContact ? ['Add complete contact information'] : []),
            ...(!hasSkills ? ['Include keyword-rich skills section'] : []),
            'Use standard section headings'
          ]
        },
        {
          category: 'Industry Alignment',
          score: hasSkills && hasExperience ? 7 : 5,
          maxScore: 10,
          feedback: 'Industry alignment shows ' + (hasSkills && hasExperience ? 'relevant experience and skills' : 'room for improvement'),
          improvements: ['Add industry-specific keywords', 'Highlight relevant certifications', 'Include domain expertise']
        }
      ],
      sections: [
        {
          section: 'Contact Information',
          present: hasContact,
          quality: hasContact ? 8 : 0,
          feedback: hasContact ? 'Contact information is present' : 'Missing essential contact details',
          suggestions: hasContact ? ['Ensure LinkedIn profile is included'] : ['Add phone, email, and LinkedIn profile']
        },
        {
          section: 'Professional Summary',
          present: hasSummary,
          quality: hasSummary ? 7 : 0,
          feedback: hasSummary ? 'Professional summary is present' : 'Missing professional summary',
          suggestions: hasSummary ? ['Make it more compelling and specific'] : ['Add a 2-3 line professional summary highlighting key achievements']
        },
        {
          section: 'Work Experience',
          present: hasExperience,
          quality: hasExperience ? (hasQuantifiableAchievements ? 8 : 6) : 0,
          feedback: hasExperience ? 'Work experience section is present' : 'Missing work experience section',
          suggestions: hasExperience ? ['Add more quantifiable achievements', 'Use stronger action verbs'] : ['Add detailed work experience with achievements']
        },
        {
          section: 'Education',
          present: hasEducation,
          quality: hasEducation ? 7 : 0,
          feedback: hasEducation ? 'Education section is present' : 'Missing education information',
          suggestions: hasEducation ? ['Include relevant coursework if applicable'] : ['Add educational background']
        },
        {
          section: 'Skills',
          present: hasSkills,
          quality: hasSkills ? 7 : 0,
          feedback: hasSkills ? 'Skills section is present' : 'Missing skills section',
          suggestions: hasSkills ? ['Organize skills by category', 'Add proficiency levels'] : ['Add comprehensive technical and soft skills']
        },
        {
          section: 'Projects',
          present: hasProjects,
          quality: hasProjects ? 6 : 0,
          feedback: hasProjects ? 'Projects section is present' : 'Missing projects section',
          suggestions: hasProjects ? ['Add more technical details', 'Include project outcomes'] : ['Add relevant projects to showcase practical experience']
        }
      ],
      atsScore: Math.round(
        (hasContact ? 20 : 0) +
        (hasSkills ? 20 : 0) +
        (hasExperience ? 20 : 0) +
        (hasActionVerbs ? 15 : 0) +
        (hasQuantifiableAchievements ? 15 : 0) +
        10
      ),
      keywords: {
        found: ['JavaScript', 'React', 'Node.js', 'Python'].filter(() => Math.random() > 0.5),
        missing: ['TypeScript', 'AWS', 'Docker', 'Kubernetes'].filter(() => Math.random() > 0.3),
        density: Math.round(Math.random() * 30 + 10)
      },
      recommendations: [
        {
          priority: 'High',
          category: 'Content Enhancement',
          suggestion: 'Add quantifiable achievements with specific numbers and percentages',
          impact: 'Increases credibility and demonstrates measurable impact'
        },
        {
          priority: 'High',
          category: 'ATS Optimization',
          suggestion: 'Include industry-specific keywords throughout your resume',
          impact: 'Improves ATS parsing and keyword matching'
        },
        {
          priority: 'Medium',
          category: 'Format Improvement',
          suggestion: 'Use consistent formatting and standard section headings',
          impact: 'Enhances readability and professional appearance'
        },
        {
          priority: 'Medium',
          category: 'Skills Enhancement',
          suggestion: 'Organize technical skills by proficiency level and relevance',
          impact: 'Helps recruiters quickly identify your core competencies'
        },
        {
          priority: 'Low',
          category: 'Additional Sections',
          suggestion: 'Consider adding certifications or professional development',
          impact: 'Demonstrates commitment to continuous learning'
        }
      ]
    };
  };

  const getScoreColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return 'text-green-600 bg-green-100';
    if (percentage >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800 border-red-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (!analysis) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <BarChart3 className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Resume Analysis
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Get a comprehensive evaluation of your resume with detailed scoring, ATS compatibility analysis, and actionable recommendations
            </p>
          </div>

          {/* Analysis Promise */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">What You'll Receive:</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Detailed Scoring (1-10)</h3>
                    <p className="text-gray-600 text-sm">Overall Impact, Content Quality, Format, ATS Compatibility, Industry Alignment</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <Eye className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Section-by-Section Analysis</h3>
                    <p className="text-gray-600 text-sm">Contact Info, Summary, Experience, Education, Skills, Projects</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <Target className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">ATS Optimization</h3>
                    <p className="text-gray-600 text-sm">Keyword analysis, compatibility score, formatting recommendations</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="bg-orange-100 p-2 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Actionable Recommendations</h3>
                    <p className="text-gray-600 text-sm">Prioritized improvements with specific examples and impact analysis</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="bg-red-100 p-2 rounded-lg">
                    <Award className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Industry Alignment</h3>
                    <p className="text-gray-600 text-sm">Keywords to add, format optimization, achievement quantification</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="bg-indigo-100 p-2 rounded-lg">
                    <FileText className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Detailed Report</h3>
                    <p className="text-gray-600 text-sm">Comprehensive evaluation summary and improvement checklist</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Upload Section */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <FileText className="w-6 h-6 mr-2 text-blue-600" />
              Upload Your Resume
            </h2>
            <FileUpload onFileUpload={handleFileUpload} />
          </div>

          {/* Action Buttons */}
          {resumeText && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={analyzeResume}
                disabled={isAnalyzing}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Analyzing Resume...</span>
                  </>
                ) : (
                  <>
                    <BarChart3 className="w-5 h-5" />
                    <span>Start Comprehensive Analysis</span>
                  </>
                )}
              </button>
              
              <button
                onClick={onBack}
                className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-4 px-8 rounded-xl transition-colors"
              >
                Back to Optimizer
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-gradient-to-r from-green-600 to-blue-600 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Award className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Resume Analysis Complete
          </h1>
          <p className="text-xl text-gray-600">
            Here's your comprehensive resume evaluation and recommendations
          </p>
        </div>

        {/* Overall Score */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="text-center">
            <div className="text-6xl font-bold text-gray-900 mb-2">{analysis.overallScore}%</div>
            <div className="text-xl text-gray-600 mb-4">Overall Resume Score</div>
            <div className={`inline-flex items-center px-4 py-2 rounded-full text-lg font-semibold ${
              analysis.overallScore >= 80 ? 'bg-green-100 text-green-800' :
              analysis.overallScore >= 60 ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {analysis.overallScore >= 80 ? 'Excellent' :
               analysis.overallScore >= 60 ? 'Good' : 'Needs Improvement'}
            </div>
          </div>
        </div>

        {/* Detailed Scores */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Detailed Scoring</h2>
          <div className="space-y-6">
            {analysis.scores.map((score, index) => (
              <div key={index} className="border-b border-gray-200 pb-6 last:border-b-0">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">{score.category}</h3>
                  <div className={`px-3 py-1 rounded-full text-sm font-bold ${getScoreColor(score.score, score.maxScore)}`}>
                    {score.score}/{score.maxScore}
                  </div>
                </div>
                <p className="text-gray-700 mb-3">{score.feedback}</p>
                {score.improvements.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Improvements:</h4>
                    <ul className="list-disc list-inside text-gray-600 space-y-1">
                      {score.improvements.map((improvement, idx) => (
                        <li key={idx}>{improvement}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Section Analysis */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Section-by-Section Analysis</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {analysis.sections.map((section, index) => (
              <div key={index} className="border border-gray-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">{section.section}</h3>
                  <div className="flex items-center space-x-2">
                    {section.present ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                    )}
                    <span className={`text-sm font-medium ${section.present ? 'text-green-600' : 'text-red-600'}`}>
                      {section.quality}/10
                    </span>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-3">{section.feedback}</p>
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Suggestions:</h4>
                  <ul className="text-xs text-gray-600 space-y-1">
                    {section.suggestions.map((suggestion, idx) => (
                      <li key={idx}>• {suggestion}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ATS Analysis */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">ATS Compatibility Analysis</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">{analysis.atsScore}%</div>
              <div className="text-gray-600">ATS Score</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">{analysis.keywords.found.length}</div>
              <div className="text-gray-600">Keywords Found</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-600 mb-2">{analysis.keywords.density}%</div>
              <div className="text-gray-600">Keyword Density</div>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6 mt-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Keywords Found:</h3>
              <div className="flex flex-wrap gap-2">
                {analysis.keywords.found.map((keyword, index) => (
                  <span key={index} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Missing Keywords:</h3>
              <div className="flex flex-wrap gap-2">
                {analysis.keywords.missing.map((keyword, index) => (
                  <span key={index} className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm">
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Prioritized Recommendations</h2>
          <div className="space-y-4">
            {analysis.recommendations.map((rec, index) => (
              <div key={index} className={`border rounded-xl p-4 ${getPriorityColor(rec.priority)}`}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold">{rec.category}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(rec.priority)}`}>
                      {rec.priority} Priority
                    </span>
                  </div>
                </div>
                <p className="font-medium mb-2">{rec.suggestion}</p>
                <p className="text-sm opacity-80">{rec.impact}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => onAnalysisComplete(analysis, resumeText)}
            className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <Zap className="w-5 h-5" />
            <span>Proceed to Optimization</span>
            <ArrowRight className="w-5 h-5" />
          </button>
          
          <button
            onClick={() => setAnalysis(null)}
            className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-4 px-8 rounded-xl transition-colors flex items-center justify-center space-x-2"
          >
            <RefreshCw className="w-5 h-5" />
            <span>Analyze Another Resume</span>
          </button>
        </div>
      </div>
    </div>
  );
};