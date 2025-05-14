import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import Link from "next/link";
import { Calendar, User, ArrowRight, Tag } from "lucide-react";

// News articles data
const newsArticles = [
  {
    id: 1,
    title: "AgroMarket Launches New Financial Services for Smallholder Farmers",
    slug: "agromarket-launches-financial-services",
    excerpt: "New microloans and insurance products designed specifically for smallholder farmers are now available on the AgroMarket platform.",
    content: `
      <p>AgroMarket is proud to announce the launch of our new financial services tailored specifically for smallholder farmers across Nigeria. These services include microloans for farm inputs, equipment financing, and crop insurance products designed to mitigate risks associated with farming.</p>
      
      <p>According to Adebayo Johnson, CEO of AgroMarket, "Access to finance remains one of the biggest challenges facing smallholder farmers in Nigeria. Our new financial services are designed to address this gap by providing flexible, accessible financial products that align with agricultural seasons and cash flows."</p>
      
      <p>The microloans range from ₦50,000 to ₦500,000 with repayment terms that align with harvest cycles. The application process is simple and can be completed entirely through the AgroMarket mobile app or website. Approval decisions are typically made within 48 hours.</p>
      
      <p>The crop insurance products cover risks such as drought, excessive rainfall, pests, and diseases. Premiums are affordable, starting at just 3% of the insured amount, making it accessible to even the smallest-scale farmers.</p>
      
      <p>"We've already piloted these financial services with 500 farmers across three states, and the results have been remarkable," says Chioma Okafor, Chief Operations Officer at AgroMarket. "Farmers who accessed loans for improved inputs saw yield increases of 30-50%, while those with insurance were able to recover quickly from weather-related losses."</p>
      
      <p>AgroMarket has partnered with several financial institutions and insurance companies to provide these services, including MicroFinance Bank, AgriInsure, and FarmCredit Nigeria.</p>
      
      <p>Farmers interested in accessing these financial services can apply through their AgroMarket account or visit one of our regional offices for assistance.</p>
    `,
    image: "/assets/img/news/financial-services.jpg",
    author: "AgroMarket Team",
    date: "May 1, 2023",
    category: "Financial Services",
    tags: ["Finance", "Loans", "Insurance", "Smallholder Farmers"]
  },
  {
    id: 2,
    title: "AgroMarket Expands Cold Chain Logistics Network to Serve More Regions",
    slug: "cold-chain-logistics-expansion",
    excerpt: "New refrigerated vehicles and cold storage facilities will help reduce post-harvest losses and connect farmers in remote areas to urban markets.",
    content: `
      <p>AgroMarket has announced a significant expansion of its cold chain logistics network, adding 20 new refrigerated vehicles and establishing cold storage facilities in five additional states across Nigeria. This expansion aims to reduce post-harvest losses and enable farmers in remote areas to access urban markets with perishable produce.</p>
      
      <p>Post-harvest losses are a major challenge in Nigeria's agricultural sector, with estimates suggesting that up to 40% of fresh produce is lost between harvest and market due to inadequate storage and transportation infrastructure. AgroMarket's expanded cold chain network directly addresses this challenge.</p>
      
      <p>"Our cold chain logistics service has been one of our most impactful offerings," explains Emmanuel Nwachukwu, Chief Technology Officer at AgroMarket. "By maintaining the cold chain from farm to market, we've helped farmers reduce losses by up to 80% and extend the shelf life of their products, allowing them to reach more distant markets and command better prices."</p>
      
      <p>The new refrigerated vehicles range from small vans suitable for last-mile delivery to large trucks capable of transporting bulk produce across long distances. The cold storage facilities, located in strategic agricultural hubs, provide temporary storage for produce awaiting transportation or distribution.</p>
      
      <p>Fatima Abdullahi, Head of Farmer Relations at AgroMarket, highlights the impact on farmers: "Before our cold chain service, many farmers in remote areas were limited to selling locally or through middlemen who offered low prices. Now, a tomato farmer in Kano can reliably supply restaurants in Lagos, knowing their produce will arrive fresh and in perfect condition."</p>
      
      <p>The expanded cold chain network now covers 15 states, with plans to achieve nationwide coverage by the end of next year. Farmers can book cold chain logistics services through the AgroMarket platform, with pricing based on volume, distance, and specific temperature requirements.</p>
      
      <p>This expansion was made possible through a partnership with ColdLogistics Nigeria and a grant from the Agricultural Transformation Initiative.</p>
    `,
    image: "/assets/img/news/cold-chain.jpg",
    author: "AgroMarket Team",
    date: "April 15, 2023",
    category: "Logistics",
    tags: ["Cold Chain", "Logistics", "Post-harvest Losses", "Market Access"]
  },
  {
    id: 3,
    title: "AgroMarket Partners with Ministry of Agriculture on Farmer Training Program",
    slug: "ministry-partnership-farmer-training",
    excerpt: "New partnership will provide digital literacy and modern farming techniques training to 10,000 farmers across Nigeria.",
    content: `
      <p>AgroMarket has announced a strategic partnership with the Federal Ministry of Agriculture and Rural Development to provide comprehensive training to 10,000 farmers across Nigeria over the next 12 months. The training program will focus on digital literacy, modern farming techniques, and market access strategies.</p>
      
      <p>The partnership was formalized at a signing ceremony attended by the Minister of Agriculture and Rural Development, the CEO of AgroMarket, and representatives from various farmer associations. The program will be implemented in all six geopolitical zones of Nigeria, with a special focus on women and youth farmers.</p>
      
      <p>"This partnership represents a significant step toward our goal of digitizing Nigeria's agricultural sector," said the Minister during the signing ceremony. "By combining the Ministry's reach and resources with AgroMarket's technological expertise and market connections, we can accelerate the adoption of modern farming practices and digital tools among smallholder farmers."</p>
      
      <p>The training program consists of three modules:</p>
      
      <ol>
        <li><strong>Digital Literacy:</strong> Basic smartphone usage, accessing agricultural information online, using the AgroMarket platform, digital financial services, and online safety.</li>
        <li><strong>Modern Farming Techniques:</strong> Climate-smart agriculture, integrated pest management, efficient irrigation methods, soil health management, and post-harvest handling.</li>
        <li><strong>Market Access Strategies:</strong> Product quality standards, pricing strategies, negotiation skills, contract farming, and cooperative formation.</li>
      </ol>
      
      <p>Each farmer will receive a smartphone with pre-installed agricultural apps, including the AgroMarket platform, and three months of free internet access to practice their new digital skills.</p>
      
      <p>"We've seen firsthand how digital literacy and market knowledge can transform a farmer's business," explains Fatima Abdullahi, Head of Farmer Relations at AgroMarket. "Farmers who effectively use our platform typically see income increases of 30-50% due to better prices, reduced losses, and access to premium markets."</p>
      
      <p>The training will be delivered through a combination of in-person workshops, mobile learning, and peer-to-peer support groups. Local agricultural extension officers will be trained as facilitators to ensure the program's sustainability beyond the initial 12-month period.</p>
      
      <p>Farmers interested in participating in the training program can register through their local agricultural extension office or directly through the AgroMarket platform.</p>
    `,
    image: "/assets/img/news/farmer-training.jpg",
    author: "AgroMarket Team",
    date: "March 20, 2023",
    category: "Education",
    tags: ["Training", "Digital Literacy", "Government Partnership", "Capacity Building"]
  },
  {
    id: 4,
    title: "AgroMarket Introduces Quality Verification System for Agricultural Products",
    slug: "quality-verification-system",
    excerpt: "New blockchain-based system allows buyers to verify the quality, origin, and handling of agricultural products purchased through the platform.",
    content: `
      <p>AgroMarket has launched an innovative blockchain-based quality verification system that allows buyers to trace the journey of agricultural products from farm to table. The system provides transparent information about a product's origin, farming practices, handling, and quality certifications.</p>
      
      <p>The quality verification system works through QR codes attached to product packaging or accompanying documentation. Buyers can scan these codes using the AgroMarket app to access a complete history of the product, including:</p>
      
      <ul>
        <li>Farm location and farmer profile</li>
        <li>Planting and harvest dates</li>
        <li>Farming practices (organic, conventional, etc.)</li>
        <li>Any inputs used (fertilizers, pesticides, etc.)</li>
        <li>Quality certifications</li>
        <li>Storage and transportation conditions</li>
        <li>Quality inspection results</li>
      </ul>
      
      <p>"Trust and transparency are essential in agricultural commerce," says Emmanuel Nwachukwu, Chief Technology Officer at AgroMarket. "Our quality verification system gives buyers confidence in the products they purchase while allowing farmers who follow best practices to differentiate themselves and command premium prices."</p>
      
      <p>The system is particularly valuable for export-oriented farmers and those supplying premium markets such as high-end restaurants, supermarkets, and food processors with strict quality requirements.</p>
      
      <p>David Okonkwo, owner of Fresh Foods Supermarket in Abuja, has been using the system during its pilot phase: "Our customers increasingly want to know where their food comes from and how it was produced. The quality verification system allows us to provide this information transparently, which has significantly increased customer trust and loyalty."</p>
      
      <p>For farmers, the system provides a structured way to document their practices and demonstrate their commitment to quality. Farmers who participate in the quality verification system receive training on quality standards and documentation practices.</p>
      
      <p>"Initially, I was concerned about the additional documentation required," admits Ibrahim Musa, a tomato farmer from Kano. "But the AgroMarket team helped me set up simple systems to record the necessary information, and the premium prices I now receive more than compensate for the extra effort."</p>
      
      <p>The quality verification system is now available to all farmers and buyers on the AgroMarket platform, with plans to expand its capabilities to include more detailed environmental and social impact metrics in the future.</p>
    `,
    image: "/assets/img/news/quality-verification.jpg",
    author: "AgroMarket Team",
    date: "February 10, 2023",
    category: "Technology",
    tags: ["Blockchain", "Quality Assurance", "Traceability", "Food Safety"]
  },
  {
    id: 5,
    title: "AgroMarket Secures $5 Million in Series A Funding to Expand Operations",
    slug: "series-a-funding",
    excerpt: "Investment will fund expansion to all 36 states in Nigeria and the development of new features to support smallholder farmers.",
    content: `
      <p>AgroMarket has successfully raised $5 million in Series A funding to support its expansion across Nigeria and the development of new platform features. The funding round was led by AgriTech Ventures, with participation from Impact Investors Nigeria, Tech Growth Capital, and several angel investors with backgrounds in agriculture and technology.</p>
      
      <p>"This investment represents a strong vote of confidence in our mission to transform agricultural commerce in Nigeria," says Adebayo Johnson, CEO of AgroMarket. "With this funding, we will accelerate our expansion to all 36 states, enhance our technology platform, and develop new services that address the unique challenges faced by smallholder farmers."</p>
      
      <p>AgroMarket currently operates in 15 states, serving over 50,000 farmers and 5,000 buyers. The platform has facilitated transactions worth more than ₦2 billion since its launch in 2022, with the average farmer seeing a 40% increase in income after joining the platform.</p>
      
      <p>The new funding will be allocated to several key initiatives:</p>
      
      <ol>
        <li><strong>Geographic Expansion:</strong> Establishing operations in all 36 states of Nigeria, including setting up regional offices, building logistics networks, and recruiting local teams.</li>
        <li><strong>Technology Enhancement:</strong> Developing new features such as weather forecasting, pest and disease alerts, and enhanced market analytics to help farmers make informed decisions.</li>
        <li><strong>Financial Services:</strong> Expanding the range of financial products available to farmers, including input financing, equipment leasing, and crop insurance.</li>
        <li><strong>Farmer Training:</strong> Scaling up digital literacy and agricultural best practices training programs to reach 100,000 farmers over the next two years.</li>
        <li><strong>Team Growth:</strong> Doubling the size of the team, with a focus on technology, farmer support, and logistics operations.</li>
      </ol>
      
      <p>Lead investor AgriTech Ventures has a strong track record of supporting agricultural technology companies across Africa. "AgroMarket stands out for its deep understanding of the challenges faced by smallholder farmers and its innovative approach to addressing these challenges," says Sarah Kimani, Partner at AgriTech Ventures. "We're excited to support their mission to create a more efficient, transparent, and equitable agricultural marketplace."</p>
      
      <p>The funding comes at a time of growing recognition of the importance of digital platforms in transforming African agriculture. A recent report by the African Development Bank identified digital marketplaces as a key driver of agricultural productivity and rural income growth.</p>
      
      <p>"This investment will allow us to reach more farmers in more remote areas, helping them access better markets and improve their livelihoods," says Chioma Okafor, Chief Operations Officer at AgroMarket. "We're particularly excited about expanding our presence in the northeast and northwest regions, where farmers face significant market access challenges."</p>
      
      <p>AgroMarket expects to complete its nationwide expansion by the end of 2023 and aims to serve 200,000 farmers by 2025.</p>
    `,
    image: "/assets/img/news/funding.jpg",
    author: "AgroMarket Team",
    date: "January 15, 2023",
    category: "Business",
    tags: ["Funding", "Expansion", "Investment", "Growth"]
  }
];

export default function NewsPage() {
  return (
    <>
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative bg-green-900 py-20 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 overflow-hidden">
          <Image 
            src="/assets/img/news/news-hero.jpg" 
            alt="Agricultural news" 
            fill
            className="object-cover opacity-20"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-green-900/90 to-green-800/80"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
              Latest News
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-300">
              Stay updated with the latest developments, innovations, and stories from AgroMarket and the agricultural sector.
            </p>
          </div>
        </div>
      </section>
      
      {/* Featured Article */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Story</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our most important recent development in agricultural innovation.
            </p>
          </div>
          
          <div className="bg-gray-50 rounded-xl overflow-hidden shadow-sm">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="relative h-64 lg:h-auto">
                <Image 
                  src={newsArticles[0].image} 
                  alt={newsArticles[0].title}
                  fill
                  className="object-cover"
                />
              </div>
              
              <div className="p-8">
                <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {newsArticles[0].date}
                  </div>
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-1" />
                    {newsArticles[0].author}
                  </div>
                  <div className="flex items-center">
                    <Tag className="h-4 w-4 mr-1" />
                    {newsArticles[0].category}
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{newsArticles[0].title}</h3>
                <p className="text-gray-600 mb-6">{newsArticles[0].excerpt}</p>
                
                <Link 
                  href={`/news/${newsArticles[0].slug}`} 
                  className="inline-flex items-center text-green-600 font-medium hover:text-green-700"
                >
                  Read full article <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* All News Articles */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Recent News</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Stay informed about the latest developments in AgroMarket and the agricultural sector.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {newsArticles.slice(1).map((article) => (
              <div key={article.id} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="relative h-48">
                  <Image 
                    src={article.image} 
                    alt={article.title}
                    fill
                    className="object-cover"
                  />
                </div>
                
                <div className="p-6">
                  <div className="flex items-center space-x-4 text-xs text-gray-500 mb-3">
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {article.date}
                    </div>
                    <div className="flex items-center">
                      <Tag className="h-3 w-3 mr-1" />
                      {article.category}
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">{article.title}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">{article.excerpt}</p>
                  
                  <Link 
                    href={`/news/${article.slug}`} 
                    className="inline-flex items-center text-green-600 font-medium hover:text-green-700"
                  >
                    Read more <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
          
          {/* Pagination - for future expansion */}
          <div className="mt-12 flex justify-center">
            <nav className="flex items-center space-x-2">
              <span className="px-4 py-2 rounded-md bg-green-600 text-white">1</span>
              <span className="px-4 py-2 rounded-md text-gray-700 hover:bg-gray-100 cursor-pointer">2</span>
              <span className="px-4 py-2 rounded-md text-gray-700 hover:bg-gray-100 cursor-pointer">3</span>
              <span className="px-4 py-2 rounded-md text-gray-700">...</span>
            </nav>
          </div>
        </div>
      </section>
      
      {/* Newsletter Signup */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="bg-green-50 rounded-2xl p-8 sm:p-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Stay Updated with AgroMarket News</h2>
                <p className="text-gray-600 mb-6">
                  Subscribe to our newsletter to receive the latest news, market insights, and agricultural tips directly in your inbox.
                </p>
                
                <form className="space-y-4">
                  <div>
                    <label htmlFor="email" className="sr-only">Email Address</label>
                    <input
                      type="email"
                      id="email"
                      placeholder="Enter your email address"
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  
                  <div className="flex items-start">
                    <input
                      id="privacy"
                      type="checkbox"
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded mt-1"
                    />
                    <label htmlFor="privacy" className="ml-2 block text-sm text-gray-600">
                      I agree to receive updates and accept the <Link href="/privacy-policy" className="text-green-600 hover:underline">Privacy Policy</Link>
                    </label>
                  </div>
                  
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-6 py-3 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 transition-colors"
                  >
                    Subscribe
                  </button>
                </form>
              </div>
              
              <div className="hidden lg:block relative h-64">
                <Image 
                  src="/assets/img/news/newsletter.jpg" 
                  alt="Agricultural newsletter" 
                  fill
                  className="object-cover rounded-xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Categories Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">News Categories</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Explore news by topic to find the information most relevant to you.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: "Technology", icon: "🖥️", description: "Innovations in agricultural technology" },
              { name: "Business", icon: "📊", description: "Market trends and business insights" },
              { name: "Education", icon: "📚", description: "Training programs and knowledge sharing" },
              { name: "Logistics", icon: "🚚", description: "Supply chain and distribution news" },
              { name: "Financial Services", icon: "💰", description: "Funding, loans, and insurance" },
              { name: "Policy", icon: "📜", description: "Agricultural policies and regulations" },
              { name: "Sustainability", icon: "🌱", description: "Sustainable farming practices" },
              { name: "Community", icon: "👥", description: "Farmer success stories and community initiatives" }
            ].map((category, index) => (
              <Link 
                key={index} 
                href={`/news/category/${category.name.toLowerCase()}`}
                className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow text-center"
              >
                <div className="text-4xl mb-3">{category.icon}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{category.name}</h3>
                <p className="text-sm text-gray-600">{category.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
      
      <Footer />
    </>
  );
}
