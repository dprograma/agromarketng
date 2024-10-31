import Link from 'next/link';

const CallToAction = () => {
    return (
      <section className="bg-green-900 py-16 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-white mb-4">
            Join the Agro Revolution
          </h2>
          <p className="text-lg text-gray-200 mb-8">
            Sign up to access fresh produce, connect with farmers, and be part of a sustainable marketplace. Start your journey today!
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            {/* Sign Up Button */}
            <Link
              href="#"
              className="inline-block rounded-md bg-yellow-500 px-8 py-3 text-lg font-semibold text-white hover:bg-yellow-400 transition duration-200"
            >
              Sign Up Now
            </Link>
            
            {/* Explore Marketplace Button */}
            <Link
              href="#"
              className="inline-block rounded-md border border-yellow-500 px-8 py-3 text-lg font-semibold text-yellow-500 hover:bg-yellow-500 hover:text-white transition duration-200"
            >
              Explore Marketplace
            </Link>
          </div>
        </div>
      </section>
    );
  };
  
  export default CallToAction;
  