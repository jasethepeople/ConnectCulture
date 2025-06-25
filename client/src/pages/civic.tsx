import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Heart,
  Users,
  MessageSquare,
  Phone,
  Send,
  MapPin,
  Building,
  GraduationCap,
  DollarSign,
  Shield,
  Handshake,
  Star,
  ThumbsUp,
  MessageCircle,
  Flag,
  Search,
  ExternalLink,
  FileText,
  Clock
} from "lucide-react";

interface CivicDiscussion {
  id: string;
  title: string;
  content: string;
  category: string;
  author: string;
  authorId: string;
  createdAt: string;
  replies: number;
  likes: number;
  tags: string[];
}

interface CongressionalContact {
  name: string;
  title: string;
  party: string;
  office: string;
  phone: string;
  email: string;
  website: string;
}

// Sample civic discussions with emphasis on unity and respect
const SAMPLE_DISCUSSIONS: CivicDiscussion[] = [
  {
    id: "1",
    title: "Homeschooling vs Public School: Finding What Works for Each Family",
    content: "Every family's educational journey is unique. Let's share experiences and support each other regardless of the path we choose for our children.",
    category: "Education",
    author: "CommunityMom",
    authorId: "user1",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    replies: 23,
    likes: 45,
    tags: ["education", "parenting", "community"]
  },
  {
    id: "2", 
    title: "Local Resource Sharing: How We Can Help Our Neighbors",
    content: "Community strength comes from supporting each other. What local resources have helped your family, and how can we share knowledge?",
    category: "Community",
    author: "NeighborlyHelper",
    authorId: "user2",
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    replies: 18,
    likes: 67,
    tags: ["community", "resources", "support"]
  },
  {
    id: "3",
    title: "Healthcare Choices: Respecting Different Approaches",
    content: "We all want what's best for our families' health. Let's discuss different perspectives with kindness and respect for personal choice.",
    category: "Health",
    author: "WellnessAdvocate",
    authorId: "user3", 
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    replies: 31,
    likes: 29,
    tags: ["health", "choice", "respect"]
  }
];

const CONGRESSIONAL_INFO: CongressionalContact[] = [
  {
    name: "Representative Sample",
    title: "U.S. Representative",
    party: "Example Party",
    office: "House of Representatives",
    phone: "(202) 225-0000",
    email: "contact@representative.house.gov",
    website: "https://representative.house.gov"
  },
  {
    name: "Senator Example",
    title: "U.S. Senator", 
    party: "Example Party",
    office: "U.S. Senate",
    phone: "(202) 224-0000",
    email: "contact@senator.senate.gov",
    website: "https://senator.senate.gov"
  }
];

export default function Civic() {
  const [newDiscussion, setNewDiscussion] = useState({
    title: "",
    content: "",
    category: "General"
  });
  const [congressMessage, setCongressMessage] = useState({
    subject: "",
    message: "",
    zipCode: ""
  });
  const [discussions, setDiscussions] = useState<CivicDiscussion[]>(SAMPLE_DISCUSSIONS);
  const [selectedCategory, setSelectedCategory] = useState("All");

  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const categories = ["All", "Education", "Health", "Community", "Economy", "Environment", "Government"];

  const filteredDiscussions = selectedCategory === "All" 
    ? discussions 
    : discussions.filter(d => d.category === selectedCategory);

  const createDiscussion = () => {
    if (!newDiscussion.title || !newDiscussion.content) {
      toast({ title: "Please fill in all fields", variant: "destructive" });
      return;
    }

    const discussion: CivicDiscussion = {
      id: Date.now().toString(),
      title: newDiscussion.title,
      content: newDiscussion.content,
      category: newDiscussion.category,
      author: user?.firstName + " " + user?.lastName || "Anonymous",
      authorId: user?.id || "anonymous",
      createdAt: new Date().toISOString(),
      replies: 0,
      likes: 0,
      tags: []
    };

    setDiscussions(prev => [discussion, ...prev]);
    setNewDiscussion({ title: "", content: "", category: "General" });
    toast({ title: "Discussion created", description: "Thank you for contributing to our community" });
  };

  const sendToCongressMessage = () => {
    if (!congressMessage.subject || !congressMessage.message || !congressMessage.zipCode) {
      toast({ title: "Please fill in all fields", variant: "destructive" });
      return;
    }

    // In a real implementation, this would lookup representatives by zip code and send messages
    toast({ 
      title: "Message prepared", 
      description: "Your message has been formatted and is ready to send to your representatives" 
    });
    
    // Show the formatted message
    const formattedMessage = `Subject: ${congressMessage.subject}\n\nDear Representative,\n\n${congressMessage.message}\n\nThank you for your service to our community.\n\nSincerely,\nA Constituent from ${congressMessage.zipCode}`;
    
    navigator.clipboard.writeText(formattedMessage);
    toast({ title: "Message copied to clipboard", description: "Paste into your representative's contact form" });
  };

  const get211Resources = () => {
    // Simulate 211 resource lookup
    const resources = [
      "Food assistance programs in your area",
      "Housing and utility assistance",
      "Healthcare resources and clinics", 
      "Employment and job training programs",
      "Mental health and counseling services",
      "Senior citizen services",
      "Child care and family support",
      "Transportation assistance"
    ];

    toast({ 
      title: "211 Resources Available", 
      description: "Dial 2-1-1 for local assistance programs" 
    });
  };

  const findAAMeetings = () => {
    // In real implementation, this would use AA's meeting finder API
    toast({ 
      title: "AA Meeting Finder", 
      description: "Visit aa.org or call your local AA hotline for meeting schedules" 
    });
  };

  const findFaithCommunity = (faithType: string) => {
    const faithResources = {
      "Christian": "Visit churchfinder.com or contact your local denominational office",
      "Islamic": "Visit islamicfinder.org for mosque locations and prayer times",
      "Jewish": "Contact your local Jewish federation or visit urj.org",
      "Buddhist": "Search for local meditation centers and Buddhist temples",
      "Hindu": "Find Hindu temples and cultural centers in your area",
      "LDS": "Use the LDS meetinghouse locator at churchofjesuschrist.org"
    };
    
    toast({ 
      title: `${faithType} Communities`, 
      description: faithResources[faithType as keyof typeof faithResources] || "Contact local faith directories"
    });
  };

  return (
    <div className="min-h-screen bg-[hsl(240,50%,7%)] text-white">
      <Navigation />
      
      <div className="pt-20 container mx-auto px-4 py-8">
        {/* Header with Core Values */}
        <div className="glass-effect rounded-2xl p-6 mb-8 relative overflow-hidden border-blue-700 bg-blue-900/20">
          <div className="absolute inset-0 opacity-10">
            <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-500"></div>
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <Heart className="h-8 w-8 text-red-400" />
              <h1 className="text-3xl font-bold font-mono">
                <span className="text-blue-400">Civic</span> Engagement & Community
              </h1>
            </div>
            <div className="grid md:grid-cols-4 gap-4 mb-4">
              <div className="flex items-center gap-2">
                <Handshake className="h-5 w-5 text-green-400" />
                <span className="text-sm">Unity & Respect</span>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-400" />
                <span className="text-sm">Kindness First</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-400" />
                <span className="text-sm">Integrity & Honesty</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-400" />
                <span className="text-sm">Working Together</span>
              </div>
            </div>
            <p className="text-gray-300 leading-relaxed">
              A space for thoughtful discussion on the issues that matter to our communities. 
              It's okay to disagree, it's okay to be wrong or right - what matters is that we 
              treat each other with kindness, respect, and work together with integrity and honesty.
            </p>
          </div>
        </div>

        <Tabs defaultValue="discussions" className="space-y-6">
          <TabsList className="grid grid-cols-2 lg:grid-cols-4 w-full bg-[hsl(240,29%,11%)]">
            <TabsTrigger value="discussions" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Community Discussions</span>
            </TabsTrigger>
            <TabsTrigger value="resources" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              <span className="hidden sm:inline">Local Resources</span>
            </TabsTrigger>
            <TabsTrigger value="representatives" className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              <span className="hidden sm:inline">Contact Congress</span>
            </TabsTrigger>
            <TabsTrigger value="guide" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Civic Guide</span>
            </TabsTrigger>
          </TabsList>

          {/* Community Discussions Tab */}
          <TabsContent value="discussions">
            <div className="grid lg:grid-cols-4 gap-6">
              <div className="lg:col-span-3 space-y-6">
                {/* Create Discussion */}
                {isAuthenticated && (
                  <Card className="glass-effect bg-transparent border-white/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-blue-400" />
                        Start a Community Discussion
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Input
                            placeholder="Discussion title"
                            value={newDiscussion.title}
                            onChange={(e) => setNewDiscussion(prev => ({...prev, title: e.target.value}))}
                            className="bg-[hsl(240,29%,11%)] border-gray-700"
                          />
                          <select
                            value={newDiscussion.category}
                            onChange={(e) => setNewDiscussion(prev => ({...prev, category: e.target.value}))}
                            className="p-2 bg-[hsl(240,29%,11%)] border border-gray-700 rounded-lg text-white"
                          >
                            {categories.filter(c => c !== "All").map(category => (
                              <option key={category} value={category}>{category}</option>
                            ))}
                          </select>
                        </div>
                        <Textarea
                          placeholder="Share your thoughts with kindness and respect..."
                          value={newDiscussion.content}
                          onChange={(e) => setNewDiscussion(prev => ({...prev, content: e.target.value}))}
                          className="min-h-[100px] bg-[hsl(240,29%,11%)] border-gray-700"
                        />
                        <Button 
                          onClick={createDiscussion}
                          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                        >
                          Start Discussion
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Discussion List */}
                <div className="space-y-4">
                  {filteredDiscussions.map(discussion => (
                    <Card key={discussion.id} className="glass-effect bg-transparent border-white/20 hover:border-blue-400/50 transition-colors">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-lg font-semibold">
                              {discussion.author.charAt(0)}
                            </span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-lg">{discussion.title}</h3>
                              <Badge variant="outline" className="text-xs">
                                {discussion.category}
                              </Badge>
                            </div>
                            <p className="text-gray-300 mb-3">{discussion.content}</p>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4 text-sm text-gray-400">
                                <span>by {discussion.author}</span>
                                <span>{new Date(discussion.createdAt).toLocaleDateString()}</span>
                              </div>
                              <div className="flex items-center gap-4">
                                <Button size="sm" variant="ghost" className="text-gray-400 hover:text-green-400">
                                  <ThumbsUp className="h-4 w-4 mr-1" />
                                  {discussion.likes}
                                </Button>
                                <Button size="sm" variant="ghost" className="text-gray-400 hover:text-blue-400">
                                  <MessageCircle className="h-4 w-4 mr-1" />
                                  {discussion.replies}
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Category Filter */}
                <Card className="glass-effect bg-transparent border-white/20">
                  <CardHeader>
                    <CardTitle className="text-lg">Discussion Topics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {categories.map(category => (
                        <Button
                          key={category}
                          variant={selectedCategory === category ? "default" : "ghost"}
                          className="w-full justify-start"
                          onClick={() => setSelectedCategory(category)}
                        >
                          {category}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Community Guidelines */}
                <Card className="glass-effect bg-green-900/20 border-green-700">
                  <CardHeader>
                    <CardTitle className="text-lg text-green-400">Community Values</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="flex items-start gap-2">
                      <Heart className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
                      <p className="text-gray-300">Lead with kindness and compassion</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Handshake className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                      <p className="text-gray-300">Respect different viewpoints and experiences</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Star className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                      <p className="text-gray-300">Embrace integrity and honesty in all discussions</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Users className="h-4 w-4 text-purple-400 mt-0.5 flex-shrink-0" />
                      <p className="text-gray-300">Work together toward understanding</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Local Resources Tab */}
          <TabsContent value="resources">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* 211 Resources */}
              <Card className="glass-effect bg-transparent border-white/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="h-5 w-5 text-blue-400" />
                    211 - Community Resources
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center p-4 bg-blue-900/20 border border-blue-700 rounded-lg">
                      <Phone className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                      <h3 className="text-xl font-bold text-blue-400 mb-2">Dial 2-1-1</h3>
                      <p className="text-gray-300 text-sm mb-3">Free, confidential helpline 24/7</p>
                      <Button onClick={get211Resources} size="sm" className="bg-blue-600 hover:bg-blue-700">
                        Find Resources
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-semibold text-white text-sm">Basic Needs:</h4>
                      <div className="grid gap-1">
                        {[
                          "Food assistance & food banks",
                          "Housing & rental assistance", 
                          "Healthcare & medical clinics",
                          "Employment & job training",
                          "Utility assistance programs"
                        ].map((resource, index) => (
                          <div key={index} className="flex items-center gap-2 p-2 bg-[hsl(240,29%,11%)] rounded text-xs">
                            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                            <span className="text-gray-300">{resource}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Support Groups */}
              <Card className="glass-effect bg-transparent border-white/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-green-400" />
                    Support Groups
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-3 bg-green-900/20 border border-green-700 rounded-lg">
                      <h4 className="font-semibold text-green-400 mb-2 text-sm">Alcoholics Anonymous</h4>
                      <p className="text-xs text-gray-300 mb-2">Local AA meetings and support</p>
                      <Button size="sm" variant="outline" className="w-full text-xs">
                        <Search className="h-3 w-3 mr-1" />
                        Find AA Meetings
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-semibold text-white text-sm">Other Support Groups:</h4>
                      <div className="grid gap-1">
                        {[
                          "Narcotics Anonymous (NA)",
                          "Al-Anon (families of alcoholics)",
                          "Gamblers Anonymous",
                          "Overeaters Anonymous",
                          "SMART Recovery",
                          "Celebrate Recovery",
                          "Grief support groups",
                          "PTSD support groups"
                        ].map((group, index) => (
                          <div key={index} className="flex items-center gap-2 p-2 bg-[hsl(240,29%,11%)] rounded text-xs">
                            <Heart className="h-3 w-3 text-red-400" />
                            <span className="text-gray-300">{group}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Religious Organizations */}
              <Card className="glass-effect bg-transparent border-white/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-400" />
                    Faith Communities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-3">
                      {[
                        { name: "Christian Churches", icon: "✝️", contact: "Local church directories" },
                        { name: "Islamic Centers", icon: "☪️", contact: "ISNA mosque finder" },
                        { name: "Jewish Synagogues", icon: "✡️", contact: "URJ congregation finder" },
                        { name: "Buddhist Temples", icon: "☸️", contact: "Buddhist temple directory" },
                        { name: "Hindu Temples", icon: "🕉️", contact: "Local Hindu centers" },
                        { name: "Latter-day Saints", icon: "🏛️", contact: "LDS meetinghouse locator" }
                      ].map((faith, index) => (
                        <div key={index} className="p-3 bg-[hsl(240,29%,11%)] rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm">{faith.icon}</span>
                            <h5 className="font-medium text-white text-sm">{faith.name}</h5>
                          </div>
                          <p className="text-xs text-gray-400">{faith.contact}</p>
                          <Button size="sm" variant="ghost" className="mt-2 text-xs">
                            <MapPin className="h-3 w-3 mr-1" />
                            Find Nearby
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Additional Resource Categories */}
            <div className="grid lg:grid-cols-2 gap-6 mt-6">
              <Card className="glass-effect bg-transparent border-white/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-purple-400" />
                    Crisis Support
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3">
                    <div className="p-3 bg-red-900/20 border border-red-700 rounded-lg">
                      <h5 className="font-semibold text-red-400 mb-1">National Suicide Prevention</h5>
                      <p className="text-lg font-bold text-red-300">988</p>
                      <p className="text-xs text-gray-400">24/7 crisis chat and phone support</p>
                    </div>
                    
                    <div className="p-3 bg-blue-900/20 border border-blue-700 rounded-lg">
                      <h5 className="font-semibold text-blue-400 mb-1">Crisis Text Line</h5>
                      <p className="text-sm font-bold text-blue-300">Text HOME to 741741</p>
                      <p className="text-xs text-gray-400">Free 24/7 crisis support via text</p>
                    </div>
                    
                    <div className="p-3 bg-purple-900/20 border border-purple-700 rounded-lg">
                      <h5 className="font-semibold text-purple-400 mb-1">SAMHSA Helpline</h5>
                      <p className="text-sm font-bold text-purple-300">1-800-662-4357</p>
                      <p className="text-xs text-gray-400">Substance abuse & mental health</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-effect bg-transparent border-white/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-pink-400" />
                    Specialized Support
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {[
                      { name: "Veterans Crisis Line", contact: "1-800-273-8255", desc: "24/7 support for veterans" },
                      { name: "Domestic Violence Hotline", contact: "1-800-799-7233", desc: "National domestic violence support" },
                      { name: "RAINN Sexual Assault", contact: "1-800-656-4673", desc: "Sexual assault hotline" },
                      { name: "Trans Lifeline", contact: "877-565-8860", desc: "Support for transgender individuals" },
                      { name: "PFLAG", contact: "pflag.org", desc: "Support for LGBTQ+ families" },
                      { name: "NAMI", contact: "nami.org", desc: "Mental health advocacy & support" }
                    ].map((resource, index) => (
                      <div key={index} className="p-2 bg-[hsl(240,29%,11%)] rounded-lg">
                        <div className="flex justify-between items-start mb-1">
                          <h6 className="font-medium text-white text-sm">{resource.name}</h6>
                          <span className="text-xs text-pink-400 font-mono">{resource.contact}</span>
                        </div>
                        <p className="text-xs text-gray-400">{resource.desc}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Contact Representatives Tab */}
          <TabsContent value="representatives">
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Card className="glass-effect bg-transparent border-white/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Send className="h-5 w-5 text-blue-400" />
                      Contact Your Representatives
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Input
                        placeholder="Your ZIP code"
                        value={congressMessage.zipCode}
                        onChange={(e) => setCongressMessage(prev => ({...prev, zipCode: e.target.value}))}
                        className="bg-[hsl(240,29%,11%)] border-gray-700"
                      />
                      <Input
                        placeholder="Message subject"
                        value={congressMessage.subject}
                        onChange={(e) => setCongressMessage(prev => ({...prev, subject: e.target.value}))}
                        className="bg-[hsl(240,29%,11%)] border-gray-700"
                      />
                      <Textarea
                        placeholder="Your message to representatives..."
                        value={congressMessage.message}
                        onChange={(e) => setCongressMessage(prev => ({...prev, message: e.target.value}))}
                        className="min-h-[150px] bg-[hsl(240,29%,11%)] border-gray-700"
                      />
                      <Button 
                        onClick={sendToCongressMessage}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Prepare Message for Congress
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Sample Representatives */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">Your Representatives</h3>
                  {CONGRESSIONAL_INFO.map((rep, index) => (
                    <Card key={index} className="glass-effect bg-transparent border-white/20">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-blue-500 rounded-full flex items-center justify-center">
                            <Flag className="h-8 w-8 text-white" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-lg">{rep.name}</h4>
                            <p className="text-blue-400">{rep.title}</p>
                            <p className="text-gray-400 text-sm mb-3">{rep.office}</p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                              <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-green-400" />
                                <span className="text-gray-300">{rep.phone}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <ExternalLink className="h-4 w-4 text-blue-400" />
                                <a href={rep.website} target="_blank" rel="noopener noreferrer" 
                                   className="text-blue-400 hover:underline">
                                  Official Website
                                </a>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <Card className="glass-effect bg-green-900/20 border-green-700">
                  <CardHeader>
                    <CardTitle className="text-lg text-green-400">Effective Communication</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <p className="text-gray-300">• Be respectful and professional</p>
                    <p className="text-gray-300">• State your position clearly</p>
                    <p className="text-gray-300">• Include your ZIP code</p>
                    <p className="text-gray-300">• Focus on specific issues</p>
                    <p className="text-gray-300">• Thank them for their service</p>
                  </CardContent>
                </Card>

                <Card className="glass-effect bg-transparent border-white/20">
                  <CardHeader>
                    <CardTitle className="text-lg">Find Your Representatives</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" className="w-full mb-3">
                      <Search className="h-4 w-4 mr-2" />
                      Look Up by ZIP Code
                    </Button>
                    <p className="text-xs text-gray-400">
                      Enter your ZIP code to automatically find your specific representatives
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Civic Guide Tab */}
          <TabsContent value="guide">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="glass-effect bg-transparent border-white/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-purple-400" />
                    Building Stronger Communities
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="p-4 bg-[hsl(240,29%,11%)] rounded-lg">
                      <h4 className="font-semibold text-purple-400 mb-2">Start Local</h4>
                      <p className="text-gray-300 text-sm">
                        Change begins in our neighborhoods. Get involved in local school boards, 
                        city councils, and community organizations.
                      </p>
                    </div>
                    
                    <div className="p-4 bg-[hsl(240,29%,11%)] rounded-lg">
                      <h4 className="font-semibold text-blue-400 mb-2">Listen & Learn</h4>
                      <p className="text-gray-300 text-sm">
                        Approach conversations with curiosity. Everyone has experiences that 
                        can teach us something valuable.
                      </p>
                    </div>
                    
                    <div className="p-4 bg-[hsl(240,29%,11%)] rounded-lg">
                      <h4 className="font-semibold text-green-400 mb-2">Find Common Ground</h4>
                      <p className="text-gray-300 text-sm">
                        Focus on shared values like family, safety, opportunity, and community 
                        well-being that unite us across differences.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-effect bg-transparent border-white/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-red-400" />
                    Our Shared Values
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center p-6 bg-gradient-to-r from-red-900/20 to-blue-900/20 border border-purple-700 rounded-lg">
                    <Heart className="h-12 w-12 text-red-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold mb-4">Unity Through Kindness</h3>
                    <div className="space-y-2 text-sm">
                      <p className="text-gray-300">✓ It's okay to disagree</p>
                      <p className="text-gray-300">✓ It's okay to be wrong or right</p>
                      <p className="text-gray-300">✓ We treat each other with kindness</p>
                      <p className="text-gray-300">✓ We embrace integrity and honesty</p>
                      <p className="text-gray-300">✓ We work together despite differences</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}