"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/components/SessionWrapper";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Settings as SettingsIcon,
  User,
  Bell,
  MessageSquare,
  Clock,
  Shield,
  Loader2,
  Save,
  CheckCircle,
} from "lucide-react";
import toast from "react-hot-toast";

interface AgentProfile {
  id: string;
  userId: string;
  name: string;
  email: string;
  isOnline: boolean;
  isAvailable: boolean;
  specialties: string[];
  bio: string;
  profileImage: string;
  activeChats: number;
  lastActive: string;
}

interface NotificationSettings {
  newChatAssigned: boolean;
  newTicketAssigned: boolean;
  chatUpdates: boolean;
  ticketUpdates: boolean;
  systemAnnouncements: boolean;
  emailNotifications: boolean;
  desktopNotifications: boolean;
  soundAlerts: boolean;
}

interface AppearanceSettings {
  theme: string;
  fontSize: string;
  chatLayout: string;
  showTimestamps: boolean;
  compactView: boolean;
}

export default function Settings() {
  const { session } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState<AgentProfile | null>(null);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    newChatAssigned: true,
    newTicketAssigned: true,
    chatUpdates: true,
    ticketUpdates: true,
    systemAnnouncements: true,
    emailNotifications: true,
    desktopNotifications: true,
    soundAlerts: true,
  });
  const [appearanceSettings, setAppearanceSettings] = useState<AppearanceSettings>({
    theme: "light",
    fontSize: "medium",
    chatLayout: "default",
    showTimestamps: true,
    compactView: false,
  });
  const [activeTab, setActiveTab] = useState("profile");
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [newSpecialty, setNewSpecialty] = useState("");

  // Fetch agent profile and settings on component mount
  useEffect(() => {
    if (session) {
      fetchAgentProfile();
      fetchAgentSettings();
    }
  }, [session]);

  const fetchAgentProfile = async () => {
    try {
      setIsLoading(true);
      
      // In a real app, this would be an API call
      // For now, we'll use mock data
      setTimeout(() => {
        const mockProfile: AgentProfile = {
          id: "agent123",
          userId: session?.id || "",
          name: session?.name || "Agent Name",
          email: session?.email || "agent@example.com",
          isOnline: true,
          isAvailable: true,
          specialties: ["Technical Support", "Billing Issues", "Product Information"],
          bio: "Experienced customer support agent with 3+ years in technical support and billing assistance.",
          profileImage: session?.image || "",
          activeChats: 2,
          lastActive: new Date().toISOString(),
        };
        
        setProfile(mockProfile);
        setSpecialties(mockProfile.specialties);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching agent profile:', error);
      toast.error('Failed to load profile');
      setIsLoading(false);
    }
  };

  const fetchAgentSettings = async () => {
    try {
      // In a real app, this would be an API call
      // For now, we'll use mock data or localStorage
      const savedNotifications = localStorage.getItem("agentNotificationSettings");
      const savedAppearance = localStorage.getItem("agentAppearanceSettings");
      
      if (savedNotifications) {
        setNotificationSettings(JSON.parse(savedNotifications));
      }
      
      if (savedAppearance) {
        setAppearanceSettings(JSON.parse(savedAppearance));
      }
    } catch (error) {
      console.error('Error fetching agent settings:', error);
    }
  };

  const handleProfileUpdate = async () => {
    if (!profile) return;
    
    try {
      setIsSaving(true);
      
      // In a real app, this would be an API call
      // For now, we'll simulate it
      setTimeout(() => {
        // Update profile with specialties
        setProfile({
          ...profile,
          specialties,
        });
        
        toast.success('Profile updated successfully');
        setIsSaving(false);
      }, 1000);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
      setIsSaving(false);
    }
  };

  const handleNotificationSettingsUpdate = async () => {
    try {
      setIsSaving(true);
      
      // In a real app, this would be an API call
      // For now, we'll save to localStorage
      localStorage.setItem("agentNotificationSettings", JSON.stringify(notificationSettings));
      
      setTimeout(() => {
        toast.success('Notification settings updated');
        setIsSaving(false);
      }, 500);
    } catch (error) {
      console.error('Error updating notification settings:', error);
      toast.error('Failed to update notification settings');
      setIsSaving(false);
    }
  };

  const handleAppearanceSettingsUpdate = async () => {
    try {
      setIsSaving(true);
      
      // In a real app, this would be an API call
      // For now, we'll save to localStorage
      localStorage.setItem("agentAppearanceSettings", JSON.stringify(appearanceSettings));
      
      setTimeout(() => {
        toast.success('Appearance settings updated');
        setIsSaving(false);
      }, 500);
    } catch (error) {
      console.error('Error updating appearance settings:', error);
      toast.error('Failed to update appearance settings');
      setIsSaving(false);
    }
  };

  const addSpecialty = () => {
    if (newSpecialty.trim() && !specialties.includes(newSpecialty.trim())) {
      setSpecialties([...specialties, newSpecialty.trim()]);
      setNewSpecialty("");
    }
  };

  const removeSpecialty = (specialty: string) => {
    setSpecialties(specialties.filter(s => s !== specialty));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">Agent Settings</h2>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="profile">
            <User className="w-4 h-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="w-4 h-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="appearance">
            <SettingsIcon className="w-4 h-4 mr-2" />
            Appearance
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="w-4 h-4 mr-2" />
            Security
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your agent profile information and specialties
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input 
                    id="name" 
                    value={profile?.name || ""} 
                    onChange={(e) => setProfile(prev => prev ? {...prev, name: e.target.value} : null)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    value={profile?.email || ""} 
                    disabled
                  />
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea 
                    id="bio" 
                    rows={4}
                    value={profile?.bio || ""} 
                    onChange={(e) => setProfile(prev => prev ? {...prev, bio: e.target.value} : null)}
                    placeholder="Tell us about your experience and expertise"
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label>Specialties</Label>
                  <div className="flex gap-2">
                    <Input 
                      placeholder="Add specialty" 
                      value={newSpecialty}
                      onChange={(e) => setNewSpecialty(e.target.value)}
                      className="w-48"
                    />
                    <Button onClick={addSpecialty} size="sm">Add</Button>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {specialties.map((specialty, index) => (
                    <div key={index} className="flex items-center bg-gray-100 rounded-full px-3 py-1">
                      <span className="text-sm">{specialty}</span>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-5 w-5 ml-1"
                        onClick={() => removeSpecialty(specialty)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="available" 
                    checked={profile?.isAvailable || false}
                    onCheckedChange={(checked) => setProfile(prev => prev ? {...prev, isAvailable: checked} : null)}
                  />
                  <Label htmlFor="available">Available for new chats and tickets</Label>
                </div>
                <p className="text-sm text-gray-500">
                  When turned off, you won't receive new chat or ticket assignments
                </p>
              </div>
              
              <div className="flex justify-end">
                <Button onClick={handleProfileUpdate} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Customize how and when you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Event Notifications</h3>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="newChatAssigned">New Chat Assigned</Label>
                      <p className="text-sm text-gray-500">
                        Receive notifications when a new chat is assigned to you
                      </p>
                    </div>
                    <Switch 
                      id="newChatAssigned" 
                      checked={notificationSettings.newChatAssigned}
                      onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, newChatAssigned: checked})}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="newTicketAssigned">New Ticket Assigned</Label>
                      <p className="text-sm text-gray-500">
                        Receive notifications when a new ticket is assigned to you
                      </p>
                    </div>
                    <Switch 
                      id="newTicketAssigned" 
                      checked={notificationSettings.newTicketAssigned}
                      onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, newTicketAssigned: checked})}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="chatUpdates">Chat Updates</Label>
                      <p className="text-sm text-gray-500">
                        Receive notifications for updates to your active chats
                      </p>
                    </div>
                    <Switch 
                      id="chatUpdates" 
                      checked={notificationSettings.chatUpdates}
                      onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, chatUpdates: checked})}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="ticketUpdates">Ticket Updates</Label>
                      <p className="text-sm text-gray-500">
                        Receive notifications for updates to your assigned tickets
                      </p>
                    </div>
                    <Switch 
                      id="ticketUpdates" 
                      checked={notificationSettings.ticketUpdates}
                      onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, ticketUpdates: checked})}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="systemAnnouncements">System Announcements</Label>
                      <p className="text-sm text-gray-500">
                        Receive notifications for important system announcements
                      </p>
                    </div>
                    <Switch 
                      id="systemAnnouncements" 
                      checked={notificationSettings.systemAnnouncements}
                      onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, systemAnnouncements: checked})}
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-4 pt-4 border-t">
                <h3 className="text-lg font-medium">Notification Channels</h3>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="emailNotifications">Email Notifications</Label>
                      <p className="text-sm text-gray-500">
                        Receive notifications via email
                      </p>
                    </div>
                    <Switch 
                      id="emailNotifications" 
                      checked={notificationSettings.emailNotifications}
                      onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, emailNotifications: checked})}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="desktopNotifications">Desktop Notifications</Label>
                      <p className="text-sm text-gray-500">
                        Receive browser notifications when the app is open
                      </p>
                    </div>
                    <Switch 
                      id="desktopNotifications" 
                      checked={notificationSettings.desktopNotifications}
                      onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, desktopNotifications: checked})}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="soundAlerts">Sound Alerts</Label>
                      <p className="text-sm text-gray-500">
                        Play sound alerts for new notifications
                      </p>
                    </div>
                    <Switch 
                      id="soundAlerts" 
                      checked={notificationSettings.soundAlerts}
                      onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, soundAlerts: checked})}
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button onClick={handleNotificationSettingsUpdate} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Preferences
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Appearance Settings</CardTitle>
              <CardDescription>
                Customize the look and feel of your agent dashboard
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="theme">Theme</Label>
                  <Select 
                    value={appearanceSettings.theme}
                    onValueChange={(value) => setAppearanceSettings({...appearanceSettings, theme: value})}
                  >
                    <SelectTrigger id="theme">
                      <SelectValue placeholder="Select theme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System Default</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="fontSize">Font Size</Label>
                  <Select 
                    value={appearanceSettings.fontSize}
                    onValueChange={(value) => setAppearanceSettings({...appearanceSettings, fontSize: value})}
                  >
                    <SelectTrigger id="fontSize">
                      <SelectValue placeholder="Select font size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Small</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="large">Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="chatLayout">Chat Layout</Label>
                  <Select 
                    value={appearanceSettings.chatLayout}
                    onValueChange={(value) => setAppearanceSettings({...appearanceSettings, chatLayout: value})}
                  >
                    <SelectTrigger id="chatLayout">
                      <SelectValue placeholder="Select chat layout" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default</SelectItem>
                      <SelectItem value="compact">Compact</SelectItem>
                      <SelectItem value="bubbles">Bubbles</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="showTimestamps">Show Timestamps</Label>
                      <p className="text-sm text-gray-500">
                        Show timestamps for all messages in chats
                      </p>
                    </div>
                    <Switch 
                      id="showTimestamps" 
                      checked={appearanceSettings.showTimestamps}
                      onCheckedChange={(checked) => setAppearanceSettings({...appearanceSettings, showTimestamps: checked})}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="compactView">Compact View</Label>
                      <p className="text-sm text-gray-500">
                        Use a more compact layout to fit more content on screen
                      </p>
                    </div>
                    <Switch 
                      id="compactView" 
                      checked={appearanceSettings.compactView}
                      onCheckedChange={(checked) => setAppearanceSettings({...appearanceSettings, compactView: checked})}
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button onClick={handleAppearanceSettingsUpdate} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Settings
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Manage your account security and password
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Change Password</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input id="currentPassword" type="password" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input id="newPassword" type="password" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input id="confirmPassword" type="password" />
                </div>
                
                <Button>
                  <Shield className="w-4 h-4 mr-2" />
                  Update Password
                </Button>
              </div>
              
              <div className="space-y-4 pt-6 border-t">
                <h3 className="text-lg font-medium">Two-Factor Authentication</h3>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Two-Factor Authentication</Label>
                      <p className="text-sm text-gray-500">
                        Add an extra layer of security to your account
                      </p>
                    </div>
                    <Button variant="outline">
                      Enable 2FA
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4 pt-6 border-t">
                <h3 className="text-lg font-medium">Session Management</h3>
                
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">
                    You are currently logged in from this device.
                  </p>
                  
                  <Button variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                    Log Out All Other Devices
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
