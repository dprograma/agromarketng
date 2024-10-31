import { ChartPieIcon, CurrencyDollarIcon, GlobeAltIcon, HeartIcon } from "@heroicons/react/24/outline";

const WhyChooseUs = () => {
  return (
    <section className="bg-gray-50 py-16 px-4">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-green-900 mb-8">Why Choose Us</h2>
        <p className="text-lg text-gray-700 mb-12">
          Discover what sets us apart and why our platform is the best choice for fresh, local, and sustainable produce.
        </p>

        {/* Benefits */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Fresh Produce */}
          <div className="flex flex-col items-center text-center p-6 bg-white rounded-lg shadow-md">
            <ChartPieIcon className="h-12 w-12 text-green-600 mb-4" />
            <h3 className="text-xl font-semibold text-green-900">Fresh Produce</h3>
            <p className="text-gray-600 mt-2 text-sm">
              Get the freshest produce, harvested directly from local farms to ensure quality and flavor.
            </p>
          </div>

          {/* Local Sourcing */}
          <div className="flex flex-col items-center text-center p-6 bg-white rounded-lg shadow-md">
            <GlobeAltIcon className="h-12 w-12 text-green-600 mb-4" />
            <h3 className="text-xl font-semibold text-green-900">Locally Sourced</h3>
            <p className="text-gray-600 mt-2 text-sm">
              Support local farmers and contribute to the community by sourcing locally grown products.
            </p>
          </div>

          {/* Affordable Pricing */}
          <div className="flex flex-col items-center text-center p-6 bg-white rounded-lg shadow-md">
            <CurrencyDollarIcon className="h-12 w-12 text-green-600 mb-4" />
            <h3 className="text-xl font-semibold text-green-900">Transparent Pricing</h3>
            <p className="text-gray-600 mt-2 text-sm">
              Enjoy affordable, transparent pricing without middlemen, directly benefiting farmers.
            </p>
          </div>

          {/* Sustainable Practices */}
          <div className="flex flex-col items-center text-center p-6 bg-white rounded-lg shadow-md">
            <HeartIcon className="h-12 w-12 text-green-600 mb-4" />
            <h3 className="text-xl font-semibold text-green-900">Sustainable Practices</h3>
            <p className="text-gray-600 mt-2 text-sm">
              Choose sustainably grown produce and support eco-friendly farming practices.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
