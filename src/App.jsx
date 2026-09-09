import React from 'react';
import BrandHero from './components/BrandHero';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import HeroNews from './components/news/HeroNews';
import QuickTopics from './components/news/QuickTopics';
import PopularGrid from './components/news/PopularGrid';
import Editorial from './components/news/Editorial';
import SubscribeBanner from './components/news/SubscribeBanner';
import RightRail from './components/RightRail';

export default function App() {
  return (
    <div className="site">
      <BrandHero />
      <div className="workspace">
        <div className="dashboard">
          <Header />
          <div className="page-layout">
            <Sidebar />
            <main className="main-content">
              <HeroNews />
              <QuickTopics />
              <PopularGrid />
              <Editorial />
              <SubscribeBanner />
            </main>
          </div>
        </div>
        <RightRail />
      </div>
    </div>
  );
}
