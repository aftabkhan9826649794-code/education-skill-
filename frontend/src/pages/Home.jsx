import React from 'react';
import TopBar from '../components/TopBar';
import Navbar from '../components/Navbar';
import HeroSlider from '../components/HeroSlider';
import HubsSection from '../components/HubsSection';
import LevelsSection from '../components/LevelsSection';
import StatsBar from '../components/StatsBar';
import Footer from '../components/Footer';
import FloatingMic from '../components/FloatingMic';
import GestureBox from '../components/GestureBox';
import AnimatedBackground from '../components/AnimatedBackground';
import SARAWidget from '../components/SARAWidget';
import AccessibilitySidebar from '../components/AccessibilitySidebar';

const Home = () => {
  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />
      <AccessibilitySidebar />
      <TopBar />
      <Navbar />
      <HeroSlider />
      <HubsSection />
      <LevelsSection />
      <StatsBar />
      <Footer />
      <SARAWidget />
      <FloatingMic />
      <GestureBox />
    </div>
  );
};

export default Home;
