import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import DashboardLayout from "@/components/DashboardLayout";
import { AlertTriangle, FileText, CheckCircle, Loader2, XCircle } from "lucide-react";
import { useWeb3, LandLayout } from "@/contexts/Web3Context";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const ResolverDashboard = () => {
  const [disputedLands, setDisputedLands] = useState<LandLayout[]>([]);
  const [loading, setLoading] = useState(false);
  const [resolveOpen, setResolveOpen] = useState(false);
  const [selectedLandId, setSelectedLandId] = useState<number | null>(null);
  const [rightfulOwner, setRightfulOwner] = useState("");

  const {
    account,
    isConnected,
    resolveConflict
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
    if (isConnected && user?.role === 'resolver') {
      loadDisputedLands();
    }
  }, [isConnected, user]);

  const loadDisputedLands = async () => {
    setLoading(true);
    try {
      const response = await api.get('/lands/disputed');
      setDisputedLands(response.data);
    } catch (error) {
      console.error('Error loading disputed lands:', error);
      toast.error('Failed to load disputed lands');
    } finally {
      setLoading(false);
    }
  };

  const handleResolveDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLandId || !rightfulOwner) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      await resolveConflict(selectedLandId, rightfulOwner);
      toast.success('Dispute resolved successfully');
      setResolveOpen(false);
      loadDisputedLands();
      setRightfulOwner('');
      setSelectedLandId(null);
    } catch (error) {
      console.error('Error resolving dispute:', error);
      toast.error('Failed to resolve dispute');
    } finally {
      setLoading(false);
    }
  };

  if (!isConnected || user?.role !== 'resolver') {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-screen">
          <AlertTriangle className="h-16 w-16 text-yellow-500 mb-4" />
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-gray-600">You must be connected and have resolver role to access this page.</p>
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
              <CardTitle>Disputed Lands</CardTitle>
              <CardDescription>Number of lands under dispute</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-2xl font-bold">{disputedLands.length}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Disputed Land Management</CardTitle>
              <CardDescription>Manage and resolve land disputes</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <div className="grid gap-4">
                  {disputedLands.map((land, index) => (
                    <Card key={index}>
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold">Land Code: {land.landCode}</h3>
                            <p className="text-sm text-gray-500 mt-1">Owner: {land.landOwner}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => {
                                setSelectedLandId(index);
                                setResolveOpen(true);
                              }}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Resolve
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Resolve Dispute Dialog */}
      <Dialog open={resolveOpen} onOpenChange={setResolveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resolve Land Dispute</DialogTitle>
            <DialogDescription>
              Determine the rightful owner of the disputed land
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleResolveDispute} className="space-y-4">
            <div>
              <Label htmlFor="owner">Rightful Owner Address</Label>
              <Input
                id="owner"
                value={rightfulOwner}
                onChange={(e) => setRightfulOwner(e.target.value)}
                placeholder="Enter rightful owner's address"
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Resolving...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Resolve Dispute
                </>
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default ResolverDashboard;