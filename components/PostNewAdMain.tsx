"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import FileUpload from "@/components/ui/file-upload";
import { Loader2, AlertCircle, ArrowLeft } from "lucide-react";
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

export default function PostNewAd() {
  const router = useRouter();
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
  const [availableSubcategories, setAvailableSubcategories] = useState<{name: string}[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileState>([]);
  const [formSubmitted, setFormSubmitted] = useState(false);
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
      // When subcategory changes
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

  // No need for debugging function anymore

  // Update subcategories when category changes
  useEffect(() => {
    if (formData.category) {
      // Map the UI category to the corresponding navigation category
      const mappedCategory = getCategoryMapping(formData.category);

      // Find the category in the navigation structure
      const categoryData = navigation.categories.find(
        cat => cat.name === mappedCategory
      );

      if (categoryData) {
        // Get items directly from the category
        const subcategories = categoryData.items
          .filter(item => item.name !== 'Browse All') // Filter out "Browse All" items
          .map(item => ({
            name: item.name
          }));

        setAvailableSubcategories(subcategories);
        console.log(`Found ${subcategories.length} subcategories for ${formData.category} (mapped to ${mappedCategory})`);
      } else {
        console.log(`No category data found for ${formData.category} (mapped to ${mappedCategory})`);
        setAvailableSubcategories([]);
      }
    } else {
      setAvailableSubcategories([]);
    }
  }, [formData.category]);

  const handleFileChange = (files: File[]) => {
    setSelectedFiles(files);

    // Clear image error when files are selected
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

    // Subcategory validation (only if category is selected and subcategories are available)
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
      // Simple validation for phone or email
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contact);
      const isPhone = /^[0-9+\-\s()]{7,20}$/.test(formData.contact);

      if (!isEmail && !isPhone) {
        newErrors.contact = "Please enter a valid email or phone number";
        isValid = false;
      }
    }

    // Image validation
    if (selectedFiles.length === 0) {
      newErrors.images = "Please upload at least one image";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);

    // Validate form
    if (!validateForm()) {
      // Scroll to the first error
      const firstErrorElement = document.querySelector('.error-message');
      if (firstErrorElement) {
        firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      // Show toast for validation errors
      showToast('Please fix the errors in the form', 'error');
      return;
    }

    setLoading(true);

    try {
      // Check network connectivity first
      if (!navigator.onLine) {
        throw new Error('No internet connection. Please check your network and try again.');
      }

      const submitFormData = new FormData();

      // Append form fields
      Object.keys(formData).forEach(key => {
        submitFormData.append(key, formData[key as keyof typeof formData]);
      });

      // Validate and append files
      if (selectedFiles.length === 0) {
        throw new Error('Please upload at least one image');
      }

      // Check file sizes again before submission
      const oversizedFiles = selectedFiles.filter(file => file.size > 2 * 1024 * 1024);
      if (oversizedFiles.length > 0) {
        throw new Error(`${oversizedFiles.length} image(s) exceed the 2MB size limit. Please resize and try again.`);
      }

      // Append files
      selectedFiles.forEach(file => {
        submitFormData.append('images', file);
      });

      // Set timeout for the request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      try {
        const response = await fetch('/api/postAd', {
          method: 'POST',
          body: submitFormData,
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        const data = await response.json();

        if (response.ok) {
          showToast('Your ad has been posted successfully!', 'success');

          // Show success state briefly before redirecting
          setTimeout(() => {
            router.push('/dashboard/my-ads');
          }, 1500);
        } else {
          // Handle specific error codes
          if (response.status === 413) {
            throw new Error('The uploaded files are too large. Please reduce the image sizes and try again.');
          } else if (response.status === 429) {
            throw new Error('Too many requests. Please wait a moment and try again.');
          } else {
            throw new Error(data.error || `Failed to post ad (Error ${response.status})`);
          }
        }
      } catch (fetchError) {
        clearTimeout(timeoutId);

        if (fetchError instanceof DOMException && fetchError.name === 'AbortError') {
          throw new Error('Request timed out. Please try again or check your internet connection.');
        }
        throw fetchError;
      }
    } catch (error) {
      console.error('Ad posting error:', error);
      showToast(error instanceof Error ? error.message : 'Failed to post ad', 'error');
      setLoading(false);
    }
  };

  // Loading/Success state after form submission
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
          <h2 className="text-2xl font-bold text-gray-900">Posting Your Ad</h2>
          <p className="text-gray-700 max-w-md text-lg">
            Your ad is being processed. Please wait a moment...
          </p>
          <div className="w-full max-w-md bg-gray-200 rounded-full h-2.5 mt-4">
            <div className="bg-green-600 h-2.5 rounded-full animate-pulse" style={{ width: '75%' }}></div>
          </div>
          <p className="text-sm text-gray-500">This may take a few seconds if you're uploading multiple images</p>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-xl rounded-xl">
      <div className="flex items-center mb-6">
        <Link href="/dashboard" className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors" aria-label="Back to dashboard">
          <ArrowLeft className="h-5 w-5 text-gray-700" />
        </Link>
        <h2 className="text-2xl font-bold text-gray-900">Post a New Ad</h2>
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-600 p-4 mb-6 rounded-md">
        <p className="text-sm text-blue-800 font-medium">
          <strong className="font-semibold">Tip:</strong> High-quality ads with clear images and detailed descriptions get up to 3x more responses!
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
            aria-describedby={errors.title ? "title-error" : "title-hint"}
          />
          {errors.title && (
            <p id="title-error" className="text-red-600 text-sm mt-1 font-medium error-message flex items-start">
              <AlertCircle className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
              {errors.title}
            </p>
          )}
          <p id="title-hint" className="text-xs text-gray-700 mt-1">A clear, descriptive title will attract more buyers (5-100 characters)</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="category" className="block text-sm font-semibold text-gray-800">Category <span className="text-red-500">*</span></label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={`w-full px-4 py-3 rounded-lg border ${errors.category ? 'border-red-400 bg-red-50' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors font-medium text-gray-800 shadow-sm`}
              aria-invalid={errors.category ? "true" : "false"}
              aria-describedby={errors.category ? "category-error" : undefined}
            >
              <option value="">Select a category</option>
              {navigation.categories.map(cat => (
                <option key={cat.id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
            {errors.category && (
              <p id="category-error" className="text-red-600 text-sm mt-1 font-medium error-message flex items-start">
                <AlertCircle className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
                {errors.category}
              </p>
            )}
          </div>

          {formData.category && (
            <div className="space-y-2">
              <label htmlFor="subcategory" className="block text-sm font-semibold text-gray-800">
                Subcategory <span className="text-red-500">*</span>
                {availableSubcategories.length === 0 && (
                  <span className="ml-2 text-xs text-amber-600 font-normal">
                    (Loading subcategories...)
                  </span>
                )}
              </label>
              <select
                id="subcategory"
                name="subcategory"
                value={formData.subcategory}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-lg border ${errors.subcategory ? 'border-red-400 bg-red-50' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors font-medium text-gray-800 shadow-sm`}
                aria-invalid={errors.subcategory ? "true" : "false"}
                aria-describedby={errors.subcategory ? "subcategory-error" : undefined}
                disabled={availableSubcategories.length === 0}
              >
                <option value="">Select a subcategory</option>
                {availableSubcategories.map(sub => (
                  <option key={sub.name} value={sub.name}>{sub.name}</option>
                ))}
              </select>
              {errors.subcategory && (
                <p id="subcategory-error" className="text-red-600 text-sm mt-1 font-medium error-message flex items-start">
                  <AlertCircle className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
                  {errors.subcategory}
                </p>
              )}
              {availableSubcategories.length === 0 && formData.category && (
                <p className="text-amber-600 text-xs mt-1">
                  No subcategories found for {formData.category}. Please try selecting a different category.
                </p>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="location" className="block text-sm font-semibold text-gray-800">Location <span className="text-red-500">*</span></label>
            <input
              id="location"
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g., Lagos, Nigeria"
              className={`w-full px-4 py-3 rounded-lg border ${errors.location ? 'border-red-400 bg-red-50' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors font-medium text-gray-800 shadow-sm`}
              aria-invalid={errors.location ? "true" : "false"}
              aria-describedby={errors.location ? "location-error" : undefined}
            />
            {errors.location && (
              <p id="location-error" className="text-red-600 text-sm mt-1 font-medium error-message flex items-start">
                <AlertCircle className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
                {errors.location}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="price" className="block text-sm font-semibold text-gray-800">Price (₦) <span className="text-red-500">*</span></label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-700 font-medium">₦</span>
              <input
                id="price"
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="Enter price"
                min="0"
                step="0.01"
                className={`w-full pl-8 px-4 py-3 rounded-lg border ${errors.price ? 'border-red-400 bg-red-50' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors font-medium text-gray-800 shadow-sm`}
                aria-invalid={errors.price ? "true" : "false"}
                aria-describedby={errors.price ? "price-error" : undefined}
              />
            </div>
            {errors.price && (
              <p id="price-error" className="text-red-600 text-sm mt-1 font-medium error-message flex items-start">
                <AlertCircle className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
                {errors.price}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="description" className="block text-sm font-semibold text-gray-800">Description <span className="text-red-500">*</span></label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Provide more details about your product or service..."
            rows={5}
            className={`w-full px-4 py-3 rounded-lg border ${errors.description ? 'border-red-400 bg-red-50' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors font-medium text-gray-800 shadow-sm`}
            aria-invalid={errors.description ? "true" : "false"}
            aria-describedby={errors.description ? "description-error" : "description-hint"}
          />
          {errors.description && (
            <p id="description-error" className="text-red-600 text-sm mt-1 font-medium error-message flex items-start">
              <AlertCircle className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
              {errors.description}
            </p>
          )}
          <p id="description-hint" className="text-xs text-gray-700 mt-1">
            Include details like condition, features, benefits, and why someone should buy your product (20-2000 characters)
          </p>
          <div className="text-right text-xs text-gray-500">
            {formData.description.length}/2000 characters
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="contact" className="block text-sm font-semibold text-gray-800">Contact Details <span className="text-red-500">*</span></label>
          <input
            id="contact"
            type="text"
            name="contact"
            value={formData.contact}
            onChange={handleChange}
            placeholder="Phone number or email"
            className={`w-full px-4 py-3 rounded-lg border ${errors.contact ? 'border-red-400 bg-red-50' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors font-medium text-gray-800 shadow-sm`}
            aria-invalid={errors.contact ? "true" : "false"}
            aria-describedby={errors.contact ? "contact-error" : "contact-hint"}
          />
          {errors.contact && (
            <p id="contact-error" className="text-red-600 text-sm mt-1 font-medium error-message flex items-start">
              <AlertCircle className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
              {errors.contact}
            </p>
          )}
          <p id="contact-hint" className="text-xs text-gray-700 mt-1">This will be visible to potential buyers. Enter a valid phone number or email address.</p>
        </div>

        <FileUpload
          onFilesSelected={handleFileChange}
          maxFiles={5}
          error={errors.images}
        />

        <div className="pt-6">
          {Object.keys(errors).length > 0 && formSubmitted && (
            <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-md">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2" />
                <div>
                  <h3 className="text-sm font-medium text-red-800">Please fix the following errors:</h3>
                  <ul className="mt-1 text-sm text-red-700 list-disc list-inside">
                    {Object.entries(errors).map(([field, message]) => (
                      <li key={field}>{message}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : "Post Ad"}
          </button>

          <p className="text-center text-xs text-gray-600 mt-4">
            By posting this ad, you agree to our <Link href="/terms" className="text-green-600 hover:underline">Terms of Service</Link> and <Link href="/privacy" className="text-green-600 hover:underline">Privacy Policy</Link>
          </p>
        </div>
      </form>
    </div>
  );
}
