"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";

export default function CreateAgent() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [specialties, setSpecialties] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/admin/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email,
          name,
          specialties: specialties.split(",").map((s) => s.trim()),
        }),
      });

      if (response.ok) {
        toast.success("Agent created successfully");
        setEmail("");
        setName("");
        setSpecialties("");
      } else {
        const data = await response.json();
        throw new Error(data.error);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to create agent");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6 mt-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">Email *</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="agent@example.com"
            className="w-full"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-medium">Full Name *</Label>
          <Input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Doe"
            className="w-full"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="specialties" className="text-sm font-medium">
            Specialties (comma-separated) *
          </Label>
          <Input
            id="specialties"
            value={specialties}
            onChange={(e) => setSpecialties(e.target.value)}
            placeholder="Technical Support, Billing, General"
            className="w-full"
            required
          />
          <p className="text-xs text-gray-500">
            Enter specialties separated by commas (e.g., Technical Support, Billing Issues)
          </p>
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2 text-sm"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating Agent...
            </>
          ) : (
            "Create New Agent"
          )}
        </Button>
      </form>
    </div>
  );
}