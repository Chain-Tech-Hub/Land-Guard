import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import DashboardLayout from "@/components/DashboardLayout";
import Web3Connection from "@/components/Web3Connection";
import { MapPin, FileText, DollarSign, AlertTriangle, Upload, Eye, Plus, Wallet, ShoppingCart, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useWeb3, LandLayout } from "@/contexts/Web3Context";
import { toast } from "sonner";

const CitizenDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [myLands, setMyLands] = useState<number[]>([]);
  const [landDetails, setLandDetails] = useState<{ [key: number]: LandLayout }>({});
  const [listedLands, setListedLands] = useState<LandLayout[]>([]);
  const [loading, setLoading] = useState(false);
  const [createLandOpen, setCreateLandOpen] = useState(false);
  const [listLandOpen, setListLandOpen] = useState(false);
  const [selectedLandId, setSelectedLandId] = useState<number | null>(null);
  const [flagDisputeOpen, setFlagDisputeOpen] = useState(false);

  // Form states
  const [landCode, setLandCode] = useState("");
  const [layoutUrl, setLayoutUrl] = useState("");
  const [titleDeedUrl, setTitleDeedUrl] = useState("");
  const [listPrice, setListPrice] = useState("");
  const [evidenceHash, setEvidenceHash] = useState("");

  const {
    account,
    isConnected,
    createLandLayout,
    registerLand,
    mintTitleDeed,
    listLand,
    buyLand,
    unlistLand,
    getLandLayout,
    getListedLands,
    getOwnerDeeds,
    flagConflict,
    formatEther,
    parseEther
  } = useWeb3();

  // Load user's lands and marketplace data
  useEffect(() => {
    if (isConnected && account) {
      loadUserData();
      loadMarketplaceData();
    }
  }, [isConnected, account]);

  const loadUserData = async () => {
    if (!account) return;
    
    setLoading(true);
    try {
      const deeds = await getOwnerDeeds(account);
      setMyLands(deeds);

      // Load details for each land
      const details: { [key: number]: LandLayout } = {};
      for (const landId of deeds) {
        const layout = await getLandLayout(landId);
        if (layout) {
          details[landId] = layout;
        }
      }
      setLandDetails(details);
    } catch (error) {
      console.error('Error loading user data:', error);
      toast.error('Failed to load your lands');
    } finally {
      setLoading(false);
    }
  };

  const loadMarketplaceData = async () => {
    try {
      const listed = await getListedLands();
      setListedLands(listed);
    } catch (error) {
      console.error('Error loading marketplace data:', error);
    }
  };

  const handleCreateLand = async () => {
    if (!landCode || !layoutUrl) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      await createLandLayout(landCode, layoutUrl);
      setCreateLandOpen(false);
      setLandCode("");
      setLayoutUrl("");
      await loadUserData();
    } catch (error) {
      console.error('Error creating land:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterLand = async (landId: number) => {
    if (!account) return;
    
    setLoading(true);
    try {
      await registerLand(landId, account);
      await loadUserData();
    } catch (error) {
      console.error('Error registering land:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMintTitleDeed = async (landId: number) => {
    if (!titleDeedUrl) {
      toast.error('Please provide title deed URL');
      return;
    }

    setLoading(true);
    try {
      await mintTitleDeed(landId, titleDeedUrl);
      setTitleDeedUrl("");
      await loadUserData();
    } catch (error) {
      console.error('Error minting title deed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleListLand = async () => {
    if (!selectedLandId || !listPrice) {
      toast.error('Please provide all required information');
      return;
    }

    setLoading(true);
    try {
      await listLand(selectedLandId, listPrice);
      setListLandOpen(false);
      setListPrice("");
      setSelectedLandId(null);
      await loadUserData();
      await loadMarketplaceData();
    } catch (error) {
      console.error('Error listing land:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBuyLand = async (landId: number, price: string) => {
    setLoading(true);
    try {
      await buyLand(landId, price);
      await loadUserData();
      await loadMarketplaceData();
    } catch (error) {
      console.error('Error buying land:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnlistLand = async (landId: number) => {
    setLoading(true);
    try {
      await unlistLand(landId);
      await loadUserData();
      await loadMarketplaceData();
    } catch (error) {
      console.error('Error unlisting land:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFlagDispute = async () => {
    if (!selectedLandId || !evidenceHash) {
      toast.error('Please provide all required information');
      return;
    }

    setLoading(true);
    try {
      await flagConflict(selectedLandId, evidenceHash);
      setFlagDisputeOpen(false);
      setEvidenceHash("");
      setSelectedLandId(null);
      await loadUserData();
    } catch (error) {
      console.error('Error flagging dispute:', error);
    } finally {
      setLoading(false);
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
      case 2: return 'LISTED';
      case 3: return 'SOLD';
      case 4: return 'DISPUTED';
      default: return 'UNKNOWN';
    }
  };

  if (!isConnected) {
    return (
      <DashboardLayout
        title="Citizen Dashboard"
        description="Connect your wallet to manage your land ownership"
      >
        <div className="flex justify-center items-center min-h-[400px]">
          <Web3Connection />
        </div>
      </DashboardLayout>
    );
  }

  const totalValue = Object.values(landDetails).reduce((sum, land) => sum + parseFloat(land.landValue), 0);
  const activeLands = Object.values(landDetails).filter(land => land.landStatus === 1).length;
  const disputedLands = Object.values(landDetails).filter(land => land.inDispute).length;

  const actions = (
    <>
      <Dialog open={createLandOpen} onOpenChange={setCreateLandOpen}>
        <DialogTrigger asChild>
          <Button className="bg-gradient-secondary border-0">
            <Plus className="h-4 w-4 mr-2" />
            Create Land Layout
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Land Layout</DialogTitle>
            <DialogDescription>
              Create a new land layout that can be registered later
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="landCode">Land Code</Label>
              <Input
                id="landCode"
                value={landCode}
                onChange={(e) => setLandCode(e.target.value)}
                placeholder="e.g., LG001"
              />
            </div>
            <div>
              <Label htmlFor="layoutUrl">Layout URL (IPFS)</Label>
              <Input
                id="layoutUrl"
                value={layoutUrl}
                onChange={(e) => setLayoutUrl(e.target.value)}
                placeholder="ipfs://..."
              />
            </div>
            <Button onClick={handleCreateLand} disabled={loading} className="w-full">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Land Layout
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Button variant="outline" onClick={() => navigate('/verify')}>
        <Eye className="h-4 w-4 mr-2" />
        Public Verification
      </Button>
    </>
  );

  return (
    <DashboardLayout
      title="Citizen Dashboard"
      description="Manage your land ownership, documents, and marketplace activities"
      actions={actions}
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="lands">My Lands</TabsTrigger>
          <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
          <TabsTrigger value="disputes">Disputes</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Wallet Connection Status */}
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                Wallet Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Connected Address</p>
                  <p className="text-sm text-muted-foreground font-mono">
                    {account?.slice(0, 6)}...{account?.slice(-4)}
                  </p>
                </div>
                <Badge className="bg-green-500 text-white">Connected</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="shadow-soft">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Lands</CardTitle>
                <MapPin className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{myLands.length}</div>
                <p className="text-xs text-muted-foreground">{activeLands} active</p>
              </CardContent>
            </Card>

            <Card className="shadow-soft">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Value</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalValue.toFixed(2)} ETH</div>
                <p className="text-xs text-muted-foreground">Estimated market value</p>
              </CardContent>
            </Card>

            <Card className="shadow-soft">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Listed Lands</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Object.values(landDetails).filter(land => land.landStatus === 2).length}
                </div>
                <p className="text-xs text-muted-foreground">Available for sale</p>
              </CardContent>
            </Card>

            <Card className="shadow-soft">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Disputes</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{disputedLands}</div>
                <p className="text-xs text-muted-foreground">Pending resolution</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="lands" className="space-y-6">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : myLands.length === 0 ? (
            <Card className="shadow-soft">
              <CardContent className="text-center py-12">
                <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Lands Registered</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first land layout to get started
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {myLands.map((landId) => {
                const land = landDetails[landId];
                if (!land) return null;

                return (
                  <Card key={landId} className="shadow-soft hover:shadow-medium transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">Land #{landId}</CardTitle>
                          <CardDescription>Code: {land.landCode}</CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <Badge className={getStatusColor(land.landStatus)}>
                            {getStatusText(land.landStatus)}
                          </Badge>
                          {land.inDispute && (
                            <Badge className="bg-red-500 text-white">DISPUTED</Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Owner</p>
                          <p className="text-sm font-mono">
                            {land.landOwner.slice(0, 6)}...{land.landOwner.slice(-4)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Value</p>
                          <p className="text-sm font-bold">{land.landValue} ETH</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Title Deed</p>
                          <p className="text-sm">
                            {land.titleDeedUrl ? 'Available' : 'Not minted'}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2 flex-wrap">
                        {land.landStatus === 0 && (
                          <Button 
                            size="sm" 
                            onClick={() => handleRegisterLand(landId)}
                            disabled={loading}
                          >
                            Register Land
                          </Button>
                        )}

                        {land.landStatus === 1 && !land.titleDeedUrl && (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="outline">
                                <FileText className="h-4 w-4 mr-2" />
                                Mint Title Deed
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Mint Title Deed</DialogTitle>
                                <DialogDescription>
                                  Provide the IPFS URL for the title deed document
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label htmlFor="titleDeedUrl">Title Deed URL (IPFS)</Label>
                                  <Input
                                    id="titleDeedUrl"
                                    value={titleDeedUrl}
                                    onChange={(e) => setTitleDeedUrl(e.target.value)}
                                    placeholder="ipfs://..."
                                  />
                                </div>
                                <Button 
                                  onClick={() => handleMintTitleDeed(landId)} 
                                  disabled={loading}
                                  className="w-full"
                                >
                                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                  Mint Title Deed
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}

                        {land.landStatus === 1 && (
                          <Button 
                            size="sm" 
                            className="bg-gradient-accent border-0"
                            onClick={() => {
                              setSelectedLandId(landId);
                              setListLandOpen(true);
                            }}
                          >
                            List for Sale
                          </Button>
                        )}

                        {land.landStatus === 2 && land.landOwner.toLowerCase() === account?.toLowerCase() && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleUnlistLand(landId)}
                            disabled={loading}
                          >
                            Unlist
                          </Button>
                        )}

                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            setSelectedLandId(landId);
                            setFlagDisputeOpen(true);
                          }}
                        >
                          <AlertTriangle className="h-4 w-4 mr-2" />
                          Flag Dispute
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="marketplace" className="space-y-6">
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle>Land Marketplace</CardTitle>
              <CardDescription>Buy verified land parcels from other users</CardDescription>
            </CardHeader>
            <CardContent>
              {listedLands.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Lands Listed</h3>
                  <p className="text-muted-foreground">
                    No land parcels are currently available for purchase
                  </p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {listedLands.map((land, index) => (
                    <Card key={index} className="border">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="font-semibold">Land Code: {land.landCode}</h4>
                            <p className="text-sm text-muted-foreground">
                              Owner: {land.landOwner.slice(0, 6)}...{land.landOwner.slice(-4)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold">{land.landValue} ETH</p>
                            <Badge className={getStatusColor(land.landStatus)}>
                              {getStatusText(land.landStatus)}
                            </Badge>
                          </div>
                        </div>
                        
                        {land.landOwner.toLowerCase() !== account?.toLowerCase() && (
                          <Button 
                            onClick={() => handleBuyLand(index + 1, land.landValue)}
                            disabled={loading}
                            className="w-full"
                          >
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Buy Land
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="disputes" className="space-y-6">
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle>Dispute Management</CardTitle>
              <CardDescription>Track and manage land ownership disputes</CardDescription>
            </CardHeader>
            <CardContent>
              {Object.entries(landDetails).filter(([_, land]) => land.inDispute).length === 0 ? (
                <div className="text-center py-12">
                  <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Active Disputes</h3>
                  <p className="text-muted-foreground">
                    All your land parcels are currently dispute-free
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(landDetails)
                    .filter(([_, land]) => land.inDispute)
                    .map(([landId, land]) => (
                      <div key={landId} className="border rounded-lg p-4 bg-red-50 border-red-200">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-semibold">Land #{landId}</h4>
                            <p className="text-sm text-muted-foreground">Code: {land.landCode}</p>
                          </div>
                          <Badge className="bg-red-500 text-white">DISPUTED</Badge>
                        </div>
                        <p className="text-sm mb-4">
                          This land parcel has been flagged for potential ownership conflicts. 
                          Evidence is being reviewed by dispute resolvers.
                        </p>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* List Land Dialog */}
      <Dialog open={listLandOpen} onOpenChange={setListLandOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>List Land for Sale</DialogTitle>
            <DialogDescription>
              Set a price for your land parcel
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="listPrice">Price (ETH)</Label>
              <Input
                id="listPrice"
                type="number"
                step="0.01"
                value={listPrice}
                onChange={(e) => setListPrice(e.target.value)}
                placeholder="0.1"
              />
            </div>
            <Button onClick={handleListLand} disabled={loading} className="w-full">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              List Land
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Flag Dispute Dialog */}
      <Dialog open={flagDisputeOpen} onOpenChange={setFlagDisputeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Flag Land Dispute</DialogTitle>
            <DialogDescription>
              Provide evidence hash for the dispute
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="evidenceHash">Evidence Hash</Label>
              <Textarea
                id="evidenceHash"
                value={evidenceHash}
                onChange={(e) => setEvidenceHash(e.target.value)}
                placeholder="Provide evidence or IPFS hash..."
              />
            </div>
            <Button onClick={handleFlagDispute} disabled={loading} className="w-full">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Flag Dispute
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default CitizenDashboard;