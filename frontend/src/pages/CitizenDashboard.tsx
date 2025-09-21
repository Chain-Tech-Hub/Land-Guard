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
import { MapPin, FileText, DollarSign, AlertTriangle, Upload, Eye, Plus, Wallet, ShoppingCart, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useWeb3, LandLayout } from "@/contexts/Web3Context";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const CitizenDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [myLands, setMyLands] = useState<LandLayout[]>([]);
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
    flagConflict
  } = useWeb3();

  const { user } = useAuth();

  const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${account}`
    }
  });

  useEffect(() => {
    if (isConnected && user) {
      loadCitizenData();
    }
  }, [isConnected, user]);

  const loadCitizenData = async () => {
    setLoading(true);
    try {
      // Load my lands
      const myLandsResponse = await api.get(`/lands/owner/${user?.address}`);
      setMyLands(myLandsResponse.data);

      // Load listed lands
      const listedLandsResponse = await api.get('/lands/listed');
      setListedLands(listedLandsResponse.data);
    } catch (error) {
      console.error('Error loading citizen data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!landCode || !layoutUrl) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      await createLandLayout(landCode, layoutUrl);
      toast.success('Land created successfully');
      setCreateLandOpen(false);
      loadCitizenData();
      resetForm();
    } catch (error) {
      console.error('Error creating land:', error);
      toast.error('Failed to create land');
    } finally {
      setLoading(false);
    }
  };

  const handleListLand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLandId || !listPrice) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      await listLand(selectedLandId, listPrice);
      toast.success('Land listed successfully');
      setListLandOpen(false);
      loadCitizenData();
      resetForm();
    } catch (error) {
      console.error('Error listing land:', error);
      toast.error('Failed to list land');
    } finally {
      setLoading(false);
    }
  };

  const handleBuyLand = async (landId: number, price: string) => {
    try {
      setLoading(true);
      await buyLand(landId, price);
      toast.success('Land purchased successfully');
      loadCitizenData();
    } catch (error) {
      console.error('Error buying land:', error);
      toast.error('Failed to buy land');
    } finally {
      setLoading(false);
    }
  };

  const handleUnlistLand = async (landId: number) => {
    try {
      setLoading(true);
      await unlistLand(landId);
      toast.success('Land unlisted successfully');
      loadCitizenData();
    } catch (error) {
      console.error('Error unlisting land:', error);
      toast.error('Failed to unlist land');
    } finally {
      setLoading(false);
    }
  };

  const handleFlagDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLandId || !evidenceHash) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      await flagConflict(selectedLandId, evidenceHash);
      toast.success('Dispute flagged successfully');
      setFlagDisputeOpen(false);
      loadCitizenData();
      resetForm();
    } catch (error) {
      console.error('Error flagging dispute:', error);
      toast.error('Failed to flag dispute');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setLandCode('');
    setLayoutUrl('');
    setTitleDeedUrl('');
    setListPrice('');
    setEvidenceHash('');
    setSelectedLandId(null);
  };

  if (!isConnected || user?.role !== 'citizen') {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-screen">
          <AlertTriangle className="h-16 w-16 text-yellow-500 mb-4" />
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-gray-600">You must be connected and have citizen role to access this page.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4">
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>My Lands</CardTitle>
              <CardDescription>Your registered lands</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span className="text-2xl font-bold">{myLands.length}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between">
                <div>
                  <CardTitle>Land Management</CardTitle>
                  <CardDescription>Manage your land assets</CardDescription>
                </div>
                <div>
                  <Dialog open={createLandOpen} onOpenChange={setCreateLandOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Land
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create New Land</DialogTitle>
                        <DialogDescription>
                          Register a new land in the system
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleCreateLand} className="space-y-4">
                        <div>
                          <Label htmlFor="landCode">Land Code</Label>
                          <Input
                            id="landCode"
                            value={landCode}
                            onChange={(e) => setLandCode(e.target.value)}
                            placeholder="Enter land code"
                          />
                        </div>
                        <div>
                          <Label htmlFor="layoutUrl">Layout URL</Label>
                          <Input
                            id="layoutUrl"
                            value={layoutUrl}
                            onChange={(e) => setLayoutUrl(e.target.value)}
                            placeholder="Enter layout URL"
                          />
                        </div>
                        <Button type="submit" disabled={loading}>
                          {loading ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Creating...
                            </>
                          ) : (
                            <>
                              <Upload className="h-4 w-4 mr-2" />
                              Create Land
                            </>
                          )}
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                  <TabsTrigger value="overview">My Lands</TabsTrigger>
                  <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
                </TabsList>
                <TabsContent value="overview">
                  {loading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {myLands.map((land, index) => (
                        <Card key={index}>
                          <CardContent className="pt-6">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-semibold">Land Code: {land.landCode}</h3>
                                <p className="text-sm text-gray-500 mt-1">Status: {land.landStatus}</p>
                              </div>
                              <div className="flex gap-2">
                                {!land.inDispute && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedLandId(index);
                                      setListLandOpen(true);
                                    }}
                                  >
                                    <DollarSign className="h-4 w-4 mr-2" />
                                    List for Sale
                                  </Button>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="marketplace">
                  {loading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {listedLands.map((land, index) => (
                        <Card key={index}>
                          <CardContent className="pt-6">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-semibold">Land Code: {land.landCode}</h3>
                                <p className="text-sm text-gray-500 mt-1">
                                  Price: {land.landValue} ETH
                                </p>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleBuyLand(index, land.landValue)}
                                  disabled={loading || land.landOwner.toLowerCase() === account?.toLowerCase()}
                                >
                                  <ShoppingCart className="h-4 w-4 mr-2" />
                                  Buy Now
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* List Land Dialog */}
      <Dialog open={listLandOpen} onOpenChange={setListLandOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>List Land for Sale</DialogTitle>
            <DialogDescription>
              Set a price to list your land in the marketplace
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleListLand} className="space-y-4">
            <div>
              <Label htmlFor="price">Price (ETH)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={listPrice}
                onChange={(e) => setListPrice(e.target.value)}
                placeholder="Enter price in ETH"
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Listing...
                </>
              ) : (
                <>
                  <DollarSign className="h-4 w-4 mr-2" />
                  List Land
                </>
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Flag Dispute Dialog */}
      <Dialog open={flagDisputeOpen} onOpenChange={setFlagDisputeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Flag Land Dispute</DialogTitle>
            <DialogDescription>
              Provide evidence to flag a dispute for this land
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleFlagDispute} className="space-y-4">
            <div>
              <Label htmlFor="evidence">Evidence Hash</Label>
              <Textarea
                id="evidence"
                value={evidenceHash}
                onChange={(e) => setEvidenceHash(e.target.value)}
                placeholder="Enter evidence hash or IPFS CID"
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Flagging...
                </>
              ) : (
                <>
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Flag Dispute
                </>
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default CitizenDashboard;