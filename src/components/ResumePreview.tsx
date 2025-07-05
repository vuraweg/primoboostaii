import React from 'react';
import { ResumeData, UserType } from '../types/resume';

interface ResumePreviewProps {
  resumeData: ResumeData;
  userType?: UserType;
}

export const ResumePreview: React.FC<ResumePreviewProps> = ({ resumeData, userType = 'experienced' }) => {
  // Build contact info with bold labels and hyperlinks
  const buildContactInfo = () => {
    const contactElements = [];
    
    if (resumeData.phone) {
      contactElements.push(
        <span key="phone">
          <strong>Phone no: </strong>
          <a 
            href={`tel:${resumeData.phone}`} 
            className="text-blue-600 hover:text-blue-800 transition-colors"
          >
            {resumeData.phone}
          </a>
        </span>
      );
    }
    
    if (resumeData.email) {
      contactElements.push(
        <span key="email">
          <strong>Email: </strong>
          <a 
            href={`mailto:${resumeData.email}`} 
            className="text-blue-600 hover:text-blue-800 transition-colors"
          >
            {resumeData.email}
          </a>
        </span>
      );
    }
    
    if (resumeData.linkedin) {
      contactElements.push(
        <span key="linkedin">
          <strong>LinkedIn: </strong>
          <a 
            href={resumeData.linkedin} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 transition-colors"
          >
            {resumeData.linkedin}
          </a>
        </span>
      );
    }
    
    if (resumeData.github) {
      contactElements.push(
        <span key="github">
          <strong>GitHub: </strong>
          <a 
            href={resumeData.github} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 transition-colors"
          >
            {resumeData.github}
          </a>
        </span>
      );
    }
    
    return contactElements;
  };

  const contactElements = buildContactInfo();

  // Define section order based on user type
  const getSectionOrder = () => {
    if (userType === 'experienced') {
      return [ 
        'summary',
        'workExperience',
        'projects',
        'skills',
        'certifications',
        'education' // Minimal for experienced
      ];
    } else {
      return [ 
        'summary', // Optional for freshers
        'education', // Prominent for freshers
        'workExperience', // Internships
        'projects', // Academic projects
        'skills',
        'achievements',
        'extraCurricularActivities',
        'certifications',
        'languagesKnown',
        'personalDetails'
      ];
    }
  };

  const sectionOrder = getSectionOrder();

  const renderSection = (sectionName: string) => {
    switch (sectionName) {
      case 'summary':
        if (!resumeData.summary || userType === 'fresher') return null; // Skip summary for freshers
        return (
          <div className="mb-6" style={{ marginBottom: '18pt' }}>
            <h2 className="font-bold mb-2 uppercase tracking-wide" style={{ 
              fontSize: '14pt', 
              fontWeight: 'bold', 
              marginBottom: '6pt',
              marginTop: '6pt',
              fontFamily: 'Calibri, "Segoe UI", Tahoma, Geneva, Verdana, sans-serif'
            }}>
              PROFESSIONAL SUMMARY
            </h2>
            <div className="border-b border-gray-400 mb-3" style={{ 
              borderBottomWidth: '1px', 
              borderColor: '#9CA3AF',
              marginBottom: '12pt'
            }}></div>
            <p style={{ 
              fontSize: '11pt', 
              lineHeight: '1.15',
              fontFamily: 'Calibri, "Segoe UI", Tahoma, Geneva, Verdana, sans-serif'
            }}>
              {resumeData.summary}
            </p>
          </div>
        );

      case 'workExperience':
        if (!resumeData.workExperience || resumeData.workExperience.length === 0) return null;
        return (
          <div className="mb-6" style={{ marginBottom: '18pt' }}>
            <h2 className="font-bold mb-2 uppercase tracking-wide" style={{ 
              fontSize: '14pt', 
              fontWeight: 'bold', 
              marginBottom: '6pt',
              marginTop: '6pt',
              fontFamily: 'Calibri, "Segoe UI", Tahoma, Geneva, Verdana, sans-serif'
            }}>
              {userType === 'fresher' ? 'INTERNSHIPS & WORK EXPERIENCE' : 'WORK EXPERIENCE'}
            </h2>
            <div className="border-b border-gray-400 mb-3" style={{ 
              borderBottomWidth: '1px', 
              borderColor: '#9CA3AF',
              marginBottom: '12pt'
            }}></div>
            
            {resumeData.workExperience.map((job, index) => (
              <div key={index} className="mb-4" style={{ marginBottom: '12pt' }}>
                <div className="flex justify-between items-start mb-2" style={{ marginBottom: '6pt' }}>
                  <div>
                    <div className="font-bold" style={{ 
                      fontSize: '11pt', 
                      fontWeight: 'bold',
                      fontFamily: 'Calibri, "Segoe UI", Tahoma, Geneva, Verdana, sans-serif'
                    }}>
                      {job.role}
                    </div>
                    <div style={{ 
                      fontSize: '11pt',
                      fontFamily: 'Calibri, "Segoe UI", Tahoma, Geneva, Verdana, sans-serif'
                    }}>
                      {job.company}
                    </div>
                  </div>
                  <div className="font-bold" style={{ 
                    fontSize: '11pt', 
                    fontWeight: 'bold',
                    fontFamily: 'Calibri, "Segoe UI", Tahoma, Geneva, Verdana, sans-serif'
                  }}>
                    {job.year}
                  </div>
                </div>
                {job.bullets && job.bullets.length > 0 && (
                  <ul className="ml-4 space-y-1" style={{ marginLeft: '18pt' }}>
                    {job.bullets.map((bullet, bulletIndex) => (
                      <li key={bulletIndex} className="leading-relaxed" style={{ 
                        fontSize: '11pt', 
                        lineHeight: '1.15',
                        marginBottom: '6pt',
                        fontFamily: 'Calibri, "Segoe UI", Tahoma, Geneva, Verdana, sans-serif'
                      }}>
                        • {bullet}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        );

      case 'education':
        if (!resumeData.education || resumeData.education.length === 0) return null;
        // For experienced professionals, show education minimally unless it's important
        const showEducationProminently = userType === 'fresher';
        
        return (
          <div className="mb-6" style={{ marginBottom: '18pt' }}>
            <h2 className="font-bold mb-2 uppercase tracking-wide" style={{ 
              fontSize: showEducationProminently ? '14pt' : '12pt', 
              fontWeight: 'bold', 
              marginBottom: '6pt',
              marginTop: '6pt',
              fontFamily: 'Calibri, "Segoe UI", Tahoma, Geneva, Verdana, sans-serif'
            }}>
              EDUCATION
            </h2>
            <div className="border-b border-gray-400 mb-3" style={{ 
              borderBottomWidth: '1px', 
              borderColor: '#9CA3AF',
              marginBottom: '12pt'
            }}></div>
            
            {resumeData.education.map((edu, index) => (
              <div key={index} className="mb-3" style={{ marginBottom: '12pt' }}>
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-bold" style={{ 
                      fontSize: '11pt', 
                      fontWeight: 'bold',
                      fontFamily: 'Calibri, "Segoe UI", Tahoma, Geneva, Verdana, sans-serif'
                    }}>
                      {edu.degree}
                    </div>
                    <div style={{ 
                      fontSize: '11pt',
                      fontFamily: 'Calibri, "Segoe UI", Tahoma, Geneva, Verdana, sans-serif'
                    }}>
                      {edu.school}
                    </div>
                  </div>
                  <div className="font-bold" style={{ 
                    fontSize: '11pt', 
                    fontWeight: 'bold',
                    fontFamily: 'Calibri, "Segoe UI", Tahoma, Geneva, Verdana, sans-serif'
                  }}>
                    {edu.year}
                  </div>
                </div>
              </div>
            ))}
          </div>
        );

      case 'projects':
        if (!resumeData.projects || resumeData.projects.length === 0) return null;
        return (
          <div className="mb-6" style={{ marginBottom: '18pt' }}>
            <h2 className="font-bold mb-2 uppercase tracking-wide" style={{ 
              fontSize: '14pt', 
              fontWeight: 'bold', 
              marginBottom: '6pt',
              marginTop: '6pt',
              fontFamily: 'Calibri, "Segoe UI", Tahoma, Geneva, Verdana, sans-serif'
            }}>
              {userType === 'fresher' ? 'ACADEMIC PROJECTS' : 'PROJECTS'}
            </h2>
            <div className="border-b border-gray-400 mb-3" style={{ 
              borderBottomWidth: '1px', 
              borderColor: '#9CA3AF',
              marginBottom: '12pt'
            }}></div>
            
            {resumeData.projects.map((project, index) => (
              <div key={index} className="mb-4" style={{ marginBottom: '12pt' }}>
                <div className="font-bold mb-1" style={{ 
                  fontSize: '11pt', 
                  fontWeight: 'bold',
                  marginBottom: '6pt',
                  fontFamily: 'Calibri, "Segoe UI", Tahoma, Geneva, Verdana, sans-serif'
                }}>
                  {project.title}
                </div>
                {project.bullets && project.bullets.length > 0 && (
                  <ul className="ml-4 space-y-1" style={{ marginLeft: '18pt' }}>
                    {project.bullets.map((bullet, bulletIndex) => (
                      <li key={bulletIndex} className="leading-relaxed" style={{ 
                        fontSize: '11pt', 
                        lineHeight: '1.15',
                        marginBottom: '6pt',
                        fontFamily: 'Calibri, "Segoe UI", Tahoma, Geneva, Verdana, sans-serif'
                      }}>
                        • {bullet}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        );

      case 'skills':
        if (!resumeData.skills || resumeData.skills.length === 0) return null;
        return (
          <div className="mb-6" style={{ marginBottom: '18pt' }}>
            <h2 className="font-bold mb-2 uppercase tracking-wide" style={{ 
              fontSize: '14pt', 
              fontWeight: 'bold', 
              marginBottom: '6pt',
              marginTop: '6pt',
              fontFamily: 'Calibri, "Segoe UI", Tahoma, Geneva, Verdana, sans-serif'
            }}>
              TECHNICAL SKILLS
            </h2>
            <div className="border-b border-gray-400 mb-3" style={{ 
              borderBottomWidth: '1px', 
              borderColor: '#9CA3AF',
              marginBottom: '12pt'
            }}></div>
            
            {resumeData.skills.map((skill, index) => (
              <div key={index} className="mb-2" style={{ marginBottom: '6pt' }}>
                <span style={{ 
                  fontSize: '11pt',
                  fontFamily: 'Calibri, "Segoe UI", Tahoma, Geneva, Verdana, sans-serif'
                }}>
                  <span className="font-bold">• {skill.category}:</span>{' '}
                  {skill.list && skill.list.join(', ')}
                </span>
              </div>
            ))}
          </div>
        );

      case 'achievements':
        if (!resumeData.achievements || resumeData.achievements.length === 0) return null;
        return (
          <div className="mb-6" style={{ marginBottom: '18pt' }}>
            <h2 className="font-bold mb-2 uppercase tracking-wide" style={{ 
              fontSize: '14pt', 
              fontWeight: 'bold', 
              marginBottom: '6pt',
              marginTop: '6pt',
              fontFamily: 'Calibri, "Segoe UI", Tahoma, Geneva, Verdana, sans-serif'
            }}>
              ACHIEVEMENTS
            </h2>
            <div className="border-b border-gray-400 mb-3" style={{ 
              borderBottomWidth: '1px', 
              borderColor: '#9CA3AF',
              marginBottom: '12pt'
            }}></div>
            
            <ul className="ml-4 space-y-1" style={{ marginLeft: '18pt' }}>
              {resumeData.achievements.map((achievement, index) => (
                <li key={index} style={{ 
                  fontSize: '11pt',
                  marginBottom: '6pt',
                  fontFamily: 'Calibri, "Segoe UI", Tahoma, Geneva, Verdana, sans-serif'
                }}>
                  • {achievement}
                </li>
              ))}
            </ul>
          </div>
        );

      case 'extraCurricularActivities':
        if (!resumeData.extraCurricularActivities || resumeData.extraCurricularActivities.length === 0) return null;
        return (
          <div className="mb-6" style={{ marginBottom: '18pt' }}>
            <h2 className="font-bold mb-2 uppercase tracking-wide" style={{ 
              fontSize: '14pt', 
              fontWeight: 'bold', 
              marginBottom: '6pt',
              marginTop: '6pt',
              fontFamily: 'Calibri, "Segoe UI", Tahoma, Geneva, Verdana, sans-serif'
            }}>
              EXTRA-CURRICULAR ACTIVITIES
            </h2>
            <div className="border-b border-gray-400 mb-3" style={{ 
              borderBottomWidth: '1px', 
              borderColor: '#9CA3AF',
              marginBottom: '12pt'
            }}></div>
            
            <ul className="ml-4 space-y-1" style={{ marginLeft: '18pt' }}>
              {resumeData.extraCurricularActivities.map((activity, index) => (
                <li key={index} style={{ 
                  fontSize: '11pt',
                  marginBottom: '6pt',
                  fontFamily: 'Calibri, "Segoe UI", Tahoma, Geneva, Verdana, sans-serif'
                }}>
                  • {activity}
                </li>
              ))}
            </ul>
          </div>
        );

      case 'certifications':
        if (!resumeData.certifications || resumeData.certifications.length === 0) return null;
        return (
          <div className="mb-6" style={{ marginBottom: '18pt' }}>
            <h2 className="font-bold mb-2 uppercase tracking-wide" style={{ 
              fontSize: '14pt', 
              fontWeight: 'bold', 
              marginBottom: '6pt',
              marginTop: '6pt',
              fontFamily: 'Calibri, "Segoe UI", Tahoma, Geneva, Verdana, sans-serif'
            }}>
              CERTIFICATIONS
            </h2>
            <div className="border-b border-gray-400 mb-3" style={{ 
              borderBottomWidth: '1px', 
              borderColor: '#9CA3AF',
              marginBottom: '12pt'
            }}></div>
            
            <ul className="ml-4 space-y-1" style={{ marginLeft: '18pt' }}>
              {resumeData.certifications.map((cert, index) => {
                // Handle both string and object formats
                let certText = '';
                if (typeof cert === 'string') {
                  certText = cert;
                } else if (cert && typeof cert === 'object') {
                  // Handle object format with title and issuer
                  if ('title' in cert && 'issuer' in cert) {
                    certText = `${cert.title} - ${cert.issuer}`;
                  } else if ('name' in cert) {
                    certText = cert.name;
                  } else {
                    certText = JSON.stringify(cert);
                  }
                } else {
                  certText = String(cert);
                }
                
                return (
                  <li key={index} style={{ 
                    fontSize: '11pt',
                    marginBottom: '6pt',
                    fontFamily: 'Calibri, "Segoe UI", Tahoma, Geneva, Verdana, sans-serif'
                  }}>
                    • {certText}
                  </li>
                );
              })}
            </ul>
          </div>
        );

      case 'languagesKnown':
        if (!resumeData.languagesKnown || resumeData.languagesKnown.length === 0) return null;
        return (
          <div className="mb-6" style={{ marginBottom: '18pt' }}>
            <h2 className="font-bold mb-2 uppercase tracking-wide" style={{ 
              fontSize: '14pt', 
              fontWeight: 'bold', 
              marginBottom: '6pt',
              marginTop: '6pt',
              fontFamily: 'Calibri, "Segoe UI", Tahoma, Geneva, Verdana, sans-serif'
            }}>
              LANGUAGES KNOWN
            </h2>
            <div className="border-b border-gray-400 mb-3" style={{ 
              borderBottomWidth: '1px', 
              borderColor: '#9CA3AF',
              marginBottom: '12pt'
            }}></div>
            
            <p style={{ 
              fontSize: '11pt',
              fontFamily: 'Calibri, "Segoe UI", Tahoma, Geneva, Verdana, sans-serif'
            }}>
              {resumeData.languagesKnown.join(', ')}
            </p>
          </div>
        );

      case 'personalDetails':
        if (!resumeData.personalDetails) return null;
        return (
          <div className="mb-6" style={{ marginBottom: '18pt' }}>
            <h2 className="font-bold mb-2 uppercase tracking-wide" style={{ 
              fontSize: '14pt', 
              fontWeight: 'bold', 
              marginBottom: '6pt',
              marginTop: '6pt',
              fontFamily: 'Calibri, "Segoe UI", Tahoma, Geneva, Verdana, sans-serif'
            }}>
              PERSONAL DETAILS
            </h2>
            <div className="border-b border-gray-400 mb-3" style={{ 
              borderBottomWidth: '1px', 
              borderColor: '#9CA3AF',
              marginBottom: '12pt'
            }}></div>
            
            <p style={{ 
              fontSize: '11pt',
              fontFamily: 'Calibri, "Segoe UI", Tahoma, Geneva, Verdana, sans-serif'
            }}>
              {resumeData.personalDetails}
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div 
        className="pt-6 px-8 pb-8 max-h-[800px] overflow-y-auto" 
        style={{ 
          fontFamily: 'Calibri, "Segoe UI", Tahoma, Geneva, Verdana, sans-serif', 
          fontSize: '11pt', 
          lineHeight: '1.15', 
          color: '#000'
        }}
      >
        {/* Header */}
        <div className="text-center mb-6" style={{ marginBottom: '24pt' }}>
          <h1 className="font-bold mb-3 tracking-widest uppercase" style={{ 
            fontSize: '18pt', 
            fontWeight: 'bold', 
            letterSpacing: '2pt',
            marginBottom: '12pt',
            fontFamily: 'Calibri, "Segoe UI", Tahoma, Geneva, Verdana, sans-serif'
          }}>
            {resumeData.name}
          </h1>
          
          {/* Contact Information */}
          {contactElements.length > 0 && (
            <div className="flex justify-center items-center gap-3 flex-wrap mb-4" style={{ 
              fontSize: '11pt',
              marginBottom: '12pt'
            }}>
              {contactElements.map((element, index) => (
                <React.Fragment key={index}>
                  {element}
                  {index < contactElements.length - 1 && <span>•</span>}
                </React.Fragment>
              ))}
            </div>
          )}
          
          {/* Horizontal line under contact info */}
          <div className="border-b-2 border-gray-600 mx-8" style={{ 
            borderBottomWidth: '2px', 
            borderColor: '#4B5563'
          }}></div>
        </div>

        {/* Dynamic sections based on user type */}
        {sectionOrder.map((sectionName) => renderSection(sectionName))}
      </div>
    </div>
  );
};