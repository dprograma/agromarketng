"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import InputField from "@/components/ui/input-field";
import TextAreaField from "@/components/ui/text-field";
import SelectField from "@/components/ui/select-field";
import FileUpload from "@/components/ui/file-upload";
import Alert from '@/components/Alerts';
import { AlertsMsg } from '@/components/AlertsMsg';
import { Loader2 } from "lucide-react";

const categories = ["Fruits", "Vegetables", "Grains", "Livestock", "Machinery"];

type FileState = File[];

export default function PostNewAd() {
  const router = useRouter();
  const [alerts, setAlerts] = useState<boolean>(false);
  const [alertMessages, setAlertMessages] = useState<string | undefined>();
  const [alertTypes, setAlertTypes] = useState<string | undefined>();
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    location: "",
    price: "",
    description: "",
    contact: "",
    subscriptionPlanId: ""
  });
  const [loading, setLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileState>([]);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (files: File[]) => {
    setSelectedFiles(files);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitFormData = new FormData();

      // Validate price before submission
      const price = parseFloat(formData.price);
      if (isNaN(price) || price <= 0) {
        throw new Error('Invalid price value');
      }

      // Validate files
      if (selectedFiles.length === 0) {
        throw new Error('Please upload at least one image');
      }

      if (selectedFiles.length > 5) {
        throw new Error('Maximum 5 images allowed');
      }

      // Validate file types and sizes
      for (const file of selectedFiles) {
        if (!file.type.startsWith('image/')) {
          throw new Error('Only image files are allowed');
        }
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
          throw new Error('Each image must be less than 5MB');
        }
      }

      // Append form fields
      Object.keys(formData).forEach(key => {
        submitFormData.append(key, formData[key as keyof typeof formData]);
      });

      // Append files
      selectedFiles.forEach((file, index) => {
        submitFormData.append('images', file);
      });

      const response = await fetch('/api/postAd', {
        method: 'POST',
        body: submitFormData,
      });

      const data = await response.json();

      if (response.ok) {
        const alert = 'success_ad_post';
        const alertsResponse = AlertsMsg({ alert: alert || '' });
        setAlerts(true);
        setAlertTypes(alertsResponse?.alertType);
        setAlertMessages(alertsResponse?.alertMessage);
        router.push('/dashboard/my-ads');
      } else {
        throw new Error(data.error || 'Failed to post ad');
      }
    } catch (error) {
      const alert = 'error_post_ad';
      const alertsResponse = AlertsMsg({ alert: alert || '' });
      setAlerts(true);
      setAlertTypes(alertsResponse?.alertType);
      setAlertMessages(error instanceof Error ? error.message : 'Failed to post ad');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">📢 Post a New Ad</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <InputField label="Ad Title" name="title" value={formData.title} onChange={handleChange} placeholder="e.g., Fresh Organic Mangoes for Sale" required />
        <SelectField label="Category" name="category" value={formData.category} onChange={handleChange} options={categories} required />
        <InputField label="Location" name="location" value={formData.location} onChange={handleChange} placeholder="e.g., Lagos, Nigeria" required />
        <InputField label="Price (₦)" name="price" type="number" value={formData.price} onChange={handleChange} placeholder="Enter price" required />
        <TextAreaField label="Description" name="description" value={formData.description} onChange={handleChange} placeholder="Provide more details about the ad..." required />
        <InputField label="Contact Details" name="contact" value={formData.contact} onChange={handleChange} placeholder="Phone number or email" required />
        <FileUpload onFilesSelected={handleFileChange} />
        <button type="submit" className="w-full bg-green-600 text-white py-2 rounded-md font-semibold hover:bg-green-700 flex items-center justify-center">
          {loading ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : "Post Ad"}
        </button>
      </form>
    </div>
  );
}
