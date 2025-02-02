"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import InputField from "@/components/ui/input-field";
import TextAreaField from "@/components/ui/text-field";
import SelectField from "@/components/ui/select-field";
import FileUpload from "@/components/ui/file-upload";
import { Loader2 } from "lucide-react";

const categories = ["Fruits", "Vegetables", "Grains", "Livestock", "Machinery"];

export default function PostNewAd() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    location: "",
    price: "",
    description: "",
    contact: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    setTimeout(() => {
      setLoading(false);
      alert("Ad posted successfully!");
      router.push("/ads");
    }, 2000);
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
        <FileUpload onFilesSelected={() => {}} />
        <button type="submit" className="w-full bg-green-600 text-white py-2 rounded-md font-semibold hover:bg-green-700 flex items-center justify-center">
          {loading ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : "Post Ad"}
        </button>
      </form>
    </div>
  );
}
