"use client";

import { useState } from "react";
import Modal from "@/components/Modal";
import { useToast } from "@/components/ui/use-toast";

export default function SettingsModal({ isOpen, onClose }) {
  const [settings, setSettings] = useState({
    theme: "dark",
    language: "en",
    notifications: true,
    autoSave: true,
  });

  const { toast } = useToast();

  const handleSave = () => {
    // Simulate saving settings
    toast({
      title: "Settings saved",
      description: "Your preferences have been updated successfully.",
      variant: "success",
    });
    onClose();
  };

  const handleReset = () => {
    setSettings({
      theme: "dark",
      language: "en",
      notifications: true,
      autoSave: true,
    });

    toast({
      title: "Settings reset",
      description: "All settings have been reset to defaults.",
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Settings"
      description="Manage your application preferences"
      size="lg"
      footer={
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={handleReset}
            className="flex-1 sm:flex-none px-4 py-2 border border-border rounded-md hover:bg-accent transition-colors"
          >
            Reset to Defaults
          </button>
          <button
            onClick={onClose}
            className="flex-1 sm:flex-none px-4 py-2 border border-border rounded-md hover:bg-accent transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 sm:flex-none px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Save Changes
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Theme Setting */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Theme</label>
          <select
            value={settings.theme}
            onChange={(e) =>
              setSettings((prev) => ({ ...prev, theme: e.target.value }))
            }
            className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="system">System</option>
          </select>
        </div>

        {/* Language Setting */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Language</label>
          <select
            value={settings.language}
            onChange={(e) =>
              setSettings((prev) => ({ ...prev, language: e.target.value }))
            }
            className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
          </select>
        </div>

        {/* Notifications Setting */}
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium">Notifications</label>
            <p className="text-xs text-muted-foreground">
              Receive notifications for new messages
            </p>
          </div>
          <input
            type="checkbox"
            checked={settings.notifications}
            onChange={(e) =>
              setSettings((prev) => ({
                ...prev,
                notifications: e.target.checked,
              }))
            }
            className="h-4 w-4"
          />
        </div>

        {/* Auto-save Setting */}
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium">
              Auto-save conversations
            </label>
            <p className="text-xs text-muted-foreground">
              Automatically save your chat history
            </p>
          </div>
          <input
            type="checkbox"
            checked={settings.autoSave}
            onChange={(e) =>
              setSettings((prev) => ({ ...prev, autoSave: e.target.checked }))
            }
            className="h-4 w-4"
          />
        </div>
      </div>
    </Modal>
  );
}
