import React, { useEffect } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomeView } from './views/HomeView';
import { CoursesView } from './views/CoursesView';
import { CourseDetailView } from './views/CourseDetailView';
import { CheckoutView } from './views/CheckoutView';
import { ConfirmationView } from './views/ConfirmationView';
import { AccountView } from './views/AccountView';
import { AboutView } from './views/AboutView';
import { AdminView } from './views/AdminView';
import { AuthView } from './views/AuthView';

const MainRouter: React.FC = () => {
  const { currentView } = useStore();

  // Scroll to top whenever the view changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentView]);

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF6EF] text-[#4A3F3A]">
      <Header />
      <main className="flex-1">
        {currentView.view === 'home' && <HomeView />}
        {currentView.view === 'courses' && (
          <CoursesView initialCategory={currentView.category} />
        )}
        {currentView.view === 'course-detail' && (
          <CourseDetailView
            courseId={currentView.courseId}
            autoSelectSessionId={currentView.autoSelectSessionId}
          />
        )}
        {currentView.view === 'checkout' && (
          <CheckoutView
            sessionId={currentView.sessionId}
            initialQuantity={currentView.initialQuantity}
          />
        )}
        {currentView.view === 'confirmation' && (
          <ConfirmationView orderId={currentView.orderId} />
        )}
        {currentView.view === 'account' && <AccountView />}
        {currentView.view === 'about' && <AboutView />}
        {currentView.view === 'admin' && <AdminView />}
        {currentView.view === 'auth' && (
          <AuthView initialTab={currentView.initialTab} returnTo={currentView.returnTo} />
        )}
      </main>
      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <MainRouter />
    </StoreProvider>
  );
}
