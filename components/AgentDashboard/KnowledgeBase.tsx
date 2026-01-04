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

      // Build query parameters
      const params = new URLSearchParams();
      if (categoryFilter && categoryFilter !== 'all') {
        params.append('category', categoryFilter);
      }
      if (searchTerm) {
        params.append('search', searchTerm);
      }

      const response = await fetch(`/api/knowledge/articles?${params.toString()}`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch articles');
      }

      const articlesData = await response.json();
      setArticles(articlesData);
    } catch (error) {
      console.error('Error fetching knowledge base articles:', error);
      toast.error('Failed to load knowledge base');
    } finally {
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

  const handleCreateArticle = async () => {
    if (!newArticle.title || !newArticle.content) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const response = await fetch('/api/knowledge/articles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: newArticle.title,
          content: newArticle.content,
          category: newArticle.category,
          tags: newArticle.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
        }),
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to create article');
      }

      const createdArticle = await response.json();
      setArticles([createdArticle, ...articles]);
      setIsDialogOpen(false);
      toast.success('Article created successfully');

      // Reset form
      setNewArticle({
        title: "",
        content: "",
        category: "general",
        tags: "",
      });
    } catch (error) {
      console.error('Error creating article:', error);
      toast.error('Failed to create article');
    }
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

  const rateArticle = async (articleId: string, isHelpful: boolean) => {
    try {
      const response = await fetch(`/api/knowledge/articles/${articleId}/rate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isHelpful }),
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to rate article');
      }

      const ratingData = await response.json();

      // Update the local state with new rating counts
      setArticles(articles.map(article => {
        if (article.id === articleId) {
          return {
            ...article,
            helpful: ratingData.helpful,
            notHelpful: ratingData.notHelpful,
          };
        }
        return article;
      }));

      toast.success('Thank you for your feedback!');
    } catch (error) {
      console.error('Error rating article:', error);
      toast.error('Failed to submit rating');
    }
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
                    <SelectItem value="general">General</SelectItem>
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
                      onClick={() => {
                        setSelectedArticle(article);
                        // Track view
                        fetch(`/api/knowledge/articles/${article.id}`, {
                          credentials: 'include'
                        }).catch(console.error);
                      }}
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
