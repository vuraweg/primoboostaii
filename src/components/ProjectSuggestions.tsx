import React, { useState } from 'react';
import { 
  Lightbulb, 
  ExternalLink, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Code, 
  Target,
  Zap,
  Star,
  ArrowRight,
  BarChart3,
  Loader2
} from 'lucide-react';
import { ProjectAnalysisResult, ProjectSuggestion } from '../types/projectAnalysis';
import { projectSuggestionService } from '../services/projectSuggestionService';

interface ProjectSuggestionsProps {
  jobDescription: string;
  onClose?: () => void;
}

export const ProjectSuggestions: React.FC<ProjectSuggestionsProps> = ({ 
  jobDescription, 
  onClose 
}) => {
  const [analysis, setAnalysis] = useState<ProjectAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeJobDescription = async () => {
    if (!jobDescription.trim()) {
      setError('Please provide a job description to analyze');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await projectSuggestionService.analyzeAndSuggest(jobDescription);
      setAnalysis(result);
    } catch (err) {
      console.error('Project analysis error:', err);
      setError('Failed to analyze job description. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800 border-green-200';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Advanced': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600 bg-green-100';
    if (score >= 70) return 'text-blue-600 bg-blue-100';
    if (score >= 50) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 85) return <CheckCircle className="w-4 h-4" />;
    if (score >= 70) return <TrendingUp className="w-4 h-4" />;
    return <AlertTriangle className="w-4 h-4" />;
  };

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-4 sm:p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="bg-purple-600 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mr-3 sm:mr-4">
              <Lightbulb className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">Project Suggestions</h2>
              <p className="text-xs sm:text-sm text-gray-600">AI-powered project recommendations based on job requirements</p>
            </div>
          </div>
          
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              ×
            </button>
          )}
        </div>
      </div>

      <div className="p-4 sm:p-6">
        {/* Analyze Button */}
        {!analysis && (
          <div className="text-center mb-6">
            <button
              onClick={analyzeJobDescription}
              disabled={isLoading || !jobDescription.trim()}
              className={`inline-flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                isLoading || !jobDescription.trim()
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Analyzing Job Description...</span>
                </>
              ) : (
                <>
                  <Target className="w-5 h-5" />
                  <span>Analyze & Get Project Suggestions</span>
                </>
              )}
            </button>
            
            {!jobDescription.trim() && (
              <p className="text-sm text-gray-500 mt-2">
                Please add a job description to get personalized project suggestions
              </p>
            )}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <div className="flex items-start">
              <AlertTriangle className="w-5 h-5 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-800 font-medium">Analysis Failed</p>
                <p className="text-red-700 text-sm mt-1">{error}</p>
                <button
                  onClick={analyzeJobDescription}
                  className="text-red-600 text-sm mt-2 underline hover:no-underline"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Analysis Results */}
        {analysis && (
          <div className="space-y-6">
            {/* Overall Score and Summary */}
            <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
                  Analysis Overview
                </h3>
                <div className={`px-3 py-1 rounded-full text-sm font-bold ${getScoreColor(analysis.overall_match_score || 0)}`}>
                  {analysis.overall_match_score}% Match
                </div>
              </div>
              
              {analysis.analysis_summary && (
                <p className="text-gray-700 mb-4">{analysis.analysis_summary}</p>
              )}

              {/* Missing Skills */}
              {analysis.missing_skills.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Key Skills to Focus On:</h4>
                  <div className="flex flex-wrap gap-2">
                    {analysis.missing_skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Recommendation Alert */}
            {analysis.recommendation && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <div className="flex items-start">
                  <AlertTriangle className="w-5 h-5 text-amber-600 mr-3 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-amber-800 font-medium mb-1">Alignment Improvement Needed</p>
                    <p className="text-amber-700 text-sm">{analysis.recommendation}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Project Suggestions */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Code className="w-5 h-5 mr-2 text-purple-600" />
                Recommended Projects ({analysis.projects.length})
              </h3>
              
              <div className="grid gap-4">
                {analysis.projects.map((project, index) => (
                  <ProjectCard key={index} project={project} />
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
              <button
                onClick={analyzeJobDescription}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors flex items-center justify-center space-x-2"
              >
                <Zap className="w-4 h-4" />
                <span>Re-analyze</span>
              </button>
              
              {onClose && (
                <button
                  onClick={onClose}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-xl transition-colors"
                >
                  Close
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Project Card Component
const ProjectCard: React.FC<{ project: ProjectSuggestion }> = ({ project }) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800 border-green-200';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Advanced': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600 bg-green-100';
    if (score >= 70) return 'text-blue-600 bg-blue-100';
    if (score >= 50) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 85) return <CheckCircle className="w-4 h-4" />;
    if (score >= 70) return <TrendingUp className="w-4 h-4" />;
    return <AlertTriangle className="w-4 h-4" />;
  };

  return (
    <div className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="text-lg font-semibold text-gray-900 mb-1">{project.title}</h4>
          <p className="text-gray-600 text-sm mb-2">{project.teaches}</p>
        </div>
        
        <div className={`px-2 py-1 rounded-lg text-xs font-bold flex items-center space-x-1 ${getScoreColor(project.match_score)}`}>
          {getScoreIcon(project.match_score)}
          <span>{project.match_score}%</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        <span className={`px-2 py-1 rounded-md text-xs font-medium border ${getDifficultyColor(project.difficulty)}`}>
          {project.difficulty}
        </span>
        
        {project.responsive && (
          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-xs font-medium border border-blue-200">
            Responsive
          </span>
        )}
      </div>

      <div className="mb-3">
        <p className="text-sm text-gray-700">
          <span className="font-medium">Tech Stack:</span> {project.stack}
        </p>
      </div>

      <div className="flex items-center justify-between">
        <a
          href={project.link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center space-x-1 text-purple-600 hover:text-purple-700 font-medium text-sm transition-colors"
        >
          <span>View Tutorial</span>
          <ExternalLink className="w-4 h-4" />
        </a>
        
        <button className="text-gray-400 hover:text-purple-600 transition-colors">
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};