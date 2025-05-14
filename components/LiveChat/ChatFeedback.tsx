"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ThumbsUp, ThumbsDown, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import toast from "react-hot-toast";

interface ChatFeedbackProps {
  chatId: string;
  onClose: () => void;
  onSubmit: (rating: number, feedback: string) => void;
}

export default function ChatFeedback({ chatId, onClose, onSubmit }: ChatFeedbackProps) {
  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [feedback, setFeedback] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [quickFeedback, setQuickFeedback] = useState<"positive" | "negative" | null>(null);

  const handleSubmit = async () => {
    if (rating === 0 && !quickFeedback) {
      toast.error("Please provide a rating before submitting");
      return;
    }

    try {
      // In a real app, this would be an API call
      // For now, we'll just simulate it
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      // Calculate final rating
      let finalRating = rating;
      if (!finalRating && quickFeedback === "positive") finalRating = 5;
      if (!finalRating && quickFeedback === "negative") finalRating = 2;
      
      onSubmit(finalRating, feedback);
      setSubmitted(true);
      
      // Show success toast
      toast.success("Thank you for your feedback!");
      
      // Close after a delay
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast.error("Failed to submit feedback. Please try again.");
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">How was your experience?</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!submitted ? (
          <>
            <div className="space-y-6">
              {/* Star Rating */}
              <div className="flex flex-col items-center">
                <p className="text-sm text-gray-500 mb-2">Rate your chat experience</p>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <motion.button
                      key={star}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          star <= (hoveredRating || rating)
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-300"
                        } transition-colors duration-150`}
                      />
                    </motion.button>
                  ))}
                </div>
                <p className="mt-2 text-sm font-medium text-gray-700">
                  {rating === 1 && "Poor"}
                  {rating === 2 && "Fair"}
                  {rating === 3 && "Good"}
                  {rating === 4 && "Very Good"}
                  {rating === 5 && "Excellent"}
                </p>
              </div>

              {/* Quick Feedback */}
              <div className="flex justify-center space-x-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setQuickFeedback("positive")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full border ${
                    quickFeedback === "positive"
                      ? "bg-green-50 border-green-500 text-green-700"
                      : "border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <ThumbsUp className="w-4 h-4" />
                  <span>Helpful</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setQuickFeedback("negative")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full border ${
                    quickFeedback === "negative"
                      ? "bg-red-50 border-red-500 text-red-700"
                      : "border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <ThumbsDown className="w-4 h-4" />
                  <span>Not Helpful</span>
                </motion.button>
              </div>

              {/* Additional Feedback */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Additional comments (optional)
                </label>
                <Textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Tell us more about your experience..."
                  className="w-full h-24"
                />
              </div>

              <Button
                onClick={handleSubmit}
                className="w-full flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                Submit Feedback
              </Button>
            </div>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8"
          >
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ThumbsUp className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Thank You!</h3>
            <p className="text-gray-500">Your feedback helps us improve our service.</p>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
