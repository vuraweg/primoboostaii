export interface ProjectMatch {
  title: string;
  matchScore: number;
  relevantSkills: string[];
  alignmentReason: string;
}

export interface RecommendedProject {
  id: string;
  title: string;
  type: string;
  focusArea: string;
  priority: 'High' | 'Medium' | 'Low';
  impactScore: number;
  technologies: string[];
  scope: string;
  deliverables: string[];
  industryContext: string;
  timeEstimate: string;
  skillsAddressed: string[];
  projectUrl?: string; // URL to tutorial, GitHub repo, or learning resource
}

export interface ProjectAnalysis {
  matchScore: number;
  matchingProjects: ProjectMatch[];
  recommendedProjects: RecommendedProject[];
  overallAssessment: string;
  priorityActions: string[];
}