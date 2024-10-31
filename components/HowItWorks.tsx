import { ShoppingCartIcon, UsersIcon, TruckIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const HowItWorks = () => {
  return (
    <section className="bg-gray-100 py-16 px-4">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-green-900 mb-8">How It Works</h2>
        <p className="text-lg text-gray-700 mb-12">
          Discover a seamless way to connect with local farmers and get fresh produce delivered to your doorstep.
        </p>

        {/* Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Step 1 */}
          <div className="flex flex-col items-center text-center p-6 bg-white rounded-lg shadow-md">
            <ShoppingCartIcon className="h-12 w-12 text-green-600 mb-4" />
            <h3 className="text-xl font-semibold text-green-900">Browse Products</h3>
            <p className="text-gray-600 mt-2">
              Explore a wide variety of fresh produce directly from local farmers.
            </p>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col items-center text-center p-6 bg-white rounded-lg shadow-md">
            <UsersIcon className="h-12 w-12 text-green-600 mb-4" />
            <h3 className="text-xl font-semibold text-green-900">Connect with Farmers</h3>
            <p className="text-gray-600 mt-2">
              Chat with farmers, learn about their produce, and support local agriculture.
            </p>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col items-center text-center p-6 bg-white rounded-lg shadow-md">
            <TruckIcon className="h-12 w-12 text-green-600 mb-4" />
            <h3 className="text-xl font-semibold text-green-900">Place Your Order</h3>
            <p className="text-gray-600 mt-2">
              Select your items, add them to your cart, and proceed to checkout.
            </p>
          </div>

          {/* Step 4 */}
          <div className="flex flex-col items-center text-center p-6 bg-white rounded-lg shadow-md">
            <CheckCircleIcon className="h-12 w-12 text-green-600 mb-4" />
            <h3 className="text-xl font-semibold text-green-900">Get it Delivered</h3>
            <p className="text-gray-600 mt-2">
              Enjoy fresh produce delivered straight to your door with our reliable service.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
