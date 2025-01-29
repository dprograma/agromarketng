import { ArrowUpRight } from "lucide-react";
import { activities } from "@/constants";


export function ActivityFeed() {
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
  