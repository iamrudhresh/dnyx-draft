import { ArchitectureSection } from '../components/ArchitectureSection';
import { ComparisonMatrix } from '../components/ComparisonMatrix';
import { FaqSection } from '../components/FaqSection';
import { FeatureGrid } from '../components/FeatureGrid';
import { Footer } from '../components/Footer';
import { Hero } from '../components/Hero';
import { InteractiveDemo } from '../components/InteractiveDemo';
import { Navbar } from '../components/Navbar';
import { UseCasesSection } from '../components/UseCasesSection';

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar />
      <Hero />
      <UseCasesSection />
      <InteractiveDemo />
      <FeatureGrid />
      <ArchitectureSection />
      <ComparisonMatrix />
      <FaqSection />
      <Footer />
    </main>
  );
}
