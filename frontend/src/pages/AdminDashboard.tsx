import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import DashboardLayout from "@/components/DashboardLayout";
import Web3Connection from "@/components/Web3Connection";
import { MapPin, Users, FileText, Plus, Upload, Check, Clock, AlertTriangle, Loader2, Wallet } from "lucide-react";
import { useWeb3, LandLayout } from "@/contexts/Web3Context";
import { toast } from "sonner";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [allLands, setAllLands] = useState<LandLayout[]>([]);
  const [loading, setLoading] = useState(false);
  const [createLayoutOpen, setCreateLayoutOpen] = useState(false);
  const [grantRoleOpen, setGrantRoleOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState("");
  const [targetAddress, setTargetAddress] = useState("");
  
  // Form states
  const [landCode, setLandCode] = useState("");
  const [layoutUrl, setLayoutUrl] = useState("");

  const {
    account,
    isConnected,
    landTokenContract,
    createLandLayout,
    getListedLands,
    formatEther
  } = useWeb3();

  useEffect(() => {
    if (isConnected && account) {
      loadAdminData();
    }
  }, [isConnected, account]);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const listed = await getListedLands();
      setAllLands(listed);
    } catch (error) {
      console.error('Error loading admin data:', error);
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLayout = async () => {
    if (!landCode || !layoutUrl) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      await createLandLayout(landCode, layoutUrl);
      setCreateLayoutOpen(false);
      setLandCode("");
      setLayoutUrl("");
      await loadAdminData();
    } catch (error) {
      console.error('Error creating layout:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGrantRole = async () => {
    if (!landTokenContract || !selectedRole || !targetAddress) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      // Get role hash based on selection
      let roleHash;
      switch (selectedRole) {
        case 'admin':
          roleHash = await landTokenContract.LAND_ADMIN_ROLE();
          break;
        case 'minter':
          roleHash = await landTokenContract.MINTER_ROLE();
          break;
        case 'resolver':
          roleHash = await landTokenContract.RESOLVER_ROLE();
          break;
        default:
          throw new Error('Invalid role selected');
      }

      const tx = await landTokenContract.grantRole(roleHash, targetAddress);
      await tx.wait();
      
      toast.success(`${selectedRole} role granted successfully!`);
      setGrantRoleOpen(false);
      setSelectedRole("");
      setTargetAddress("");
    } catch (error: any) {
      console.error('Error granting role:', error);
      toast.error('Failed to grant role: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePauseContract = async () => {
    if (!landTokenContract) return;

    setLoading(true);
    try {
      const tx = await landTokenContract.pause();
      await tx.wait();
      toast.success('Contract paused successfully!');
    } catch (error: any) {
      console.error('Error pausing contract:', error);
      toast.error('Failed to pause contract: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUnpauseContract = async () => {
    if (!landTokenContract) return;

    setLoading(true);
    try {
      const tx = await landTokenContract.unpause();
      await tx.wait();
      toast.success('Contract unpaused successfully!');
    } catch (error: any) {
      console.error('Error unpausing contract:', error);
      toast.error('Failed to unpause contract: ' + error.message);
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
        title="Land Administrator Dashboard"
        description="Connect your wallet to manage the LandGuard system"
      >
        <div className="flex justify-center items-center min-h-[400px]">
          <Web3Connection />
        </div>
      </DashboardLayout>
    );
  }

  const totalLands = allLands.length;
  const activeLands = allLands.filter(land => land.landStatus === 1).length;
  const listedLands = allLands.filter(land => land.landStatus === 2).length;
  const disputedLands = allLands.filter(land => land.inDispute).length;

  const actions = (
    <>
      <Dialog open={createLayoutOpen} onOpenChange={setCreateLayoutOpen}>
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
              Create a new land layout for registration
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
            <Button onClick={handleCreateLayout} disabled={loading} className="w-full">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Layout
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={grantRoleOpen} onOpenChange={setGrantRoleOpen}>
        <DialogTrigger asChild>
          <Button variant="outline">
            <Users className="h-4 w-4 mr-2" />
            Grant Role
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Grant Role</DialogTitle>
            <DialogDescription>
              Grant administrative roles to other addresses
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="role">Role</Label>
              <select
                id="role"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Select a role</option>
                <option value="admin">Land Admin</option>
                <option value="minter">Minter</option>
                <option value="resolver">Resolver</option>
              </select>
            </div>
            <div>
              <Label htmlFor="address">Target Address</Label>
              <Input
                id="address"
                value={targetAddress}
                onChange={(e) => setTargetAddress(e.target.value)}
                placeholder="0x..."
              />
            </div>
            <Button onClick={handleGrantRole} disabled={loading} className="w-full">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Grant Role
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );

  return (
    <DashboardLayout
      title="Land Administrator Dashboard" 
      description="Manage land layouts, registrations, and system operations"
      actions={actions}
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="lands">All Lands</TabsTrigger>
          <TabsTrigger value="system">System Control</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Wallet Connection Status */}
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                Admin Wallet Status
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
                <Badge className="bg-green-500 text-white">Admin Connected</Badge>
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
                <div className="text-2xl font-bold">{totalLands}</div>
                <p className="text-xs text-muted-foreground">{activeLands} active</p>
              </CardContent>
            </Card>

            <Card className="shadow-soft">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Listed for Sale</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{listedLands}</div>
                <p className="text-xs text-muted-foreground">Available in marketplace</p>
              </CardContent>
            </Card>

            <Card className="shadow-soft">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Disputes</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{disputedLands}</div>
                <p className="text-xs text-muted-foreground">Requires resolution</p>
              </CardContent>
            </Card>

            <Card className="shadow-soft">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">System Status</CardTitle>
                <Check className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Active</div>
                <p className="text-xs text-muted-foreground">All systems operational</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle>System Overview</CardTitle>
              <CardDescription>Current state of the LandGuard system</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="text-sm font-medium">Contract Status</p>
                    <p className="text-xs text-muted-foreground">Smart contracts are operational</p>
                  </div>
                  <Badge className="bg-green-500 text-white">Active</Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="text-sm font-medium">Total Value Locked</p>
                    <p className="text-xs text-muted-foreground">
                      {allLands.reduce((sum, land) => sum + parseFloat(land.landValue), 0).toFixed(2)} ETH
                    </p>
                  </div>
                  <Badge className="bg-blue-500 text-white">Tracked</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lands" className="space-y-6">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : allLands.length === 0 ? (
            <Card className="shadow-soft">
              <CardContent className="text-center py-12">
                <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Lands Found</h3>
                <p className="text-muted-foreground">
                  No land parcels have been created yet
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {allLands.map((land, index) => (
                <Card key={index} className="shadow-soft">
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
                        {land.inDispute && (
                          <Badge className="bg-red-500 text-white">DISPUTED</Badge>
                        )}
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
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle>System Controls</CardTitle>
              <CardDescription>Administrative controls for the LandGuard system</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <Button 
                  onClick={handlePauseContract}
                  disabled={loading}
                  variant="outline"
                  className="border-red-500 text-red-500 hover:bg-red-50"
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Pause Contract
                </Button>
                
                <Button 
                  onClick={handleUnpauseContract}
                  disabled={loading}
                  className="bg-green-500 hover:bg-green-600 text-white"
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Check className="h-4 w-4 mr-2" />
                  Unpause Contract
                </Button>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">Emergency Functions</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Use these functions only in emergency situations
                </p>
                <Button 
                  variant="outline"
                  className="border-orange-500 text-orange-500 hover:bg-orange-50"
                  disabled={loading}
                >
                  Emergency Withdraw
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle>System Analytics</CardTitle>
              <CardDescription>Insights and metrics for the LandGuard platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-4">Land Status Distribution</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Active</span>
                      <span className="text-sm font-bold">{activeLands}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Listed</span>
                      <span className="text-sm font-bold">{listedLands}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Disputed</span>
                      <span className="text-sm font-bold">{disputedLands}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-4">Value Metrics</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Total Value</span>
                      <span className="text-sm font-bold">
                        {allLands.reduce((sum, land) => sum + parseFloat(land.landValue), 0).toFixed(2)} ETH
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Average Value</span>
                      <span className="text-sm font-bold">
                        {totalLands > 0 
                          ? (allLands.reduce((sum, land) => sum + parseFloat(land.landValue), 0) / totalLands).toFixed(2)
                          : '0.00'
                        } ETH
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default AdminDashboard;