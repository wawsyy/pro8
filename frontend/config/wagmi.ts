import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { sepolia, hardhat } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'Encrypted Temperature Check',
  projectId: 'YOUR_PROJECT_ID', // Replace with your WalletConnect project ID if using WalletConnect
  chains: [hardhat, sepolia],
  ssr: false,
});

