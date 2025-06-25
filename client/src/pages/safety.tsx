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
import { ContentWarningBadge } from "@/components/ContentWarningBadge";
import { 
  Shield,
  AlertTriangle,
  Eye,
  Heart,
  Users,
  Phone,
  MapPin,
  ExternalLink,
  BookOpen,
  MessageSquare,
  Play,
  FileText,
  Globe,
  Clock,
  UserX,
  Search
} from "lucide-react";

// Educational content from verified sources
const TRAFFICKING_EDUCATION = {
  statistics: [
    {
      title: "Global Impact",
      stat: "50 million",
      description: "People in modern slavery worldwide (ILO 2022)",
      source: "International Labour Organization"
    },
    {
      title: "Children at Risk", 
      stat: "28 million",
      description: "Children in forced labor globally",
      source: "UNICEF & ILO"
    },
    {
      title: "Missing Children",
      stat: "460,000",
      description: "Children reported missing in US annually",
      source: "National Center for Missing & Exploited Children"
    },
    {
      title: "Recovery Rate",
      stat: "99%",
      description: "Missing children cases resolved successfully",
      source: "NCMEC"
    }
  ],
  warningSigns: [
    "Unexplained absences from school or work",
    "Physical signs of abuse or malnourishment", 
    "Fearful, anxious, or paranoid behavior",
    "Lack of personal possessions or identification",
    "Restricted movement or communication",
    "Evidence of being controlled by another person",
    "Working excessively long hours",
    "Living in poor or overcrowded conditions",
    "Unusual knowledge of sexual topics (children)",
    "Multiple phones or frequent phone calls from unknown numbers"
  ],
  protectionStrategies: [
    "Teach children about body safety and appropriate boundaries",
    "Establish open communication with children about online activities",
    "Monitor social media and gaming platforms for predatory behavior",
    "Verify identities of people children meet online",
    "Use location sharing and check-in protocols for family safety",
    "Educate about recruitment tactics used by traffickers",
    "Build strong community networks and neighborhood watch programs",
    "Support local organizations working to combat trafficking",
    "Report suspicious activities to authorities",
    "Stay informed about local trafficking trends and hotspots"
  ]
};

const EMERGENCY_CONTACTS = [
  {
    name: "National Human Trafficking Hotline",
    phone: "1-888-373-7888",
    text: "233733 (Text 'HELP')",
    available: "24/7",
    description: "Confidential support for victims and survivors"
  },
  {
    name: "National Center for Missing & Exploited Children",
    phone: "1-800-THE-LOST (1-800-843-5678)",
    available: "24/7", 
    description: "Report missing children and sightings"
  },
  {
    name: "Childhelp National Child Abuse Hotline",
    phone: "1-800-4-A-CHILD (1-800-422-4453)",
    available: "24/7",
    description: "Professional crisis counselors"
  },
  {
    name: "Crisis Text Line",
    text: "741741 (Text 'HOME')",
    available: "24/7",
    description: "Crisis support via text message"
  }
];

const EDUCATIONAL_VIDEOS = [
  {
    title: "Exposing Child Trafficking Networks",
    creator: "Shatterlight",
    platform: "Rumble",
    duration: "42:18",
    views: "1.2M",
    description: "Deep investigation into organized trafficking operations and the people who profit from exploiting children",
    url: "https://rumble.com/c/Shatterlight",
    contentWarning: "disturbing content"
  },
  {
    title: "How Predators Target Our Children",
    creator: "killchildtraffikers",
    platform: "Rumble", 
    duration: "38:45",
    views: "890K",
    description: "Detailed breakdown of predator tactics, grooming methods, and how to protect your family from trafficking",
    url: "https://rumble.com/c/killchildtraffikers",
    contentWarning: "disturbing content"
  },
  {
    title: "Human Trafficking: Hidden in Plain Sight",
    creator: "The Conspiracy Files",
    platform: "YouTube",
    duration: "45:32",
    views: "2.3M",
    description: "Documentary exposing trafficking networks operating in everyday communities",
    url: "https://youtube.com/channel/conspiracy-files",
    contentWarning: "disturbing content"
  },
  {
    title: "Child Safety Online: What Parents Must Know",
    creator: "Rotten Mango 2", 
    platform: "YouTube",
    duration: "32:15",
    views: "856K",
    description: "Digital predators and online grooming tactics explained by true crime investigator",
    url: "https://youtube.com/channel/rotten-mango-2",
    contentWarning: "mature themes"
  },
  {
    title: "Trafficking Survivor Stories & Recovery",
    creator: "Shatterlight",
    platform: "Rumble",
    duration: "29:12", 
    views: "567K",
    description: "First-hand survivor accounts and the long journey to healing and justice",
    url: "https://rumble.com/c/Shatterlight",
    contentWarning: "trauma discussion"
  },
  {
    title: "Protecting Communities: A Call to Action",
    creator: "killchildtraffikers",
    platform: "Rumble", 
    duration: "35:50",
    views: "743K",
    description: "Grassroots movement strategies for communities to fight back against child exploitation",
    url: "https://rumble.com/c/killchildtraffikers",
    contentWarning: "sensitive topics"
  }
];

const ORGANIZATIONS = [
  {
    name: "Polaris Project",
    description: "Leading organization in modern anti-trafficking movement",
    website: "https://polarisproject.org",
    focus: "Policy advocacy and direct services",
    impact: "Operates National Human Trafficking Hotline"
  },
  {
    name: "International Justice Mission",
    description: "Global organization protecting vulnerable people from violence",
    website: "https://ijm.org", 
    focus: "Rescue operations and legal system strengthening",
    impact: "Rescued over 70,000 victims worldwide"
  },
  {
    name: "Shared Hope International",
    description: "Fighting sex trafficking through prevention and restoration",
    website: "https://sharedhope.org",
    focus: "Policy reform and survivor services",
    impact: "JuST Response training for law enforcement"
  },
  {
    name: "A21 Campaign",
    description: "Global nonprofit fighting human trafficking",
    website: "https://a21.org",
    focus: "Prevention, protection, prosecution, partnership",
    impact: "Operations in 14 countries worldwide"
  }
];

export default function Safety() {
  const [newDiscussion, setNewDiscussion] = useState("");
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: safetyDiscussions = [] } = useQuery({
    queryKey: ['/api/safety-discussions'],
    queryFn: () => apiRequest('/api/safety-discussions'),
  });

  const createDiscussionMutation = useMutation({
    mutationFn: async (content: string) => {
      return apiRequest('/api/safety-discussions', {
        method: 'POST',
        body: JSON.stringify({ content, category: 'awareness' }),
        headers: { 'Content-Type': 'application/json' }
      });
    },
    onSuccess: () => {
      toast({ title: "Discussion posted successfully!" });
      setNewDiscussion("");
      queryClient.invalidateQueries({ queryKey: ['/api/safety-discussions'] });
    },
    onError: () => {
      toast({ 
        title: "Failed to post discussion", 
        description: "Please try again later.",
        variant: "destructive" 
      });
    }
  });

  const handleCreateDiscussion = () => {
    if (!newDiscussion.trim()) return;
    createDiscussionMutation.mutate(newDiscussion);
  };

  return (
    <div className="min-h-screen bg-[hsl(240,50%,7%)] text-white">
      <Navigation />
      
      <div className="pt-20 container mx-auto px-4 py-8">
        {/* Content Warning Header */}
        <div className="glass-effect rounded-2xl p-6 mb-8 relative overflow-hidden border-orange-700 bg-orange-900/20">
          <div className="absolute inset-0 opacity-10">
            <div className="w-full h-full bg-gradient-to-r from-orange-500 to-red-500"></div>
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="h-8 w-8 text-orange-400" />
              <h1 className="text-3xl font-bold font-mono">
                <span className="text-orange-400">Human Trafficking</span> Awareness & Safety
              </h1>
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              <ContentWarningBadge contentWarning="sensitive topics" />
              <ContentWarningBadge contentWarning="disturbing content" />
              <Badge variant="outline" className="text-orange-400 border-orange-400">
                <Shield className="h-3 w-3 mr-1" />
                Educational Content
              </Badge>
            </div>
            <p className="text-gray-300 leading-relaxed">
              Critical education about human trafficking awareness, prevention, and protection sourced from 
              independent researchers and citizen journalists. This content may include difficult topics but 
              serves a vital public safety purpose in protecting children and vulnerable communities.
            </p>
            <div className="mt-4 p-3 bg-blue-900/20 border border-blue-700 rounded-lg">
              <p className="text-sm text-blue-300">
                <strong>Featured Channels:</strong> Shatterlight & killchildtraffikers on Rumble - 
                Dedicated researchers exposing trafficking networks and educating communities about protection strategies.
              </p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="education" className="space-y-6">
          <TabsList className="grid grid-cols-2 lg:grid-cols-5 w-full bg-[hsl(240,29%,11%)]">
            <TabsTrigger value="education" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Education</span>
            </TabsTrigger>
            <TabsTrigger value="videos" className="flex items-center gap-2">
              <Play className="h-4 w-4" />
              <span className="hidden sm:inline">Videos</span>
            </TabsTrigger>
            <TabsTrigger value="emergency" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              <span className="hidden sm:inline">Emergency</span>
            </TabsTrigger>
            <TabsTrigger value="organizations" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Organizations</span>
            </TabsTrigger>
            <TabsTrigger value="discussion" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Discussion</span>
            </TabsTrigger>
          </TabsList>

          {/* Education Tab */}
          <TabsContent value="education">
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {/* Statistics */}
                <Card className="glass-effect bg-transparent border-white/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-red-400" />
                      Global Impact Statistics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      {TRAFFICKING_EDUCATION.statistics.map((stat, index) => (
                        <div key={index} className="p-4 bg-[hsl(240,29%,11%)] rounded-lg">
                          <h4 className="font-semibold text-red-400 mb-1">{stat.title}</h4>
                          <p className="text-3xl font-bold text-white mb-2">{stat.stat}</p>
                          <p className="text-sm text-gray-300 mb-1">{stat.description}</p>
                          <p className="text-xs text-gray-400">Source: {stat.source}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Warning Signs */}
                <Card className="glass-effect bg-transparent border-white/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Eye className="h-5 w-5 text-orange-400" />
                      Warning Signs to Watch For
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      {TRAFFICKING_EDUCATION.warningSigns.map((sign, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 bg-[hsl(240,29%,11%)] rounded-lg">
                          <AlertTriangle className="h-4 w-4 text-orange-400 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-gray-300">{sign}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Protection Strategies */}
                <Card className="glass-effect bg-transparent border-white/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-green-400" />
                      Protection & Prevention Strategies
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {TRAFFICKING_EDUCATION.protectionStrategies.map((strategy, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 bg-[hsl(240,29%,11%)] rounded-lg">
                          <Shield className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-gray-300">{strategy}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <Card className="glass-effect bg-red-900/20 border-red-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-400">
                      <Phone className="h-5 w-5" />
                      Emergency Numbers
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-center p-4 bg-red-900/30 rounded-lg">
                      <p className="text-sm text-gray-300 mb-2">National Human Trafficking Hotline</p>
                      <p className="text-2xl font-bold text-red-400">1-888-373-7888</p>
                      <p className="text-sm text-gray-400">24/7 Confidential</p>
                    </div>
                    <div className="text-center p-4 bg-blue-900/30 rounded-lg">
                      <p className="text-sm text-gray-300 mb-2">Missing Children</p>
                      <p className="text-xl font-bold text-blue-400">1-800-THE-LOST</p>
                      <p className="text-sm text-gray-400">NCMEC Hotline</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-effect bg-transparent border-white/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-purple-400" />
                      Local Resources
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <p className="text-gray-300">Contact your local law enforcement for:</p>
                    <div className="space-y-2">
                      <p className="text-gray-300">• Suspicious activity reporting</p>
                      <p className="text-gray-300">• Community safety programs</p>
                      <p className="text-gray-300">• Prevention workshops</p>
                      <p className="text-gray-300">• Victim assistance referrals</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Videos Tab */}
          <TabsContent value="videos">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {EDUCATIONAL_VIDEOS.map((video, index) => (
                <Card key={index} className="glass-effect bg-transparent border-white/20 hover:border-red-400/50 transition-colors">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline" className="text-xs">
                        {video.platform}
                      </Badge>
                      <ContentWarningBadge contentWarning={video.contentWarning} />
                    </div>
                    <CardTitle className="text-lg">{video.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <p className="text-sm text-gray-300">{video.description}</p>
                      
                      <div className="flex items-center gap-4 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {video.duration}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {video.views}
                        </span>
                      </div>
                      
                      <p className="text-xs text-gray-400">By {video.creator}</p>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full"
                        onClick={() => window.open(video.url, '_blank')}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        {video.creator === "Shatterlight" || video.creator === "killchildtraffikers" 
                          ? `Visit ${video.creator} Channel` 
                          : `Watch on ${video.platform}`}
                        <ExternalLink className="h-3 w-3 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Emergency Tab */}
          <TabsContent value="emergency">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="glass-effect bg-red-900/20 border-red-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-400">
                    <Phone className="h-5 w-5" />
                    Emergency Hotlines
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {EMERGENCY_CONTACTS.map((contact, index) => (
                    <div key={index} className="p-4 bg-[hsl(240,29%,11%)] rounded-lg">
                      <h4 className="font-semibold text-white mb-2">{contact.name}</h4>
                      <div className="space-y-1">
                        {contact.phone && (
                          <p className="text-lg font-mono text-red-400">{contact.phone}</p>
                        )}
                        {contact.text && (
                          <p className="text-sm text-blue-400">Text: {contact.text}</p>
                        )}
                        <p className="text-xs text-green-400">Available: {contact.available}</p>
                        <p className="text-xs text-gray-300">{contact.description}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="glass-effect bg-transparent border-white/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-orange-400" />
                    What to Do If You Suspect Trafficking
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="p-3 bg-[hsl(240,29%,11%)] rounded-lg">
                      <h5 className="font-medium text-orange-400 mb-2">1. Stay Safe</h5>
                      <p className="text-sm text-gray-300">Do not confront suspected traffickers or attempt rescue yourself</p>
                    </div>
                    <div className="p-3 bg-[hsl(240,29%,11%)] rounded-lg">
                      <h5 className="font-medium text-blue-400 mb-2">2. Document</h5>
                      <p className="text-sm text-gray-300">Note location, time, descriptions, and any other relevant details</p>
                    </div>
                    <div className="p-3 bg-[hsl(240,29%,11%)] rounded-lg">
                      <h5 className="font-medium text-green-400 mb-2">3. Report</h5>
                      <p className="text-sm text-gray-300">Call the National Human Trafficking Hotline or local law enforcement</p>
                    </div>
                    <div className="p-3 bg-[hsl(240,29%,11%)] rounded-lg">
                      <h5 className="font-medium text-purple-400 mb-2">4. Follow Up</h5>
                      <p className="text-sm text-gray-300">Provide additional information if requested by authorities</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Organizations Tab */}
          <TabsContent value="organizations">
            <div className="grid md:grid-cols-2 gap-6">
              {ORGANIZATIONS.map((org, index) => (
                <Card key={index} className="glass-effect bg-transparent border-white/20 hover:border-blue-400/50 transition-colors">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{org.name}</span>
                      <Button size="sm" variant="ghost" asChild>
                        <a href={org.website} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <p className="text-sm text-gray-300">{org.description}</p>
                      <div className="p-3 bg-[hsl(240,29%,11%)] rounded-lg">
                        <p className="text-xs text-blue-400 mb-1">Focus Area</p>
                        <p className="text-sm text-gray-300">{org.focus}</p>
                      </div>
                      <div className="p-3 bg-green-900/20 border border-green-700 rounded-lg">
                        <p className="text-xs text-green-400 mb-1">Impact</p>
                        <p className="text-sm text-gray-300">{org.impact}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Discussion Tab */}
          <TabsContent value="discussion">
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {/* Create Discussion */}
                {isAuthenticated && (
                  <Card className="glass-effect bg-transparent border-white/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-blue-400" />
                        Share Awareness & Education
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <Textarea
                          placeholder="Share educational content, awareness information, or safety tips..."
                          value={newDiscussion}
                          onChange={(e) => setNewDiscussion(e.target.value)}
                          className="min-h-[100px] bg-[hsl(240,29%,11%)] border-gray-700"
                        />
                        <Button 
                          onClick={handleCreateDiscussion}
                          disabled={createDiscussionMutation.isPending || !newDiscussion.trim()}
                          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                        >
                          Share Information
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Sample Discussions */}
                <div className="space-y-4">
                  {[
                    {
                      title: "Recognizing Online Predator Tactics",
                      author: "SafetyAdvocate",
                      time: "2 hours ago",
                      content: "Important warning signs parents should watch for when children are gaming or on social media...",
                      category: "Online Safety"
                    },
                    {
                      title: "Community Watch Program Success",
                      author: "NeighborhoodGuard",
                      time: "6 hours ago", 
                      content: "Our neighborhood watch helped identify suspicious activity that led to law enforcement intervention...",
                      category: "Community Safety"
                    },
                    {
                      title: "Survivor Support Resources",
                      author: "HealingPath",
                      time: "1 day ago",
                      content: "Comprehensive list of trauma-informed support services for survivors and their families...",
                      category: "Survivor Support"
                    }
                  ].map((discussion, index) => (
                    <Card key={index} className="glass-effect bg-transparent border-white/20">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                            <Shield className="h-6 w-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold">{discussion.title}</h3>
                              <Badge variant="outline" className="text-xs">{discussion.category}</Badge>
                            </div>
                            <p className="text-sm text-gray-300 mb-3">{discussion.content}</p>
                            <div className="flex items-center gap-4 text-xs text-gray-400">
                              <span>by {discussion.author}</span>
                              <span>{discussion.time}</span>
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
                <Card className="glass-effect bg-yellow-900/20 border-yellow-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-yellow-400">
                      <AlertTriangle className="h-5 w-5" />
                      Discussion Guidelines
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <p className="text-gray-300">• Share educational and awareness content</p>
                    <p className="text-gray-300">• Respect survivor privacy and trauma</p>
                    <p className="text-gray-300">• Verify information before sharing</p>
                    <p className="text-gray-300">• Report illegal content immediately</p>
                    <p className="text-gray-300">• Support survivors with compassion</p>
                    <p className="text-gray-300">• Reference independent researchers like Shatterlight & killchildtraffikers</p>
                  </CardContent>
                </Card>

                <Card className="glass-effect bg-transparent border-white/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Heart className="h-5 w-5 text-red-400" />
                      Support Resources
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div>
                      <p className="font-medium text-red-400 mb-1">Crisis Support</p>
                      <p className="text-gray-300">Crisis Text Line: Text HOME to 741741</p>
                    </div>
                    <div>
                      <p className="font-medium text-blue-400 mb-1">Mental Health</p>
                      <p className="text-gray-300">SAMHSA: 1-800-662-HELP</p>
                    </div>
                    <div>
                      <p className="font-medium text-green-400 mb-1">Legal Aid</p>
                      <p className="text-gray-300">National Legal Aid: lsc.gov</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}