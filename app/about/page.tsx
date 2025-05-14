import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle, ArrowRight } from "lucide-react";

export default function AboutPage() {
  return (
    <>
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative bg-green-900 py-20 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 overflow-hidden">
          <Image 
            src="/assets/img/about-hero.jpg" 
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
              About AgroMarket
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-300">
              Connecting farmers to markets and revolutionizing agricultural commerce across Africa.
            </p>
          </div>
        </div>
      </section>
      
      {/* Our Story Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
              <p className="text-lg text-gray-600 mb-6">
                AgroMarket was founded in 2022 with a simple yet powerful vision: to transform how agricultural products are bought and sold in Africa. We recognized the challenges faced by farmers in accessing fair markets and the difficulties consumers encounter in finding quality, locally-sourced produce.
              </p>
              <p className="text-lg text-gray-600 mb-6">
                What began as a small platform connecting local farmers with nearby consumers has grown into Nigeria's leading agricultural marketplace, serving thousands of farmers and buyers across the country.
              </p>
              <p className="text-lg text-gray-600">
                Today, we're proud to be at the forefront of agricultural innovation, leveraging technology to create sustainable, efficient, and equitable food systems that benefit everyone in the supply chain.
              </p>
            </div>
            <div className="relative h-96 rounded-xl overflow-hidden shadow-xl">
              <Image 
                src="/assets/img/about-story.jpg" 
                alt="AgroMarket founders" 
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>
      
      {/* Mission & Vision Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Mission & Vision</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We're driven by a commitment to transform agricultural commerce through technology and innovation.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-sm">
              <h3 className="text-2xl font-bold text-green-600 mb-4">Our Mission</h3>
              <p className="text-gray-600 mb-6">
                To empower farmers with direct market access and fair prices while providing consumers with fresh, quality produce through a transparent and efficient platform.
              </p>
              <ul className="space-y-3">
                {[
                  "Connect farmers directly to buyers, eliminating middlemen",
                  "Provide market insights and analytics to farmers",
                  "Ensure fair pricing and transparent transactions",
                  "Promote sustainable farming practices"
                ].map((item, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-sm">
              <h3 className="text-2xl font-bold text-green-600 mb-4">Our Vision</h3>
              <p className="text-gray-600 mb-6">
                To create Africa's most trusted agricultural marketplace that transforms food systems, enhances food security, and improves livelihoods across the continent.
              </p>
              <ul className="space-y-3">
                {[
                  "Build the largest digital agricultural ecosystem in Africa",
                  "Revolutionize how agricultural products are traded",
                  "Improve food security through efficient distribution",
                  "Create economic opportunities for rural communities"
                ].map((item, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
      
      {/* Our Services Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Services</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We provide comprehensive solutions for farmers, buyers, and agricultural stakeholders.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Marketplace Platform",
                description: "A secure online platform where farmers can list their products and buyers can discover and purchase quality agricultural goods.",
                image: "/assets/img/services/marketplace.jpg"
              },
              {
                title: "Logistics & Delivery",
                description: "Efficient transportation and delivery services to ensure products reach buyers in optimal condition.",
                image: "/assets/img/services/logistics.jpg"
              },
              {
                title: "Market Insights",
                description: "Data-driven market intelligence to help farmers make informed decisions about pricing and production.",
                image: "/assets/img/services/insights.jpg"
              },
              {
                title: "Quality Assurance",
                description: "Verification and quality control processes to ensure all products meet high standards.",
                image: "/assets/img/services/quality.jpg"
              },
              {
                title: "Farmer Training",
                description: "Educational resources and training programs to help farmers improve their practices and productivity.",
                image: "/assets/img/services/training.jpg"
              },
              {
                title: "Financial Services",
                description: "Access to loans, insurance, and other financial products tailored for agricultural businesses.",
                image: "/assets/img/services/financial.jpg"
              }
            ].map((service, index) => (
              <div key={index} className="bg-gray-50 rounded-xl overflow-hidden shadow-sm transition-transform hover:scale-105">
                <div className="h-48 relative">
                  <Image 
                    src={service.image} 
                    alt={service.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{service.title}</h3>
                  <p className="text-gray-600 mb-4">{service.description}</p>
                  <Link href="/services" className="text-green-600 font-medium flex items-center hover:text-green-700">
                    Learn more <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link 
              href="/services" 
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
            >
              Explore All Services
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
      
      {/* Team Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Team</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Meet the passionate individuals driving our mission to transform agricultural commerce.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                name: "Adebayo Johnson",
                role: "Founder & CEO",
                bio: "Former agricultural economist with 15 years of experience in the Nigerian agricultural sector.",
                image: "/assets/img/team/ceo.jpg"
              },
              {
                name: "Chioma Okafor",
                role: "Chief Operations Officer",
                bio: "Supply chain expert who has worked with major agricultural cooperatives across West Africa.",
                image: "/assets/img/team/coo.jpg"
              },
              {
                name: "Emmanuel Nwachukwu",
                role: "Chief Technology Officer",
                bio: "Tech entrepreneur with multiple successful platforms in the African market.",
                image: "/assets/img/team/cto.jpg"
              },
              {
                name: "Fatima Abdullahi",
                role: "Head of Farmer Relations",
                bio: "Agricultural extension specialist with deep connections to farming communities.",
                image: "/assets/img/team/farmer-relations.jpg"
              }
            ].map((member, index) => (
              <div key={index} className="bg-white rounded-xl overflow-hidden shadow-sm text-center">
                <div className="h-64 relative">
                  <Image 
                    src={member.image} 
                    alt={member.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900">{member.name}</h3>
                  <p className="text-green-600 font-medium mb-2">{member.role}</p>
                  <p className="text-gray-600 text-sm">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Testimonials Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What People Say About Us</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Hear from the farmers and buyers who have experienced the AgroMarket difference.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                quote: "AgroMarket has transformed my farming business. I now sell directly to buyers at fair prices and have increased my income by 40%.",
                name: "Ibrahim Musa",
                role: "Tomato Farmer, Kano",
                image: "/assets/img/testimonials/farmer1.jpg"
              },
              {
                quote: "As a restaurant owner, I need consistent quality produce. AgroMarket connects me directly with reliable farmers, ensuring I always get the best ingredients.",
                name: "Grace Okonkwo",
                role: "Restaurant Owner, Lagos",
                image: "/assets/img/testimonials/customer1.jpg"
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-gray-50 p-8 rounded-xl shadow-sm">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mr-4">
                    <div className="h-16 w-16 relative rounded-full overflow-hidden">
                      <Image 
                        src={testimonial.image} 
                        alt={testimonial.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-600 italic mb-4">"{testimonial.quote}"</p>
                    <p className="font-medium text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link 
              href="/testimonials" 
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
            >
              Read More Success Stories
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
      
      {/* Contact Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-green-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Get In Touch</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Have questions or want to learn more about AgroMarket? We'd love to hear from you.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="bg-white p-8 rounded-xl shadow-sm">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Contact Information</h3>
              
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">Headquarters</h4>
                  <p className="text-gray-600">
                    123 Agro Plaza, Victoria Island<br />
                    Lagos, Nigeria
                  </p>
                </div>
                
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">Email</h4>
                  <p className="text-gray-600">
                    info@agromarket.ng<br />
                    support@agromarket.ng
                  </p>
                </div>
                
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">Phone</h4>
                  <p className="text-gray-600">
                    +234 123 456 7890<br />
                    +234 987 654 3210
                  </p>
                </div>
                
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">Hours</h4>
                  <p className="text-gray-600">
                    Monday - Friday: 8:00 AM - 6:00 PM<br />
                    Saturday: 9:00 AM - 2:00 PM<br />
                    Sunday: Closed
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-sm">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Send Us a Message</h3>
              
              <form className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Your Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="Enter your name"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Enter subject"
                  />
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                    Message
                  </label>
                  <textarea
                    id="message"
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Enter your message"
                  ></textarea>
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-green-600 text-white font-medium py-2 px-4 rounded-md hover:bg-green-700 transition-colors duration-300"
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </>
  );
}
