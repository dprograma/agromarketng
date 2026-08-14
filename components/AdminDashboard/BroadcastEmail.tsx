"use client";

import { useState } from "react";
import { Send, Users, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

interface BroadcastResult {
  total: number;
  sent: number;
  failed: number;
}

export default function BroadcastEmail() {
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<BroadcastResult | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSend = async () => {
    setSending(true);
    setShowConfirm(false);
    setResult(null);

    try {
      const res = await fetch("/api/admin/broadcast-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ subject, content }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Broadcast failed");
        return;
      }

      setResult(data);
      toast.success(`Broadcast sent to ${data.sent} users`);
    } catch (err) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const isReady = subject.trim().length > 0 && content.trim().length > 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Broadcast Email</h2>
        <p className="text-sm text-gray-500 mt-1">
          Send a message to all verified users on the platform. Each email is personalised with the recipient&apos;s first name.
        </p>
      </div>

      {/* Result banner */}
      {result && (
        <div className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-lg p-4">
          <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold text-green-800">Broadcast complete</p>
            <p className="text-sm text-green-700 mt-1">
              {result.sent} of {result.total} emails sent successfully.
              {result.failed > 0 && (
                <span className="text-red-600 ml-1">{result.failed} failed.</span>
              )}
            </p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border shadow-sm p-6 space-y-5">
        {/* Subject */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Email Subject <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g. Important update from AgroMarket NG"
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Message Body <span className="text-red-500">*</span>
          </label>
          <p className="text-xs text-gray-400 mb-2">
            Plain text. Each email will begin with &ldquo;Hi [First Name],&rdquo; automatically.
          </p>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={10}
            placeholder={`We're excited to share some great news with you...\n\nYou can now post unlimited ads for free on AgroMarket NG.\n\nVisit us to list your farm produce today.`}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-y font-mono"
          />
          <p className="text-xs text-gray-400 mt-1 text-right">{content.length} characters</p>
        </div>

        {/* Preview */}
        {isReady && (
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Preview</p>
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 text-sm text-gray-700 space-y-2">
              <p><span className="font-semibold text-gray-500">Subject:</span> {subject}</p>
              <hr className="border-gray-200" />
              <p className="text-gray-600">Hi [First Name],</p>
              <p className="whitespace-pre-wrap text-gray-700">{content}</p>
            </div>
          </div>
        )}

        {/* Warning */}
        <div className="flex items-start gap-2 text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <p className="text-xs leading-relaxed">
            This will send an email to <strong>every verified user</strong> on the platform. Double-check your message before sending.
          </p>
        </div>

        {/* Actions */}
        {!showConfirm ? (
          <Button
            onClick={() => setShowConfirm(true)}
            disabled={!isReady || sending}
            className="bg-green-700 hover:bg-green-800 text-white w-full sm:w-auto"
          >
            <Users className="w-4 h-4 mr-2" />
            Send to All Users
          </Button>
        ) : (
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleSend}
              disabled={sending}
              className="bg-green-700 hover:bg-green-800 text-white"
            >
              {sending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending…
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Yes, send now
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowConfirm(false)}
              disabled={sending}
            >
              Cancel
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
