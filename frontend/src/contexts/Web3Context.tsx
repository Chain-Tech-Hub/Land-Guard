import React, { createContext, useContext, useState, ReactNode } from 'react';
import axios from 'axios';
import { toast } from 'sonner';

const API_BASE_URL = process.env.VITE_APP_API_URL || 'http://localhost:3001/api';

export interface LandLayout {
  landCode: string;
  layoutUrl: string;
  landOwner: string;
  titleDeedUrl: string;
  landStatus: number;
  landValue: string;
  inDispute: boolean;
}

interface Web3ContextType {
  // User state
  account: string | null;
  isConnected: boolean;
  isLoading: boolean;

  // Connection methods
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;

  // Land management methods
  createLandLayout: (landCode: string, layoutUrl: string) => Promise<void>;
  registerLand: (landId: number, landOwner: string) => Promise<void>;
  mintTitleDeed: (landId: number, titleDeedUrl: string) => Promise<void>;
  listLand: (landId: number, price: string) => Promise<void>;
  buyLand: (landId: number, price: string) => Promise<void>;
  unlistLand: (landId: number) => Promise<void>;
  getLandLayout: (landId: number) => Promise<LandLayout | null>;

  // Admin methods
  addSteward: (address: string) => Promise<void>;
  removeSteward: (address: string) => Promise<void>;

  // Dispute resolution
  flagConflict: (landId: number, evidenceHash: string) => Promise<void>;
  resolveConflict: (landId: number, rightfulOwner: string) => Promise<void>;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};

interface Web3ProviderProps {
  children: ReactNode;
}

export const Web3Provider: React.FC<Web3ProviderProps> = ({ children }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // API helpers
  const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json'
    }
  });

  // Update authorization header when account changes
  api.interceptors.request.use((config) => {
    if (account) {
      config.headers['Authorization'] = `Bearer ${account}`;
    }
    return config;
  });

  const handleError = (error: any) => {
    console.error('Error:', error);
    toast.error(error.response?.data?.message || error.message || 'Operation failed');
    throw error;
  };

  // Connection methods
  const connectWallet = async () => {
    try {
      setIsLoading(true);
      const response = await api.post('/auth/connect');
      setAccount(response.data.address);
      setIsConnected(true);
      toast.success('Connected successfully');
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setIsConnected(false);
    toast.info('Disconnected');
  };

  // Land management methods
  const createLandLayout = async (landCode: string, layoutUrl: string) => {
    try {
      setIsLoading(true);
      await api.post('/lands/create', { landCode, layoutUrl });
      toast.success('Land layout created successfully');
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const registerLand = async (landId: number, landOwner: string) => {
    try {
      setIsLoading(true);
      await api.post('/lands/register', { landId, landOwner });
      toast.success('Land registered successfully');
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const mintTitleDeed = async (landId: number, titleDeedUrl: string) => {
    try {
      setIsLoading(true);
      await api.post('/lands/mint-deed', { landId, titleDeedUrl });
      toast.success('Title deed minted successfully');
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const listLand = async (landId: number, price: string) => {
    try {
      setIsLoading(true);
      await api.post('/lands/list', { landId, price });
      toast.success('Land listed for sale successfully');
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const buyLand = async (landId: number, price: string) => {
    try {
      setIsLoading(true);
      await api.post('/lands/buy', { landId, price });
      toast.success('Land purchased successfully');
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const unlistLand = async (landId: number) => {
    try {
      setIsLoading(true);
      await api.post('/lands/unlist', { landId });
      toast.success('Land unlisted successfully');
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const getLandLayout = async (landId: number) => {
    try {
      setIsLoading(true);
      const response = await api.get(`/lands/${landId}`);
      return response.data;
    } catch (error) {
      handleError(error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Admin methods
  const addSteward = async (address: string) => {
    try {
      setIsLoading(true);
      await api.post('/admin/stewards', { address });
      toast.success('Steward added successfully');
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const removeSteward = async (address: string) => {
    try {
      setIsLoading(true);
      await api.delete(`/admin/stewards/${address}`);
      toast.success('Steward removed successfully');
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Dispute resolution
  const flagConflict = async (landId: number, evidenceHash: string) => {
    try {
      setIsLoading(true);
      await api.post('/lands/conflicts', { landId, evidenceHash });
      toast.success('Conflict flagged successfully');
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const resolveConflict = async (landId: number, rightfulOwner: string) => {
    try {
      setIsLoading(true);
      await api.post(`/lands/conflicts/${landId}/resolve`, { rightfulOwner });
      toast.success('Conflict resolved successfully');
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    account,
    isConnected,
    isLoading,
    connectWallet,
    disconnectWallet,
    createLandLayout,
    registerLand,
    mintTitleDeed,
    listLand,
    buyLand,
    unlistLand,
    getLandLayout,
    addSteward,
    removeSteward,
    flagConflict,
    resolveConflict
  };

  return (
    <Web3Context.Provider value={value}>
      {children}
    </Web3Context.Provider>
  );
};