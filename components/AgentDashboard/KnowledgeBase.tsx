"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Search,
  FileText,
  Bookmark,
  Star,
  PlusCircle,
  Loader2,
  ChevronRight,
  Copy,
  ThumbsUp,
  ThumbsDown,
  Edit,
} from "lucide-react";
import toast from "react-hot-toast";

interface KnowledgeArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  views: number;
  helpful: number;
  notHelpful: number;
}

export default function KnowledgeBase() {
  const [isLoading, setIsLoading] = useState(true);
  const [articles, setArticles] = useState<KnowledgeArticle[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<KnowledgeArticle[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<KnowledgeArticle | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newArticle, setNewArticle] = useState({
    title: "",
    content: "",
    category: "general",
    tags: "",
  });
  const [savedArticles, setSavedArticles] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("all");

  // Fetch knowledge base articles on component mount
  useEffect(() => {
    fetchArticles();
    // Load saved articles from localStorage
    const saved = localStorage.getItem("savedArticles");
    if (saved) {
      setSavedArticles(JSON.parse(saved));
    }
  }, []);

  // Filter articles when search term or category changes
  useEffect(() => {
    filterArticles();
  }, [searchTerm, categoryFilter, articles, activeTab, savedArticles]);

  const fetchArticles = async () => {
    try {
      setIsLoading(true);

      // In a real app, this would be an API call
      // For now, we'll use mock data
      setTimeout(() => {
        const mockArticles: KnowledgeArticle[] = [
          {
            id: "1",
            title: "How to handle customer refund requests",
            content: "This guide explains the process for handling customer refund requests in accordance with our company policy.\n\n## Policy Overview\n\nOur refund policy allows customers to request refunds within 30 days of purchase for any reason. After 30 days, refunds are only provided for defective products or services.\n\n## Steps to Process a Refund\n\n1. Verify the purchase date and order details\n2. Determine if the request falls within the 30-day window\n3. Check if the product was returned (if applicable)\n4. Process the refund through the payment system\n5. Send confirmation email to the customer\n\n## Special Cases\n\n- For subscription services, prorate the refund based on usage\n- For digital products, ensure the product access has been revoked\n- For high-value refunds (over $500), get manager approval\n\n## Documentation\n\nAlways document the reason for the refund in the customer's account notes and in the refund processing system.",
            category: "customer-service",
            tags: ["refunds", "customer-service", "payments"],
            createdAt: "2023-05-15T10:30:00Z",
            updatedAt: "2023-06-20T14:45:00Z",
            views: 245,
            helpful: 42,
            notHelpful: 3,
          },
          {
            id: "2",
            title: "Troubleshooting common technical issues",
            content: "This article covers the most common technical issues reported by customers and how to resolve them.\n\n## Login Problems\n\n- **Issue**: Customer cannot log in\n- **Solution**: Reset password, check email verification status, verify account hasn't been locked due to multiple failed attempts\n\n## Payment Processing Errors\n\n- **Issue**: Payment declined\n- **Solution**: Verify card details, check for sufficient funds, ensure billing address matches card information\n\n## Mobile App Crashes\n\n- **Issue**: App closes unexpectedly\n- **Solution**: Check app version, suggest reinstalling, verify device compatibility\n\n## Website Loading Issues\n\n- **Issue**: Website doesn't load or loads partially\n- **Solution**: Clear browser cache, try different browser, check internet connection\n\n## Account Synchronization Problems\n\n- **Issue**: Data not syncing between devices\n- **Solution**: Verify sync is enabled, check last sync time, ensure all devices are using the same account",
            category: "technical",
            tags: ["troubleshooting", "login", "payments", "mobile", "sync"],
            createdAt: "2023-04-10T09:15:00Z",
            updatedAt: "2023-07-05T11:20:00Z",
            views: 378,
            helpful: 65,
            notHelpful: 7,
          },
          {
            id: "3",
            title: "Product pricing and subscription plans",
            content: "This document outlines our current pricing structure and subscription plans.\n\n## Basic Plan - $9.99/month\n\n- Access to core features\n- 5GB storage\n- Email support\n- 1 user account\n\n## Professional Plan - $24.99/month\n\n- All Basic features\n- 25GB storage\n- Priority email support\n- 5 user accounts\n- Advanced analytics\n\n## Enterprise Plan - $99.99/month\n\n- All Professional features\n- 100GB storage\n- 24/7 phone and email support\n- Unlimited user accounts\n- Custom integrations\n- Dedicated account manager\n\n## Annual Discounts\n\nAll plans offer a 20% discount when billed annually.\n\n## Special Promotions\n\n- New customers: 30-day free trial of any plan\n- Referral program: One month free for each successful referral\n- Nonprofit organizations: 50% discount on all plans",
            category: "billing",
            tags: ["pricing", "subscriptions", "plans", "billing"],
            createdAt: "2023-03-22T13:45:00Z",
            updatedAt: "2023-08-01T10:10:00Z",
            views: 512,
            helpful: 89,
            notHelpful: 4,
          },
          {
            id: "4",
            title: "Shipping and delivery policy",
            content: "This document explains our shipping methods, timeframes, and policies.\n\n## Shipping Methods\n\n- **Standard Shipping**: 5-7 business days, $5.99\n- **Express Shipping**: 2-3 business days, $12.99\n- **Overnight Shipping**: Next business day, $24.99\n\n## Free Shipping\n\nOrders over $50 qualify for free standard shipping (domestic only).\n\n## International Shipping\n\nWe ship to over 100 countries. International shipping rates vary by location and are calculated at checkout. Please note that international orders may be subject to import duties and taxes.\n\n## Tracking Orders\n\nAll shipments include tracking information that will be emailed once the order ships.\n\n## Delivery Issues\n\nIf a package is lost or damaged during shipping, customers should contact support within 14 days of the expected delivery date.\n\n## Shipping Restrictions\n\nCertain products cannot be shipped to specific locations due to regulations. These restrictions will be noted during checkout.",
            category: "shipping",
            tags: ["shipping", "delivery", "international", "tracking"],
            createdAt: "2023-02-18T15:30:00Z",
            updatedAt: "2023-07-12T09:25:00Z",
            views: 289,
            helpful: 53,
            notHelpful: 6,
          },
          {
            id: "5",
            title: "How to use the product search feature",
            content: "This guide explains how to effectively use our product search feature to help customers find what they're looking for.\n\n## Basic Search\n\nCustomers can enter keywords in the search bar at the top of any page. The search engine will look for matches in product titles, descriptions, and tags.\n\n## Advanced Search Options\n\n### Filters\n\nAfter performing a basic search, customers can refine results using filters such as:\n- Price range\n- Category\n- Brand\n- Rating\n- Availability\n\n### Search Operators\n\nCustomers can use these operators to refine searches:\n- Quotation marks (\"\") for exact phrases\n- Minus sign (-) to exclude words\n- OR to search for either term\n\n## Search Shortcuts\n\n- Typing \"#deals\" shows current promotions\n- Typing \"#new\" shows recently added products\n- Typing \"#popular\" shows bestselling items\n\n## Helping Customers with Search\n\nIf a customer can't find what they're looking for:\n1. Ask for specific details about the product\n2. Suggest alternative search terms\n3. Check if the product is actually available\n4. Use category browsing instead of search if appropriate",
            category: "product",
            tags: ["search", "products", "filters", "features"],
            createdAt: "2023-06-05T11:20:00Z",
            updatedAt: "2023-08-10T16:15:00Z",
            views: 176,
            helpful: 38,
            notHelpful: 2,
          },
        ];

        setArticles(mockArticles);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching knowledge base articles:', error);
      toast.error('Failed to load knowledge base');
      setIsLoading(false);
    }
  };

  const filterArticles = () => {
    let filtered = [...articles];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(article =>
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by category
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(article => article.category === categoryFilter);
    }

    // Filter by tab
    if (activeTab === 'saved') {
      filtered = filtered.filter(article => savedArticles.includes(article.id));
    }

    setFilteredArticles(filtered);
  };

  const handleCreateArticle = () => {
    // In a real app, this would be an API call
    const newId = (articles.length + 1).toString();
    const createdArticle: KnowledgeArticle = {
      id: newId,
      title: newArticle.title,
      content: newArticle.content,
      category: newArticle.category,
      tags: newArticle.tags.split(',').map(tag => tag.trim()),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      views: 0,
      helpful: 0,
      notHelpful: 0,
    };

    setArticles([...articles, createdArticle]);
    setIsDialogOpen(false);
    toast.success('Article created successfully');

    // Reset form
    setNewArticle({
      title: "",
      content: "",
      category: "general",
      tags: "",
    });
  };

  const toggleSaveArticle = (articleId: string) => {
    let updated;
    if (savedArticles.includes(articleId)) {
      updated = savedArticles.filter(id => id !== articleId);
      toast.success('Article removed from saved');
    } else {
      updated = [...savedArticles, articleId];
      toast.success('Article saved for quick access');
    }

    setSavedArticles(updated);
    localStorage.setItem("savedArticles", JSON.stringify(updated));
  };

  const copyArticleContent = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success('Content copied to clipboard');
  };

  const rateArticle = (articleId: string, isHelpful: boolean) => {
    setArticles(articles.map(article => {
      if (article.id === articleId) {
        return {
          ...article,
          helpful: isHelpful ? article.helpful + 1 : article.helpful,
          notHelpful: !isHelpful ? article.notHelpful + 1 : article.notHelpful,
        };
      }
      return article;
    }));

    toast.success(`Thank you for your feedback!`);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
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
        <h2 className="text-xl font-bold text-gray-900">Knowledge Base</h2>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="w-4 h-4 mr-2" />
              Create Article
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px]">
            <DialogHeader>
              <DialogTitle>Create Knowledge Base Article</DialogTitle>
              <DialogDescription>
                Add a new article to the knowledge base to help agents assist customers.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Title</label>
                <Input
                  placeholder="Article title"
                  value={newArticle.title}
                  onChange={(e) => setNewArticle({ ...newArticle, title: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Select
                  value={newArticle.category}
                  onValueChange={(value) => setNewArticle({ ...newArticle, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="customer-service">Customer Service</SelectItem>
                    <SelectItem value="technical">Technical</SelectItem>
                    <SelectItem value="billing">Billing</SelectItem>
                    <SelectItem value="product">Product</SelectItem>
                    <SelectItem value="shipping">Shipping</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Tags (comma-separated)</label>
                <Input
                  placeholder="tag1, tag2, tag3"
                  value={newArticle.tags}
                  onChange={(e) => setNewArticle({ ...newArticle, tags: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Content (Markdown supported)</label>
                <Textarea
                  placeholder="Article content"
                  rows={10}
                  value={newArticle.content}
                  onChange={(e) => setNewArticle({ ...newArticle, content: e.target.value })}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleCreateArticle}>Create Article</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input
                placeholder="Search knowledge base..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="customer-service">Customer Service</SelectItem>
                <SelectItem value="technical">Technical</SelectItem>
                <SelectItem value="billing">Billing</SelectItem>
                <SelectItem value="product">Product</SelectItem>
                <SelectItem value="shipping">Shipping</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Knowledge Base Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Articles List */}
        <div className="md:col-span-1">
          <Card className="h-full">
            <CardHeader className="pb-2">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="w-full">
                  <TabsTrigger value="all" className="flex-1">
                    <BookOpen className="w-4 h-4 mr-2" />
                    All
                  </TabsTrigger>
                  <TabsTrigger value="saved" className="flex-1">
                    <Bookmark className="w-4 h-4 mr-2" />
                    Saved
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent className="h-[calc(100%-60px)] overflow-y-auto">
              {filteredArticles.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                  <p>No articles found</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredArticles.map(article => (
                    <div
                      key={article.id}
                      className={`p-3 rounded-lg cursor-pointer border ${selectedArticle?.id === article.id ? 'bg-green-50 border-green-200' : 'hover:bg-gray-50'
                        }`}
                      onClick={() => setSelectedArticle(article)}
                    >
                      <div className="flex justify-between items-start">
                        <h3 className="font-medium">{article.title}</h3>
                        <Button
                          variant="ghost"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSaveArticle(article.id);
                          }}
                        >
                          <Bookmark
                            className={`w-4 h-4 ${savedArticles.includes(article.id) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'
                              }`}
                          />
                        </Button>
                      </div>
                      <div className="flex items-center mt-2 text-xs text-gray-500">
                        <Badge variant="outline" className="mr-2">
                          {article.category}
                        </Badge>
                        <span>Updated: {formatDate(article.updatedAt)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Article Content */}
        <div className="md:col-span-2">
          <Card className="h-full">
            {selectedArticle ? (
              <>
                <CardHeader className="pb-2 border-b">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{selectedArticle.title}</CardTitle>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {selectedArticle.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        className="h-8"
                        onClick={() => copyArticleContent(selectedArticle.content)}
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy
                      </Button>
                      <Button
                        variant={savedArticles.includes(selectedArticle.id) ? "default" : "outline"}
                        className="h-8"
                        onClick={() => toggleSaveArticle(selectedArticle.id)}
                      >
                        <Bookmark className="w-4 h-4 mr-2" />
                        {savedArticles.includes(selectedArticle.id) ? 'Saved' : 'Save'}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-4 h-[calc(100%-140px)] overflow-y-auto">
                  <div className="prose max-w-none">
                    {selectedArticle.content.split('\n\n').map((paragraph, index) => (
                      <p key={index}>{paragraph}</p>
                    ))}
                  </div>

                  <div className="mt-8 pt-4 border-t">
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-500">
                        <p>Last updated: {formatDate(selectedArticle.updatedAt)}</p>
                        <p>Views: {selectedArticle.views}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">Was this helpful?</span>
                        <Button
                          variant="outline"
                          className="h-8"
                          onClick={() => rateArticle(selectedArticle.id, true)}
                        >
                          <ThumbsUp className="w-4 h-4 mr-2" />
                          Yes ({selectedArticle.helpful})
                        </Button>
                        <Button
                          variant="outline"
                          className="h-8"
                          onClick={() => rateArticle(selectedArticle.id, false)}
                        >
                          <ThumbsDown className="w-4 h-4 mr-2" />
                          No ({selectedArticle.notHelpful})
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full py-12 text-gray-500">
                <BookOpen className="w-16 h-16 text-gray-300 mb-4" />
                <h3 className="text-xl font-medium mb-2">No article selected</h3>
                <p>Select an article from the list to view its content</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
