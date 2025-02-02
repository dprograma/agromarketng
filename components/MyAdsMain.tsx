"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, Star, TrendingUp, MoreVertical, CheckCircle, Clock, XCircle } from "lucide-react";
import { adsData } from "@/constants";

export default function MyAdsManagement() {
  const [ads, setAds] = useState(adsData);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Handle search functionality
  const filteredAds = ads.filter(
    (ad) =>
      ad.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ad.price.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle pagination
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentAds = filteredAds.slice(startIndex, startIndex + itemsPerPage);

  const updateStatus = (id: number, newStatus: string) => {
    setAds(ads.map((ad) => (ad.id === id ? { ...ad, status: newStatus } : ad)));
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < Math.ceil(filteredAds.length / itemsPerPage)) setCurrentPage(currentPage + 1);
  };

  return (
    // <div className="p-8 mx-auto max-w-6xl">
    <div className="container mx-auto p-6 space-y-6">
      {/* container mx-auto p-6 space-y-6 */}
      {/* Page Title */}
      <h1 className="text-3xl font-bold text-gray-900 mb-6">My Ads Management</h1>

      {/* Search Filter */}
      <div className="mb-4 flex items-center space-x-4">
        <input
          type="text"
          placeholder="Search Ads"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border border-gray-300 px-4 py-2 rounded-md w-1/3"
        />
        <Button variant="outline" className="px-6 py-2">Search</Button>
      </div>

      <Card className="shadow-lg border border-gray-200">
        <CardHeader className="bg-gray-100 p-4 rounded-t-lg">
          <h2 className="text-lg font-semibold text-gray-700">Your Ads</h2>
        </CardHeader>

        <CardContent className="p-6">
          <Table className="w-full border border-gray-200 rounded-md">
            <TableHeader>
              <TableRow className="bg-gray-100">
                <TableHead className="px-4 py-3 text-left">Title</TableHead>
                <TableHead className="px-4 py-3 text-center">Status</TableHead>
                <TableHead className="px-4 py-3 text-center">Analytics</TableHead>
                <TableHead className="px-4 py-3 text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentAds.map((ad) => (
                <TableRow key={ad.id} className="hover:bg-gray-50 transition">
                  {/* Ad Title & Price */}
                  <TableCell className="px-4 py-4">
                    <p className="font-semibold text-gray-900">{ad.title}</p>
                    <p className="text-sm text-gray-500">{ad.price}</p>
                  </TableCell>

                  {/* Status Badge */}
                  <TableCell className="px-4 py-4 text-center">
                    <Badge
                      className={`px-3 py-1 text-sm font-medium rounded-full ${ad.status === "Active"
                          ? "bg-green-100 text-green-700"
                          : ad.status === "Pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-gray-200 text-gray-700"
                        }`}
                    >
                      {ad.status}
                    </Badge>
                  </TableCell>

                  {/* Analytics Section */}
                  <TableCell className="px-4 py-4 text-center">
                    <div className="text-sm">
                      <p className="flex items-center justify-center space-x-2">
                        <Eye className="w-4 h-4 text-blue-500" /> <span>{ad.views} Views</span>
                      </p>
                      <p className="flex items-center justify-center space-x-2">
                        <TrendingUp className="w-4 h-4 text-green-500" /> <span>{ad.clicks} Clicks</span>
                      </p>
                      <p className="flex items-center justify-center space-x-2">
                        <Star className="w-4 h-4 text-yellow-500" /> <span>{ad.shares} Shares</span>
                      </p>
                    </div>
                  </TableCell>

                  {/* Actions Dropdown */}
                  <TableCell className="px-4 py-4 text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="hover:bg-gray-200 p-2 rounded-lg">
                          <MoreVertical className="w-5 h-5 text-gray-600" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="right" className="bg-white shadow-lg rounded-lg border border-gray-200">
                        <DropdownMenuItem onClick={() => updateStatus(ad.id, "Sold")} className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-500" /> <span>Mark as Sold</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateStatus(ad.id, "Pending")} className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-yellow-500" /> <span>Set as Pending</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateStatus(ad.id, "Inactive")} className="flex items-center space-x-2">
                          <XCircle className="w-4 h-4 text-gray-500" /> <span>Mark as Inactive</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="flex items-center space-x-2">
                          <Star className="w-4 h-4 text-purple-500" /> <span>Upgrade to Featured</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>

                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>

        <CardFooter className="flex flex-wrap justify-between items-center p-4 bg-gray-50 rounded-b-lg gap-2">
          {/* Pagination */}
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={handlePrevPage} disabled={currentPage === 1}>Previous</Button>
            <p>Page {currentPage} of {Math.ceil(filteredAds.length / itemsPerPage)}</p>
            <Button variant="outline" onClick={handleNextPage} disabled={currentPage === Math.ceil(filteredAds.length / itemsPerPage)}>Next</Button>
          </div>
          {/* Add New Ad Button */}
          <Button variant="outline" className="w-full sm:w-auto">Add New Ad</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
