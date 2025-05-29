import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle, ArrowRight } from "lucide-react";

// Service data
const services = [
  {
    id: 1,
    title: "Marketplace Platform",
    description: "Our core service is a secure, user-friendly online marketplace that connects farmers directly with buyers. Farmers can list their products, set their prices, and reach a wider customer base, while buyers can discover quality agricultural products from verified local sources.",
    features: [
      "Easy product listing and management",
      "Secure payment processing",
      "Buyer-seller messaging system",
      "Ratings and reviews",
      "Product verification",
      "Search and filter capabilities"
    ],
    image: "/assets/img/services/marketplace.jpg",
    cta: "Start Selling",
    ctaLink: "/signup"
  },
  {
    id: 2,
    title: "Logistics & Delivery",
    description: "We provide reliable transportation and delivery services to ensure agricultural products reach buyers in optimal condition. Our logistics network covers major cities and rural areas across Nigeria, with options for same-day, next-day, or scheduled deliveries.",
    features: [
      "Nationwide delivery coverage",
      "Temperature-controlled transport",
      "Real-time tracking",
      "Flexible delivery scheduling",
      "Bulk shipping options",
      "Last-mile delivery solutions"
    ],
    image: "/assets/img/services/logistics.jpg",
    cta: "Learn About Shipping",
    ctaLink: "/shipping"
  },
  {
    id: 3,
    title: "Market Insights",
    description: "Our data analytics platform provides farmers and buyers with valuable market intelligence. Access real-time pricing data, demand trends, seasonal forecasts, and competitive analysis to make informed business decisions and maximize profitability.",
    features: [
      "Price trend analysis",
      "Demand forecasting",
      "Seasonal market reports",
      "Competitor benchmarking",
      "Regional market insights",
      "Customized data dashboards"
    ],
    image: "/assets/img/services/insights.jpg",
    cta: "Access Insights",
    ctaLink: "/dashboard/analytics"
  },
  {
    id: 4,
    title: "Quality Assurance",
    description: "We implement rigorous quality control processes to ensure all products on our platform meet high standards. Our verification team conducts farm visits, product inspections, and certification checks to maintain trust and transparency in our marketplace.",
    features: [
      "Product quality verification",
      "Farm inspections",
      "Certification validation",
      "Quality dispute resolution",
      "Product grading standards",
      "Safety compliance checks"
    ],
    image: "/assets/img/services/quality.jpg",
    cta: "Our Quality Standards",
    ctaLink: "/quality"
  },
  {
    id: 5,
    title: "Farmer Training",
    description: "We offer comprehensive educational resources and training programs to help farmers improve their practices, increase productivity, and adapt to changing market demands. Our workshops cover everything from sustainable farming techniques to digital marketing skills.",
    features: [
      "Sustainable farming practices",
      "Crop management techniques",
      "Digital literacy training",
      "Marketing and sales skills",
      "Financial management",
      "Climate-smart agriculture"
    ],
    image: "/assets/img/services/training.jpg",
    cta: "Join Training Program",
    ctaLink: "/training"
  },
  {
    id: 6,
    title: "Financial Services",
    description: "We provide access to tailored financial products for agricultural businesses. Through partnerships with financial institutions, we offer loans, insurance, and payment solutions designed specifically for the unique needs and cycles of farming operations.",
    features: [
      "Agricultural loans",
      "Crop insurance",
      "Flexible payment terms",
      "Invoice financing",
      "Equipment leasing",
      "Financial literacy training"
    ],
    image: "/assets/img/services/financial.jpg",
    cta: "Explore Financial Options",
    ctaLink: "/financial-services"
  }
];

// Pricing plans
const pricingPlans = [
  {
    name: "Basic",
    price: "Free",
    description: "Perfect for small-scale farmers just getting started.",
    features: [
      "List up to 5 products",
      "Basic marketplace access",
      "Standard visibility",
      "Email support",
      "Basic analytics"
    ],
    cta: "Get Started",
    ctaLink: "/signup",
    popular: false
  },
  {
    name: "Premium",
    price: "₦5,000",
    period: "per month",
    description: "Ideal for growing agricultural businesses looking to expand their reach.",
    features: [
      "Unlimited product listings",
      "Featured product placement",
      "Priority in search results",
      "Priority customer support",
      "Advanced analytics dashboard",
      "Access to market insights",
      "Discounted delivery rates"
    ],
    cta: "Upgrade Now",
    ctaLink: "/pricing",
    popular: true
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "Tailored solutions for large-scale agricultural operations and cooperatives.",
    features: [
      "All Premium features",
      "Dedicated account manager",
      "Custom integration options",
      "Bulk listing tools",
      "Advanced logistics solutions",
      "Comprehensive market analytics",
      "Training and onboarding support"
    ],
    cta: "Contact Sales",
    ctaLink: "/contact",
    popular: false
  }
];

export default function ServicesPage() {
  return (
    <>
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative bg-green-900 py-20 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 overflow-hidden">
          <Image 
            src="/assets/img/services/services-hero.jpg" 
            alt="Agricultural services" 
            fill
            className="object-cover opacity-20"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-green-900/90 to-green-800/80"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
              Our Services
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-300">
              Comprehensive solutions to transform agricultural commerce and empower farmers across Nigeria.
            </p>
          </div>
        </div>
      </section>
      
      {/* Services Overview */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How We Support Agricultural Commerce</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From farm to table, we provide end-to-end solutions that connect farmers with markets and streamline the agricultural supply chain.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {services.slice(0, 3).map((service) => (
              <div key={service.id} className="bg-gray-50 rounded-xl overflow-hidden shadow-sm transition-transform hover:shadow-md">
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
                  <p className="text-gray-600 mb-4 line-clamp-3">{service.description}</p>
                  <Link href={`/services#service-${service.id}`} className="text-green-600 font-medium flex items-center hover:text-green-700">
                    Learn more <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center">
            <Link 
              href="#all-services" 
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
            >
              View All Services
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
      
      {/* Detailed Services */}
      <section id="all-services" className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Comprehensive Services</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Explore our full range of services designed to support every aspect of agricultural commerce.
            </p>
          </div>
          
          <div className="space-y-16">
            {services.map((service, index) => (
              <div 
                id={`service-${service.id}`} 
                key={service.id} 
                className={`flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-8 items-center`}
              >
                <div className="lg:w-1/2">
                  <div className="relative h-64 sm:h-80 w-full rounded-xl overflow-hidden shadow-lg">
                    <Image 
                      src={service.image} 
                      alt={service.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
                
                <div className="lg:w-1/2">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">{service.title}</h3>
                  <p className="text-gray-600 mb-6">{service.description}</p>
                  
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Key Features:</h4>
                  <ul className="space-y-2 mb-6">
                    {service.features.map((feature, i) => (
                      <li key={i} className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Link 
                    href={service.ctaLink} 
                    className="inline-flex items-center px-5 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
                  >
                    {service.cta}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Pricing Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Pricing Plans</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose the plan that best fits your agricultural business needs.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <div 
                key={index} 
                className={`relative rounded-2xl shadow-sm overflow-hidden ${
                  plan.popular 
                    ? 'border-2 border-green-500 transform scale-105 z-10' 
                    : 'border border-gray-200'
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-0 bg-green-500 text-white px-4 py-1 text-sm font-medium">
                    Most Popular
                  </div>
                )}
                
                <div className="p-6 bg-white">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <div className="mb-4">
                    <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
                    {plan.period && (
                      <span className="text-gray-500 ml-2">{plan.period}</span>
                    )}
                  </div>
                  <p className="text-gray-600 mb-6">{plan.description}</p>
                  
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                        <span className="text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Link 
                    href={plan.ctaLink} 
                    className={`w-full inline-flex justify-center items-center px-5 py-3 border text-base font-medium rounded-md shadow-sm ${
                      plan.popular
                        ? 'bg-green-600 text-white hover:bg-green-700 border-transparent'
                        : 'bg-white text-green-600 hover:bg-gray-50 border-green-600'
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">Need a custom solution for your specific requirements?</p>
            <Link 
              href="/contact" 
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
            >
              Contact Our Team
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
      
      {/* Testimonials */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What Our Clients Say</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Hear from farmers and buyers who have experienced the benefits of our services.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                quote: "AgroMarket's logistics service has been a game-changer for my business. I can now deliver fresh produce to customers across Lagos without worrying about transportation.",
                name: "Oluwaseun Adeyemi",
                role: "Vegetable Farmer, Ogun State",
                image: "/assets/img/testimonials/farmer1.jpg"
              },
              {
                quote: "The market insights provided by AgroMarket helped me identify high-demand crops and optimize my planting schedule. My revenue has increased by 35% since I started using their platform.",
                name: "Amina Ibrahim",
                role: "Grain Farmer, Kaduna",
                image: "/assets/img/testimonials/farmer2.jpg"
              },
              {
                quote: "As a restaurant owner, I need reliable suppliers. AgroMarket's quality assurance process ensures I always get the best ingredients, and their delivery is always on time.",
                name: "David Okonkwo",
                role: "Restaurant Owner, Abuja",
                image: "/assets/img/testimonials/customer1.jpg"
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-sm">
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
      
      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-green-900 text-white">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Transform Your Agricultural Business?</h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            Join thousands of farmers and buyers who are already benefiting from our comprehensive services.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link 
              href="/signup" 
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-green-900 bg-white hover:bg-gray-100"
            >
              Get Started
            </Link>
            <Link 
              href="/contact" 
              className="inline-flex items-center justify-center px-6 py-3 border border-white text-base font-medium rounded-md shadow-sm text-white hover:bg-green-800"
            >
              Contact Sales
            </Link>
          </div>
        </div>
      </section>
      
      <Footer />
    </>
  );
}
