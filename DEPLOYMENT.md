# Deployment Guide

## 部署到 Sepolia 测试网

### 前置要求

1. **获取 Sepolia ETH**
   - 访问 [Sepolia Faucet](https://sepoliafaucet.com/)
   - 输入你的钱包地址
   - 等待测试 ETH 到账

2. **配置环境变量**
   
   确保 `hardhat.config.ts` 中配置了正确的私钥和 Infura API Key：
   ```typescript
   const PRIVATE_KEY: string = vars.get("PRIVATE_KEY", "your-private-key");
   const INFURA_API_KEY: string = vars.get("INFURA_API_KEY", "your-infura-key");
   ```

   或者使用 Hardhat 的变量系统：
   ```bash
   npx hardhat vars setup
   ```

### 部署步骤

1. **编译合约**
   ```bash
   npm run compile
   ```

2. **部署到 Sepolia**
   ```bash
   npx hardhat deploy --network sepolia
   ```

3. **更新前端 ABI 文件**
   
   部署完成后，运行以下命令更新前端 ABI 文件：
   ```bash
   cd frontend
   npm run genabi
   ```

   这会自动读取 `deployments/sepolia/EncryptedTemperatureCheck.json` 中的地址，并更新 `frontend/abi/EncryptedTemperatureCheckAddresses.ts`。

4. **验证部署**
   
   在 Etherscan 上验证合约（可选）：
   ```bash
   npx hardhat verify --network sepolia <CONTRACT_ADDRESS>
   ```

### 验证合约是否已部署

如果前端显示 "Contract Not Deployed"，请检查：

1. **检查部署文件**
   ```bash
   cat deployments/sepolia/EncryptedTemperatureCheck.json
   ```
   
   确认文件中包含有效的合约地址（不是 `0x0000000000000000000000000000000000000000`）。

2. **检查地址文件**
   ```bash
   cat frontend/abi/EncryptedTemperatureCheckAddresses.ts
   ```
   
   确认 Sepolia 地址不是零地址。

3. **在 Etherscan 上验证**
   
   访问 [Sepolia Etherscan](https://sepolia.etherscan.io/) 并搜索合约地址，确认合约确实已部署。

4. **重新生成 ABI**
   
   如果地址文件不正确，重新运行：
   ```bash
   cd frontend
   npm run genabi
   ```

## 本地 Hardhat 网络（用于快速测试）

### 启动本地节点

```bash
npx hardhat node
```

### 部署到本地网络

```bash
npx hardhat deploy --network localhost
```

### 在 MetaMask 中添加本地网络

- **网络名称**: Hardhat
- **RPC URL**: http://127.0.0.1:8545
- **Chain ID**: 31337
- **货币符号**: ETH

## FHEVM Relayer SDK 配置

### 浏览器兼容性

FHEVM Relayer SDK 需要以下 HTTP headers 才能正常工作：

- `Cross-Origin-Opener-Policy: same-origin`
- `Cross-Origin-Embedder-Policy: credentialless`

这些 headers 已在 `frontend/next.config.ts` 中配置。

### 常见问题

1. **"This browser does not support threads"**
   - 确保 Next.js 配置了正确的 COOP/COEP headers
   - 检查浏览器控制台是否有相关错误

2. **"ERR_CONNECTION_CLOSED"**
   - 这可能是 FHEVM Relayer 服务暂时不可用
   - 尝试切换到本地 Hardhat 网络进行测试
   - 检查网络连接

3. **合约未部署错误**
   - 确认已运行 `npx hardhat deploy --network sepolia`
   - 确认已运行 `npm run genabi` 更新地址文件
   - 在 Etherscan 上验证合约地址是否有效

## 故障排除

### 重新部署合约

如果合约地址无效或需要重新部署：

1. 删除旧的部署文件（可选）：
   ```bash
   rm -rf deployments/sepolia
   ```

2. 重新部署：
   ```bash
   npx hardhat deploy --network sepolia --reset
   ```

3. 更新前端 ABI：
   ```bash
   cd frontend
   npm run genabi
   ```

### 检查合约代码

在 Etherscan 上查看合约：
- Sepolia: https://sepolia.etherscan.io/address/<CONTRACT_ADDRESS>

### 测试合约

```bash
npx hardhat test --network sepolia
```

