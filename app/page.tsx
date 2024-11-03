import Image from "next/image";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import FarmerHighlights from "@/components/FarmerHighlights";
import WhyChooseUs from "@/components/WhyChooseUs";
import LatestNews from "@/components/LatestNews";
import CallToAction from "@/components/CallToAction";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
    <Navbar />
    <Hero/>
    <HowItWorks/>
    <CallToAction/>
    <FarmerHighlights/>
    <WhyChooseUs/>
    <LatestNews/>
    <Footer />
    </>
  );
}
