import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import EnhancedHero from "@/components/EnhancedHero";
import FeaturedProducts from "@/components/FeaturedProducts";
import EnhancedHowItWorks from "@/components/EnhancedHowItWorks";
import SustainabilitySection from "@/components/SustainabilitySection";
import CommunitySection from "@/components/CommunitySection";
import EnhancedCallToAction from "@/components/EnhancedCallToAction";
import FarmerHighlights from "@/components/FarmerHighlights";
import LatestNews from "@/components/LatestNews";

export default function Home() {
  console.log('Rendering Home Page');
  return (
    <>
      <Navbar />
      <EnhancedHero />
      <FeaturedProducts />
      <EnhancedHowItWorks />
      <SustainabilitySection />
      <FarmerHighlights />
      <CommunitySection />
      <LatestNews />
      <EnhancedCallToAction />
      <Footer />
    </>
  );
}
