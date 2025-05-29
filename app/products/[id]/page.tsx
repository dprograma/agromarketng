"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Ad } from '@/types';
import { Loader2, MapPin, Calendar, Eye, Share2, MessageCircle, PhoneCall, Heart, AlertCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import { useRouter } from "next/navigation";
import { useSession } from '@/components/SessionWrapper';

export default function ProductDetails() {
  const { session } = useSession();
  const router = useRouter();
  const params = useParams();
  const [product, setProduct] = useState<Ad | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [showPhone, setShowPhone] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/products/${params.id}`);
        if (!response.ok) throw new Error('Failed to fetch product');
        const data = await response.json();
        setProduct(data);

        // Record view
        await fetch(`/api/ads/${params.id}/analytics`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'view' })
        });
      } catch (error) {
        console.error('Error:', error);
        toast.error('Failed to load product details');
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchProduct();
    }
  }, [params.id]);

  const handleContact = async () => {
    if (!session) {
      toast.error('Please sign in to contact the seller');
      router.push('/signin');
      return;
    }

    if (!product) return;
    console.log("product: ", product);

    try {
      // Don't allow users to message themselves
      if (session.id === product.userId) {
        console.log("You can't message your own ad")
        toast.error("You can't message your own ad");
        return;
      }

      toast.loading('Starting chat...');

      const response = await fetch('/api/chats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          adId: product.id,
          recipientId: product.userId,
          message: `Hi, I'm interested in your ad: ${product.title}`
        }),
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create chat');
      }

      if (!data.chat?.id) {
        throw new Error('No chat ID returned');
      }

      toast.dismiss();
      toast.success('Chat started successfully!');

      // Redirect to messages with the chat ID
      router.push(`/dashboard/messages?chatId=${data.chat.id}`);
    } catch (error) {
      toast.dismiss();
      console.error('Error creating chat:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to start chat');
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: product?.title,
        text: product?.description,
        url: window.location.href,
      });

      // Record share
      await fetch(`/api/ads/${params.id}/analytics`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'share' })
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-green-600" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex flex-col items-center justify-center p-4">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h1>
          <p className="text-gray-600">This product may have been removed or is no longer available.</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Image Gallery */}
            <div className="space-y-4">
              <div className="aspect-square relative rounded-lg overflow-hidden bg-gray-100">
                <Image
                  src={product.images[selectedImage] || '/placeholder.png'}
                  alt={product.title}
                  fill
                  className="object-cover"
                  priority
                />
                {product.featured && (
                  <div className="absolute top-4 right-4 bg-green-500/90 text-white px-3 py-1 rounded-full text-sm">
                    Featured
                  </div>
                )}
              </div>

              {/* Thumbnail Gallery */}
              {product.images.length > 1 && (
                <div className="grid grid-cols-6 gap-2">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`aspect-square relative rounded-md overflow-hidden ${selectedImage === index ? 'ring-2 ring-green-500' : ''
                        }`}
                    >
                      <Image
                        src={image}
                        alt={`${product.title} - Image ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{product.title}</h1>
                <p className="text-2xl font-bold text-green-600 mt-2">
                  {formatCurrency(Number(product.price))}
                </p>
              </div>

              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {product.location}
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {formatDistanceToNow(new Date(product.createdAt), { addSuffix: true })}
                </div>
                <div className="flex items-center">
                  <Eye className="h-4 w-4 mr-1" />
                  {product.views} views
                </div>
              </div>

              <div className="border-t border-b py-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Description</h3>
                <p className="text-gray-600 whitespace-pre-line">{product.description}</p>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Seller Information</h3>
                <div className="flex items-center space-x-4">
                  <Image
                    src={product.user.image || '/placeholder-avatar.png'}
                    alt={product.user.name}
                    width={48}
                    height={48}
                    className="rounded-full"
                  />
                  <div>
                    <p className="font-medium text-gray-900">{product.user.name}</p>
                    <p className="text-sm text-gray-500">Member since {new Date(product.user.createdAt).getFullYear()}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col space-y-3">
                <Button
                  onClick={handleContact}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  <MessageCircle className="h-5 w-5 mr-2" />
                  Contact Seller
                </Button>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowPhone(!showPhone)}
                    className="w-full"
                  >
                    <PhoneCall className="h-5 w-5 mr-2" />
                    {showPhone ? (
                      <span className="font-mono">{product.contact}</span>
                    ) : (
                      'Show Phone Number'
                    )}
                  </Button>

                  <Button
                    variant="outline"
                    onClick={handleShare}
                    className="w-full"
                  >
                    <Share2 className="h-5 w-5 mr-2" />
                    Share
                  </Button>
                </div>

                <Button
                  variant="outline"
                  onClick={() => {
                    setIsSaved(!isSaved);
                    toast.success(isSaved ? 'Removed from saved items' : 'Added to saved items');
                  }}
                  className={`w-full ${isSaved ? 'bg-gray-50 text-green-600' : ''}`}
                >
                  <Heart className={`h-5 w-5 mr-2 ${isSaved ? 'fill-green-600' : ''}`} />
                  {isSaved ? 'Saved' : 'Save'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}