import Image from "next/image";
import Link from "next/link";
import blogImg1 from "../public/assets/img/blog/blogImg1.jpg";
import blogImg2 from "../public/assets/img/blog/blogImg2.jpg";
import blogImg3 from "../public/assets/img/blog/blogImg3.jpg";

const LatestNews = () => {
  return (
    <section className="bg-white py-16 px-4">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-green-900 mb-8">Latest News</h2>
        <p className="text-lg text-gray-700 mb-12">
          Stay updated with the latest trends in agriculture, sustainable farming, and market insights.
        </p>

        {/* Blog Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Blog Card 1 */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <Image src={blogImg1} alt="Blog 1" className="w-full h-40 object-cover" />
            <div className="p-6">
              <h3 className="text-xl font-semibold text-green-900">Sustainable Farming Practices</h3>
              <p className="text-gray-600 mt-2 text-sm">
                Learn how sustainable farming can positively impact our environment and food quality.
              </p>
              <Link href="/news" className="text-yellow-500 text-sm font-semibold mt-4 inline-block">
                Read More →
              </Link>
            </div>
          </div>

          {/* Blog Card 2 */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <Image src={blogImg2} alt="Blog 2" className="w-full h-40 object-cover" />
            <div className="p-6">
              <h3 className="text-xl font-semibold text-green-900">Market Trends for 2024</h3>
              <p className="text-gray-600 mt-2 text-sm">
                Discover the latest trends and demands shaping the agricultural market this year.
              </p>
              <Link href="/news" className="text-yellow-500 text-sm font-semibold mt-4 inline-block">
                Read More →
              </Link>
            </div>
          </div>

          {/* Blog Card 3 */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <Image src={blogImg3} alt="Blog 3" className="w-full h-40 object-cover" />
            <div className="p-6">
              <h3 className="text-xl font-semibold text-green-900">Empowering Local Farmers</h3>
              <p className="text-gray-600 mt-2 text-sm">
                How supporting local farmers can strengthen communities and promote sustainable growth.
              </p>
              <Link href="/news" className="text-yellow-500 text-sm font-semibold mt-4 inline-block">
                Read More →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LatestNews;
