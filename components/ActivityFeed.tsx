import React from "react";
import { ArrowUpRight, Inbox } from "lucide-react";

interface Activity {
  id: string;
  description: string;
  time: string;
  type?: string;
  read?: boolean;
}

interface ActivityFeedProps {
  activities?: Activity[];
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
    if (!activities || activities.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Inbox className="text-gray-300 mb-2" size={32} />
          <p className="text-gray-400 text-sm">No recent activity yet.</p>
        </div>
      );
    }

    return (
      <ul className="space-y-4">
        {activities.map((activity) => (
          <li key={activity.id} className="flex items-start gap-4">
            <div className="flex-shrink-0 w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
              <ArrowUpRight className="text-gray-600" />
            </div>
            <div>
              <p className="font-medium text-gray-400 font-sans text-sm">{activity.description}</p>
              <p className="text-sm text-gray-500">{activity.time}</p>
            </div>
          </li>
        ))}
      </ul>
    );
  }
  