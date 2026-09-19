import React from 'react';
import BrandHero from './components/BrandHero';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import HeroNews from './components/news/HeroNews';
import QuickTopics from './components/news/QuickTopics';
import SourcesFeed from './components/news/SourcesFeed';
import PopularGrid from './components/news/PopularGrid';
import Editorial from './components/news/Editorial';
import SideNavFeed from './components/news/SideNavFeed';
import SubscribeBanner from './components/news/SubscribeBanner';
import RightRail from './components/RightRail';
import Footer from './components/layout/Footer';
import { AppProvider, useApp } from './state/store';
import ModalRoot from './components/common/ModalRoot';
import ToastStack from './components/common/ToastStack';
import CookieBanner from './components/common/CookieBanner';

function MainContent() {
  const { activeSideNav } = useApp();
  if (activeSideNav && activeSideNav !== 'Главная') {
    return <SideNavFeed mode={activeSideNav} />;
  }
  return (
    <>
      <HeroNews />
      <QuickTopics />
      <SourcesFeed />
      <PopularGrid />
      <Editorial />
    </>
  );
}

function Shell() {
  return (
    <div className="site">
      <BrandHero />
      <div className="workspace">
        <div className="dashboard">
          <Header />
          <div className="page-layout">
            <Sidebar />
            <main className="main-content">
              <MainContent />
            </main>
          </div>
          <SubscribeBanner />
        </div>
        <RightRail />
      </div>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Shell />
      <ModalRoot />
      <ToastStack />
      <CookieBanner />
    </AppProvider>
  );
}
