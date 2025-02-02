import React from "react";
import Image from "next/image";
import farmerHighlight1 from "../public/assets/img/farmer-highlight1.png";
import farmerHighlight2 from "../public/assets/img/farmer-highlight2.png";
import farmerHighlight3 from "../public/assets/img/farmer-highlight3.png";
import { ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline";


const FarmerHighlights = () => {
  return (
    <section className="bg-white py-16 px-4">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-green-900 mb-8">Meet Our Farmers</h2>
        <p className="text-lg text-gray-700 mb-12">
          Get to know the farmers who work tirelessly to bring fresh produce to your table.
        </p>

        {/* Farmer Stories */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
          {/* Farmer 1 */}
          <div className="flex flex-col items-center text-center p-6 bg-gray-100 rounded-lg shadow-md">
            <div className="relative w-32 h-32 mb-4">
              <Image
                src={farmerHighlight1} 
                alt="Farmer Profile"
                layout="fill"
                objectFit="cover"
                className="rounded-full"
              />
            </div>
            <h3 className="text-xl font-semibold text-green-900">John Adamu</h3>
            <p className="text-gray-600 mt-2 text-sm">Corn Farmer from Kaduna</p>
            <div className="mt-4 text-green-600 flex items-center gap-2">
              <ChatBubbleLeftRightIcon className="h-5 w-5" />
              <p className="italic text-gray-700 text-sm">
                "Farming is not just my livelihood, it’s my passion. Every crop tells a story."
              </p>
            </div>
          </div>

          {/* Farmer 2 */}
          <div className="flex flex-col items-center text-center p-6 bg-gray-100 rounded-lg shadow-md">
            <div className="relative w-32 h-32 mb-4">
              <Image
                src={farmerHighlight2}
                alt="Farmer Profile"
                layout="fill"
                objectFit="cover"
                className="rounded-full"
              />
            </div>
            <h3 className="text-xl font-semibold text-green-900">Mohammed Abubakar</h3>
            <p className="text-gray-600 mt-2 text-sm">Cattle rearer from Kano</p>
            <div className="mt-4 text-green-600 flex items-center gap-2">
              <ChatBubbleLeftRightIcon className="h-5 w-5" />
              <p className="italic text-gray-700 text-sm">
                "Bringing quality produce to market is my contribution to a healthier community."
              </p>
            </div>
          </div>

          {/* Farmer 3 */}
          <div className="flex flex-col items-center text-center p-6 bg-gray-100 rounded-lg shadow-md">
            <div className="relative w-32 h-32 mb-4">
              <Image
                src={farmerHighlight3} 
                alt="Farmer Profile"
                layout="fill"
                objectFit="cover"
                className="rounded-full"
              />
            </div>
            <h3 className="text-xl font-semibold text-green-900">Ade Omolade</h3>
            <p className="text-gray-600 mt-2 text-sm">Fruit Farmer from Ogun</p>
            <div className="mt-4 text-green-600 flex items-center gap-2">
              <ChatBubbleLeftRightIcon className="h-5 w-5" />
              <p className="italic text-gray-700 text-sm">
                "Each season brings new challenges and rewards – that's the beauty of farming."
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FarmerHighlights;
