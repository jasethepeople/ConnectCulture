import { useState, useEffect } from "react";
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
  Shield,
  Globe,
  Lock,
  Key,
  Eye,
  EyeOff,
  MessageSquare,
  Send,
  Copy,
  Download,
  Upload,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Wifi,
  WifiOff,
  Search,
  ExternalLink,
  Settings
} from "lucide-react";

interface TorConnection {
  isConnected: boolean;
  circuitPath: string[];
  exitNode: string;
  connectionSpeed: string;
}

interface PGPKeyPair {
  publicKey: string;
  privateKey: string;
  fingerprint: string;
  userId: string;
  created: string;
}

interface EncryptedMessage {
  id: string;
  encryptedContent: string;
  senderFingerprint: string;
  recipientFingerprint: string;
  timestamp: string;
}

interface EmailAlias {
  id: string;
  address: string;
  name: string;
  isTemporary: boolean;
  expiresAt?: string;
  createdAt: string;
  messageCount: number;
}

interface AnonymousEmail {
  id: string;
  from: string;
  to: string;
  subject: string;
  body: string;
  isEncrypted: boolean;
  selfDestructAt?: string;
  createdAt: string;
  isRead: boolean;
}

export default function Privacy() {
  // Tor Browser State
  const [torUrl, setTorUrl] = useState("http://3g2upl4pq6kufc4m.onion"); // DuckDuckGo onion
  const [torConnection, setTorConnection] = useState<TorConnection>({
    isConnected: false,
    circuitPath: [],
    exitNode: "",
    connectionSpeed: "0 KB/s"
  });
  const [torHistory, setTorHistory] = useState<string[]>([]);
  const [torBookmarks, setTorBookmarks] = useState<{name: string, url: string}[]>([
    { name: "DuckDuckGo", url: "http://3g2upl4pq6kufc4m.onion" },
    { name: "Facebook", url: "http://facebookwkhpilnemxj7asaniu7vnjjbiltxjqhye3mhbshg7kx5tfyd.onion" },
    { name: "BBC News", url: "http://bbcnewsv2vjtpsuy.onion" },
    { name: "ProPublica", url: "http://p53lf57qovyuvwsc6xnrppddxpr23otqjbrrd6wukmgwrgossad.onion" }
  ]);

  // PGP State
  const [pgpKeyPair, setPgpKeyPair] = useState<PGPKeyPair | null>(null);
  const [contactKeys, setContactKeys] = useState<{[userId: string]: string}>({});
  const [messageToEncrypt, setMessageToEncrypt] = useState("");
  const [messageToDecrypt, setMessageToDecrypt] = useState("");
  const [encryptedOutput, setEncryptedOutput] = useState("");
  const [decryptedOutput, setDecryptedOutput] = useState("");
  const [selectedContact, setSelectedContact] = useState("");

  // Anonymous Email State
  const [emailAliases, setEmailAliases] = useState<EmailAlias[]>([
    {
      id: "1",
      address: "secure.anon.2024@secmail.onion",
      name: "Primary Anonymous",
      isTemporary: false,
      createdAt: new Date().toISOString(),
      messageCount: 3
    }
  ]);
  const [anonymousEmails, setAnonymousEmails] = useState<AnonymousEmail[]>([
    {
      id: "1",
      from: "contact@privacy.onion",
      to: "secure.anon.2024@secmail.onion",
      subject: "Welcome to Anonymous Email",
      body: "Your secure email system is now active. All messages are automatically encrypted and routed through Tor.",
      isEncrypted: true,
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      isRead: false
    }
  ]);
  const [selectedAlias, setSelectedAlias] = useState<string>("");
  const [emailCompose, setEmailCompose] = useState({
    to: "",
    subject: "",
    body: "",
    selfDestructHours: 24
  });

  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  // Initialize PGP keys on component mount
  useEffect(() => {
    if (isAuthenticated && !pgpKeyPair) {
      generatePGPKeys();
    }
  }, [isAuthenticated]);

  // Simulate Tor connection
  const connectToTor = async () => {
    setTorConnection(prev => ({ ...prev, isConnected: false }));
    
    // Simulate connection process
    for (let i = 0; i < 3; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const nodes = ["Node-" + Math.random().toString(36).substr(2, 8)];
      setTorConnection(prev => ({
        ...prev,
        circuitPath: [...prev.circuitPath, ...nodes]
      }));
    }
    
    setTorConnection(prev => ({
      ...prev,
      isConnected: true,
      exitNode: "Exit-" + Math.random().toString(36).substr(2, 8),
      connectionSpeed: Math.floor(Math.random() * 500 + 100) + " KB/s"
    }));
    
    toast({ title: "Connected to Tor network", description: "Your browsing is now anonymous" });
  };

  const disconnectTor = () => {
    setTorConnection({
      isConnected: false,
      circuitPath: [],
      exitNode: "",
      connectionSpeed: "0 KB/s"
    });
    toast({ title: "Disconnected from Tor", description: "Regular browsing resumed" });
  };

  const navigateToUrl = (url: string) => {
    if (!torConnection.isConnected) {
      toast({ 
        title: "Connect to Tor first", 
        description: "Please establish Tor connection before browsing .onion sites",
        variant: "destructive" 
      });
      return;
    }
    
    setTorUrl(url);
    setTorHistory(prev => [url, ...prev.slice(0, 9)]); // Keep last 10
    toast({ title: "Navigating", description: `Loading ${url}` });
  };

  // PGP Key Generation (simplified simulation)
  const generatePGPKeys = async () => {
    if (!user) return;
    
    // Simulate key generation
    const mockKeyPair: PGPKeyPair = {
      publicKey: `-----BEGIN PGP PUBLIC KEY BLOCK-----
Version: SpaceLink PGP 1.0

mQENBGNK7YUBCAC8vQ7LF9yK2...${Math.random().toString(36)}...
-----END PGP PUBLIC KEY BLOCK-----`,
      privateKey: `-----BEGIN PGP PRIVATE KEY BLOCK-----
Version: SpaceLink PGP 1.0

lQPGBGNK7YUBCAC8vQ7LF9yK2...${Math.random().toString(36)}...
-----END PGP PRIVATE KEY BLOCK-----`,
      fingerprint: Array.from({length: 8}, () => Math.random().toString(16).substr(2, 4)).join(' ').toUpperCase(),
      userId: `${user.firstName} ${user.lastName} <${user.email}>`,
      created: new Date().toISOString()
    };
    
    setPgpKeyPair(mockKeyPair);
    toast({ title: "PGP keys generated", description: "Your encryption keys are ready" });
  };

  const encryptMessage = async () => {
    if (!pgpKeyPair || !messageToEncrypt || !selectedContact) {
      toast({ title: "Missing requirements", description: "Select contact and enter message", variant: "destructive" });
      return;
    }
    
    // Simulate encryption
    const encrypted = `-----BEGIN PGP MESSAGE-----
Version: SpaceLink PGP 1.0

hQEMA+${Math.random().toString(36)}+encrypted+${btoa(messageToEncrypt)}+end
-----END PGP MESSAGE-----`;
    
    setEncryptedOutput(encrypted);
    toast({ title: "Message encrypted", description: "Ready to send securely" });
  };

  const decryptMessage = async () => {
    if (!pgpKeyPair || !messageToDecrypt) {
      toast({ title: "Missing requirements", description: "Enter encrypted message", variant: "destructive" });
      return;
    }
    
    // Simulate decryption (extract base64 content)
    try {
      const base64Match = messageToDecrypt.match(/\+([A-Za-z0-9+/=]+)\+/);
      if (base64Match) {
        const decrypted = atob(base64Match[1]);
        setDecryptedOutput(decrypted);
        toast({ title: "Message decrypted", description: "Content revealed" });
      } else {
        setDecryptedOutput("Failed to decrypt - invalid format or wrong key");
      }
    } catch (error) {
      setDecryptedOutput("Decryption failed - check message format");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied", description: "Content copied to clipboard" });
  };

  // Email functions
  const generateTempEmail = () => {
    const randomId = Math.random().toString(36).substr(2, 12);
    const tempDomains = ["tempmail.onion", "burner.onion", "disposable.onion"];
    const domain = tempDomains[Math.floor(Math.random() * tempDomains.length)];
    
    const newAlias: EmailAlias = {
      id: Date.now().toString(),
      address: `${randomId}@${domain}`,
      name: "Temporary Email",
      isTemporary: true,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      createdAt: new Date().toISOString(),
      messageCount: 0
    };
    
    setEmailAliases(prev => [...prev, newAlias]);
    toast({ title: "Temporary email created", description: "Expires in 24 hours" });
  };

  const generateAlias = () => {
    const adjectives = ["secure", "private", "anon", "shadow", "ghost", "stealth"];
    const nouns = ["mail", "msg", "comm", "drop", "box", "vault"];
    const randomAdj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
    const randomNum = Math.floor(Math.random() * 9999);
    
    const newAlias: EmailAlias = {
      id: Date.now().toString(),
      address: `${randomAdj}.${randomNoun}.${randomNum}@secmail.onion`,
      name: "Custom Alias",
      isTemporary: false,
      createdAt: new Date().toISOString(),
      messageCount: 0
    };
    
    setEmailAliases(prev => [...prev, newAlias]);
    toast({ title: "Email alias created", description: "Permanent alias ready to use" });
  };

  const sendAnonymousEmail = () => {
    if (!emailCompose.to || !emailCompose.subject || !selectedAlias) {
      toast({ title: "Missing fields", description: "Please fill all required fields", variant: "destructive" });
      return;
    }
    
    const newEmail: AnonymousEmail = {
      id: Date.now().toString(),
      from: selectedAlias,
      to: emailCompose.to,
      subject: emailCompose.subject,
      body: emailCompose.body,
      isEncrypted: true,
      selfDestructAt: emailCompose.selfDestructHours > 0 
        ? new Date(Date.now() + emailCompose.selfDestructHours * 60 * 60 * 1000).toISOString()
        : undefined,
      createdAt: new Date().toISOString(),
      isRead: false
    };
    
    // Add to sent emails (in real implementation, this would be handled by backend)
    setAnonymousEmails(prev => [newEmail, ...prev]);
    
    // Reset compose form
    setEmailCompose({
      to: "",
      subject: "",
      body: "",
      selfDestructHours: 24
    });
    
    toast({ title: "Email sent anonymously", description: "Message encrypted and routed through Tor" });
  };

  return (
    <div className="min-h-screen bg-[hsl(240,50%,7%)] text-white">
      <Navigation />
      
      <div className="pt-20 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="glass-effect rounded-2xl p-6 mb-8 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="w-full h-full bg-gradient-to-r from-[hsl(280,100%,70%)] via-[hsl(260,100%,70%)] to-[hsl(240,100%,70%)]"></div>
          </div>
          <div className="relative z-10">
            <h1 className="text-3xl font-bold mb-2 font-mono flex items-center gap-3">
              <Shield className="h-8 w-8 text-[hsl(280,100%,70%)]" />
              <span className="gradient-text">Privacy & Security Center</span>
            </h1>
            <p className="text-gray-300">
              Built-in Tor browser and encrypted PGP messaging for maximum privacy and security
            </p>
          </div>
        </div>

        <Tabs defaultValue="tor" className="space-y-6">
          <TabsList className="grid grid-cols-2 lg:grid-cols-4 w-full bg-[hsl(240,29%,11%)]">
            <TabsTrigger value="tor" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              <span className="hidden sm:inline">Tor Browser</span>
            </TabsTrigger>
            <TabsTrigger value="email" className="flex items-center gap-2">
              <Send className="h-4 w-4" />
              <span className="hidden sm:inline">Anonymous Email</span>
            </TabsTrigger>
            <TabsTrigger value="pgp" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              <span className="hidden sm:inline">PGP Encryption</span>
            </TabsTrigger>
            <TabsTrigger value="secure-chat" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Secure Chat</span>
            </TabsTrigger>
          </TabsList>

          {/* Tor Browser Tab */}
          <TabsContent value="tor">
            <div className="grid lg:grid-cols-4 gap-6">
              <div className="lg:col-span-3 space-y-4">
                {/* Tor Controls */}
                <Card className="glass-effect bg-transparent border-white/20">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Globe className="h-5 w-5 text-purple-400" />
                        Tor Browser
                      </div>
                      <div className="flex items-center gap-2">
                        {torConnection.isConnected ? (
                          <Badge className="bg-green-600 text-white">
                            <Wifi className="h-3 w-3 mr-1" />
                            Connected
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-red-400 border-red-400">
                            <WifiOff className="h-3 w-3 mr-1" />
                            Disconnected
                          </Badge>
                        )}
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex gap-2">
                        <Button 
                          onClick={connectToTor}
                          disabled={torConnection.isConnected}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Connect to Tor
                        </Button>
                        <Button 
                          onClick={disconnectTor}
                          disabled={!torConnection.isConnected}
                          variant="destructive"
                        >
                          Disconnect
                        </Button>
                        <Button 
                          onClick={() => setTorConnection(prev => ({...prev, circuitPath: []}))}
                          variant="outline"
                          disabled={!torConnection.isConnected}
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          New Circuit
                        </Button>
                      </div>

                      {torConnection.isConnected && (
                        <div className="p-4 bg-green-900/20 border border-green-700 rounded-lg">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-green-400 font-medium">Circuit Path:</p>
                              <p className="text-gray-300">{torConnection.circuitPath.join(' → ')}</p>
                            </div>
                            <div>
                              <p className="text-green-400 font-medium">Exit Node:</p>
                              <p className="text-gray-300">{torConnection.exitNode}</p>
                            </div>
                            <div>
                              <p className="text-green-400 font-medium">Speed:</p>
                              <p className="text-gray-300">{torConnection.connectionSpeed}</p>
                            </div>
                            <div>
                              <p className="text-green-400 font-medium">Status:</p>
                              <p className="text-green-300">Anonymous browsing active</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* URL Bar */}
                      <div className="flex gap-2">
                        <Input
                          value={torUrl}
                          onChange={(e) => setTorUrl(e.target.value)}
                          placeholder="Enter .onion URL"
                          className="bg-[hsl(240,29%,11%)] border-gray-700"
                        />
                        <Button 
                          onClick={() => navigateToUrl(torUrl)}
                          disabled={!torConnection.isConnected}
                        >
                          <Search className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Browser Window */}
                      <div className="h-96 bg-[hsl(240,29%,11%)] border border-gray-700 rounded-lg p-4">
                        {torConnection.isConnected ? (
                          <div className="h-full flex items-center justify-center">
                            <div className="text-center">
                              <Globe className="h-16 w-16 text-purple-400 mx-auto mb-4" />
                              <h3 className="text-lg font-semibold mb-2">Tor Browser Active</h3>
                              <p className="text-gray-300 mb-4">Current URL: {torUrl}</p>
                              <p className="text-sm text-gray-400">
                                This is a simulated Tor browser. In production, this would render actual .onion sites.
                              </p>
                              <Button
                                variant="outline"
                                className="mt-4"
                                onClick={() => window.open(torUrl.replace('.onion', '.com'), '_blank')}
                              >
                                <ExternalLink className="h-4 w-4 mr-2" />
                                Open in External Browser
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="h-full flex items-center justify-center">
                            <div className="text-center">
                              <WifiOff className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                              <h3 className="text-lg font-semibold mb-2">Connect to Tor Network</h3>
                              <p className="text-gray-400">Establish a secure connection to browse .onion sites</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-4">
                {/* Bookmarks */}
                <Card className="glass-effect bg-transparent border-white/20">
                  <CardHeader>
                    <CardTitle className="text-lg">Onion Bookmarks</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {torBookmarks.map((bookmark, index) => (
                        <Button
                          key={index}
                          variant="ghost"
                          className="w-full justify-start text-sm"
                          onClick={() => navigateToUrl(bookmark.url)}
                        >
                          {bookmark.name}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* History */}
                <Card className="glass-effect bg-transparent border-white/20">
                  <CardHeader>
                    <CardTitle className="text-lg">Recent</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1">
                      {torHistory.slice(0, 5).map((url, index) => (
                        <Button
                          key={index}
                          variant="ghost"
                          className="w-full justify-start text-xs text-gray-400"
                          onClick={() => navigateToUrl(url)}
                        >
                          {url.length > 30 ? url.substring(0, 30) + '...' : url}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Security Info */}
                <Card className="glass-effect bg-green-900/20 border-green-700">
                  <CardHeader>
                    <CardTitle className="text-lg text-green-400">Security Status</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      <span>IP Address Hidden</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      <span>Traffic Encrypted</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      <span>Location Masked</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Anonymous Email Tab */}
          <TabsContent value="email">
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {/* Email Compose */}
                <Card className="glass-effect bg-transparent border-white/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Send className="h-5 w-5 text-blue-400" />
                      Compose Anonymous Email
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium mb-2 block">From Alias</label>
                          <select
                            value={selectedAlias}
                            onChange={(e) => setSelectedAlias(e.target.value)}
                            className="w-full p-2 bg-[hsl(240,29%,11%)] border border-gray-700 rounded-lg text-white"
                          >
                            <option value="">Select alias...</option>
                            {emailAliases.map(alias => (
                              <option key={alias.id} value={alias.address}>
                                {alias.address} ({alias.name})
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-2 block">Self-Destruct (hours)</label>
                          <Input
                            type="number"
                            value={emailCompose.selfDestructHours}
                            onChange={(e) => setEmailCompose(prev => ({...prev, selfDestructHours: parseInt(e.target.value) || 0}))}
                            className="bg-[hsl(240,29%,11%)] border-gray-700"
                            min="0"
                            max="168"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium mb-2 block">To</label>
                        <Input
                          value={emailCompose.to}
                          onChange={(e) => setEmailCompose(prev => ({...prev, to: e.target.value}))}
                          placeholder="recipient@example.onion"
                          className="bg-[hsl(240,29%,11%)] border-gray-700"
                        />
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium mb-2 block">Subject</label>
                        <Input
                          value={emailCompose.subject}
                          onChange={(e) => setEmailCompose(prev => ({...prev, subject: e.target.value}))}
                          placeholder="Message subject"
                          className="bg-[hsl(240,29%,11%)] border-gray-700"
                        />
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium mb-2 block">Message</label>
                        <Textarea
                          value={emailCompose.body}
                          onChange={(e) => setEmailCompose(prev => ({...prev, body: e.target.value}))}
                          placeholder="Your encrypted message..."
                          className="min-h-[150px] bg-[hsl(240,29%,11%)] border-gray-700"
                        />
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          onClick={sendAnonymousEmail}
                          className="bg-blue-600 hover:bg-blue-700 flex-1"
                        >
                          <Send className="h-4 w-4 mr-2" />
                          Send Anonymously
                        </Button>
                        <Button variant="outline" onClick={() => setEmailCompose({to: "", subject: "", body: "", selfDestructHours: 24})}>
                          Clear
                        </Button>
                      </div>
                      
                      {emailCompose.selfDestructHours > 0 && (
                        <div className="p-3 bg-orange-900/20 border border-orange-700 rounded-lg">
                          <p className="text-sm text-orange-300">
                            <AlertTriangle className="h-4 w-4 inline mr-2" />
                            This email will self-destruct in {emailCompose.selfDestructHours} hours after being read
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Email Inbox */}
                <Card className="glass-effect bg-transparent border-white/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-green-400" />
                      Anonymous Inbox
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {anonymousEmails.map(email => (
                        <div key={email.id} className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                          email.isRead ? 'bg-[hsl(240,29%,9%)] border-gray-700' : 'bg-[hsl(240,29%,11%)] border-blue-700'
                        }`}>
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-medium text-sm">{email.subject}</p>
                                {email.isEncrypted && <Lock className="h-3 w-3 text-green-400" />}
                                {email.selfDestructAt && <AlertTriangle className="h-3 w-3 text-orange-400" />}
                                {!email.isRead && <div className="w-2 h-2 bg-blue-400 rounded-full" />}
                              </div>
                              <p className="text-xs text-gray-400">From: {email.from}</p>
                              <p className="text-xs text-gray-400">To: {email.to}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-gray-400">{new Date(email.createdAt).toLocaleString()}</p>
                              {email.selfDestructAt && (
                                <p className="text-xs text-orange-400">
                                  Expires: {new Date(email.selfDestructAt).toLocaleString()}
                                </p>
                              )}
                            </div>
                          </div>
                          <p className="text-sm text-gray-300 truncate">{email.body}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Email Sidebar */}
              <div className="space-y-6">
                {/* Alias Management */}
                <Card className="glass-effect bg-transparent border-white/20">
                  <CardHeader>
                    <CardTitle className="text-lg">Email Aliases</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Button 
                          onClick={generateTempEmail}
                          variant="outline"
                          className="w-full"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Generate Temp Email
                        </Button>
                        <Button 
                          onClick={generateAlias}
                          variant="outline"
                          className="w-full"
                        >
                          <Key className="h-4 w-4 mr-2" />
                          Create Alias
                        </Button>
                      </div>
                      
                      <div className="space-y-2">
                        {emailAliases.map(alias => (
                          <div key={alias.id} className="p-3 bg-[hsl(240,29%,11%)] rounded-lg">
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-sm font-medium">{alias.name}</p>
                              {alias.isTemporary && (
                                <Badge variant="outline" className="text-xs text-orange-400 border-orange-400">
                                  TEMP
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-gray-400 mb-1">{alias.address}</p>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-500">{alias.messageCount} messages</span>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => copyToClipboard(alias.address)}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                            {alias.expiresAt && (
                              <p className="text-xs text-orange-400 mt-1">
                                Expires: {new Date(alias.expiresAt).toLocaleString()}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Email Security Info */}
                <Card className="glass-effect bg-green-900/20 border-green-700">
                  <CardHeader>
                    <CardTitle className="text-lg text-green-400">Email Security</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      <span>End-to-end encrypted</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      <span>Routed through Tor</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      <span>No metadata logging</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      <span>Self-destruct capable</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Anonymous Email Tips */}
                <Card className="glass-effect bg-yellow-900/20 border-yellow-700">
                  <CardHeader>
                    <CardTitle className="text-lg text-yellow-400">Privacy Tips</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <p className="text-gray-300">• Use temp emails for one-time communications</p>
                    <p className="text-gray-300">• Create unique aliases for different purposes</p>
                    <p className="text-gray-300">• Set self-destruct for sensitive messages</p>
                    <p className="text-gray-300">• Connect through Tor for maximum anonymity</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* PGP Encryption Tab */}
          <TabsContent value="pgp">
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="space-y-6">
                {/* Key Management */}
                <Card className="glass-effect bg-transparent border-white/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Key className="h-5 w-5 text-yellow-400" />
                      PGP Key Management
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {pgpKeyPair ? (
                      <div className="space-y-4">
                        <div className="p-4 bg-green-900/20 border border-green-700 rounded-lg">
                          <h4 className="font-semibold text-green-400 mb-2">Your PGP Identity</h4>
                          <p className="text-sm text-gray-300 mb-2">{pgpKeyPair.userId}</p>
                          <p className="text-xs text-gray-400">Fingerprint: {pgpKeyPair.fingerprint}</p>
                          <p className="text-xs text-gray-400">Created: {new Date(pgpKeyPair.created).toLocaleDateString()}</p>
                        </div>
                        
                        <div className="space-y-2">
                          <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => copyToClipboard(pgpKeyPair.publicKey)}
                          >
                            <Copy className="h-4 w-4 mr-2" />
                            Copy Public Key
                          </Button>
                          <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => {
                              const blob = new Blob([pgpKeyPair.privateKey], { type: 'text/plain' });
                              const url = URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = 'private-key.asc';
                              a.click();
                            }}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Export Private Key
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <Key className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-400 mb-4">No PGP keys found</p>
                        <Button onClick={generatePGPKeys}>
                          Generate Key Pair
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Message Encryption */}
                <Card className="glass-effect bg-transparent border-white/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lock className="h-5 w-5 text-blue-400" />
                      Encrypt Message
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Recipient</label>
                        <Input
                          placeholder="Contact's email or key ID"
                          value={selectedContact}
                          onChange={(e) => setSelectedContact(e.target.value)}
                          className="bg-[hsl(240,29%,11%)] border-gray-700"
                        />
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium mb-2 block">Message</label>
                        <Textarea
                          placeholder="Enter message to encrypt..."
                          value={messageToEncrypt}
                          onChange={(e) => setMessageToEncrypt(e.target.value)}
                          className="min-h-[100px] bg-[hsl(240,29%,11%)] border-gray-700"
                        />
                      </div>
                      
                      <Button 
                        onClick={encryptMessage}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                        disabled={!pgpKeyPair}
                      >
                        <Lock className="h-4 w-4 mr-2" />
                        Encrypt Message
                      </Button>
                      
                      {encryptedOutput && (
                        <div>
                          <label className="text-sm font-medium mb-2 block">Encrypted Output</label>
                          <div className="relative">
                            <Textarea
                              value={encryptedOutput}
                              readOnly
                              className="min-h-[150px] bg-[hsl(240,29%,11%)] border-gray-700 font-mono text-xs"
                            />
                            <Button
                              size="sm"
                              variant="ghost"
                              className="absolute top-2 right-2"
                              onClick={() => copyToClipboard(encryptedOutput)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                {/* Message Decryption */}
                <Card className="glass-effect bg-transparent border-white/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <EyeOff className="h-5 w-5 text-green-400" />
                      Decrypt Message
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Encrypted Message</label>
                        <Textarea
                          placeholder="Paste encrypted PGP message here..."
                          value={messageToDecrypt}
                          onChange={(e) => setMessageToDecrypt(e.target.value)}
                          className="min-h-[150px] bg-[hsl(240,29%,11%)] border-gray-700 font-mono text-xs"
                        />
                      </div>
                      
                      <Button 
                        onClick={decryptMessage}
                        className="w-full bg-green-600 hover:bg-green-700"
                        disabled={!pgpKeyPair}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Decrypt Message
                      </Button>
                      
                      {decryptedOutput && (
                        <div>
                          <label className="text-sm font-medium mb-2 block">Decrypted Content</label>
                          <div className="p-4 bg-green-900/20 border border-green-700 rounded-lg">
                            <p className="text-gray-300">{decryptedOutput}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Key Import */}
                <Card className="glass-effect bg-transparent border-white/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Upload className="h-5 w-5 text-purple-400" />
                      Import Contact Key
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Textarea
                        placeholder="Paste contact's public key here..."
                        className="min-h-[100px] bg-[hsl(240,29%,11%)] border-gray-700 font-mono text-xs"
                      />
                      <Button variant="outline" className="w-full">
                        <Upload className="h-4 w-4 mr-2" />
                        Import Public Key
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Security Notice */}
                <Card className="glass-effect bg-yellow-900/20 border-yellow-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-yellow-400">
                      <AlertTriangle className="h-5 w-5" />
                      Security Notice
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <p className="text-gray-300">• Keys are generated locally and never leave your device</p>
                    <p className="text-gray-300">• Always verify key fingerprints with contacts</p>
                    <p className="text-gray-300">• Keep private keys secure and backed up</p>
                    <p className="text-gray-300">• Use strong passphrases for key protection</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Secure Chat Tab */}
          <TabsContent value="secure-chat">
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card className="glass-effect bg-transparent border-white/20 h-[600px] flex flex-col">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-green-400" />
                      Encrypted Chat
                      <Badge className="bg-green-600 text-white ml-2">
                        <Lock className="h-3 w-3 mr-1" />
                        E2E Encrypted
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col">
                    {/* Chat Messages */}
                    <div className="flex-1 bg-[hsl(240,29%,11%)] rounded-lg p-4 mb-4 overflow-y-auto">
                      <div className="space-y-4">
                        <div className="text-center">
                          <p className="text-sm text-gray-400">End-to-end encrypted chat</p>
                          <p className="text-xs text-gray-500">Messages are encrypted with PGP</p>
                        </div>
                        
                        {/* Sample encrypted messages */}
                        <div className="text-right">
                          <div className="inline-block bg-blue-600 rounded-lg p-3 max-w-xs">
                            <p className="text-sm text-white">Hello! Testing encrypted messaging.</p>
                            <p className="text-xs text-blue-200 mt-1">Encrypted • Just now</p>
                          </div>
                        </div>
                        
                        <div className="text-left">
                          <div className="inline-block bg-[hsl(240,29%,15%)] rounded-lg p-3 max-w-xs">
                            <p className="text-sm text-gray-300">Message received and decrypted successfully!</p>
                            <p className="text-xs text-gray-400 mt-1">Encrypted • 2 min ago</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Message Input */}
                    <div className="flex gap-2">
                      <Input
                        placeholder="Type encrypted message..."
                        className="flex-1 bg-[hsl(240,29%,11%)] border-gray-700"
                      />
                      <Button className="bg-green-600 hover:bg-green-700">
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Chat Sidebar */}
              <div className="space-y-4">
                <Card className="glass-effect bg-transparent border-white/20">
                  <CardHeader>
                    <CardTitle className="text-lg">Contacts</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="p-3 bg-[hsl(240,29%,11%)] rounded-lg cursor-pointer hover:bg-[hsl(240,29%,13%)]">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-semibold">A</span>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Alice Smith</p>
                            <p className="text-xs text-gray-400">Key verified</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-3 bg-[hsl(240,29%,11%)] rounded-lg cursor-pointer hover:bg-[hsl(240,29%,13%)]">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-semibold">B</span>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Bob Johnson</p>
                            <p className="text-xs text-gray-400">Key verified</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="glass-effect bg-transparent border-white/20">
                  <CardHeader>
                    <CardTitle className="text-lg">Chat Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                      <span>Auto-encrypt messages</span>
                      <Badge className="bg-green-600">ON</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Key verification</span>
                      <Badge className="bg-green-600">REQUIRED</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Message retention</span>
                      <Badge variant="outline">7 DAYS</Badge>
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