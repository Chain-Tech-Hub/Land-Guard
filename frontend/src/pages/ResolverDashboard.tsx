import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import DashboardLayout from "@/components/DashboardLayout";
import Web3Connection from "@/components/Web3Connection";
import { AlertTriangle, FileText, Users, Clock, Upload, Check, Eye, Loader2, Wallet } from "lucide-react";
import { useWeb3, LandLayout } from "@/contexts/Web3Context";
import { toast } from "sonner";

const ResolverDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [disputedLands, setDisputedLands] = useState<LandLayout[]>([]);
  const [loading, setLoading] = useState(false);
  const [resolveDisputeOpen, setResolveDisputeOpen] = useState(false);
  const [selectedLandId, setSelectedLandId] = useState<number | null>(null);
  const [rightfulOwner, setRightfulOwner] = useState("");
  const [signatures, setSignatures] = useState<string[]>([]);
  const [signatureInput, setSignatureInput] = useState("");

  const {
    account,
    isConnected,
    landRegistryContract,
    getListedLands,
    resolveConflict
  } = useWeb3();

  useEffect(() => {
    if (isConnected && account) {
      loadDisputeData();
    }
  }, [isConnected, account]);

  const loadDisputeData = async () => {
    setLoading(true);
    try {
      // Get all lands and filter disputed ones
      const allLands = await getListedLands();
      const disputed = allLands.filter(land => land.inDispute);
      setDisputedLands(disputed);
    } catch (error) {
      console.error('Error loading dispute data:', error);
      toast.error('Failed to load dispute data');
    } finally {
      setLoading(false);
    }
  };

  const handleResolveDispute = async () => {
    if (!selectedLandId || !rightfulOwner || signatures.length === 0) {
      toast.error('Please provide all required information');
      return;
    }

    setLoading(true);
    try {
      await resolveConflict(selectedLandId, rightfulOwner, signatures);
      setResolveDisputeOpen(false);
      setSelectedLandId(null);
      setRightfulOwner("");
      setSignatures([]);
      setSignatureInput("");
      await loadDisputeData();
    } catch (error) {
      console.error('Error resolving dispute:', error);
    } finally {
      setLoading(false);
    }
  };

  const addSignature = () => {
    if (signatureInput.trim()) {
      setSignatures([...signatures, signatureInput.trim()]);
      setSignatureInput("");
    }
  };

  const removeSignature = (index: number) => {
    setSignatures(signatures.filter((_, i) => i !== index));
  };

  const checkStewardRole = async () => {
    if (!landRegistryContract || !account) return false;
    
    try {
      const stewardRole = await landRegistryContract.STEWARD_ROLE();
      const hasRole = await landRegistryContract.hasRole(stewardRole, account);
      return hasRole;
    } catch (error) {
      console.error('Error checking steward role:', error);
      return false;
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
        title="Dispute Resolver Dashboard"
        description="Connect your wallet to resolve land disputes"
      >
        <div className="flex justify-center items-center min-h-[400px]">
          <Web3Connection />
        </div>
      </DashboardLayout>
    );
  }

  const totalDisputes = disputedLands.length;
  const highPriorityDisputes = disputedLands.filter(land => parseFloat(land.landValue) > 1).length;

  const actions = (
    <>
      <Button className="bg-gradient-secondary border-0">
        <FileText className="h-4 w-4 mr-2" />
        Generate Report
      </Button>
      <Button variant="outline">
        <Users className="h-4 w-4 mr-2" />
        Steward Panel
      </Button>
    </>
  );

  return (
    <DashboardLayout
      title="Dispute Resolver Dashboard"
      description="Review conflicts, evaluate evidence, and coordinate resolution processes"
      actions={actions}
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="disputes">Active Disputes</TabsTrigger>
          <TabsTrigger value="evidence">Evidence Review</TabsTrigger>
          <TabsTrigger value="resolutions">Resolutions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Wallet Connection Status */}
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                Resolver Wallet Status
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
                <Badge className="bg-green-500 text-white">Resolver Connected</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="shadow-soft">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Disputes</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalDisputes}</div>
                <p className="text-xs text-muted-foreground">{highPriorityDisputes} high value</p>
              </CardContent>
            </Card>

            <Card className="shadow-soft">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Value</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {disputedLands.reduce((sum, land) => sum + parseFloat(land.landValue), 0).toFixed(2)} ETH
                </div>
                <p className="text-xs text-muted-foreground">In disputed lands</p>
              </CardContent>
            </Card>

            <Card className="shadow-soft">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Resolution Rate</CardTitle>
                <Check className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">85%</div>
                <p className="text-xs text-muted-foreground">Success rate</p>
              </CardContent>
            </Card>

            <Card className="shadow-soft">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Resolution Time</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">7.2</div>
                <p className="text-xs text-muted-foreground">Days</p>
              </CardContent>
            </Card>
          </div>

          {/* Priority Disputes */}
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle>High Priority Disputes</CardTitle>
              <CardDescription>Cases requiring immediate attention</CardDescription>
            </CardHeader>
            <CardContent>
              {disputedLands.length === 0 ? (
                <div className="text-center py-8">
                  <Check className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Active Disputes</h3>
                  <p className="text-muted-foreground">
                    All land disputes have been resolved
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {disputedLands.slice(0, 3).map((land, index) => (
                    <div key={index} className="border border-red-200 rounded-lg p-4 bg-red-50">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-semibold">Land Code: {land.landCode}</h4>
                          <p className="text-sm text-muted-foreground">
                            Owner: {land.landOwner.slice(0, 6)}...{land.landOwner.slice(-4)}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Badge className="bg-red-500 text-white">HIGH PRIORITY</Badge>
                          <Badge className="bg-red-500 text-white">DISPUTED</Badge>
                        </div>
                      </div>
                      <p className="text-sm mb-3">
                        Value: {land.landValue} ETH - Requires immediate resolution
                      </p>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            setSelectedLandId(index + 1);
                            setResolveDisputeOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Review Case
                        </Button>
                        <Button 
                          size="sm" 
                          className="bg-blue-500 text-white"
                          onClick={() => {
                            setSelectedLandId(index + 1);
                            setResolveDisputeOpen(true);
                          }}
                        >
                          Begin Resolution
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="disputes" className="space-y-6">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : disputedLands.length === 0 ? (
            <Card className="shadow-soft">
              <CardContent className="text-center py-12">
                <Check className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Active Disputes</h3>
                <p className="text-muted-foreground">
                  All land disputes have been resolved
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {disputedLands.map((land, index) => (
                <Card key={index} className="shadow-soft hover:shadow-medium transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">Land Code: {land.landCode}</CardTitle>
                        <CardDescription>
                          Owner: {land.landOwner.slice(0, 6)}...{land.landOwner.slice(-4)}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Badge className={getStatusColor(land.landStatus)}>
                          {getStatusText(land.landStatus)}
                        </Badge>
                        <Badge className="bg-red-500 text-white">DISPUTED</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-3 gap-4 mb-4">
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
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Layout URL</p>
                        <p className="text-sm truncate">{land.layoutUrl}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          setSelectedLandId(index + 1);
                          setResolveDisputeOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                      <Button 
                        size="sm" 
                        className="bg-green-500 text-white"
                        onClick={() => {
                          setSelectedLandId(index + 1);
                          setResolveDisputeOpen(true);
                        }}
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Resolve Dispute
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="evidence" className="space-y-6">
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle>Evidence Review Panel</CardTitle>
              <CardDescription>Analyze submitted evidence for dispute resolution</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Evidence Review System</h3>
                <p className="text-muted-foreground mb-4">
                  Evidence review functionality will be integrated with IPFS storage
                </p>
                <Button className="bg-gradient-primary border-0">
                  Access Evidence Portal
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resolutions" className="space-y-6">
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle>Resolution History</CardTitle>
              <CardDescription>Track completed dispute resolutions and outcomes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Check className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Resolution History</h3>
                <p className="text-muted-foreground mb-4">
                  Completed resolutions will be displayed here
                </p>
                <Button className="bg-gradient-primary border-0">
                  View All Resolutions
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Resolve Dispute Dialog */}
      <Dialog open={resolveDisputeOpen} onOpenChange={setResolveDisputeOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Resolve Land Dispute</DialogTitle>
            <DialogDescription>
              Provide the rightful owner and required signatures to resolve this dispute
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="rightfulOwner">Rightful Owner Address</Label>
              <Input
                id="rightfulOwner"
                value={rightfulOwner}
                onChange={(e) => setRightfulOwner(e.target.value)}
                placeholder="0x..."
              />
            </div>
            
            <div>
              <Label>Steward Signatures</Label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    value={signatureInput}
                    onChange={(e) => setSignatureInput(e.target.value)}
                    placeholder="Enter signature..."
                  />
                  <Button onClick={addSignature} variant="outline">
                    Add
                  </Button>
                </div>
                
                {signatures.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Added Signatures:</p>
                    {signatures.map((sig, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                        <span className="text-sm font-mono truncate">{sig}</span>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => removeSignature(index)}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <Button 
              onClick={handleResolveDispute} 
              disabled={loading || !rightfulOwner || signatures.length === 0}
              className="w-full"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Resolve Dispute
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default ResolverDashboard;