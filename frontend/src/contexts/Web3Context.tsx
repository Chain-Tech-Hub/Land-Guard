import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ethers } from 'ethers';
import { toast } from 'sonner';

// Contract ABIs
import LandTokenABI from '../contracts/LandToken.json';
import LandRegistryABI from '../contracts/LandRegistry.json';

// Contract addresses (update these with your deployed addresses)
const CONTRACTS = {
  LAND_TOKEN: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
  LAND_REGISTRY: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512', // Update with actual address
};

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
  // Connection state
  provider: ethers.BrowserProvider | null;
  signer: ethers.JsonRpcSigner | null;
  account: string | null;
  chainId: number | null;
  isConnected: boolean;
  isLoading: boolean;

  // Contracts
  landTokenContract: ethers.Contract | null;
  landRegistryContract: ethers.Contract | null;

  // Connection methods
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  switchNetwork: (chainId: number) => Promise<void>;

  // Contract methods
  createLandLayout: (landCode: string, layoutUrl: string) => Promise<void>;
  registerLand: (landId: number, landOwner: string) => Promise<void>;
  mintTitleDeed: (landId: number, titleDeedUrl: string) => Promise<void>;
  listLand: (landId: number, price: string) => Promise<void>;
  buyLand: (landId: number, price: string) => Promise<void>;
  unlistLand: (landId: number) => Promise<void>;
  getLandLayout: (landId: number) => Promise<LandLayout | null>;
  getListedLands: () => Promise<LandLayout[]>;
  getOwnerDeeds: (owner: string) => Promise<number[]>;
  flagConflict: (tokenId: number, evidenceHash: string) => Promise<void>;
  resolveConflict: (tokenId: number, rightfulOwner: string, signatures: string[]) => Promise<void>;

  // Utility methods
  formatEther: (value: string) => string;
  parseEther: (value: string) => string;
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
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [landTokenContract, setLandTokenContract] = useState<ethers.Contract | null>(null);
  const [landRegistryContract, setLandRegistryContract] = useState<ethers.Contract | null>(null);

  // Initialize contracts when signer is available
  useEffect(() => {
    if (signer) {
      const landToken = new ethers.Contract(CONTRACTS.LAND_TOKEN, LandTokenABI, signer);
      const landRegistry = new ethers.Contract(CONTRACTS.LAND_REGISTRY, LandRegistryABI, signer);
      
      setLandTokenContract(landToken);
      setLandRegistryContract(landRegistry);
    } else {
      setLandTokenContract(null);
      setLandRegistryContract(null);
    }
  }, [signer]);

  // Check if wallet is already connected
  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.listAccounts();
        
        if (accounts.length > 0) {
          const signer = await provider.getSigner();
          const network = await provider.getNetwork();
          
          setProvider(provider);
          setSigner(signer);
          setAccount(accounts[0].address);
          setChainId(Number(network.chainId));
          setIsConnected(true);
        }
      } catch (error) {
        console.error('Error checking connection:', error);
      }
    }
  };

  const connectWallet = async () => {
    if (typeof window.ethereum === 'undefined') {
      toast.error('MetaMask is not installed. Please install MetaMask to continue.');
      return;
    }

    setIsLoading(true);
    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const network = await provider.getNetwork();
      const address = await signer.getAddress();

      setProvider(provider);
      setSigner(signer);
      setAccount(address);
      setChainId(Number(network.chainId));
      setIsConnected(true);

      toast.success('Wallet connected successfully!');
    } catch (error: any) {
      console.error('Error connecting wallet:', error);
      toast.error('Failed to connect wallet: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectWallet = () => {
    setProvider(null);
    setSigner(null);
    setAccount(null);
    setChainId(null);
    setIsConnected(false);
    setLandTokenContract(null);
    setLandRegistryContract(null);
    toast.success('Wallet disconnected');
  };

  const switchNetwork = async (targetChainId: number) => {
    if (!window.ethereum) return;

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${targetChainId.toString(16)}` }],
      });
    } catch (error: any) {
      if (error.code === 4902) {
        // Network not added to MetaMask
        toast.error('Please add the network to MetaMask manually');
      } else {
        toast.error('Failed to switch network');
      }
    }
  };

  // Contract interaction methods
  const createLandLayout = async (landCode: string, layoutUrl: string) => {
    if (!landTokenContract) throw new Error('Contract not initialized');
    
    try {
      const tx = await landTokenContract.createLandLayout(landCode, layoutUrl);
      await tx.wait();
      toast.success('Land layout created successfully!');
    } catch (error: any) {
      console.error('Error creating land layout:', error);
      toast.error('Failed to create land layout: ' + error.message);
      throw error;
    }
  };

  const registerLand = async (landId: number, landOwner: string) => {
    if (!landTokenContract) throw new Error('Contract not initialized');
    
    try {
      const tx = await landTokenContract.landRegistration(landId, landOwner);
      await tx.wait();
      toast.success('Land registered successfully!');
    } catch (error: any) {
      console.error('Error registering land:', error);
      toast.error('Failed to register land: ' + error.message);
      throw error;
    }
  };

  const mintTitleDeed = async (landId: number, titleDeedUrl: string) => {
    if (!landTokenContract) throw new Error('Contract not initialized');
    
    try {
      const tx = await landTokenContract.mintTitleDeed(landId, titleDeedUrl);
      await tx.wait();
      toast.success('Title deed minted successfully!');
    } catch (error: any) {
      console.error('Error minting title deed:', error);
      toast.error('Failed to mint title deed: ' + error.message);
      throw error;
    }
  };

  const listLand = async (landId: number, price: string) => {
    if (!landTokenContract) throw new Error('Contract not initialized');
    
    try {
      const priceInWei = ethers.parseEther(price);
      const tx = await landTokenContract.listLand(landId, priceInWei);
      await tx.wait();
      toast.success('Land listed for sale successfully!');
    } catch (error: any) {
      console.error('Error listing land:', error);
      toast.error('Failed to list land: ' + error.message);
      throw error;
    }
  };

  const buyLand = async (landId: number, price: string) => {
    if (!landTokenContract) throw new Error('Contract not initialized');
    
    try {
      const priceInWei = ethers.parseEther(price);
      const tx = await landTokenContract.buyLand(landId, { value: priceInWei });
      await tx.wait();
      toast.success('Land purchased successfully!');
    } catch (error: any) {
      console.error('Error buying land:', error);
      toast.error('Failed to buy land: ' + error.message);
      throw error;
    }
  };

  const unlistLand = async (landId: number) => {
    if (!landTokenContract) throw new Error('Contract not initialized');
    
    try {
      const tx = await landTokenContract.unlistLand(landId);
      await tx.wait();
      toast.success('Land unlisted successfully!');
    } catch (error: any) {
      console.error('Error unlisting land:', error);
      toast.error('Failed to unlist land: ' + error.message);
      throw error;
    }
  };

  const getLandLayout = async (landId: number): Promise<LandLayout | null> => {
    if (!landTokenContract) throw new Error('Contract not initialized');
    
    try {
      const result = await landTokenContract.getLandLayout(landId);
      return {
        landCode: result.landCode,
        layoutUrl: result.layoutUrl,
        landOwner: result.landOwner,
        titleDeedUrl: result.titleDeedUrl,
        landStatus: result.landStatus,
        landValue: ethers.formatEther(result.landValue),
        inDispute: result.inDispute,
      };
    } catch (error: any) {
      console.error('Error getting land layout:', error);
      return null;
    }
  };

  const getListedLands = async (): Promise<LandLayout[]> => {
    if (!landTokenContract) throw new Error('Contract not initialized');
    
    try {
      const results = await landTokenContract.getListedLands();
      return results.map((result: any) => ({
        landCode: result.landCode,
        layoutUrl: result.layoutUrl,
        landOwner: result.landOwner,
        titleDeedUrl: result.titleDeedUrl,
        landStatus: result.landStatus,
        landValue: ethers.formatEther(result.landValue),
        inDispute: result.inDispute,
      }));
    } catch (error: any) {
      console.error('Error getting listed lands:', error);
      return [];
    }
  };

  const getOwnerDeeds = async (owner: string): Promise<number[]> => {
    if (!landTokenContract) throw new Error('Contract not initialized');
    
    try {
      const results = await landTokenContract.getOwnerDeeds(owner);
      return results.map((id: any) => Number(id));
    } catch (error: any) {
      console.error('Error getting owner deeds:', error);
      return [];
    }
  };

  const flagConflict = async (tokenId: number, evidenceHash: string) => {
    if (!landRegistryContract) throw new Error('Registry contract not initialized');
    
    try {
      const tx = await landRegistryContract.flagConflict(tokenId, evidenceHash);
      await tx.wait();
      toast.success('Conflict flagged successfully!');
    } catch (error: any) {
      console.error('Error flagging conflict:', error);
      toast.error('Failed to flag conflict: ' + error.message);
      throw error;
    }
  };

  const resolveConflict = async (tokenId: number, rightfulOwner: string, signatures: string[]) => {
    if (!landRegistryContract) throw new Error('Registry contract not initialized');
    
    try {
      const tx = await landRegistryContract.resolveConflict(tokenId, rightfulOwner, signatures);
      await tx.wait();
      toast.success('Conflict resolved successfully!');
    } catch (error: any) {
      console.error('Error resolving conflict:', error);
      toast.error('Failed to resolve conflict: ' + error.message);
      throw error;
    }
  };

  const formatEther = (value: string): string => {
    return ethers.formatEther(value);
  };

  const parseEther = (value: string): string => {
    return ethers.parseEther(value).toString();
  };

  // Listen for account changes
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          setAccount(accounts[0]);
        }
      });

      window.ethereum.on('chainChanged', (chainId: string) => {
        setChainId(parseInt(chainId, 16));
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
      }
    };
  }, []);

  const value: Web3ContextType = {
    provider,
    signer,
    account,
    chainId,
    isConnected,
    isLoading,
    landTokenContract,
    landRegistryContract,
    connectWallet,
    disconnectWallet,
    switchNetwork,
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
    resolveConflict,
    formatEther,
    parseEther,
  };

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
};

// Extend Window interface for TypeScript
declare global {
  interface Window {
    ethereum?: any;
  }
}