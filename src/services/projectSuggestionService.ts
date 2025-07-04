import { ProjectAnalysisResult, ProjectSuggestion, JDAnalysis } from '../types/projectAnalysis';

const GEMINI_API_KEY = 'AIzaSyAYxmudWmbhrzaFTg2btswt6V2QHiAR_BE';

class ProjectSuggestionService {
  
  // Analyze job description and extract key information
  async analyzeJobDescription(jobDescription: string): Promise<JDAnalysis> {
    const prompt = `Analyze this job description and extract key information:

JOB DESCRIPTION:
${jobDescription}

Extract and return ONLY valid JSON in this exact format:
{
  "required_skills": ["skill1", "skill2", "skill3"],
  "preferred_skills": ["skill1", "skill2"],
  "technologies": ["tech1", "tech2", "tech3"],
  "experience_level": "Entry/Mid/Senior",
  "domain": "Frontend/Backend/Full-Stack/Data/DevOps/Mobile",
  "role_type": "Developer/Engineer/Analyst/Designer"
}

Focus on:
- Technical skills explicitly mentioned as required
- Programming languages, frameworks, databases
- Tools and technologies
- Experience level indicators
- Primary domain/specialization`;

    try {
      const response = await this.callGeminiAPI(prompt);
      return JSON.parse(response);
    } catch (error) {
      console.error('Error analyzing job description:', error);
      // Return default analysis if API fails
      return {
        required_skills: ['JavaScript', 'React', 'Node.js'],
        preferred_skills: ['TypeScript', 'Git'],
        technologies: ['HTML', 'CSS', 'JavaScript'],
        experience_level: 'Mid',
        domain: 'Full-Stack',
        role_type: 'Developer'
      };
    }
  }

  // Generate project suggestions based on JD analysis
  async generateProjectSuggestions(
    jobDescription: string, 
    jdAnalysis: JDAnalysis
  ): Promise<ProjectAnalysisResult> {
    const prompt = `Based on this job description analysis, generate 5 tailored project recommendations:

JOB DESCRIPTION:
${jobDescription}

ANALYSIS:
- Required Skills: ${jdAnalysis.required_skills.join(', ')}
- Technologies: ${jdAnalysis.technologies.join(', ')}
- Domain: ${jdAnalysis.domain}
- Experience Level: ${jdAnalysis.experience_level}

SCORING CRITERIA:
- Technical stack alignment (40%)
- Project complexity vs role requirements (30%)
- Core functionality relevance (30%)
- +5 bonus points for responsive design

INSTRUCTIONS:
1. Generate 5 project suggestions that align with the job requirements
2. Calculate match_score (0-100) for each project based on JD alignment
3. Include realistic project links (GitHub repos, tutorials, or documentation)
4. Ensure projects progress from basic to advanced complexity

CRITICAL OUTPUT RULES:
- If ANY project has match_score ≥ 85: Return normal results
- If ALL projects have match_score < 85: Add "recommendation" field with improvement suggestions

Return ONLY valid JSON in this exact format:
{
  "missing_skills": ["skill1", "skill2"],
  "projects": [
    {
      "title": "Specific Project Name",
      "teaches": "One line description of what this teaches",
      "stack": "Technologies used (comma separated)",
      "difficulty": "Beginner/Intermediate/Advanced",
      "link": "https://valid-url.com",
      "match_score": 0-100,
      "responsive": true/false
    }
  ],
  "recommendation": "⚠️ Your current projects don't align well with this JD. Try building projects in: [specific domains/technologies]",
  "overall_match_score": 0-100,
  "analysis_summary": "Brief summary of alignment"
}

IMPORTANT:
- Only include "recommendation" field if ALL projects score < 85
- Use real, accessible URLs for project links
- Make match_score calculations realistic and accurate
- Ensure projects are buildable and relevant to the role`;

    try {
      const response = await this.callGeminiAPI(prompt);
      const result = JSON.parse(response);
      
      // Validate and enhance the result
      return this.validateAndEnhanceResult(result, jdAnalysis);
    } catch (error) {
      console.error('Error generating project suggestions:', error);
      return this.getFallbackSuggestions(jdAnalysis);
    }
  }

  // Validate and enhance the AI-generated result
  private validateAndEnhanceResult(
    result: ProjectAnalysisResult, 
    jdAnalysis: JDAnalysis
  ): ProjectAnalysisResult {
    // Ensure all projects have valid scores
    result.projects = result.projects.map(project => ({
      ...project,
      match_score: Math.min(Math.max(project.match_score || 0, 0), 100)
    }));

    // Calculate overall match score
    const avgScore = result.projects.reduce((sum, p) => sum + p.match_score, 0) / result.projects.length;
    result.overall_match_score = Math.round(avgScore);

    // Check if recommendation is needed
    const hasHighScore = result.projects.some(p => p.match_score >= 85);
    if (!hasHighScore && !result.recommendation) {
      result.recommendation = this.generateRecommendation(jdAnalysis);
    } else if (hasHighScore && result.recommendation) {
      delete result.recommendation; // Remove recommendation if high scores exist
    }

    // Add analysis summary
    result.analysis_summary = this.generateAnalysisSummary(result, jdAnalysis);

    return result;
  }

  // Generate recommendation for low-scoring projects
  private generateRecommendation(jdAnalysis: JDAnalysis): string {
    const suggestions = [];
    
    if (jdAnalysis.domain.includes('Backend')) {
      suggestions.push('REST APIs', 'Database design', 'Authentication systems');
    }
    if (jdAnalysis.domain.includes('Frontend')) {
      suggestions.push('Responsive web apps', 'State management', 'Component libraries');
    }
    if (jdAnalysis.domain.includes('Full-Stack')) {
      suggestions.push('End-to-end applications', 'CRUD operations', 'User authentication');
    }
    if (jdAnalysis.technologies.includes('React')) {
      suggestions.push('React projects with hooks', 'Redux/Context API');
    }
    if (jdAnalysis.technologies.includes('Node.js')) {
      suggestions.push('Node.js backend services', 'Express.js APIs');
    }

    const uniqueSuggestions = [...new Set(suggestions)];
    return `⚠️ Your current projects don't align well with this JD. Try building projects in: ${uniqueSuggestions.join(', ')}.`;
  }

  // Generate analysis summary
  private generateAnalysisSummary(
    result: ProjectAnalysisResult, 
    jdAnalysis: JDAnalysis
  ): string {
    const avgScore = result.overall_match_score || 0;
    
    if (avgScore >= 85) {
      return `Excellent alignment! Your projects strongly match the ${jdAnalysis.domain} ${jdAnalysis.role_type} requirements.`;
    } else if (avgScore >= 70) {
      return `Good alignment with room for improvement. Focus on ${jdAnalysis.required_skills.slice(0, 2).join(' and ')} skills.`;
    } else if (avgScore >= 50) {
      return `Moderate alignment. Consider building projects that demonstrate ${jdAnalysis.domain} expertise.`;
    } else {
      return `Low alignment detected. Significant project portfolio enhancement needed for this role.`;
    }
  }

  // Fallback suggestions if API fails
  private getFallbackSuggestions(jdAnalysis: JDAnalysis): ProjectAnalysisResult {
    const fallbackProjects: ProjectSuggestion[] = [
      {
        title: 'Personal Portfolio Website',
        teaches: 'Responsive design and modern web development',
        stack: 'HTML, CSS, JavaScript, React',
        difficulty: 'Beginner',
        link: 'https://github.com/topics/portfolio-website',
        match_score: 65,
        responsive: true
      },
      {
        title: 'Task Management App',
        teaches: 'CRUD operations and state management',
        stack: 'React, Node.js, MongoDB',
        difficulty: 'Intermediate',
        link: 'https://github.com/topics/todo-app',
        match_score: 70,
        responsive: true
      },
      {
        title: 'E-commerce Product Catalog',
        teaches: 'API integration and data handling',
        stack: 'React, REST APIs, CSS Grid',
        difficulty: 'Intermediate',
        link: 'https://github.com/topics/ecommerce',
        match_score: 68,
        responsive: true
      },
      {
        title: 'Weather Dashboard',
        teaches: 'External API integration and data visualization',
        stack: 'JavaScript, Chart.js, Weather API',
        difficulty: 'Beginner',
        link: 'https://github.com/topics/weather-app',
        match_score: 60,
        responsive: true
      },
      {
        title: 'Blog Platform',
        teaches: 'Full-stack development and content management',
        stack: 'React, Node.js, Express, Database',
        difficulty: 'Advanced',
        link: 'https://github.com/topics/blog-platform',
        match_score: 72,
        responsive: true
      }
    ];

    return {
      missing_skills: jdAnalysis.required_skills.slice(0, 3),
      projects: fallbackProjects,
      recommendation: this.generateRecommendation(jdAnalysis),
      overall_match_score: 67,
      analysis_summary: 'Fallback analysis - API temporarily unavailable'
    };
  }

  // Call Gemini API
  private async callGeminiAPI(prompt: string): Promise<string> {
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
          maxOutputTokens: 3000,
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
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const result = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!result) {
      throw new Error('No response content from Gemini API');
    }

    // Clean the response to ensure it's valid JSON
    return result.replace(/```json/g, '').replace(/```/g, '').trim();
  }

  // Main method to analyze JD and generate suggestions
  async analyzeAndSuggest(jobDescription: string): Promise<ProjectAnalysisResult> {
    try {
      // Step 1: Analyze the job description
      const jdAnalysis = await this.analyzeJobDescription(jobDescription);
      
      // Step 2: Generate project suggestions based on analysis
      const suggestions = await this.generateProjectSuggestions(jobDescription, jdAnalysis);
      
      return suggestions;
    } catch (error) {
      console.error('Error in project analysis:', error);
      
      // Return fallback analysis
      return {
        missing_skills: ['JavaScript', 'React', 'Node.js'],
        projects: [
          {
            title: 'Portfolio Website',
            teaches: 'Modern web development fundamentals',
            stack: 'HTML, CSS, JavaScript',
            difficulty: 'Beginner',
            link: 'https://github.com/topics/portfolio',
            match_score: 65,
            responsive: true
          }
        ],
        recommendation: '⚠️ Analysis temporarily unavailable. Focus on building projects with modern web technologies.',
        overall_match_score: 65,
        analysis_summary: 'Fallback analysis due to service unavailability'
      };
    }
  }
}

export const projectSuggestionService = new ProjectSuggestionService();