export interface ProjectSuggestion {
  title: string;
  teaches: string;
  stack: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  link: string;
  match_score: number;
  responsive?: boolean;
}

export interface ProjectAnalysisResult {
  missing_skills: string[];
  projects: ProjectSuggestion[];
  recommendation?: string;
  overall_match_score?: number;
  analysis_summary?: string;
}

export interface JDAnalysis {
  required_skills: string[];
  preferred_skills: string[];
  technologies: string[];
  experience_level: string;
  domain: string;
  role_type: string;
}