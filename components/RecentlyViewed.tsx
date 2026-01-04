"use client";

import { useState, useEffect } from 'react';
import { useRecentlyViewed } from '@/lib/recentlyViewed';
import Link from 'next/link';
import Image from 'next/image';
import { Clock, X, MapPin, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function RecentlyViewed() {
  const { getItems, removeItem, clearAll, hasItems } = useRecentlyViewed();
  const [recentItems, setRecentItems] = useState<any[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const items = getItems(5);
    setRecentItems(items);
    setIsVisible(items.length > 0);
  }, []);

  const handleRemoveItem = (id: string) => {
    removeItem(id);
    const updatedItems = getItems(5);
    setRecentItems(updatedItems);
    setIsVisible(updatedItems.length > 0);
  };

  const handleClearAll = () => {
    clearAll();
    setRecentItems([]);
    setIsVisible(false);
  };

  if (!isVisible || recentItems.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Clock className="h-5 w-5 text-gray-500" />
          <h3 className="text-lg font-semibold text-gray-900">Recently Viewed</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClearAll}
          className="text-gray-500 hover:text-gray-700"
        >
          Clear all
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {recentItems.map((item) => (
          <div
            key={item.id}
            className="group relative bg-gray-50 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
          >
            <button
              onClick={() => handleRemoveItem(item.id)}
              className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-white rounded-full p-1 shadow-sm hover:bg-gray-100"
            >
              <X className="h-3 w-3 text-gray-500" />
            </button>

            <Link href={`/ads/${item.id}`} className="block">
              <div className="aspect-square relative bg-gray-200">
                {item.images && item.images.length > 0 ? (
                  <Image
                    src={item.images[0]}
                    alt={item.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 20vw"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Tag className="h-8 w-8 text-gray-400" />
                  </div>
                )}
              </div>

              <div className="p-3">
                <h4 className="font-medium text-gray-900 text-sm line-clamp-2 mb-1">
                  {item.title}
                </h4>

                <p className="text-green-600 font-semibold text-sm mb-2">
                  ₦{item.price.toLocaleString()}
                </p>

                <div className="flex items-center text-xs text-gray-500 space-x-2">
                  <MapPin className="h-3 w-3" />
                  <span className="truncate">{item.location}</span>
                </div>

                <div className="mt-2">
                  <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
                    {item.category}
                  </span>
                </div>

                <div className="mt-2 text-xs text-gray-400">
                  Viewed {new Date(item.viewedAt).toLocaleDateString()}
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>

      {recentItems.length >= 5 && (
        <div className="mt-4 text-center">
          <Link
            href="/recently-viewed"
            className="text-green-600 hover:text-green-700 text-sm font-medium"
          >
            View all recently viewed items →
          </Link>
        </div>
      )}
    </div>
  );
}