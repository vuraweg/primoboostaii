import { ResumeData } from '../types/resume';
import { ProjectAnalysis, ProjectMatch, RecommendedProject } from '../types/analysis';

const GEMINI_API_KEY = 'AIzaSyAYxmudWmbhrzaFTg2btswt6V2QHiAR_BE';

export const analyzeProjectAlignment = async (
  resumeData: ResumeData, 
  jobDescription: string, 
  targetRole: string
): Promise<ProjectAnalysis> => {
  const prompt = `You are a senior technical recruiter and career strategist. Analyze the alignment between the candidate's projects and the target job requirements.

CANDIDATE'S CURRENT PROJECTS:
${resumeData.projects?.map(project => `
- ${project.title}
  Bullets: ${project.bullets?.join('; ') || 'No details provided'}
`).join('\n') || 'No projects listed'}

CANDIDATE'S WORK EXPERIENCE:
${resumeData.workExperience?.map(exp => `
- ${exp.role} at ${exp.company} (${exp.year})
  Bullets: ${exp.bullets?.join('; ') || 'No details provided'}
`).join('\n') || 'No work experience listed'}

CANDIDATE'S SKILLS:
${resumeData.skills?.map(skill => `${skill.category}: ${skill.list?.join(', ') || ''}`).join('\n') || 'No skills listed'}

TARGET ROLE: ${targetRole}

JOB DESCRIPTION:
${jobDescription}

ANALYSIS REQUIREMENTS:

1. MATCH SCORE CALCULATION (0-100%):
   - Analyze how well current projects align with job requirements
   - Consider technical skills, domain knowledge, and project complexity
   - Factor in transferable skills and relevant experience

2. MATCHING PROJECTS ANALYSIS:
   - Identify which current projects are most relevant
   - Explain why each project aligns with the role
   - Highlight specific skills demonstrated

3. RECOMMENDED PROJECTS (5-7 suggestions):
   - Identify gaps in project portfolio
   - Suggest specific projects that would strengthen candidacy
   - Include realistic scope and technologies
   - Prioritize by impact on role fit

CRITICAL INSTRUCTIONS:
- Be specific and actionable in recommendations
- Consider current market trends and industry standards
- Suggest projects that can be completed in 2-8 weeks
- Include both technical and soft skill development
- Provide realistic timelines and scope

Respond ONLY with valid JSON in this exact structure:

{
  "matchScore": 0-100,
  "matchingProjects": [
    {
      "title": "project name",
      "matchScore": 0-100,
      "relevantSkills": ["skill1", "skill2"],
      "alignmentReason": "detailed explanation of why this project aligns with the role"
    }
  ],
  "recommendedProjects": [
    {
      "id": "unique-id",
      "title": "Specific Project Title",
      "type": "Web Application/Mobile App/Data Pipeline/API/etc",
      "focusArea": "Frontend/Backend/Full-Stack/Data/DevOps/etc",
      "priority": "High/Medium/Low",
      "impactScore": 0-100,
      "technologies": ["tech1", "tech2", "tech3"],
      "scope": "2-3 sentence description of project scope",
      "deliverables": ["deliverable1", "deliverable2", "deliverable3"],
      "industryContext": "How this relates to the target industry/role",
      "timeEstimate": "2-8 weeks",
      "skillsAddressed": ["skill1", "skill2", "skill3"]
    }
  ],
  "overallAssessment": "2-3 sentence summary of candidate's current position and main areas for improvement",
  "priorityActions": ["action1", "action2", "action3"]
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
          maxOutputTokens: 4000,
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
      return parsedResult;
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      console.error('Raw response:', cleanedResult);
      throw new Error('Invalid JSON response from Gemini API');
    }
  } catch (error) {
    console.error('Error calling Gemini API for project analysis:', error);
    throw new Error('Failed to analyze project alignment. Please try again.');
  }
};