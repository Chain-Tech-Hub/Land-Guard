import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, FileText, Calendar, User, Shield, ArrowLeft, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useWeb3, LandLayout } from "@/contexts/Web3Context";
import { toast } from "sonner";

const PublicVerification = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResult, setSearchResult] = useState<LandLayout | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchAttempted, setSearchAttempted] = useState(false);

  const { getLandLayout, isConnected } = useWeb3();

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error('Please enter a Land ID');
      return;
    }
    
    setIsSearching(true);
    setSearchAttempted(true);
    
    try {
      // Try to parse as number for land ID
      const landId = parseInt(searchQuery);
      if (isNaN(landId)) {
        toast.error('Please enter a valid Land ID (number)');
        setSearchResult(null);
        return;
      }

      const result = await getLandLayout(landId);
      setSearchResult(result);
      
      if (!result) {
        toast.error(`Land ID ${landId} not found`);
      }
    } catch (error) {
      console.error('Error searching for land:', error);
      toast.error('Error searching for land. Please try again.');
      setSearchResult(null);
    } finally {
      setIsSearching(false);
    }
  };

  const getStatusColor = (status: number) => {
    switch (status) {
      case 0: return 'bg-gray-500 text-white'; // Inactive
      case 1: return 'bg-green-500 text-white'; // Active
      case 2: return 'bg-blue-500 text-white'; // Listed
      case 3: return 'bg-yellow-500 text-white'; // Sold
      case 4: return 'bg-red-500 text-white'; // Disputed
      default: return 'bg-gray-500 text-white';
    }
  };

  const getStatusText = (status: number) => {
    switch (status) {
      case 0: return 'INACTIVE';
      case 1: return 'ACTIVE';
      case 2: return 'LISTED FOR SALE';
      case 3: return 'SOLD';
      case 4: return 'DISPUTED';
      default: return 'UNKNOWN';
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/95 backdrop-blur">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">LG</span>
              </div>
              <div>
                <h1 className="text-xl font-semibold">Public Verification Portal</h1>
                <p className="text-sm text-muted-foreground">Verify land ownership and authenticity</p>
              </div>
            </div>
            <Link 
              to="/" 
              className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-gradient-hero rounded-xl flex items-center justify-center mx-auto mb-6">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold mb-4">Land Ownership Verification</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Enter a Land ID to verify ownership, check status, and view blockchain-verified documentation
            </p>
          </div>

          {/* Connection Status */}
          {!isConnected && (
            <Card className="shadow-soft mb-8 border-yellow-200 bg-yellow-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-yellow-800">
                  <Shield className="h-4 w-4" />
                  <p className="text-sm">
                    Connect your wallet for full verification features, or search without connection for basic information.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Search Section */}
          <Card className="shadow-medium mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Search Land Records
              </CardTitle>
              <CardDescription>
                Enter a Land ID (numeric) to verify ownership and view details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="search" className="sr-only">Land ID</Label>
                  <Input
                    id="search"
                    placeholder="Enter Land ID (e.g., 1, 2, 3)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="text-lg"
                    type="number"
                  />
                </div>
                <Button 
                  onClick={handleSearch}
                  disabled={isSearching}
                  className="bg-gradient-primary border-0 px-8"
                >
                  {isSearching ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    "Verify"
                  )}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {isConnected 
                  ? "Connected to blockchain - full verification available"
                  : "Not connected - limited verification available"
                }
              </p>
            </CardContent>
          </Card>

          {/* Search Results */}
          {searchAttempted && (
            <div className="space-y-6">
              {searchResult ? (
                <>
                  {/* Land Information */}
                  <Card className="shadow-soft">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-2xl">Land Code: {searchResult.landCode}</CardTitle>
                          <CardDescription>Land ID: {searchQuery}</CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <Badge className={getStatusColor(searchResult.landStatus)}>
                            {getStatusText(searchResult.landStatus)}
                          </Badge>
                          {searchResult.inDispute && (
                            <Badge className="bg-red-500 text-white">DISPUTED</Badge>
                          )}
                          <Badge className="bg-gradient-primary text-white border-0">
                            <Shield className="h-3 w-3 mr-1" />
                            BLOCKCHAIN VERIFIED
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="flex items-center gap-3">
                          <User className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Owner</p>
                            <p className="font-semibold font-mono">{formatAddress(searchResult.landOwner)}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <MapPin className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Value</p>
                            <p className="font-semibold">{searchResult.landValue} ETH</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Title Deed</p>
                            <p className="font-semibold">
                              {searchResult.titleDeedUrl ? 'Available' : 'Not minted'}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <Shield className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Status</p>
                            <p className="font-semibold">
                              {searchResult.inDispute ? 'In Dispute' : 'Verified'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Blockchain Verification */}
                  <Card className="shadow-soft border-green-200 bg-green-50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-green-600" />
                        Blockchain Verification
                      </CardTitle>
                      <CardDescription>
                        This land parcel is registered and verified on the blockchain
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-1">Owner Address</p>
                          <p className="font-mono text-sm bg-white px-2 py-1 rounded border">
                            {searchResult.landOwner}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-1">Land Code</p>
                          <p className="font-mono text-sm bg-white px-2 py-1 rounded border">
                            {searchResult.landCode}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Documents */}
                  <Card className="shadow-soft">
                    <CardHeader>
                      <CardTitle>Land Information</CardTitle>
                      <CardDescription>
                        Verified information stored on blockchain and IPFS
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <p className="font-medium">Layout Document</p>
                              <p className="text-sm text-muted-foreground truncate max-w-md">
                                {searchResult.layoutUrl}
                              </p>
                            </div>
                          </div>
                          <Badge className="bg-green-500 text-white">
                            <Shield className="h-3 w-3 mr-1" />
                            VERIFIED
                          </Badge>
                        </div>

                        {searchResult.titleDeedUrl && (
                          <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
                            <div className="flex items-center gap-3">
                              <FileText className="h-5 w-5 text-muted-foreground" />
                              <div>
                                <p className="font-medium">Title Deed</p>
                                <p className="text-sm text-muted-foreground truncate max-w-md">
                                  {searchResult.titleDeedUrl}
                                </p>
                              </div>
                            </div>
                            <Badge className="bg-green-500 text-white">
                              <Shield className="h-3 w-3 mr-1" />
                              MINTED
                            </Badge>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Dispute Warning */}
                  {searchResult.inDispute && (
                    <Card className="shadow-soft border-red-200 bg-red-50">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-red-700">
                          <Shield className="h-5 w-5" />
                          Dispute Notice
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-red-700">
                          This land parcel is currently under dispute. Ownership claims are being reviewed 
                          by authorized dispute resolvers. Exercise caution in any transactions involving this property.
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </>
              ) : (
                <Card className="shadow-soft">
                  <CardContent className="text-center py-12">
                    <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Land Found</h3>
                    <p className="text-muted-foreground mb-4">
                      The Land ID "{searchQuery}" was not found in our records.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Please check the ID and try again. Land IDs are numeric values (e.g., 1, 2, 3).
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Information Section */}
          {!searchAttempted && (
            <div className="grid md:grid-cols-3 gap-6 mt-12">
              <Card className="text-center shadow-soft">
                <CardHeader>
                  <Shield className="h-8 w-8 text-primary mx-auto mb-2" />
                  <CardTitle className="text-lg">Blockchain Verified</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    All land records are secured and verified on the blockchain for maximum trust and transparency
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center shadow-soft">
                <CardHeader>
                  <FileText className="h-8 w-8 text-secondary mx-auto mb-2" />
                  <CardTitle className="text-lg">Document Integrity</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Documents are stored on IPFS ensuring they cannot be tampered with or lost
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center shadow-soft">
                <CardHeader>
                  <Search className="h-8 w-8 text-accent mx-auto mb-2" />
                  <CardTitle className="text-lg">Public Access</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Anyone can verify land ownership and authenticity through this public portal
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default PublicVerification;