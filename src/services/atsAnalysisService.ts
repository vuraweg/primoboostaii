import { ResumeData } from '../types/resume';

const GEMINI_API_KEY = 'AIzaSyAYxmudWmbhrzaFTg2btswt6V2QHiAR_BE';

export interface ATSAnalysisResult {
  score: number;
  missingSections: string[];
  suggestions: string[];
  strengths: string[];
  improvements: string[];
  keywordDensity: number;
  formatCompliance: number;
  sectionCompleteness: number;
  keywordAnalysis: {
    found: string[];
    missing: string[];
    relevance: number;
  };
  formatIssues: string[];
  sectionScores: {
    [key: string]: number;
  };
}

export interface ATSAnalysisResult {
  score: number;
  missingSections: string[];
  suggestions: string[];
  strengths: string[];
  improvements: string[];
  keywordDensity: number;
  formatCompliance: number;
  sectionCompleteness: number;
}

export const analyzeResumeForATS = async (resumeText: string, targetRole?: string): Promise<ATSAnalysisResult> => {
  const prompt = `You are an expert ATS (Applicant Tracking System) analyzer and resume optimization specialist. Analyze the provided resume for ATS compliance and provide detailed feedback.

RESUME CONTENT:
${resumeText}

${targetRole ? `TARGET ROLE: ${targetRole}` : ''}

ANALYSIS REQUIREMENTS:

1. ATS COMPLIANCE SCORE (0-100):
   - Format & Layout: 20 points (proper fonts, margins, spacing, section headers)
   - Content Completeness: 30 points (all required sections present and detailed)
   - Keyword Optimization: 30 points (relevant keywords for the role/industry)
   - Section Organization: 20 points (logical flow, proper section order)

2. MANDATORY SECTION VERIFICATION:
   - Identify any missing critical resume sections
   - Contact Information (name, phone, email, location)
   - Professional Experience (company names, titles, dates, achievements)
   - Education (degree, institution, graduation date)
   - Technical & Soft Skills
   - Optional but Recommended: Projects, Certifications, Awards

3. DETAILED FEEDBACK:
   - Strengths: What the resume does well for ATS systems
   - Improvements: Specific areas that need enhancement
   - Suggestions: Actionable recommendations for optimization

4. KEYWORD ANALYSIS:
   - Evaluate keyword density and relevance
   - Identify missing industry-standard keywords based on target role
   - Assess technical skills representation
   - Calculate keyword density percentage

5. FORMAT COMPLIANCE:
   - Check for ATS-compatible fonts (Arial, Calibri, Times New Roman)
   - Identify potential parsing issues
   - Evaluate section organization
   - Verify proper section headers and formatting consistency

CRITICAL INSTRUCTIONS:
- Be specific and actionable in recommendations
- Focus on ATS optimization, not general resume advice
- Consider industry standards and best practices
- Provide measurable improvement suggestions

Respond ONLY with valid JSON in this exact structure:

{
  "score": 0-100,
  "formatCompliance": 0-100,
  "keywordDensity": 0-100,
  "sectionCompleteness": 0-100,
  "missingSections": ["section1", "section2"],
  "suggestions": ["suggestion1", "suggestion2", "suggestion3"],
  "strengths": ["strength1", "strength2", "strength3"],
  "improvements": ["improvement1", "improvement2", "improvement3"],
  "keywordAnalysis": {
    "found": ["keyword1", "keyword2"],
    "missing": ["keyword3", "keyword4"],
    "relevance": 0-100
  },
  "formatIssues": ["issue1", "issue2"],
  "sectionScores": {
    "contactInformation": 0-100,
    "professionalExperience": 0-100,
    "education": 0-100,
    "skills": 0-100,
    "projects": 0-100,
    "certifications": 0-100
  }
}`;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.3,
          topK: 40,
          topP: 0.9,
          maxOutputTokens: 2000,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error response:', errorText);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const result = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!result) {
      throw new Error('No response content from Gemini API');
    }

    // Clean the response to ensure it's valid JSON
    let cleanedResult = result.replace(/```json/g, '').replace(/```/g, '').trim();
    
    try {
      const parsedResult = JSON.parse(cleanedResult);
      
      // Ensure all required fields exist
      if (!parsedResult.keywordAnalysis) {
        parsedResult.keywordAnalysis = {
          found: [],
          missing: [],
          relevance: 0
        };
      }
      
      if (!parsedResult.formatIssues) {
        parsedResult.formatIssues = [];
      }
      
      if (!parsedResult.sectionScores) {
        parsedResult.sectionScores = {
          contactInformation: 0,
          professionalExperience: 0,
          education: 0,
          skills: 0,
          projects: 0,
          certifications: 0
        };
      }
      
      return parsedResult;
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      console.error('Raw response:', cleanedResult);
      throw new Error('Invalid JSON response from Gemini API');
    }
  } catch (error) {
    console.error('Error calling Gemini API for ATS analysis:', error);
    throw new Error('Failed to analyze resume for ATS compliance. Please try again.');
  }
};

// Function to check document readability and formatting
export const verifyDocumentFormat = (resumeText: string): {
  isReadable: boolean;
  hasProperFormatting: boolean;
  issues: string[];
} => {
  const issues: string[] = [];
  
  // Check if document is empty or too short
  if (!resumeText || resumeText.trim().length < 100) {
    issues.push('Document is too short or empty');
    return { isReadable: false, hasProperFormatting: false, issues };
  }
  
  // Check for section headers
  const sectionHeaders = [
    /experience|work|employment/i,
    /education|degree|academic/i,
    /skills|technologies|competencies/i,
    /projects|portfolio/i,
    /certification|certificate/i,
    /summary|profile|objective/i
  ];
  
  let sectionHeadersFound = 0;
  sectionHeaders.forEach(regex => {
    if (regex.test(resumeText)) {
      sectionHeadersFound++;
    }
  });
  
  if (sectionHeadersFound < 3) {
    issues.push('Document may be missing proper section headers');
  }
  
  // Check for contact information
  const hasEmail = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(resumeText);
  const hasPhone = /(\+\d{1,3}[ -]?)?\(?\d{3}\)?[ -]?\d{3}[ -]?\d{4}/.test(resumeText);
  
  if (!hasEmail) {
    issues.push('No email address detected');
  }
  
  if (!hasPhone) {
    issues.push('No phone number detected');
  }
  
  // Check for formatting consistency
  const lines = resumeText.split('\n');
  const lineCount = lines.length;
  
  if (lineCount < 15) {
    issues.push('Document has too few lines, may have formatting issues');
  }
  
  // Check for bullet points
  const bulletPoints = resumeText.match(/•|\*|-|–|—|\d+\./g);
  if (!bulletPoints || bulletPoints.length < 5) {
    issues.push('Few or no bullet points detected, may lack structured content');
  }
  
  return {
    isReadable: issues.length < 3,
    hasProperFormatting: issues.length < 2,
    issues
  };
};

// Helper function to generate ATS optimization suggestions based on missing sections
export const generateATSSuggestions = (missingSections: string[]): string[] => {
  const suggestions: string[] = [];
  
  if (missingSections.includes('Contact Information')) {
    suggestions.push('Add complete contact information including phone, email, LinkedIn, and location');
  }
  
  if (missingSections.includes('Professional Summary')) {
    suggestions.push('Include a compelling professional summary with 2-3 sentences highlighting your key achievements');
  }
  
  if (missingSections.includes('Work Experience')) {
    suggestions.push('Add detailed work experience with quantifiable achievements and action verbs');
  }
  
  if (missingSections.includes('Technical Skills')) {
    suggestions.push('Create a comprehensive skills section with relevant technologies and tools');
  }
  
  if (missingSections.includes('Education')) {
    suggestions.push('Include your educational background with degrees, institutions, and graduation dates');
  }
  
  if (missingSections.includes('Projects')) {
    suggestions.push('Add relevant projects to showcase practical experience and technical skills');
  }
  
  if (missingSections.includes('Certifications')) {
    suggestions.push('Include professional certifications and training relevant to your field');
  }
  
  // General ATS optimization suggestions
  suggestions.push('Use standard section headings (Experience, Education, Skills, etc.)');
  suggestions.push('Include keywords from job descriptions in your content');
  suggestions.push('Use bullet points for better ATS parsing');
  suggestions.push('Avoid images, graphics, and complex formatting');
  suggestions.push('Use a clean, simple font like Arial or Calibri');
  
  return suggestions;
};

// Function to extract keywords from job description
export const extractKeywordsFromJobDescription = (jobDescription: string): string[] => {
  if (!jobDescription) return [];
  
  // Common words to exclude
  const stopWords = new Set([
    'a', 'an', 'the', 'and', 'or', 'but', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
    'in', 'on', 'at', 'to', 'for', 'with', 'by', 'about', 'against', 'between', 'into', 'through',
    'during', 'before', 'after', 'above', 'below', 'from', 'up', 'down', 'of', 'off', 'over', 'under',
    'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'any',
    'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own',
    'same', 'so', 'than', 'too', 'very', 's', 't', 'can', 'will', 'just', 'don', 'should', 'now',
    'company', 'team', 'role', 'position', 'job', 'candidate', 'applicant', 'looking', 'seeking',
    'required', 'requirements', 'qualifications', 'experience', 'skills', 'ability', 'able', 'must',
    'responsibilities', 'duties', 'work', 'working', 'day', 'week', 'month', 'year', 'time', 'hours'
  ]);
  
  // Extract words, remove punctuation, and filter out stop words
  const words = jobDescription.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.has(word));
  
  // Count word frequency
  const wordFrequency: {[key: string]: number} = {};
  words.forEach(word => {
    wordFrequency[word] = (wordFrequency[word] || 0) + 1;
  });
  
  // Sort by frequency and get top keywords
  const sortedWords = Object.entries(wordFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 30)
    .map(entry => entry[0]);
  
  return sortedWords;
};

// Function to check keyword presence in resume
export const analyzeKeywordPresence = (resumeText: string, keywords: string[]): {
  found: string[];
  missing: string[];
  density: number;
} => {
  const resumeLower = resumeText.toLowerCase();
  const found: string[] = [];
  const missing: string[] = [];
  
  keywords.forEach(keyword => {
    if (resumeLower.includes(keyword.toLowerCase())) {
      found.push(keyword);
    } else {
      missing.push(keyword);
    }
  });
  
  // Calculate keyword density
  const totalWords = resumeText.split(/\s+/).length;
  const density = (found.length / keywords.length) * 100;
  
  return {
    found,
    missing,
    density: Math.round(density)
  };
};

// Function to calculate ATS score based on resume content
export const calculateATSScore = (resumeText: string): number => {
  let score = 0;
  
  // Check for essential sections (40 points total)
  const sections = {
    contact: /(?:phone|email|linkedin)/i.test(resumeText) ? 8 : 0,
    experience: /(?:experience|work|employment)/i.test(resumeText) ? 10 : 0,
    education: /(?:education|degree|university)/i.test(resumeText) ? 8 : 0,
    skills: /(?:skills|technologies|technical)/i.test(resumeText) ? 10 : 0,
    summary: /(?:summary|objective|profile)/i.test(resumeText) ? 4 : 0
  };
  
  score += Object.values(sections).reduce((sum, points) => sum + points, 0);
  
  // Check for keyword density (20 points)
  const wordCount = resumeText.split(/\s+/).length;
  const technicalTerms = resumeText.match(/(?:javascript|python|react|node|sql|aws|docker|kubernetes|agile|scrum)/gi);
  const keywordDensity = technicalTerms ? (technicalTerms.length / wordCount) * 100 : 0;
  score += Math.min(keywordDensity * 4, 20);
  
  // Check for quantifiable achievements (20 points)
  const numbers = resumeText.match(/\d+(?:%|\+|k|million|billion|years?|months?)/gi);
  const achievementScore = numbers ? Math.min(numbers.length * 2, 20) : 0;
  score += achievementScore;
  
  // Check for action verbs (20 points)
  const actionVerbs = resumeText.match(/(?:developed|implemented|managed|led|created|designed|optimized|improved|increased|reduced)/gi);
  const verbScore = actionVerbs ? Math.min(actionVerbs.length, 20) : 0;
  score += verbScore;
  
  return Math.min(Math.round(score), 100);
};

// Function to generate a comprehensive ATS report
export const generateATSReport = (analysis: ATSAnalysisResult, resumeText: string, targetRole?: string): string => {
  const formatScore = (score: number): string => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Very Good';
    if (score >= 70) return 'Good';
    if (score >= 60) return 'Fair';
    if (score >= 50) return 'Needs Improvement';
    return 'Poor';
  };
  
  const getScoreColor = (score: number): string => {
    if (score >= 90) return 'green';
    if (score >= 70) return 'blue';
    if (score >= 60) return 'orange';
    return 'red';
  };
  
  let report = `# ATS Resume Analysis Report\n\n`;
  report += `## Overall Score: ${analysis.score}% (${formatScore(analysis.score)})\n\n`;
  
  report += `### Score Breakdown\n`;
  report += `- Format & Layout: ${analysis.formatCompliance}%\n`;
  report += `- Content Completeness: ${analysis.sectionCompleteness}%\n`;
  report += `- Keyword Optimization: ${analysis.keywordDensity}%\n\n`;
  
  report += `### Section Analysis\n`;
  for (const [section, score] of Object.entries(analysis.sectionScores)) {
    const formattedSection = section.replace(/([A-Z])/g, ' $1').trim();
    report += `- ${formattedSection}: ${score}% (${formatScore(score)})\n`;
  }
  
  report += `\n### Missing Sections\n`;
  if (analysis.missingSections.length === 0) {
    report += `- All critical sections are present ✓\n`;
  } else {
    analysis.missingSections.forEach(section => {
      report += `- ${section} ✗\n`;
    });
  }
  
  report += `\n### Keyword Analysis\n`;
  report += `- Found Keywords (${analysis.keywordAnalysis.found.length}): ${analysis.keywordAnalysis.found.join(', ')}\n`;
  report += `- Missing Keywords (${analysis.keywordAnalysis.missing.length}): ${analysis.keywordAnalysis.missing.join(', ')}\n`;
  report += `- Keyword Relevance: ${analysis.keywordAnalysis.relevance}%\n`;
  
  report += `\n### Format Issues\n`;
  if (analysis.formatIssues.length === 0) {
    report += `- No significant formatting issues detected ✓\n`;
  } else {
    analysis.formatIssues.forEach(issue => {
      report += `- ${issue}\n`;
    });
  }
  
  report += `\n### Strengths\n`;
  analysis.strengths.forEach(strength => {
    report += `- ${strength}\n`;
  });
  
  report += `\n### Improvement Areas\n`;
  analysis.improvements.forEach(improvement => {
    report += `- ${improvement}\n`;
  });
  
  report += `\n### Actionable Recommendations\n`;
  analysis.suggestions.forEach((suggestion, index) => {
    report += `${index + 1}. ${suggestion}\n`;
  });
  
  return report;
};