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

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/admin/settings", {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      } else {
        throw new Error("Failed to fetch settings");
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
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
        throw new Error("Failed to save settings");
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings");
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