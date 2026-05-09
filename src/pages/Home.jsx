import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import StatsBar from '../components/StatsBar';
import CuratedEscapes from '../components/CuratedEscapes';
import FeaturesSection from '../components/FeaturesSection';
import NewsletterSection from '../components/NewsletterSection';
import Footer from '../components/Footer';
import useScrollReveal from '../hooks/useScrollReveal';

export default function Home() {
  useScrollReveal();

  return (
    <div className="min-h-screen bg-white font-sans">
      <Navbar />
      <HeroSection />
      <StatsBar />
      <CuratedEscapes />
      <FeaturesSection />
      <NewsletterSection />
      <Footer />
    </div>
  );
}
