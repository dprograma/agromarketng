"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";

export default function TestFarmMachineryPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch debug information
        const debugResponse = await fetch('/api/debug-farm-machinery');
        if (!debugResponse.ok) {
          throw new Error(`Debug API failed: ${debugResponse.status}`);
        }
        const debugData = await debugResponse.json();
        setDebugInfo(debugData);
        
        // Fetch products directly with Farm Machinery filter
        const productsResponse = await fetch('/api/featured-products?category=Farm+Machinery');
        if (!productsResponse.ok) {
          throw new Error(`Products API failed: ${productsResponse.status}`);
        }
        const productsData = await productsResponse.json();
        setProducts(productsData.products || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Farm Machinery Test Page</h1>
      
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Debug Information</h2>
            <div className="bg-gray-100 p-4 rounded-lg">
              <h3 className="font-medium mb-2">Farm Machinery Products: {debugInfo?.farmMachineryCount || 0}</h3>
              <h3 className="font-medium mb-2">Active Products: {debugInfo?.activeCount || 0}</h3>
              <h3 className="font-medium mb-2">Test Query Results: {debugInfo?.testQueryCount || 0}</h3>
              
              <h3 className="font-medium mt-4 mb-2">Status Counts:</h3>
              <ul className="list-disc pl-5">
                {debugInfo?.statusCounts?.map((status: any) => (
                  <li key={status.status}>
                    {status.status}: {status._count.status}
                  </li>
                ))}
              </ul>
              
              <h3 className="font-medium mt-4 mb-2">Category Counts:</h3>
              <ul className="list-disc pl-5">
                {debugInfo?.categoryCounts?.slice(0, 10).map((category: any) => (
                  <li key={category.category}>
                    {category.category}: {category._count.category}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <h2 className="text-2xl font-semibold mb-4">Farm Machinery Products from API</h2>
          {products.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {products.map((product) => (
                <div key={product.id} className="border rounded-lg overflow-hidden shadow-sm">
                  <div className="relative h-48">
                    <Image
                      src={product.images && product.images.length > 0 ? product.images[0] : '/placeholder.png'}
                      alt={product.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg">{product.title}</h3>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-green-600 font-medium">{formatCurrency(Number(product.price))}</span>
                      <span className="text-sm text-gray-500">{product.location}</span>
                    </div>
                    <div className="mt-2 text-sm">
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full mr-2">
                        {product.category}
                      </span>
                      {product.subcategory && (
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                          {product.subcategory}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-red-500">No Farm Machinery products found from the API.</p>
          )}
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">Farm Machinery Products from Debug</h2>
          {debugInfo?.farmMachineryProducts?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {debugInfo.farmMachineryProducts.map((product: any) => (
                <div key={product.id} className="border rounded-lg overflow-hidden shadow-sm">
                  <div className="relative h-48">
                    <Image
                      src={product.images && product.images.length > 0 ? product.images[0] : '/placeholder.png'}
                      alt={product.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg">{product.title}</h3>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-green-600 font-medium">{formatCurrency(Number(product.price))}</span>
                      <span className="text-sm text-gray-500">{product.location}</span>
                    </div>
                    <div className="mt-2 text-sm">
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full mr-2">
                        {product.category}
                      </span>
                      {product.subcategory && (
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                          {product.subcategory}
                        </span>
                      )}
                    </div>
                    <div className="mt-2">
                      <span className={`text-sm ${product.status === 'Active' ? 'text-green-600' : 'text-red-600'}`}>
                        Status: {product.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-red-500">No Farm Machinery products found in debug data.</p>
          )}
        </>
      )}
    </div>
  );
}
