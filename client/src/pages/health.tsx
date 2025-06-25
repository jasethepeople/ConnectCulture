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
  },
  {
    title: "Project CBD",
    description: "Cannabis science and education for health professionals",
    url: "https://www.projectcbd.org",
    category: "Cannabis Medicine",
    location: "California"
  },
  {
    title: "Multidisciplinary Association for Psychedelic Studies",
    description: "MAPS - Research on therapeutic benefits of psychedelics",
    url: "https://maps.org",
    category: "Psychedelic Research",
    location: "Santa Cruz, CA"
  },
  {
    title: "Johns Hopkins Center for Psychedelic Research",
    description: "Leading psilocybin research for depression and PTSD",
    url: "https://hopkinspsychedelic.org",
    category: "Psychedelic Research",
    location: "Baltimore, MD"
  },
  {
    title: "Realm of Caring Foundation",
    description: "Cannabis education and patient support network",
    url: "https://www.realmofcaring.org",
    category: "Cannabis Medicine",
    location: "Colorado"
  },
  {
    title: "Sacred Plant Medicine Alliance",
    description: "Education on traditional plant medicines and safety",
    category: "Plant Medicine",
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
          <TabsList className="grid grid-cols-2 lg:grid-cols-6 w-full bg-[hsl(240,29%,11%)]">
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
            <TabsTrigger value="cannabis" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              <span className="hidden sm:inline">Cannabis & Plant Medicine</span>
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
                    },
                    {
                      title: "Cannabis for Chronic Pain - My 5 Year Journey",
                      author: "PlantMedicine",
                      replies: 78,
                      time: "1 day ago",
                      excerpt: "How I replaced opioids with CBD/THC therapy. Strain recommendations, dosing protocols, and dealing with legal challenges...",
                      category: "Cannabis Medicine"
                    },
                    {
                      title: "Psilocybin Therapy for Depression - Clinical Results",
                      author: "MushroomHealer",
                      replies: 134,
                      time: "3 days ago",
                      excerpt: "Johns Hopkins research results, microdosing protocols, set and setting guidelines. Real healing without Big Pharma...",
                      category: "Psychedelic Research"
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
                    <div className="flex justify-between">
                      <span>Cannabis Medicine</span>
                      <Badge variant="outline">87 posts</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Psilocybin Research</span>
                      <Badge variant="outline">72 posts</Badge>
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

          {/* Cannabis & Plant Medicine */}
          <TabsContent value="cannabis">
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {/* Cannabis Education Section */}
                <Card className="glass-effect bg-transparent border-white/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5 text-green-400" />
                      Cannabis Medicine Benefits
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="p-4 bg-[hsl(240,29%,11%)] rounded-lg">
                        <h4 className="font-semibold text-green-400 mb-2 flex items-center gap-2">
                          <Heart className="h-4 w-4" />
                          Medical Conditions
                        </h4>
                        <ul className="text-sm space-y-1 text-gray-300">
                          <li>• Chronic pain management</li>
                          <li>• Epilepsy and seizure disorders</li>
                          <li>• Cancer treatment side effects</li>
                          <li>• PTSD and anxiety disorders</li>
                          <li>• Inflammatory conditions</li>
                          <li>• Glaucoma and eye pressure</li>
                          <li>• Appetite and nausea issues</li>
                        </ul>
                      </div>
                      <div className="p-4 bg-[hsl(240,29%,11%)] rounded-lg">
                        <h4 className="font-semibold text-blue-400 mb-2 flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          Responsible Use Guidelines
                        </h4>
                        <ul className="text-sm space-y-1 text-gray-300">
                          <li>• Start low, go slow with dosing</li>
                          <li>• Consult healthcare providers</li>
                          <li>• Choose quality, tested products</li>
                          <li>• Understand strain differences</li>
                          <li>• Monitor your response</li>
                          <li>• Avoid driving while medicated</li>
                          <li>• Keep away from children/pets</li>
                        </ul>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-green-900/20 border border-green-700 rounded-lg">
                      <h4 className="font-semibold text-green-400 mb-2">CBD vs THC: Understanding the Difference</h4>
                      <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="font-medium text-green-300 mb-1">CBD (Cannabidiol)</p>
                          <p className="text-gray-300">Non-psychoactive, anti-inflammatory, reduces anxiety, pain relief, neuroprotective properties</p>
                        </div>
                        <div>
                          <p className="font-medium text-purple-300 mb-1">THC (Tetrahydrocannabinol)</p>
                          <p className="text-gray-300">Psychoactive, pain relief, appetite stimulation, sleep aid, muscle relaxation</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Mushroom/Psychedelic Education */}
                <Card className="glass-effect bg-transparent border-white/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-purple-400" />
                      Psilocybin & Psychedelic Medicine
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="p-4 bg-[hsl(240,29%,11%)] rounded-lg">
                        <h4 className="font-semibold text-purple-400 mb-2">Therapeutic Benefits</h4>
                        <ul className="text-sm space-y-1 text-gray-300">
                          <li>• Treatment-resistant depression</li>
                          <li>• PTSD and trauma therapy</li>
                          <li>• End-of-life anxiety</li>
                          <li>• Addiction treatment</li>
                          <li>• Cluster headaches</li>
                          <li>• OCD and anxiety disorders</li>
                          <li>• Spiritual and personal growth</li>
                        </ul>
                      </div>
                      <div className="p-4 bg-[hsl(240,29%,11%)] rounded-lg">
                        <h4 className="font-semibold text-orange-400 mb-2">Safety & Set/Setting</h4>
                        <ul className="text-sm space-y-1 text-gray-300">
                          <li>• Professional supervision recommended</li>
                          <li>• Safe, comfortable environment</li>
                          <li>• Proper mental preparation</li>
                          <li>• Screen for mental health conditions</li>
                          <li>• Have a trusted trip sitter</li>
                          <li>• Integration therapy after sessions</li>
                          <li>• Respect the medicine</li>
                        </ul>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="p-3 bg-purple-900/20 border border-purple-700 rounded-lg text-center">
                        <h5 className="font-semibold text-purple-300 mb-1">Microdosing</h5>
                        <p className="text-xs text-gray-300">0.1-0.3g every 3 days</p>
                        <p className="text-xs text-gray-400">Creativity, mood, focus</p>
                      </div>
                      <div className="p-3 bg-blue-900/20 border border-blue-700 rounded-lg text-center">
                        <h5 className="font-semibold text-blue-300 mb-1">Low Dose</h5>
                        <p className="text-xs text-gray-300">0.5-1.5g</p>
                        <p className="text-xs text-gray-400">Mild effects, introspection</p>
                      </div>
                      <div className="p-3 bg-red-900/20 border border-red-700 rounded-lg text-center">
                        <h5 className="font-semibold text-red-300 mb-1">Therapeutic</h5>
                        <p className="text-xs text-gray-300">2-3.5g</p>
                        <p className="text-xs text-gray-400">Clinical supervision only</p>
                      </div>
                    </div>

                    <div className="p-4 bg-yellow-900/20 border border-yellow-700 rounded-lg">
                      <h4 className="font-semibold text-yellow-400 mb-2 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        Important Research Sources
                      </h4>
                      <div className="text-sm space-y-2">
                        <p className="text-gray-300">Johns Hopkins studies show 80% success rate for treatment-resistant depression</p>
                        <p className="text-gray-300">NYU research demonstrates significant reduction in end-of-life anxiety</p>
                        <p className="text-gray-300">Imperial College London research on neuroplasticity and brain connectivity</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Legal Status & Advocacy */}
                <Card className="glass-effect bg-transparent border-white/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="h-5 w-5 text-yellow-400" />
                      Legal Status & Advocacy
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="p-4 bg-[hsl(240,29%,11%)] rounded-lg">
                          <h4 className="font-semibold text-green-400 mb-2">Cannabis Legal States</h4>
                          <p className="text-xs text-gray-300 mb-2">Medical: 38 states + DC</p>
                          <p className="text-xs text-gray-300 mb-2">Recreational: 21 states + DC</p>
                          <p className="text-xs text-gray-400">Always check local laws</p>
                        </div>
                        <div className="p-4 bg-[hsl(240,29%,11%)] rounded-lg">
                          <h4 className="font-semibold text-purple-400 mb-2">Psilocybin Progress</h4>
                          <p className="text-xs text-gray-300 mb-1">Oregon: Legal therapy 2023</p>
                          <p className="text-xs text-gray-300 mb-1">Colorado: Passed in 2022</p>
                          <p className="text-xs text-gray-300 mb-1">Cities: Denver, Oakland, DC</p>
                          <p className="text-xs text-gray-400">Research exemptions expanding</p>
                        </div>
                      </div>
                      
                      <div className="p-4 bg-blue-900/20 border border-blue-700 rounded-lg">
                        <h4 className="font-semibold text-blue-400 mb-2">Advocacy Organizations</h4>
                        <div className="grid md:grid-cols-2 gap-2 text-xs">
                          <div>
                            <p className="text-gray-300">• NORML (Cannabis reform)</p>
                            <p className="text-gray-300">• Drug Policy Alliance</p>
                            <p className="text-gray-300">• MAPS (Psychedelic research)</p>
                          </div>
                          <div>
                            <p className="text-gray-300">• Decriminalize Nature</p>
                            <p className="text-gray-300">• Students for Liberty</p>
                            <p className="text-gray-300">• Last Prisoner Project</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar Resources */}
              <div className="space-y-6">
                <Card className="glass-effect bg-transparent border-white/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-[hsl(151,100%,50%)]" />
                      Educational Resources
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div>
                      <p className="font-medium text-green-400 mb-1">Cannabis Education</p>
                      <p className="text-xs text-gray-300">Project CBD - Science-based information</p>
                      <p className="text-xs text-gray-300">Leafly Learn - Strain database</p>
                      <p className="text-xs text-gray-300">Americans for Safe Access</p>
                    </div>
                    <div>
                      <p className="font-medium text-purple-400 mb-1">Psychedelic Research</p>
                      <p className="text-xs text-gray-300">MAPS.org - Clinical trials</p>
                      <p className="text-xs text-gray-300">Erowid - Experience database</p>
                      <p className="text-xs text-gray-300">The Third Wave - Education</p>
                    </div>
                    <div>
                      <p className="font-medium text-orange-400 mb-1">Harm Reduction</p>
                      <p className="text-xs text-gray-300">DanceSafe - Testing services</p>
                      <p className="text-xs text-gray-300">Zendo Project - Crisis support</p>
                      <p className="text-xs text-gray-300">Fireside Project - Peer support</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-effect bg-transparent border-white/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-[hsl(151,100%,50%)]" />
                      Latest Research
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-xs">
                    <div className="p-3 bg-[hsl(240,29%,11%)] rounded-lg">
                      <p className="font-medium text-green-400 mb-1">CBD for Epilepsy</p>
                      <p className="text-gray-300">FDA-approved Epidiolex shows 50% seizure reduction</p>
                    </div>
                    <div className="p-3 bg-[hsl(240,29%,11%)] rounded-lg">
                      <p className="font-medium text-purple-400 mb-1">Psilocybin for Depression</p>
                      <p className="text-gray-300">Phase 3 trials show sustained remission rates</p>
                    </div>
                    <div className="p-3 bg-[hsl(240,29%,11%)] rounded-lg">
                      <p className="font-medium text-blue-400 mb-1">MDMA for PTSD</p>
                      <p className="text-gray-300">67% no longer meet PTSD criteria after therapy</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
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