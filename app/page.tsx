import Image from "next/image";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import FarmerHighlights from "@/components/FarmerHighlights";
import WhyChooseUs from "@/components/WhyChooseUs";

export default function Home() {
  return (
    <>
    <Hero/>
    <HowItWorks/>
    <FarmerHighlights/>
    <WhyChooseUs/>
    </>
  );
}
