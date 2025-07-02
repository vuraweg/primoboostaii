import React, { useState, useEffect } from 'react';
import { Menu, X, Home, Info, BookOpen, Phone, FileText } from 'lucide-react';
import { AuthProvider } from './contexts/AuthContext';
import { Header } from './components/Header';
import { Navigation } from './components/navigation/Navigation';
import { MobileNavBar } from './components/navigation/MobileNavBar';
import ResumeOptimizer from './components/ResumeOptimizer';
import { AboutUs } from './components/pages/AboutUs';
import { Contact } from './components/pages/Contact';
import { Tutorials } from './components/pages/Tutorials';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [showMobileMenu, setShowMobileMenu] = useState(false);

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
      case 'home':
      default:
        return (
          <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
            <ResumeOptimizer />
          </div>
        );
    }
  };

  return (
    <AuthProvider>
      <div className="min-h-screen pb-16 md:pb-0">
        {currentPage === 'home' ? (
          // For home page, show the header with navigation integrated
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
                    <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-2.5 rounded-xl shadow-lg">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/>
                        <path d="M14 2v6h6"/>
                        <path d="M16 13H8"/>
                        <path d="M16 17H8"/>
                        <path d="M10 9H8"/>
                      </svg>
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
                    <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-2.5 rounded-xl shadow-lg">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/>
                        <path d="M14 2v6h6"/>
                        <path d="M16 13H8"/>
                        <path d="M16 17H8"/>
                        <path d="M10 9H8"/>
                      </svg>
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
                      { id: 'home', label: 'Home', icon: <Home className="w-5 h-5" /> },
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
      </div>
    </AuthProvider>
  );
}

export default App;