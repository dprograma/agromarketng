import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableCell } from "@/components/ui/table";
import { ActivityFeed } from "@/components/ActivityFeed";
import { Plus, Rocket, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Spinner from "@/components/Spinner";


export default function DashboardMain() {
  // State for mobile view
  const [isMobile, setIsMobile] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const router = useRouter();

  // Handle window resize to update mobile state
  useEffect(() => {
      const handleResize = () => {
          setIsMobile(window.innerWidth < 640);
      };

      handleResize(); // Initial check
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
  }, []);


  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Page Title */}
      <header className="flex justify-between items-center">
       {!isMobile ? (<h1 className="text-3xl text-gray-500 font-bold">Dashboard Overview</h1>) : (<h1 className="text-xl text-gray-500 font-bold">Dashboard</h1>)}
        <Button onClick={()=> {setIsPosting(true); router.push("/dashboard/new-ad"); setIsPosting(false);}} className="flex bg-green-600 text-white hover:bg-green-700 text-sm">
          {!isMobile ? (<><Plus className="mr-2" /> {isPosting ? <Spinner /> : 'Post New Ad'}</>) : (<><Plus className="mr-2" /> <span className="text-sm">{isPosting ? <Spinner /> : 'Post New Ad'}</span></>)}
        </Button>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Ad Performance Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Ad Performance Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex justify-between">
                <span>Active Ads:</span>
                <span className="font-medium">12</span>
              </li>
              <li className="flex justify-between">
                <span>Total Views:</span>
                <span className="font-medium">2,345</span>
              </li>
              <li className="flex justify-between">
                <span>Total Clicks:</span>
                <span className="font-medium">523</span>
              </li>
              <li className="flex justify-between">
                <span>Boosted Ads:</span>
                <span className="font-medium">4</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Promotion Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Promotion Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex justify-between">
                <span>Ongoing Promotions:</span>
                <span className="font-medium">2</span>
              </li>
              <li className="flex justify-between">
                <span>Earnings from Promotions:</span>
                <span className="font-medium">₦125.00</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button onClick={()=>router.push("/dashboard/promotions")} variant="outline" className="w-full flex items-center justify-center">
                <Rocket className="mr-2" /> Boost Ads
              </Button>
              <Button variant="outline" className="w-full flex items-center justify-center">
                <Zap className="mr-2" /> View Promotions
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Feed */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-pretty text-gray-500">Recent Activity</h2>
        <ActivityFeed />
      </div>

      {/* Custom Table Example */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-500">Ad Performance Table</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableCell>Ad Title</TableCell>
              <TableCell>Views</TableCell>
              <TableCell>Clicks</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>Ad 1</TableCell>
              <TableCell>1,245</TableCell>
              <TableCell>321</TableCell>
              <TableCell>Boosted</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Ad 2</TableCell>
              <TableCell>894</TableCell>
              <TableCell>223</TableCell>
              <TableCell>Active</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Ad 3</TableCell>
              <TableCell>473</TableCell>
              <TableCell>89</TableCell>
              <TableCell>Inactive</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
