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
  Shield,
  Sun,
  Radio,
  MapPin,
  Car,
  MessageSquare,
  AlertTriangle,
  Zap,
  Globe,
  Users,
  BookOpen,
  ExternalLink,
  Plus,
  TrendingUp,
  Activity
} from "lucide-react";

// Emergency scanner frequencies by region
const SCANNER_FREQUENCIES = {
  "California": ["154.755", "155.370", "453.212", "460.425"],
  "Texas": ["154.680", "155.175", "453.087", "460.312"],
  "Florida": ["154.725", "155.340", "453.175", "460.387"],
  "New York": ["154.695", "155.190", "453.100", "460.325"],
  "Illinois": ["154.710", "155.220", "453.137", "460.350"]
};

// Alternative health resources (focusing on independent research)
const HEALTH_RESOURCES = [
  {
    title: "Burzynski Clinic",
    description: "Antineoplaston therapy for cancer treatment",
    url: "https://www.burzynskiclinic.com",
    category: "Cancer Treatment",
    location: "Houston, TX"
  },
  {
    title: "Gerson Institute",
    description: "Nutritional therapy for cancer and chronic disease",
    url: "https://gerson.org",
    category: "Nutritional Therapy",
    location: "San Diego, CA"
  },
  {
    title: "Mexican Cancer Clinics",
    description: "Alternative cancer treatments in Tijuana",
    category: "International Treatment",
    location: "Tijuana, Mexico"
  },
  {
    title: "FLCCC Alliance",
    description: "Critical care physicians sharing treatment protocols",
    url: "https://covid19criticalcare.com",
    category: "COVID Treatment",
    location: "Worldwide"
  },
  {
    title: "ICAN (Informed Consent Action Network)",
    description: "Vaccine safety advocacy and research",
    url: "https://www.icandecide.org",
    category: "Vaccine Safety",
    location: "Nationwide"
  }
];

// Space weather data (simplified for demo)
const SPACE_WEATHER_DATA = {
  solarFlares: [
    { class: "M2.1", time: "06:45 UTC", region: "AR3842" },
    { class: "C9.3", time: "14:22 UTC", region: "AR3841" },
    { class: "C5.7", time: "22:10 UTC", region: "AR3843" }
  ],
  geomagneticStatus: "Quiet",
  kpIndex: 2.3,
  solarWindSpeed: "425 km/s",
  coronalMassEjections: 0
};

export default function Health() {
  const [selectedRegion, setSelectedRegion] = useState("California");
  const [activeFrequency, setActiveFrequency] = useState("");
  const [newDiscussion, setNewDiscussion] = useState("");
  const [rideRequest, setRideRequest] = useState({ from: "", to: "", date: "", contact: "" });
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: healthDiscussions = [] } = useQuery({
    queryKey: ['/api/health-discussions'],
    queryFn: () => apiRequest('/api/health-discussions'),
  });

  const { data: rideShares = [] } = useQuery({
    queryKey: ['/api/ride-shares'],
    queryFn: () => apiRequest('/api/ride-shares'),
  });

  const createDiscussionMutation = useMutation({
    mutationFn: async (content: string) => {
      return apiRequest('/api/health-discussions', {
        method: 'POST',
        body: JSON.stringify({ content, category: 'general' }),
        headers: { 'Content-Type': 'application/json' }
      });
    },
    onSuccess: () => {
      toast({ title: "Discussion posted successfully!" });
      setNewDiscussion("");
      queryClient.invalidateQueries({ queryKey: ['/api/health-discussions'] });
    },
    onError: () => {
      toast({ 
        title: "Failed to post discussion", 
        description: "Please try again later.",
        variant: "destructive" 
      });
    }
  });

  const createRideShareMutation = useMutation({
    mutationFn: async (request: any) => {
      return apiRequest('/api/ride-shares', {
        method: 'POST',
        body: JSON.stringify(request),
        headers: { 'Content-Type': 'application/json' }
      });
    },
    onSuccess: () => {
      toast({ title: "Ride request posted successfully!" });
      setRideRequest({ from: "", to: "", date: "", contact: "" });
      queryClient.invalidateQueries({ queryKey: ['/api/ride-shares'] });
    },
    onError: () => {
      toast({ 
        title: "Failed to post ride request", 
        description: "Please try again later.",
        variant: "destructive" 
      });
    }
  });

  const handleCreateDiscussion = () => {
    if (!newDiscussion.trim()) return;
    createDiscussionMutation.mutate(newDiscussion);
  };

  const handleCreateRideShare = () => {
    if (!rideRequest.from || !rideRequest.to || !rideRequest.contact) {
      toast({ 
        title: "Missing information", 
        description: "Please fill in all required fields.",
        variant: "destructive" 
      });
      return;
    }
    createRideShareMutation.mutate(rideRequest);
  };

  return (
    <div className="min-h-screen bg-[hsl(240,50%,7%)] text-white">
      <Navigation />
      
      <div className="pt-20 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="glass-effect rounded-2xl p-6 mb-8 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="w-full h-full bg-gradient-to-r from-[hsl(0,79%,70%)] via-[hsl(151,100%,50%)] to-[hsl(217,91%,60%)]"></div>
          </div>
          <div className="relative z-10">
            <h1 className="text-3xl font-bold mb-2 font-mono flex items-center gap-3">
              <Heart className="h-8 w-8 text-[hsl(0,79%,70%)]" />
              <span className="gradient-text">Collaborative Health Hub</span>
            </h1>
            <p className="text-gray-300">
              Independent health information, community support, emergency monitoring, and local connections
            </p>
          </div>
        </div>

        <Tabs defaultValue="discussions" className="space-y-6">
          <TabsList className="grid grid-cols-2 lg:grid-cols-5 w-full bg-[hsl(240,29%,11%)]">
            <TabsTrigger value="discussions" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Discussions</span>
            </TabsTrigger>
            <TabsTrigger value="resources" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Resources</span>
            </TabsTrigger>
            <TabsTrigger value="weather" className="flex items-center gap-2">
              <Sun className="h-4 w-4" />
              <span className="hidden sm:inline">Space Weather</span>
            </TabsTrigger>
            <TabsTrigger value="scanner" className="flex items-center gap-2">
              <Radio className="h-4 w-4" />
              <span className="hidden sm:inline">Emergency Scanner</span>
            </TabsTrigger>
            <TabsTrigger value="rideshare" className="flex items-center gap-2">
              <Car className="h-4 w-4" />
              <span className="hidden sm:inline">Ride Share</span>
            </TabsTrigger>
          </TabsList>

          {/* Health Discussions */}
          <TabsContent value="discussions">
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {/* Create Discussion */}
                {isAuthenticated && (
                  <Card className="glass-effect bg-transparent border-white/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Plus className="h-5 w-5 text-[hsl(151,100%,50%)]" />
                        Start a Discussion
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <Textarea
                          placeholder="Share your experience, ask questions, or discuss alternative health topics..."
                          value={newDiscussion}
                          onChange={(e) => setNewDiscussion(e.target.value)}
                          className="min-h-[100px] bg-[hsl(240,29%,11%)] border-gray-700"
                        />
                        <Button 
                          onClick={handleCreateDiscussion}
                          disabled={createDiscussionMutation.isPending || !newDiscussion.trim()}
                          className="bg-gradient-to-r from-[hsl(0,79%,70%)] to-[hsl(151,100%,50%)] hover:from-[hsl(0,79%,80%)] hover:to-[hsl(151,100%,60%)]"
                        >
                          Post Discussion
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Discussion Topics */}
                <div className="space-y-4">
                  {[
                    {
                      title: "COVID Vaccine Injury Support Group",
                      author: "HealthAdvocate2024",
                      replies: 47,
                      time: "2 hours ago",
                      excerpt: "Sharing experiences and supporting each other through vaccine-related health challenges. VAERS reports, symptoms, recovery protocols...",
                      category: "Vaccine Safety"
                    },
                    {
                      title: "Burzynski Clinic Results - My Father's Journey",
                      author: "HopeSeeker",
                      replies: 23,
                      time: "4 hours ago", 
                      excerpt: "Documenting our experience with antineoplaston therapy for stage 4 pancreatic cancer. Real results, not pharmaceutical propaganda...",
                      category: "Cancer Treatment"
                    },
                    {
                      title: "Mexican Cancer Clinics - Comparison & Reviews",
                      author: "AlternativePath",
                      replies: 89,
                      time: "1 day ago",
                      excerpt: "Comprehensive review of Tijuana cancer clinics: costs, treatments, success rates. What they don't want you to know...",
                      category: "International Treatment"
                    },
                    {
                      title: "Ivermectin & Natural COVID Protocols",
                      author: "FreedomMed",
                      replies: 156,
                      time: "2 days ago",
                      excerpt: "FLCCC protocols, natural immunity boosters, and treatments that actually work. Censored information from frontline doctors...",
                      category: "COVID Treatment"
                    }
                  ].map((discussion, index) => (
                    <Card key={index} className="glass-effect bg-transparent border-white/20 hover:border-[hsl(151,100%,50%)]/50 transition-colors cursor-pointer">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-[hsl(0,79%,70%)] to-[hsl(151,100%,50%)] rounded-full flex items-center justify-center">
                            <Heart className="h-6 w-6 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold">{discussion.title}</h3>
                              <Badge variant="outline" className="text-xs">{discussion.category}</Badge>
                            </div>
                            <p className="text-sm text-gray-300 mb-3 line-clamp-2">{discussion.excerpt}</p>
                            <div className="flex items-center gap-4 text-xs text-gray-400">
                              <span>by {discussion.author}</span>
                              <span>{discussion.replies} replies</span>
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
                <Card className="glass-effect bg-transparent border-white/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-[hsl(217,91%,60%)]" />
                      Community Guidelines
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <p>• Share authentic experiences and research</p>
                    <p>• Question mainstream narratives respectfully</p>
                    <p>• Support each other's health journeys</p>
                    <p>• Focus on independent, non-pharma sources</p>
                    <p>• Respect diverse treatment approaches</p>
                  </CardContent>
                </Card>

                <Card className="glass-effect bg-transparent border-white/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-[hsl(151,100%,50%)]" />
                      Hot Topics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Vaccine Injuries</span>
                      <Badge variant="outline">234 posts</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Cancer Alternatives</span>
                      <Badge variant="outline">189 posts</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Natural Immunity</span>
                      <Badge variant="outline">156 posts</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Detox Protocols</span>
                      <Badge variant="outline">98 posts</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Health Resources */}
          <TabsContent value="resources">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {HEALTH_RESOURCES.map((resource, index) => (
                <Card key={index} className="glass-effect bg-transparent border-white/20 hover:border-[hsl(151,100%,50%)]/50 transition-colors">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="text-lg">{resource.title}</span>
                      {resource.url && (
                        <Button size="sm" variant="ghost" asChild>
                          <a href={resource.url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                    </CardTitle>
                    <Badge variant="outline" className="w-fit">{resource.category}</Badge>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-300 mb-3">{resource.description}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <MapPin className="h-3 w-3" />
                      <span>{resource.location}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Space Weather */}
          <TabsContent value="weather">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="glass-effect bg-transparent border-white/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sun className="h-5 w-5 text-yellow-400" />
                    Solar Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-[hsl(240,29%,11%)] rounded-lg">
                        <p className="text-xs text-gray-400 mb-1">Solar Wind Speed</p>
                        <p className="text-xl font-bold text-blue-400">{SPACE_WEATHER_DATA.solarWindSpeed}</p>
                      </div>
                      <div className="text-center p-4 bg-[hsl(240,29%,11%)] rounded-lg">
                        <p className="text-xs text-gray-400 mb-1">Kp Index</p>
                        <p className="text-xl font-bold text-green-400">{SPACE_WEATHER_DATA.kpIndex}</p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                        <Zap className="h-4 w-4 text-yellow-400" />
                        Recent Solar Flares
                      </h4>
                      <div className="space-y-2">
                        {SPACE_WEATHER_DATA.solarFlares.map((flare, index) => (
                          <div key={index} className="flex justify-between items-center p-2 bg-[hsl(240,29%,11%)] rounded">
                            <span className="text-sm">{flare.class} Class</span>
                            <span className="text-xs text-gray-400">{flare.time}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 bg-green-900/20 border border-green-700 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Activity className="h-4 w-4 text-green-400" />
                        <span className="text-sm font-semibold">Geomagnetic Status</span>
                      </div>
                      <p className="text-green-400">{SPACE_WEATHER_DATA.geomagneticStatus}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-effect bg-transparent border-white/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-orange-400" />
                    Space Weather Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-900/20 border border-blue-700 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Globe className="h-4 w-4 text-blue-400" />
                        <span className="text-sm font-semibold">High-Speed Solar Wind Stream</span>
                      </div>
                      <p className="text-xs text-gray-300">Expected to arrive in 6-12 hours. May cause minor radio disruptions.</p>
                    </div>
                    
                    <div className="p-4 bg-yellow-900/20 border border-yellow-700 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Zap className="h-4 w-4 text-yellow-400" />
                        <span className="text-sm font-semibold">Solar Flare Watch</span>
                      </div>
                      <p className="text-xs text-gray-300">Active region AR3842 showing increased activity. M-class flares possible.</p>
                    </div>

                    <div className="text-center">
                      <p className="text-xs text-gray-400 mb-2">Data updates every 15 minutes</p>
                      <p className="text-xs text-gray-500">Source: NOAA Space Weather Prediction Center</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Emergency Scanner */}
          <TabsContent value="scanner">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="glass-effect bg-transparent border-white/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Radio className="h-5 w-5 text-[hsl(151,100%,50%)]" />
                    Emergency Scanner
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Select Region</label>
                      <select 
                        value={selectedRegion}
                        onChange={(e) => setSelectedRegion(e.target.value)}
                        className="w-full p-2 bg-[hsl(240,29%,11%)] border border-gray-700 rounded text-white"
                      >
                        {Object.keys(SCANNER_FREQUENCIES).map(region => (
                          <option key={region} value={region}>{region}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Emergency Frequencies</label>
                      <div className="grid grid-cols-2 gap-2">
                        {SCANNER_FREQUENCIES[selectedRegion as keyof typeof SCANNER_FREQUENCIES].map((freq, index) => (
                          <Button
                            key={index}
                            variant={activeFrequency === freq ? "default" : "outline"}
                            size="sm"
                            onClick={() => setActiveFrequency(freq)}
                            className="text-xs"
                          >
                            {freq} MHz
                          </Button>
                        ))}
                      </div>
                    </div>

                    {activeFrequency && (
                      <div className="p-4 bg-[hsl(240,29%,11%)] rounded-lg border border-gray-700">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold">Now Listening: {activeFrequency} MHz</span>
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        </div>
                        <p className="text-xs text-gray-400 mb-3">{selectedRegion} Emergency Services</p>
                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between">
                            <span className="text-gray-300">Signal Strength:</span>
                            <span className="text-green-400">Strong</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-300">Last Activity:</span>
                            <span className="text-gray-400">3 minutes ago</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-effect bg-transparent border-white/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-[hsl(217,91%,60%)]" />
                    Emergency Map
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video bg-[hsl(240,29%,11%)] rounded-lg border border-gray-700 flex items-center justify-center">
                    <div className="text-center">
                      <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-400">Interactive Emergency Map</p>
                      <p className="text-xs text-gray-500 mt-2">Shows active incidents in {selectedRegion}</p>
                    </div>
                  </div>
                  
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-2 text-xs">
                      <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                      <span>Fire/EMS - 3 active</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <span>Police - 7 active</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                      <span>Traffic - 2 active</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Ride Share */}
          <TabsContent value="rideshare">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="glass-effect bg-transparent border-white/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5 text-[hsl(151,100%,50%)]" />
                    Post Ride Request
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isAuthenticated ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium mb-2 block">From</label>
                          <Input
                            placeholder="Starting location"
                            value={rideRequest.from}
                            onChange={(e) => setRideRequest(prev => ({ ...prev, from: e.target.value }))}
                            className="bg-[hsl(240,29%,11%)] border-gray-700"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-2 block">To</label>
                          <Input
                            placeholder="Destination"
                            value={rideRequest.to}
                            onChange={(e) => setRideRequest(prev => ({ ...prev, to: e.target.value }))}
                            className="bg-[hsl(240,29%,11%)] border-gray-700"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Date & Time</label>
                        <Input
                          type="datetime-local"
                          value={rideRequest.date}
                          onChange={(e) => setRideRequest(prev => ({ ...prev, date: e.target.value }))}
                          className="bg-[hsl(240,29%,11%)] border-gray-700"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Contact Info</label>
                        <Input
                          placeholder="Phone or Telegram @username"
                          value={rideRequest.contact}
                          onChange={(e) => setRideRequest(prev => ({ ...prev, contact: e.target.value }))}
                          className="bg-[hsl(240,29%,11%)] border-gray-700"
                        />
                      </div>
                      <Button 
                        onClick={handleCreateRideShare}
                        disabled={createRideShareMutation.isPending}
                        className="w-full bg-gradient-to-r from-[hsl(217,91%,60%)] to-[hsl(151,100%,50%)] hover:from-[hsl(217,91%,70%)] hover:to-[hsl(151,100%,60%)]"
                      >
                        Post Ride Request
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-400">Please log in to post ride requests</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="glass-effect bg-transparent border-white/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Car className="h-5 w-5 text-[hsl(217,91%,60%)]" />
                    Available Rides
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      {
                        from: "San Francisco, CA",
                        to: "Sacramento, CA", 
                        date: "Dec 28, 2:00 PM",
                        contact: "@freedom_rider",
                        seats: 2
                      },
                      {
                        from: "Austin, TX",
                        to: "Houston, TX",
                        date: "Dec 29, 9:00 AM", 
                        contact: "555-0123",
                        seats: 1
                      },
                      {
                        from: "Phoenix, AZ",
                        to: "Tucson, AZ",
                        date: "Dec 30, 6:00 PM",
                        contact: "@health_warrior",
                        seats: 3
                      }
                    ].map((ride, index) => (
                      <div key={index} className="p-4 bg-[hsl(240,29%,11%)] rounded-lg border border-gray-700">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-[hsl(151,100%,50%)]" />
                            <span className="text-sm font-semibold">{ride.from} → {ride.to}</span>
                          </div>
                          <Badge variant="outline" className="text-xs">{ride.seats} seats</Badge>
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-400">
                          <span>{ride.date}</span>
                          <span>Contact: {ride.contact}</span>
                        </div>
                      </div>
                    ))}
                    
                    {rideShares.length === 0 && (
                      <div className="text-center py-8">
                        <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-400">No ride requests yet</p>
                        <p className="text-xs text-gray-500">Be the first to post a ride share!</p>
                      </div>
                    )}
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