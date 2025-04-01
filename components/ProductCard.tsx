import Image from 'next/image';
import Link from 'next/link';
import { Eye, MessageCircle, MapPin, Clock } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { ProductCardProps} from '@/types';
import { formatDistanceToNow } from 'date-fns';


export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Link 
      href={`/products/${product.id}`}
      className="group bg-white rounded-xl overflow-hidden border border-gray-100 transition-all hover:shadow-lg hover:border-gray-200"
    >
      {/* Image Container */}
      <div className="aspect-square relative overflow-hidden bg-gray-100">
        <Image
          src={product.images[0] || '/placeholder.png'}
          alt={product.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {product.featured && (
          <div className="absolute top-2 right-2 bg-green-500/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium">
            Featured
          </div>
        )}
        <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm text-gray-700 px-2 py-1 rounded-full text-xs font-medium flex items-center">
          <Clock className="h-3 w-3 mr-1" />
          {formatDistanceToNow(new Date(product.createdAt), { addSuffix: true })}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="text-base font-medium text-gray-900 line-clamp-1">
          {product.title}
        </h3>
        
        <p className="text-lg font-bold text-green-600 whitespace-nowrap">
          {formatCurrency(product.price)}
        </p>
        </div>

        <div className="flex items-center text-xs text-gray-500 mb-2">
          <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
          <span className="line-clamp-1">{product.location}</span>
        </div>

        <p className="text-sm text-gray-600 line-clamp-2 mb-3">
          {product.description}
        </p>

        {/* Stats */}
        <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t">
          <div className="flex items-center gap-3">
            <span className="flex items-center">
              <Eye className="h-3 w-3 mr-1" />
              {product.views}
            </span>
            <span className="flex items-center">
              <MessageCircle className="h-3 w-3 mr-1" />
              {product.shares}
            </span>
          </div>
          <span className="text-xs font-medium text-gray-600">
            {product.category}
          </span>
        </div>
      </div>
    </Link>
  );
}