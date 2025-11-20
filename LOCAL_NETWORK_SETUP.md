# 本地网络设置指南

## 快速开始

### 1. 启动本地 Hardhat 节点

在一个终端窗口中运行：

```bash
cd pro8
npx hardhat node
```

这会启动一个本地 Hardhat 节点，运行在 `http://127.0.0.1:8545`。

### 2. 部署合约到本地网络

在另一个终端窗口中运行：

```bash
cd pro8
npx hardhat deploy --network localhost
```

### 3. 更新前端 ABI 文件（如果需要）

```bash
cd pro8/frontend
npm run genabi
```

### 4. 在 MetaMask 中添加本地网络

1. 打开 MetaMask
2. 点击网络下拉菜单
3. 选择 "Add Network" 或 "添加网络"
4. 点击 "Add a network manually" 或 "手动添加网络"
5. 填写以下信息：
   - **网络名称**: Hardhat
   - **RPC URL**: http://127.0.0.1:8545
   - **Chain ID**: 31337
   - **货币符号**: ETH
   - **区块浏览器 URL**: (留空)

6. 点击 "Save" 或 "保存"

### 5. 获取测试 ETH

本地 Hardhat 节点会自动创建 20 个测试账户，每个账户都有 10000 ETH。

要导入账户到 MetaMask：

1. 查看 Hardhat 节点启动时的输出
2. 找到 "Account #0" 的私钥
3. 在 MetaMask 中：
   - 点击账户图标
   - 选择 "Import Account" 或 "导入账户"
   - 粘贴私钥
   - 点击 "Import" 或 "导入"

### 6. 切换到本地网络并刷新页面

1. 在 MetaMask 中选择 "Hardhat" 网络
2. 刷新应用页面
3. 连接钱包

## 本地网络的优势

✅ **不依赖外部服务**：不需要 FHEVM Relayer 服务  
✅ **速度更快**：所有操作都在本地执行  
✅ **完全控制**：可以重置网络、修改账户余额等  
✅ **免费测试**：无限量的测试 ETH  
✅ **使用 Mock FHEVM**：本地网络使用 Mock FHEVM，不需要外部 Relayer

## 常见问题

### Q: 为什么显示 "Contract Not Deployed"？

A: 确保：
1. Hardhat 节点正在运行
2. 已运行 `npx hardhat deploy --network localhost`
3. MetaMask 已切换到 Hardhat 网络（Chain ID: 31337）
4. 已刷新页面

### Q: 如何重置本地网络？

A: 停止 Hardhat 节点（Ctrl+C），然后重新启动。这会重置所有状态。

### Q: 如何查看合约地址？

A: 部署后，终端会显示合约地址。默认第一个部署的合约地址通常是：
`0x5FbDB2315678afecb367f032d93F642f64180aa3`

### Q: 为什么提交按钮仍然禁用？

A: 在本地网络上，如果使用 Mock FHEVM，应该可以正常提交。如果仍然禁用，检查：
1. 钱包是否已连接
2. 是否在正确的网络上（Chain ID: 31337）
3. 浏览器控制台是否有错误

## 本地网络 vs Sepolia 测试网

| 特性 | 本地网络 | Sepolia 测试网 |
|------|---------|---------------|
| 速度 | 非常快 | 较慢（需要等待区块确认） |
| 费用 | 免费 | 需要 Sepolia ETH |
| Relayer | 使用 Mock FHEVM | 需要外部 Relayer 服务 |
| 重置 | 随时可以重置 | 不可重置 |
| 适合场景 | 开发和测试 | 演示和生产测试 |

## 下一步

设置完成后，你可以：
- 提交温度读数
- 查看加密数据
- 解密结果
- 测试所有功能

所有操作都在本地执行，速度非常快！

