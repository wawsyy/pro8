export function errorNotDeployed(chainId: number | undefined) {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="panel-card border-red-200 bg-gradient-to-br from-red-50 to-orange-50">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-lg flex-shrink-0">
            <span className="text-2xl">⚠️</span>
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-red-700 mb-2">
              Contract Not Deployed
            </h1>
            <p className="text-lg text-gray-700">
              <span className="font-mono font-semibold text-indigo-600">EncryptedTemperatureCheck.sol</span> contract
              is not deployed on{" "}
              <span className="font-mono font-semibold text-indigo-600">chainId={chainId}</span>
              {chainId === 11155111 ? " (Sepolia)" : ""} or deployment address is missing.
            </p>
          </div>
        </div>

        <div className="mt-6 p-4 bg-white/60 rounded-lg border border-red-200">
          <p className="text-base text-gray-700 mb-4">
            It appears that the{" "}
            <span className="font-mono font-semibold text-indigo-600">EncryptedTemperatureCheck.sol</span> contract
            has either not been deployed yet, or the deployment address is missing
            from the ABI directory{" "}
            <span className="font-mono font-semibold text-indigo-600">frontend/abi</span>.
          </p>
          <p className="text-base text-gray-700 mb-4">
            To deploy <span className="font-mono font-semibold text-indigo-600">EncryptedTemperatureCheck.sol</span> on
            Sepolia, run the following command:
          </p>
          <div className="mt-4 p-4 bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg border border-gray-700 shadow-lg">
            <p className="font-mono text-sm text-gray-400 mb-2">
              # from &lt;root&gt;/pro8
            </p>
            <p className="font-mono text-lg text-white font-semibold">
              npx hardhat deploy --network{" "}
              {chainId === 11155111 ? "sepolia" : "your-network-name"}
            </p>
          </div>
        </div>

        <div className="mt-6 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
          <p className="text-base text-gray-700">
            <span className="font-semibold text-blue-700">💡 Alternative:</span> Switch to the local{" "}
            <span className="font-mono font-semibold text-indigo-600">Hardhat Node</span> using your
            wallet browser extension for faster testing.
          </p>
        </div>
      </div>
    </div>
  );
}
