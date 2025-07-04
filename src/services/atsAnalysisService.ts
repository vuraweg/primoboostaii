import { ResumeData } from '../types/resume';

const GEMINI_API_KEY = 'AIzaSyAYxmudWmbhrzaFTg2btswt6V2QHiAR_BE';

// Cache for storing analysis results to ensure consistency
const analysisCache = new Map<string, ATSAnalysisResult>();

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
  // Generate a cache key based on resume text and target role
  const cacheKey = `${resumeText.substring(0, 100)}|${targetRole || ''}`;
  
  // Check if we already have an analysis for this resume
  if (analysisCache.has(cacheKey)) {
    return analysisCache.get(cacheKey)!;
  }
  
  const prompt = `You are an expert ATS (Applicant Tracking System) analyzer and resume optimization specialist. Analyze the provided resume for ATS compliance and provide detailed feedback.

RESUME CONTENT:
${resumeText}

${targetRole ? `TARGET ROLE: ${targetRole}` : ''}

ANALYSIS REQUIREMENTS:

1. ATS COMPLIANCE SCORE (0-100):
   - Section structure and formatting (25%)
   - Keyword optimization (25%)
   - Content completeness (25%)
   - ATS-friendly formatting (25%)

2. MISSING SECTIONS ANALYSIS:
   - Identify any missing critical resume sections
   - Consider standard sections: Contact, Experience, Education, Skills, Projects, Certifications
   - Note: Summary/Objective is OPTIONAL and should NOT be counted as missing

3. DETAILED FEEDBACK:
   - Strengths: What the resume does well for ATS systems
   - Improvements: Specific areas that need enhancement
   - Suggestions: Actionable recommendations for optimization

4. KEYWORD ANALYSIS:
   - Evaluate keyword density and relevance
   - Identify missing industry-standard keywords
   - Assess technical skills representation

5. FORMAT COMPLIANCE:
   - Check for ATS-friendly formatting
   - Identify potential parsing issues
   - Evaluate section organization

CRITICAL INSTRUCTIONS:
- Be specific and actionable in recommendations
- Focus on ATS optimization, not general resume advice
- Consider industry standards and best practices
- Provide measurable improvement suggestions

Respond ONLY with valid JSON in this exact structure:

{
  "score": 0-100,
  "missingSections": ["section1", "section2"],
  "suggestions": ["suggestion1", "suggestion2", "suggestion3"],
  "strengths": ["strength1", "strength2", "strength3"],
  "improvements": ["improvement1", "improvement2", "improvement3"],
  "keywordDensity": 0-100,
  "formatCompliance": 0-100,
  "sectionCompleteness": 0-100
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
    const cleanedResult = result.replace(/```json/g, '').replace(/```/g, '').trim();
    
    try {
      const parsedResult = JSON.parse(cleanedResult);
      
      // Store in cache for consistency
      analysisCache.set(cacheKey, parsedResult);
      
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

// Helper function to generate ATS optimization suggestions based on missing sections
export const generateATSSuggestions = (missingSections: string[]): string[] => {
  const suggestions: string[] = [];

  // Filter out Summary/Objective from missing sections
  const filteredMissingSections = missingSections.filter(
    section => section !== 'Professional Summary' && 
    section !== 'Summary' && 
    section !== 'Objective'
  );

  if (filteredMissingSections.includes('Contact Information')) {
    suggestions.push('Add complete contact information including phone, email, LinkedIn, and location');
  }
  
  if (filteredMissingSections.includes('Technical Skills')) {
    suggestions.push('Create a comprehensive skills section with relevant technologies and tools');
  }
  
  if (filteredMissingSections.includes('Education')) {
    suggestions.push('Include your educational background with degrees, institutions, and graduation dates');
  }
  
  if (filteredMissingSections.includes('Projects')) {
    suggestions.push('Add relevant projects to showcase practical experience and technical skills');
  }
  
  if (filteredMissingSections.includes('Certifications')) {
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

// Function to calculate ATS score based on resume content
export const calculateATSScore = (resumeText: string): number => {
  let score = 0;
  
  // Check for essential sections (40 points total) - Summary/Objective is optional
  const sections = {
    contact: /(?:phone|email|linkedin)/i.test(resumeText) ? 8 : 0,
    experience: /(?:experience|work|employment)/i.test(resumeText) ? 10 : 0,
    education: /(?:education|degree|university)/i.test(resumeText) ? 8 : 0,
    skills: /(?:skills|technologies|technical)/i.test(resumeText) ? 10 : 0,
    // Summary is optional, so always award these points
    summary: 4
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