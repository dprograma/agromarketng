"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import FileUpload from "@/components/ui/file-upload";
import { Loader2, AlertCircle, ArrowLeft, Save } from "lucide-react";
import { navigation } from "@/constants";
import { mapUiCategoryToDatabase } from "@/lib/categoryUtils";
import { motion } from "framer-motion";
import { showToast } from "@/lib/toast-utils";
import Link from "next/link";

type FileState = File[];

interface FormErrors {
  title?: string;
  category?: string;
  subcategory?: string;
  location?: string;
  price?: string;
  description?: string;
  contact?: string;
  images?: string;
}

interface Ad {
  id: string;
  title: string;
  category: string;
  subcategory?: string;
  section?: string;
  location: string;
  price: string;
  description: string;
  contact: string;
  images: string[];
  subscriptionPlanId?: string;
}

export default function EditAdMain() {
  const router = useRouter();
  const params = useParams();
  const adId = params?.id as string;

  const [formData, setFormData] = useState({
    title: "",
    category: "",
    subcategory: "",
    section: "",
    location: "",
    price: "",
    description: "",
    contact: "",
    subscriptionPlanId: ""
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [availableSubcategories, setAvailableSubcategories] = useState<{ name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [selectedFiles, setSelectedFiles] = useState<FileState>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [ad, setAd] = useState<Ad | null>(null);

  // Fetch existing ad data
  useEffect(() => {
    const fetchAd = async () => {
      if (!adId) return;

      try {
        const response = await fetch(`/api/ads/${adId}`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            router.push('/signin');
            return;
          }
          throw new Error('Failed to fetch ad data');
        }

        const data = await response.json();
        const adData = data.ad;
        setAd(adData);

        // Populate form with existing data
        setFormData({
          title: adData.title || "",
          category: adData.category || "",
          subcategory: adData.subcategory || "",
          section: adData.section || "",
          location: adData.location || "",
          price: adData.price || "",
          description: adData.description || "",
          contact: adData.contact || "",
          subscriptionPlanId: adData.subscriptionPlanId || ""
        });

        setExistingImages(adData.images || []);
      } catch (error) {
        console.error('Error fetching ad:', error);
        showToast({ message: 'Failed to load ad data', type: 'error' });
        router.push('/dashboard/my-ads');
      } finally {
        setInitialLoading(false);
      }
    };

    fetchAd();
  }, [adId, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    // If changing category, reset subcategory and update available subcategories
    if (name === 'category') {
      setFormData({
        ...formData,
        [name]: value,
        subcategory: '',
        section: ''
      });
    } else if (name === 'subcategory') {
      setFormData({
        ...formData,
        subcategory: value
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Map UI categories to navigation categories
  const getCategoryMapping = (uiCategory: string) => {
    return mapUiCategoryToDatabase(uiCategory);
  };

  // Update subcategories when category changes
  useEffect(() => {
    if (formData.category) {
      const mappedCategory = getCategoryMapping(formData.category);
      const categoryData = navigation.categories.find(
        cat => cat.name === mappedCategory
      );

      if (categoryData) {
        const subcategories = categoryData.items
          .filter(item => item.name !== 'Browse All')
          .map(item => ({ name: item.name }));

        setAvailableSubcategories(subcategories);
      } else {
        setAvailableSubcategories([]);
      }
    } else {
      setAvailableSubcategories([]);
    }
  }, [formData.category]);

  const handleFileChange = (files: File[]) => {
    setSelectedFiles(files);
    if (files.length > 0 && errors.images) {
      setErrors(prev => ({ ...prev, images: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    // Title validation
    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
      isValid = false;
    } else if (formData.title.length < 5) {
      newErrors.title = "Title must be at least 5 characters";
      isValid = false;
    } else if (formData.title.length > 100) {
      newErrors.title = "Title must be less than 100 characters";
      isValid = false;
    }

    // Category validation
    if (!formData.category) {
      newErrors.category = "Category is required";
      isValid = false;
    }

    // Subcategory validation
    if (formData.category && availableSubcategories.length > 0 && !formData.subcategory) {
      newErrors.subcategory = "Subcategory is required";
      isValid = false;
    }

    // Location validation
    if (!formData.location.trim()) {
      newErrors.location = "Location is required";
      isValid = false;
    }

    // Price validation
    if (!formData.price) {
      newErrors.price = "Price is required";
      isValid = false;
    } else {
      const price = parseFloat(formData.price);
      if (isNaN(price)) {
        newErrors.price = "Price must be a number";
        isValid = false;
      } else if (price <= 0) {
        newErrors.price = "Price must be greater than 0";
        isValid = false;
      } else if (price > 99999999) {
        newErrors.price = "Price is too high";
        isValid = false;
      }
    }

    // Description validation
    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
      isValid = false;
    } else if (formData.description.length < 20) {
      newErrors.description = "Description must be at least 20 characters";
      isValid = false;
    } else if (formData.description.length > 2000) {
      newErrors.description = "Description must be less than 2000 characters";
      isValid = false;
    }

    // Contact validation
    if (!formData.contact.trim()) {
      newErrors.contact = "Contact information is required";
      isValid = false;
    } else {
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contact);
      const isPhone = /^[0-9+\-\s()]{7,20}$/.test(formData.contact);

      if (!isEmail && !isPhone) {
        newErrors.contact = "Please enter a valid email or phone number";
        isValid = false;
      }
    }

    // Image validation - allow existing images or new files
    if (existingImages.length === 0 && selectedFiles.length === 0) {
      newErrors.images = "Please keep existing images or upload new ones";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);

    if (!validateForm()) {
      const firstErrorElement = document.querySelector('.error-message');
      if (firstErrorElement) {
        firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      showToast({ message: 'Please fix the errors in the form', type: 'error' });
      return;
    }

    setLoading(true);

    try {
      if (!navigator.onLine) {
        throw new Error('No internet connection. Please check your network and try again.');
      }

      let imagesToSubmit = existingImages;

      // If new files are uploaded, we need to handle them
      if (selectedFiles.length > 0) {
        // For now, we'll keep existing images and add new ones
        // In a real app, you might want to replace or append based on user choice
        const newImageUrls: string[] = [];

        // Upload new files (you'd implement your upload logic here)
        // For now, we'll just keep the existing images
        imagesToSubmit = [...existingImages];
      }

      const updateData = {
        title: formData.title,
        category: formData.category,
        subcategory: formData.subcategory,
        section: formData.section,
        location: formData.location,
        price: formData.price,
        description: formData.description,
        contact: formData.contact,
        images: imagesToSubmit
      };

      const response = await fetch(`/api/ads/${adId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(updateData)
      });

      const data = await response.json();

      if (response.ok) {
        showToast({ message: 'Your ad has been updated successfully!', type: 'success' });
        setTimeout(() => {
          router.push('/dashboard/my-ads');
        }, 1500);
      } else {
        throw new Error(data.error || `Failed to update ad (Error ${response.status})`);
      }
    } catch (error) {
      console.error('Ad update error:', error);
      showToast({ message: error instanceof Error ? error.message : 'Failed to update ad', type: 'error' });
      setLoading(false);
    }
  };

  // Initial loading state
  if (initialLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-3xl mx-auto p-8 bg-white shadow-xl rounded-xl text-center"
      >
        <div className="flex flex-col items-center justify-center space-y-6 py-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
            <Loader2 className="h-10 w-10 text-green-600 animate-spin" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Loading Ad Data</h2>
          <p className="text-gray-700 max-w-md text-lg">
            Please wait while we fetch your ad information...
          </p>
        </div>
      </motion.div>
    );
  }

  // Loading state after form submission
  if (loading && formSubmitted) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-3xl mx-auto p-8 bg-white shadow-xl rounded-xl text-center"
      >
        <div className="flex flex-col items-center justify-center space-y-6 py-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
            <Loader2 className="h-10 w-10 text-green-600 animate-spin" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Updating Your Ad</h2>
          <p className="text-gray-700 max-w-md text-lg">
            Your changes are being saved. Please wait a moment...
          </p>
          <div className="w-full max-w-md bg-gray-200 rounded-full h-2.5 mt-4">
            <div className="bg-green-600 h-2.5 rounded-full animate-pulse" style={{ width: '75%' }}></div>
          </div>
        </div>
      </motion.div>
    );
  }

  if (!ad) {
    return (
      <div className="max-w-3xl mx-auto p-8 bg-white shadow-xl rounded-xl text-center">
        <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Ad Not Found</h2>
        <p className="text-gray-700 mb-6">The ad you're trying to edit could not be found.</p>
        <Link href="/dashboard/my-ads" className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg">
          Back to My Ads
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-xl rounded-xl">
      <div className="flex items-center mb-6">
        <Link href="/dashboard/my-ads" className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors" aria-label="Back to my ads">
          <ArrowLeft className="h-5 w-5 text-gray-700" />
        </Link>
        <h2 className="text-2xl font-bold text-gray-900">Edit Ad: {ad.title}</h2>
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-600 p-4 mb-6 rounded-md">
        <p className="text-sm text-blue-800 font-medium">
          <strong className="font-semibold">Tip:</strong> Keep your ad information up to date to maintain high visibility and engagement!
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="title" className="block text-sm font-semibold text-gray-800">Ad Title <span className="text-red-500">*</span></label>
          <input
            id="title"
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g., Fresh Organic Mangoes for Sale"
            className={`w-full px-4 py-3 rounded-lg border ${errors.title ? 'border-red-400 bg-red-50' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors font-medium text-gray-800 shadow-sm`}
            aria-invalid={errors.title ? "true" : "false"}
          />
          {errors.title && <p className="error-message text-red-500 text-sm mt-1" id="title-error">{errors.title}</p>}
        </div>

        {/* Category Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="category" className="block text-sm font-semibold text-gray-800">Category <span className="text-red-500">*</span></label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={`w-full px-4 py-3 rounded-lg border ${errors.category ? 'border-red-400 bg-red-50' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors font-medium text-gray-800 shadow-sm bg-white`}
              aria-invalid={errors.category ? "true" : "false"}
            >
              <option value="">Select a category</option>
              <option value="Cereals & Grains">Cereals & Grains</option>
              <option value="Plants">Fruits & Vegetables</option>
              <option value="Farm Animals">Livestock & Animals</option>
              <option value="Poultry">Poultry & Birds</option>
              <option value="Tools">Farm Tools & Equipment</option>
              <option value="Farm Accessories">Farm Supplies & Accessories</option>
              <option value="Seeds">Seeds & Seedlings</option>
            </select>
            {errors.category && <p className="error-message text-red-500 text-sm mt-1">{errors.category}</p>}
          </div>

          {availableSubcategories.length > 0 && (
            <div className="space-y-2">
              <label htmlFor="subcategory" className="block text-sm font-semibold text-gray-800">Subcategory <span className="text-red-500">*</span></label>
              <select
                id="subcategory"
                name="subcategory"
                value={formData.subcategory}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-lg border ${errors.subcategory ? 'border-red-400 bg-red-50' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors font-medium text-gray-800 shadow-sm bg-white`}
                aria-invalid={errors.subcategory ? "true" : "false"}
              >
                <option value="">Select a subcategory</option>
                {availableSubcategories.map(sub => (
                  <option key={sub.name} value={sub.name}>{sub.name}</option>
                ))}
              </select>
              {errors.subcategory && <p className="error-message text-red-500 text-sm mt-1">{errors.subcategory}</p>}
            </div>
          )}
        </div>

        {/* Location and Price */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="location" className="block text-sm font-semibold text-gray-800">Location <span className="text-red-500">*</span></label>
            <input
              id="location"
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g., Lagos State, Nigeria"
              className={`w-full px-4 py-3 rounded-lg border ${errors.location ? 'border-red-400 bg-red-50' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors font-medium text-gray-800 shadow-sm`}
              aria-invalid={errors.location ? "true" : "false"}
            />
            {errors.location && <p className="error-message text-red-500 text-sm mt-1">{errors.location}</p>}
          </div>

          <div className="space-y-2">
            <label htmlFor="price" className="block text-sm font-semibold text-gray-800">Price (₦) <span className="text-red-500">*</span></label>
            <input
              id="price"
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              placeholder="e.g., 5000"
              min="1"
              max="99999999"
              className={`w-full px-4 py-3 rounded-lg border ${errors.price ? 'border-red-400 bg-red-50' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors font-medium text-gray-800 shadow-sm`}
              aria-invalid={errors.price ? "true" : "false"}
            />
            {errors.price && <p className="error-message text-red-500 text-sm mt-1">{errors.price}</p>}
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label htmlFor="description" className="block text-sm font-semibold text-gray-800">Description <span className="text-red-500">*</span></label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            placeholder="Provide detailed information about your product, including quality, quantity, and any special features..."
            className={`w-full px-4 py-3 rounded-lg border ${errors.description ? 'border-red-400 bg-red-50' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors font-medium text-gray-800 shadow-sm resize-vertical`}
            aria-invalid={errors.description ? "true" : "false"}
          />
          <div className="flex justify-between text-sm text-gray-500">
            <span>{formData.description.length}/2000 characters</span>
            <span>Minimum 20 characters required</span>
          </div>
          {errors.description && <p className="error-message text-red-500 text-sm mt-1">{errors.description}</p>}
        </div>

        {/* Contact */}
        <div className="space-y-2">
          <label htmlFor="contact" className="block text-sm font-semibold text-gray-800">Contact Information <span className="text-red-500">*</span></label>
          <input
            id="contact"
            type="text"
            name="contact"
            value={formData.contact}
            onChange={handleChange}
            placeholder="Phone number or email address"
            className={`w-full px-4 py-3 rounded-lg border ${errors.contact ? 'border-red-400 bg-red-50' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors font-medium text-gray-800 shadow-sm`}
            aria-invalid={errors.contact ? "true" : "false"}
          />
          {errors.contact && <p className="error-message text-red-500 text-sm mt-1">{errors.contact}</p>}
        </div>

        {/* Images */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">Current Images</label>
            {existingImages.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                {existingImages.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={image}
                      alt={`Current image ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg border border-gray-300"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/api/placeholder/100/100';
                      }}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No current images</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">Upload New Images (Optional)</label>
            <FileUpload onFileChange={handleFileChange} />
            {errors.images && <p className="error-message text-red-500 text-sm mt-1">{errors.images}</p>}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
          <Link
            href="/dashboard/my-ads"
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium shadow-md"
          >
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Updating...' : 'Update Ad'}
          </button>
        </div>
      </form>
    </div>
  );
}