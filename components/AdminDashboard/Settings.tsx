"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Save } from "lucide-react";
import toast from "react-hot-toast";

interface AppSettings {
  supportEnabled: boolean;
  maxAgentsPerCategory: number;
  autoAssignAgents: boolean;
  chatTimeoutMinutes: number;
  notificationsEnabled: boolean;
  maintenanceMode: boolean;
}

export default function Settings() {
  const [settings, setSettings] = useState<AppSettings>({
    supportEnabled: true,
    maxAgentsPerCategory: 5,
    autoAssignAgents: true,
    chatTimeoutMinutes: 30,
    notificationsEnabled: true,
    maintenanceMode: false
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/settings", {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Failed to fetch settings' }));
        throw new Error(errorData.message || "Failed to fetch settings");
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to load settings";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        toast.success("Settings saved successfully");
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Failed to save settings' }));
        throw new Error(errorData.message || "Failed to save settings");
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to save settings";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (key: keyof AppSettings, value: boolean | number) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
        <span className="ml-2 text-gray-500">Loading settings...</span>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">System Settings</h2>
        <Button
          onClick={saveSettings}
          disabled={saving}
          className="flex items-center gap-2"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Changes
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <div className="text-red-600 text-sm">
              <strong>Error:</strong> {error}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchSettings}
              className="ml-auto text-red-600 border-red-300 hover:bg-red-100"
            >
              Retry
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* Support Settings */}
        <div className="border-b pb-4">
          <h3 className="text-lg font-medium mb-4">Support Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="supportEnabled">Enable Support System</Label>
                <p className="text-sm text-gray-500">Allow users to contact support agents</p>
              </div>
              <Switch
                id="supportEnabled"
                checked={settings.supportEnabled}
                onCheckedChange={(checked: boolean) => handleChange('supportEnabled', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="autoAssignAgents">Auto-assign Agents</Label>
                <p className="text-sm text-gray-500">Automatically assign agents to new support requests</p>
              </div>
              <Switch
                id="autoAssignAgents"
                checked={settings.autoAssignAgents}
                onCheckedChange={(checked: boolean) => handleChange('autoAssignAgents', checked)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="maxAgentsPerCategory">Max Agents Per Category</Label>
                <Input
                  id="maxAgentsPerCategory"
                  type="number"
                  value={settings.maxAgentsPerCategory}
                  onChange={(e) => handleChange('maxAgentsPerCategory', parseInt(e.target.value))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="chatTimeoutMinutes">Chat Timeout (minutes)</Label>
                <Input
                  id="chatTimeoutMinutes"
                  type="number"
                  value={settings.chatTimeoutMinutes}
                  onChange={(e) => handleChange('chatTimeoutMinutes', parseInt(e.target.value))}
                  className="mt-1"
                />
              </div>
            </div>
          </div>
        </div>

        {/* System Settings */}
        <div>
          <h3 className="text-lg font-medium mb-4">System Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="notificationsEnabled">Enable Notifications</Label>
                <p className="text-sm text-gray-500">Send email notifications for system events</p>
              </div>
              <Switch
                id="notificationsEnabled"
                checked={settings.notificationsEnabled}
                onCheckedChange={(checked: boolean) => handleChange('notificationsEnabled', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
                <p className="text-sm text-gray-500">Put the system in maintenance mode (users will see a maintenance page)</p>
              </div>
              <Switch
                id="maintenanceMode"
                checked={settings.maintenanceMode}
                onCheckedChange={(checked: boolean) => handleChange('maintenanceMode', checked)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}