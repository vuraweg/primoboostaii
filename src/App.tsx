import React, { useState, useEffect } from 'react';
import { Menu, X, Home, Info, BookOpen, Phone, FileText, LogIn, LogOut, Target } from 'lucide-react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Header } from './components/Header';
import { Navigation } from './components/navigation/Navigation';
import { MobileNavBar } from './components/navigation/MobileNavBar';
import ResumeOptimizer from './components/ResumeOptimizer';
import { ATSResumeBuilder } from './components/ATSResumeBuilder';
import { AboutUs } from './components/pages/AboutUs';
import { Contact } from './components/pages/Contact';
import { JobApplicationTracker } from './components/JobApplicationTracker';
import { Tutorials } from './components/pages/Tutorials';
import { AuthModal } from './components/auth/AuthModal';
import logoImage from '/a-modern-logo-design-featuring-primoboos_XhhkS8E_Q5iOwxbAXB4CqQ_HnpCsJn4S1yrhb826jmMDw.jpeg';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Handle mobile menu toggle
  const handleMobileMenuToggle = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  // Handle page change from mobile nav
  const handlePageChange = (page: string) => {
    if (page === 'menu') {
      handleMobileMenuToggle();
    } else {
      setCurrentPage(page);
      setShowMobileMenu(false);
    }
  };

  // Handle showing auth modal
  const handleShowAuth = () => {
    console.log('handleShowAuth called'); // Debug log
    setShowAuthModal(true);
    setShowMobileMenu(false);
  };

  // Close mobile menu on window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) { // md breakpoint
        setShowMobileMenu(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'about':
        return <AboutUs />;
      case 'contact':
        return <Contact />;
      case 'tutorials':
        return <Tutorials />;
      case 'ats-builder':
        return <ATSResumeBuilder onBackToHome={() => setCurrentPage('home')} />;
      case 'job-tracker':
        return <JobApplicationTracker />;
      case 'home':
      default:
        return (
          <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
            <ResumeOptimizer onPageChange={setCurrentPage} />
          </div>
        );
    }
  };

  return (
    <AuthProvider>
      <div className="min-h-screen pb-16 md:pb-0">
        {(currentPage === 'home' || currentPage === 'ats-builder') ? (
          // For home and ATS builder pages, show the header with navigation integrated
          <>
            <Header onMobileMenuToggle={handleMobileMenuToggle} showMobileMenu={showMobileMenu}>
              <Navigation currentPage={currentPage} onPageChange={setCurrentPage} />
            </Header>
            {renderCurrentPage()}
          </>
        ) : (
          // For other pages, show a simpler header with navigation
          <>
            <header className="bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-200 sticky top-0 z-40">
              <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                  <button
                    onClick={() => setCurrentPage('home')}
                    className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
                  >
                    <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg">
                      <img 
                        src={logoImage} 
                        alt="PrimoBoost AI Logo" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h1 className="text-xl font-bold text-gray-900">PrimoBoost AI</h1>
                    </div>
                  </button>
                  
                  <Navigation currentPage={currentPage} onPageChange={setCurrentPage} />
                  
                  {/* Mobile Menu Button */}
                  <button
                    onClick={handleMobileMenuToggle}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 sm:hidden"
                  >
                    <Menu className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </header>
            {renderCurrentPage()}
          </>
        )}
        
        {/* Mobile Bottom Navigation */}
        <MobileNavBar currentPage={currentPage} onPageChange={handlePageChange} />
        
        {/* Mobile Menu Overlay */}
        {showMobileMenu && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div 
              className="fixed inset-0 bg-black/50 backdrop-blur-sm" 
              onClick={() => setShowMobileMenu(false)}
            />
            <div className="fixed top-0 right-0 h-full w-80 max-w-[90vw] bg-white shadow-2xl p-6 overflow-y-auto">
              <div className="flex flex-col space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg">
                      <img 
                        src={logoImage} 
                        alt="PrimoBoost AI Logo" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h1 className="text-xl font-bold text-gray-900">PrimoBoost AI</h1>
                  </div>
                  <button
                    onClick={() => setShowMobileMenu(false)}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="border-t border-gray-200 pt-6">
                  <nav className="flex flex-col space-y-4">
                    {[
                      { id: 'home', label: 'Resume Optimizer', icon: <Home className="w-5 h-5" /> },
                      { id: 'ats-builder', label: 'ATS Resume Builder', icon: <Target className="w-5 h-5" /> },
                      { id: 'job-tracker', label: 'Job Tracker', icon: <Briefcase className="w-5 h-5" /> },
                      { id: 'about', label: 'About Us', icon: <Info className="w-5 h-5" /> },
                      { id: 'tutorials', label: 'Tutorials', icon: <BookOpen className="w-5 h-5" /> },
                      { id: 'contact', label: 'Contact', icon: <Phone className="w-5 h-5" /> }
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          setCurrentPage(item.id);
                          setShowMobileMenu(false);
                        }}
                        className={`flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                          currentPage === item.id
                            ? 'bg-blue-100 text-blue-700 shadow-md'
                            : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                        }`}
                      >
                        {item.icon}
                        <span>{item.label}</span>
                      </button>
                    ))}
                  </nav>
                </div>
                
                {/* Authentication Section */}
                <div className="border-t border-gray-200 pt-6">
                  <AuthButtons 
                    onPageChange={setCurrentPage} 
                    onClose={() => setShowMobileMenu(false)}
                    onShowAuth={handleShowAuth}
                  />
                </div>
                
                <div className="mt-auto pt-6 border-t border-gray-200">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4">
                    <p className="text-sm text-gray-700 mb-2">
                      Need help with your resume?
                    </p>
                    <button
                      onClick={() => {
                        setCurrentPage('home');
                        setShowMobileMenu(false);
                      }}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm flex items-center justify-center space-x-2"
                    >
                      <FileText className="w-4 h-4" />
                      <span>Optimize Now</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Auth Modal */}
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
        />
      </div>
    </AuthProvider>
  );
}

// Authentication Buttons Component
const AuthButtons: React.FC<{ 
  onPageChange: (page: string) => void; 
  onClose: () => void;
  onShowAuth: () => void;
}> = ({ onPageChange, onClose, onShowAuth }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      onClose();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleLogin = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Sign in button clicked - calling onShowAuth'); // Debug log
    onShowAuth(); // This should show the auth modal and close the mobile menu
  };

  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-500 mb-3">Account</h3>
      {isAuthenticated && user ? (
        <div className="space-y-3">
          <div className="flex items-center space-x-3 px-4 py-3 bg-blue-50 rounded-xl">
            <div className="bg-blue-600 w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold">
              {user.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
            </div>
            <div className="overflow-hidden">
              <p className="font-medium text-gray-900 truncate">{user.name}</p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 text-red-600 hover:bg-red-50"
          >
            <LogOut className="w-5 h-5" />
            <span>{isLoggingOut ? 'Signing Out...' : 'Sign Out'}</span>
          </button>
        </div>
      ) : (
        <button
          onClick={handleLogin}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 bg-blue-600 text-white hover:bg-blue-700"
          type="button"
        >
          <LogIn className="w-5 h-5" />
          <span>Sign In</span>
        </button>
      )}
    </div>
  );
};

export default App;