import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, WifiOff, AlertCircle } from 'lucide-react';
import { useWeb3 } from '@/contexts/Web3Context';

export const Web3Connection: React.FC = () => {
  const { 
    account, 
    chainId, 
    isConnected, 
    isLoading, 
    connectWallet, 
    disconnectWallet,
    switchNetwork 
  } = useWeb3();

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getNetworkName = (chainId: number) => {
    switch (chainId) {
      case 1:
        return 'Ethereum Mainnet';
      case 11155111:
        return 'Sepolia Testnet';
      case 31337:
        return 'Hardhat Local';
      default:
        return `Chain ${chainId}`;
    }
  };

  const isCorrectNetwork = chainId === 31337; // Hardhat local network

  if (!isConnected) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Wallet className="h-5 w-5" />
            Connect Wallet
          </CardTitle>
          <CardDescription>
            Connect your MetaMask wallet to interact with LandGuard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={connectWallet} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Connecting...' : 'Connect MetaMask'}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Wallet Connected
          </span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={disconnectWallet}
          >
            Disconnect
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm font-medium text-gray-600">Address</p>
          <p className="font-mono text-sm">{formatAddress(account!)}</p>
        </div>
        
        <div>
          <p className="text-sm font-medium text-gray-600">Network</p>
          <div className="flex items-center gap-2">
            <Badge variant={isCorrectNetwork ? "default" : "destructive"}>
              {getNetworkName(chainId!)}
            </Badge>
            {!isCorrectNetwork && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => switchNetwork(31337)}
                className="text-xs"
              >
                Switch to Hardhat
              </Button>
            )}
          </div>
        </div>

        {!isCorrectNetwork && (
          <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <p className="text-sm text-yellow-800">
              Please switch to Hardhat Local Network (Chain ID: 31337) to use LandGuard
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Web3Connection;