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
  RefreshCw,
  BarChart3,
  ArrowRight,
  Award, 
  Zap,
  FileCheck,
  Shield,
  Percent,
  List,
  LayoutGrid
} from 'lucide-react';
import { FileUpload } from './FileUpload';
import { ResumePreview } from './ResumePreview';
import { ExportButtons } from './ExportButtons';
import { ResumeData, UserType } from '../types/resume';
import { optimizeResume } from '../services/geminiService';
import { useAuth } from '../contexts/AuthContext';
import { paymentService } from '../services/paymentService';
import { 
  analyzeResumeForATS, 
  ATSAnalysisResult,
  verifyDocumentFormat, 
  extractKeywordsFromJobDescription, 
  analyzeKeywordPresence 
} from '../services/atsAnalysisService';

interface ATSResumeBuilderProps {
  onBackToHome?: () => void;
}

interface ATSAnalysis {
  originalScore?: number;
  score: number;
  missingSections: string[];
  suggestions: string[];
  improvements: string[];
  keywordDensity: number;
  formatCompliance: number;
  sectionCompleteness: number; 
  keywordAnalysis?: {
    found: string[];
    missing: string[];
    relevance: number;
  };
  formatIssues?: string[];
  sectionScores?: {
    [key: string]: number;
  };
}

interface UserInputs {
  githubUrl: string;
  linkedinUrl: string;
  targetRole: string;
  userType: UserType;
}

export const ATSResumeBuilder: React.FC<ATSResumeBuilderProps> = ({ onBackToHome }) => {
  // ... rest of the component code ...
};