"use client";

import { ethers } from "ethers";
import { useAccount, useChainId, useConnect, useDisconnect } from "wagmi";
import { useWalletClient, usePublicClient } from "wagmi";
import {
  createContext,
  ReactNode,
  RefObject,
  useContext,
  useEffect,
  useRef,
  useState,
  useMemo,
} from "react";

export interface UseWagmiEthersSignerState {
  provider: ethers.Eip1193Provider | undefined;
  chainId: number | undefined;
  accounts: string[] | undefined;
  isConnected: boolean;
  error: Error | undefined;
  connect: () => void;
  disconnect: () => void;
  sameChain: RefObject<(chainId: number | undefined) => boolean>;
  sameSigner: RefObject<
    (ethersSigner: ethers.JsonRpcSigner | undefined) => boolean
  >;
  ethersBrowserProvider: ethers.BrowserProvider | undefined;
  ethersReadonlyProvider: ethers.ContractRunner | undefined;
  ethersSigner: ethers.JsonRpcSigner | undefined;
  initialMockChains: Readonly<Record<number, string>> | undefined;
}

function useWagmiEthersSignerInternal(parameters: { 
  initialMockChains?: Readonly<Record<number, string>> 
}): UseWagmiEthersSignerState {
  const { initialMockChains } = parameters;
  
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  
  const [ethersSigner, setEthersSigner] = useState<
    ethers.JsonRpcSigner | undefined
  >(undefined);
  const [ethersBrowserProvider, setEthersBrowserProvider] = useState<
    ethers.BrowserProvider | undefined
  >(undefined);
  const [ethersReadonlyProvider, setEthersReadonlyProvider] = useState<
    ethers.ContractRunner | undefined
  >(undefined);
  const [provider, setProvider] = useState<ethers.Eip1193Provider | undefined>(undefined);
  const [error, setError] = useState<Error | undefined>(undefined);

  const chainIdRef = useRef<number | undefined>(chainId);
  const ethersSignerRef = useRef<ethers.JsonRpcSigner | undefined>(undefined);

  const sameChain = useRef((chainId: number | undefined) => {
    return chainId === chainIdRef.current;
  });

  const sameSigner = useRef(
    (ethersSigner: ethers.JsonRpcSigner | undefined) => {
      return ethersSigner === ethersSignerRef.current;
    }
  );

  useEffect(() => {
    chainIdRef.current = chainId;
  }, [chainId]);

  // Convert walletClient to ethers provider
  useEffect(() => {
    if (!walletClient || !isConnected || !address) {
      setProvider(undefined);
      setEthersSigner(undefined);
      setEthersBrowserProvider(undefined);
      setEthersReadonlyProvider(undefined);
      return;
    }

    try {
      // Convert viem walletClient to ethers Eip1193Provider
      const eip1193Provider: ethers.Eip1193Provider = {
        request: async (args: { method: string; params?: unknown[] }) => {
          if (args.method === "eth_requestAccounts") {
            return [address];
          }
          if (args.method === "eth_accounts") {
            return [address];
          }
          if (args.method === "eth_chainId") {
            return `0x${chainId.toString(16)}`;
          }
          // Delegate other requests to walletClient
          return walletClient.request(args as any);
        },
      };

      setProvider(eip1193Provider);

      const bp: ethers.BrowserProvider = new ethers.BrowserProvider(eip1193Provider);
      let rop: ethers.ContractRunner = bp;
      const rpcUrl: string | undefined = initialMockChains?.[chainId];
      if (rpcUrl && publicClient) {
        // Use RPC provider for mock chains
        rop = new ethers.JsonRpcProvider(rpcUrl);
      }

      const s = new ethers.JsonRpcSigner(bp, address);
      ethersSignerRef.current = s;
      setEthersSigner(s);
      setEthersBrowserProvider(bp);
      setEthersReadonlyProvider(rop);
      setError(undefined);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    }
  }, [walletClient, isConnected, address, chainId, initialMockChains, publicClient]);

  const accounts = useMemo(() => {
    return address ? [address] : undefined;
  }, [address]);

  const handleConnect = () => {
    if (connectors.length > 0) {
      connect({ connector: connectors[0] });
    }
  };

  return {
    sameChain,
    sameSigner,
    provider,
    chainId: chainId || undefined,
    accounts,
    isConnected,
    connect: handleConnect,
    disconnect,
    ethersBrowserProvider,
    ethersReadonlyProvider,
    ethersSigner,
    error,
    initialMockChains,
  };
}

const WagmiEthersSignerContext = createContext<UseWagmiEthersSignerState | undefined>(
  undefined
);

interface WagmiEthersSignerProviderProps {
  children: ReactNode;
  initialMockChains: Readonly<Record<number, string>>;
}

export const WagmiEthersSignerProvider: React.FC<WagmiEthersSignerProviderProps> = ({
  children,
  initialMockChains,
}) => {
  const props = useWagmiEthersSignerInternal({ initialMockChains });
  return (
    <WagmiEthersSignerContext.Provider value={props}>
      {children}
    </WagmiEthersSignerContext.Provider>
  );
};

export function useWagmiEthersSigner() {
  const context = useContext(WagmiEthersSignerContext);
  if (context === undefined) {
    throw new Error("useWagmiEthersSigner must be used within a WagmiEthersSignerProvider");
  }
  return context;
}

