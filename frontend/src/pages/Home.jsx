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

const Home = () => {
  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />
      <TopBar />
      <Navbar />
      <HeroSlider />
      <HubsSection />
      <LevelsSection />
      <StatsBar />
      <Footer />
      <FloatingMic />
      <GestureBox />
    </div>
  );
};

export default Home;