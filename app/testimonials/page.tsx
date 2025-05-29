import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import Link from "next/link";
import { Quote, ArrowRight, Star } from "lucide-react";

// Testimonial data
const testimonials = [
  {
    id: 1,
    name: "Ibrahim Musa",
    role: "Tomato Farmer, Kano",
    image: "/assets/img/testimonials/farmer1.jpg",
    quote: "AgroMarket has transformed my farming business. I now sell directly to buyers at fair prices and have increased my income by 40%. The platform is easy to use, and I receive payments promptly. I've also learned new farming techniques through their training programs.",
    rating: 5,
    story: "I used to rely on middlemen who would buy my tomatoes at very low prices. After joining AgroMarket, I can now set my own prices and connect directly with restaurants and retailers in Kano and even Lagos. The market insights feature helps me plan my planting schedule based on demand forecasts. Last season, I was able to invest in a small irrigation system with the extra income, which has further improved my yields.",
    impact: {
      income: "+40%",
      customers: "25+",
      reach: "Nationwide"
    }
  },
  {
    id: 2,
    name: "Grace Okonkwo",
    role: "Restaurant Owner, Lagos",
    image: "/assets/img/testimonials/customer1.jpg",
    quote: "As a restaurant owner, I need consistent quality produce. AgroMarket connects me directly with reliable farmers, ensuring I always get the best ingredients for my dishes. The delivery service is prompt, and I can track my orders in real-time.",
    rating: 5,
    story: "Running a farm-to-table restaurant in Lagos requires consistent access to fresh, quality ingredients. Before AgroMarket, I struggled with unreliable suppliers and fluctuating prices. Now, I have direct relationships with farmers across Nigeria who provide me with organic vegetables, fruits, and grains. The quality assurance process ensures that I only receive the best products. My customers have noticed the improvement in our dishes, and our reputation for using fresh, local ingredients has grown significantly.",
    impact: {
      costs: "-25%",
      quality: "Improved",
      reliability: "99%"
    }
  },
  {
    id: 3,
    name: "Amina Ibrahim",
    role: "Grain Farmer, Kaduna",
    image: "/assets/img/testimonials/farmer2.jpg",
    quote: "The market insights provided by AgroMarket helped me identify high-demand crops and optimize my planting schedule. My revenue has increased by 35% since I started using their platform, and I've expanded my farm from 2 to 5 hectares.",
    rating: 5,
    story: "I inherited a small grain farm from my father and was struggling to make it profitable. Through AgroMarket's platform, I discovered that there was high demand for millet and sorghum in southern Nigeria. I adjusted my crop selection based on this insight and started using their marketplace to reach buyers beyond my local area. The financial services offered through AgroMarket helped me secure a loan to expand my farm. I now employ three additional workers from my village and have become one of the leading grain suppliers in my region.",
    impact: {
      revenue: "+35%",
      farm_size: "150% increase",
      jobs_created: "3"
    }
  },
  {
    id: 4,
    name: "David Okonkwo",
    role: "Supermarket Owner, Abuja",
    image: "/assets/img/testimonials/customer2.jpg",
    quote: "AgroMarket has revolutionized how we source fresh produce for our supermarket chain. We can now offer our customers truly farm-fresh products while supporting local farmers. The platform's logistics service ensures timely deliveries even during challenging weather conditions.",
    rating: 4,
    story: "Managing the produce section of a supermarket chain in Abuja was always challenging due to supply chain inconsistencies. Since partnering with AgroMarket, we've been able to source directly from farms across Nigeria. The platform's quality control measures ensure that we only receive products that meet our standards. Our customers appreciate the freshness and quality of our produce, and sales in our fresh food department have increased by 30%. We've also been able to reduce waste by 25% due to the improved supply chain efficiency.",
    impact: {
      sales: "+30%",
      waste: "-25%",
      customer_satisfaction: "Significantly improved"
    }
  },
  {
    id: 5,
    name: "Fatima Abdullahi",
    role: "Poultry Farmer, Sokoto",
    image: "/assets/img/testimonials/farmer3.jpg",
    quote: "As a female farmer in a rural area, I faced many challenges in accessing markets. AgroMarket has given me a platform to sell my poultry products to buyers across Nigeria. The training programs have also helped me improve my farming practices and increase productivity.",
    rating: 5,
    story: "I started my poultry farm with just 50 birds and limited knowledge of modern farming techniques. Through AgroMarket's farmer training program, I learned about improved feeding practices, disease prevention, and business management. The platform helped me connect with buyers in urban areas who value free-range, organically raised chickens. I've now expanded to 500 birds and have diversified into egg production. The financial services offered through AgroMarket helped me secure funding for a small processing facility, allowing me to offer prepared poultry products at premium prices.",
    impact: {
      farm_size: "10x growth",
      knowledge: "Significantly improved",
      market_access: "Nationwide"
    }
  },
  {
    id: 6,
    name: "Emmanuel Nwachukwu",
    role: "Food Processor, Enugu",
    image: "/assets/img/testimonials/customer3.jpg",
    quote: "Our food processing company relies on consistent, high-quality agricultural inputs. AgroMarket has streamlined our sourcing process, connecting us with reliable farmers who meet our standards. The bulk ordering feature and logistics service have significantly improved our operational efficiency.",
    rating: 5,
    story: "Our company produces packaged cassava products for both local consumption and export. Finding consistent, high-quality cassava suppliers was always a challenge until we discovered AgroMarket. The platform's verification process ensures that we only work with farmers who meet our quality standards. The bulk ordering feature allows us to secure large quantities of cassava at competitive prices, and the logistics service ensures timely delivery to our processing facility. We've been able to increase our production capacity by 40% and expand our export markets due to the improved quality and consistency of our products.",
    impact: {
      production: "+40%",
      supplier_base: "Expanded by 200%",
      quality: "Consistently high"
    }
  },
  {
    id: 7,
    name: "Blessing Okafor",
    role: "Fruit Farmer, Cross River",
    image: "/assets/img/testimonials/farmer4.jpg",
    quote: "My pineapple farm was struggling due to limited local market access. AgroMarket opened up new opportunities by connecting me with buyers in major cities. The platform's logistics service ensures my fruits arrive fresh, and I've seen my profits double in just one year.",
    rating: 4,
    story: "Living in a remote area of Cross River State, I faced significant challenges in getting my pineapples to market before they spoiled. Local middlemen would offer very low prices, knowing I had few alternatives. After joining AgroMarket, I gained access to buyers in Lagos, Abuja, and Port Harcourt who value the unique sweetness of Cross River pineapples. The platform's cold chain logistics service ensures my fruits arrive in perfect condition. I've been able to expand my farm and now grow other tropical fruits as well. The market insights feature helps me time my harvests to coincide with periods of peak demand and pricing.",
    impact: {
      profits: "Doubled",
      product_range: "Expanded",
      wastage: "Reduced by 60%"
    }
  },
  {
    id: 8,
    name: "Chinedu Eze",
    role: "Cooperative Leader, Imo",
    image: "/assets/img/testimonials/farmer5.jpg",
    quote: "Our farming cooperative of 50 small-scale farmers has thrived since joining AgroMarket. The platform's bulk selling feature allows us to aggregate our produce and access larger buyers. The training and financial services have helped our members improve their farming practices and increase yields.",
    rating: 5,
    story: "Our cooperative consists of 50 small-scale farmers who individually lacked the volume to attract significant buyers. Through AgroMarket, we can aggregate our produce and access markets that were previously beyond our reach. The platform's training programs have introduced our members to improved farming techniques, resulting in yield increases of 30-50%. The financial services have helped many of our members invest in better inputs and small-scale irrigation. We've seen a remarkable transformation in our community, with increased incomes leading to improved housing, education, and healthcare. Several young people who had left for the cities have returned to farming, seeing it now as a viable and profitable career.",
    impact: {
      collective_income: "+60%",
      youth_engagement: "Increased",
      community_development: "Significant"
    }
  }
];

export default function TestimonialsPage() {
  return (
    <>
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative bg-green-900 py-20 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 overflow-hidden">
          <Image 
            src="/assets/img/testimonials/testimonials-hero.jpg" 
            alt="Farmers in a field" 
            fill
            className="object-cover opacity-20"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-green-900/90 to-green-800/80"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
              Success Stories
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-300">
              Real experiences from farmers and buyers who have transformed their businesses with AgroMarket.
            </p>
          </div>
        </div>
      </section>
      
      {/* Featured Testimonials */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Hear From Our Community</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover how AgroMarket is transforming agricultural commerce and improving livelihoods across Nigeria.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {testimonials.slice(0, 2).map((testimonial) => (
              <div key={testimonial.id} className="bg-gray-50 rounded-xl overflow-hidden shadow-sm">
                <div className="p-8">
                  <div className="flex items-center mb-6">
                    <div className="h-16 w-16 relative rounded-full overflow-hidden mr-4">
                      <Image 
                        src={testimonial.image} 
                        alt={testimonial.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{testimonial.name}</h3>
                      <p className="text-green-600">{testimonial.role}</p>
                      <div className="flex items-center mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`h-4 w-4 ${i < testimonial.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="relative">
                    <Quote className="absolute top-0 left-0 h-8 w-8 text-green-200 -translate-x-4 -translate-y-4" />
                    <p className="text-gray-600 italic mb-6 relative z-10">
                      "{testimonial.quote}"
                    </p>
                  </div>
                  
                  <Link 
                    href={`#testimonial-${testimonial.id}`} 
                    className="text-green-600 font-medium flex items-center hover:text-green-700"
                  >
                    Read full story <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* All Testimonials */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">More Success Stories</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Explore how AgroMarket is making a difference for farmers and buyers across Nigeria.
            </p>
          </div>
          
          <div className="space-y-16">
            {testimonials.map((testimonial) => (
              <div 
                id={`testimonial-${testimonial.id}`} 
                key={testimonial.id} 
                className="bg-white rounded-xl shadow-sm overflow-hidden"
              >
                <div className="grid grid-cols-1 lg:grid-cols-3">
                  <div className="relative h-64 lg:h-auto">
                    <Image 
                      src={testimonial.image} 
                      alt={testimonial.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  
                  <div className="p-8 lg:col-span-2">
                    <div className="flex items-center mb-6">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900">{testimonial.name}</h3>
                        <p className="text-green-600 text-lg">{testimonial.role}</p>
                        <div className="flex items-center mt-1">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`h-5 w-5 ${i < testimonial.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="relative mb-8">
                      <Quote className="absolute top-0 left-0 h-10 w-10 text-green-100 -translate-x-4 -translate-y-4" />
                      <p className="text-gray-600 italic text-lg mb-6 relative z-10">
                        "{testimonial.quote}"
                      </p>
                    </div>
                    
                    <div className="mb-8">
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">Their Story</h4>
                      <p className="text-gray-600">{testimonial.story}</p>
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">Impact</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {Object.entries(testimonial.impact).map(([key, value]) => (
                          <div key={key} className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-2xl font-bold text-green-600">{value}</p>
                            <p className="text-sm text-gray-600 capitalize">{key.replace('_', ' ')}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Share Your Story CTA */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-green-900 text-white">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Have a Success Story to Share?</h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            We'd love to hear how AgroMarket has helped transform your agricultural business.
          </p>
          <Link 
            href="/contact" 
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-green-900 bg-white hover:bg-gray-100"
          >
            Share Your Story
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>
      
      {/* Join AgroMarket CTA */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="bg-green-50 rounded-2xl p-8 sm:p-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Write Your Success Story?</h2>
                <p className="text-lg text-gray-600 mb-6">
                  Join thousands of farmers and buyers who are transforming their businesses with AgroMarket. Our platform provides the tools, connections, and support you need to succeed.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link 
                    href="/signup" 
                    className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
                  >
                    Join AgroMarket
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                  <Link 
                    href="/services" 
                    className="inline-flex items-center justify-center px-6 py-3 border border-green-600 text-base font-medium rounded-md shadow-sm text-green-600 bg-white hover:bg-gray-50"
                  >
                    Explore Our Services
                  </Link>
                </div>
              </div>
              <div className="relative h-64 lg:h-auto rounded-xl overflow-hidden">
                <Image 
                  src="/assets/img/testimonials/join-cta.jpg" 
                  alt="Farmers using AgroMarket" 
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </>
  );
}
