import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import DashboardLayout from "@/components/DashboardLayout";
import { MapPin, Users, FileText, Plus, Upload, Check, Clock, AlertTriangle, Loader2, Wallet } from "lucide-react";
import { useWeb3, LandLayout } from "@/contexts/Web3Context";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

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
    createLandLayout,
    addSteward,
    removeSteward
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
    if (isConnected && user?.role === 'admin') {
      loadAdminData();
    }
  }, [isConnected, user]);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/lands');
      setAllLands(response.data);
    } catch (error) {
      console.error('Error loading admin data:', error);
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLandLayout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!landCode || !layoutUrl) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      await createLandLayout(landCode, layoutUrl);
      toast.success('Land layout created successfully');
      setCreateLayoutOpen(false);
      loadAdminData();
      resetForm();
    } catch (error) {
      console.error('Error creating land layout:', error);
      toast.error('Failed to create land layout');
    } finally {
      setLoading(false);
    }
  };

  const handleGrantRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetAddress || !selectedRole) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      if (selectedRole === 'resolver') {
        await addSteward(targetAddress);
        toast.success('Resolver role granted successfully');
      }
      setGrantRoleOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error granting role:', error);
      toast.error('Failed to grant role');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setLandCode('');
    setLayoutUrl('');
    setTargetAddress('');
    setSelectedRole('');
  };

  if (!isConnected || user?.role !== 'admin') {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-screen">
          <AlertTriangle className="h-16 w-16 text-yellow-500 mb-4" />
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-gray-600">You must be connected and have admin role to access this page.</p>
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
              <CardTitle>Total Lands</CardTitle>
              <CardDescription>Number of registered lands</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span className="text-2xl font-bold">{allLands.length}</span>
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
                  <CardDescription>Manage land records and operations</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Dialog open={createLayoutOpen} onOpenChange={setCreateLayoutOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Layout
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create Land Layout</DialogTitle>
                        <DialogDescription>
                          Add a new land layout to the system
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleCreateLandLayout} className="space-y-4">
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
                              Create Layout
                            </>
                          )}
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>

                  <Dialog open={grantRoleOpen} onOpenChange={setGrantRoleOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Users className="h-4 w-4 mr-2" />
                        Grant Role
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Grant Role</DialogTitle>
                        <DialogDescription>
                          Grant roles to users in the system
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleGrantRole} className="space-y-4">
                        <div>
                          <Label htmlFor="address">User Address</Label>
                          <Input
                            id="address"
                            value={targetAddress}
                            onChange={(e) => setTargetAddress(e.target.value)}
                            placeholder="Enter user's address"
                          />
                        </div>
                        <div>
                          <Label htmlFor="role">Role</Label>
                          <select
                            id="role"
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value)}
                            className="w-full px-3 py-2 border rounded-md"
                          >
                            <option value="">Select role</option>
                            <option value="resolver">Resolver</option>
                          </select>
                        </div>
                        <Button type="submit" disabled={loading}>
                          {loading ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Granting...
                            </>
                          ) : (
                            <>
                              <Check className="h-4 w-4 mr-2" />
                              Grant Role
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
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="listed">Listed Lands</TabsTrigger>
                  <TabsTrigger value="registered">Registered Lands</TabsTrigger>
                </TabsList>
                <TabsContent value="overview">
                  {loading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {allLands.map((land, index) => (
                        <Card key={index}>
                          <CardContent className="pt-6">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-semibold">Land Code: {land.landCode}</h3>
                                <p className="text-sm text-gray-500">Owner: {land.landOwner}</p>
                              </div>
                              <Badge variant={land.inDispute ? "destructive" : "outline"}>
                                {land.inDispute ? "Disputed" : "Clear"}
                              </Badge>
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
    </DashboardLayout>
  );
};

export default AdminDashboard;