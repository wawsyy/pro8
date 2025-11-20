"use client";

import { useFhevm } from "../fhevm/useFhevm";
import { useInMemoryStorage } from "../hooks/useInMemoryStorage";
import { useWagmiEthersSigner } from "@/hooks/wagmi/useWagmiEthersSigner";
import { useTemperatureCheck } from "@/hooks/useTemperatureCheck";
import { errorNotDeployed } from "./ErrorNotDeployed";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useState, useEffect } from "react";
import React from "react";

export const TemperatureCheckDemo = () => {
  const { storage: fhevmDecryptionSignatureStorage } = useInMemoryStorage();
  const {
    provider,
    chainId,
    isConnected,
    ethersSigner,
    ethersReadonlyProvider,
    sameChain,
    sameSigner,
    initialMockChains,
  } = useWagmiEthersSigner();
  
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const {
    instance: fhevmInstance,
  } = useFhevm({
    provider,
    chainId,
    initialMockChains,
    enabled: true,
  });

  const temperatureCheck = useTemperatureCheck({
    instance: fhevmInstance,
    fhevmDecryptionSignatureStorage,
    eip1193Provider: provider,
    chainId,
    ethersSigner,
    ethersReadonlyProvider,
    sameChain,
    sameSigner,
  });

  const [tempInput, setTempInput] = useState<string>("37.5");

  const buttonClass =
    "btn-modern inline-flex items-center justify-center px-6 py-3 font-semibold text-white " +
    "disabled:opacity-50 disabled:pointer-events-none";

  const titleClass = "font-semibold text-gray-800 text-lg mb-4";

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <div className="mx-auto text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
        <p className="text-lg text-gray-700 mt-4">Loading...</p>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="mx-auto text-center max-w-2xl px-4">
        <div className="panel-card mb-8">
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 mb-4 shadow-lg">
              <span className="text-3xl">🌡️</span>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Encrypted Temperature Check
            </h1>
            <p className="text-lg text-gray-700 mb-2">
              Submit your temperature securely using Fully Homomorphic Encryption (FHE)
            </p>
            <p className="text-md text-gray-600">
              The system checks for fever (≥37.5°C) without ever seeing your actual temperature
            </p>
          </div>
          <div className="flex justify-center">
            <ConnectButton />
          </div>
        </div>
      </div>
    );
  }

  // Only check deployment status if connected
  if (isConnected && temperatureCheck.isDeployed === false) {
    return errorNotDeployed(chainId);
  }

  const handleSubmit = () => {
    const temp = parseFloat(tempInput);
    if (isNaN(temp) || temp < 30 || temp > 45) {
      alert("Please enter a valid temperature between 30°C and 45°C");
      return;
    }
    // Convert to tenths (e.g., 37.5 -> 375)
    const tempInTenths = Math.round(temp * 10);
    temperatureCheck.submitTemperature(tempInTenths);
  };

  const tempValue = temperatureCheck.clearTemperature 
    ? Number(temperatureCheck.clearTemperature) / 10 
    : null;
  const hasFever = temperatureCheck.clearFeverResult === true;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Card */}
      <div className="panel-card mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
            <span className="text-2xl">🌡️</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Encrypted Temperature Check
            </h2>
            <p className="text-sm text-gray-500 font-mono mt-1">
              EncryptedTemperatureCheck.sol
            </p>
          </div>
        </div>
      </div>


      {/* Encrypted Data */}
      <div className="panel-card mb-6">
        <p className={titleClass}>Encrypted Data</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg border border-indigo-100">
            <p className="text-sm font-semibold text-gray-600 mb-2">Temperature</p>
            {printProperty("Handle", temperatureCheck.temperatureHandle)}
            {printProperty(
              "Decrypted",
              tempValue !== null ? `${tempValue}°C` : "Not decrypted"
            )}
          </div>
          <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-100">
            <p className="text-sm font-semibold text-gray-600 mb-2">Fever Result</p>
            {printProperty("Handle", temperatureCheck.feverResultHandle)}
            {printProperty(
              "Result",
              temperatureCheck.clearFeverResult !== undefined
                ? (hasFever ? (
                    <span className="badge badge-danger">FEVER (≥37.5°C)</span>
                  ) : (
                    <span className="badge badge-success">NORMAL (&lt;37.5°C)</span>
                  ))
                : "Not decrypted"
            )}
          </div>
        </div>
      </div>

      {/* Submit Temperature */}
      <div className="panel-card mb-6">
        <p className={titleClass}>Submit Temperature Reading</p>
        <div className="mt-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <label className="font-semibold text-gray-700 min-w-[140px]">
              Temperature (°C):
            </label>
            <div className="flex-1 max-w-md">
              <input
                type="number"
                step="0.1"
                min="30"
                max="45"
                value={tempInput}
                onChange={(e) => setTempInput(e.target.value)}
                className="input-modern w-full"
                placeholder="37.5"
              />
            </div>
            <button
              className={buttonClass}
              disabled={!temperatureCheck.canSubmit}
              onClick={handleSubmit}
            >
              {temperatureCheck.canSubmit
                ? "Submit & Check"
                : temperatureCheck.isSubmitting
                  ? "Submitting..."
                  : "Cannot submit"}
            </button>
          </div>
          <p className="text-sm text-gray-600">
            Enter your temperature in Celsius. The system will check if it indicates fever (≥37.5°C) without seeing the actual value.
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <button
          className={`${buttonClass} btn-success`}
          disabled={!temperatureCheck.canDecrypt}
          onClick={temperatureCheck.decryptResults}
        >
          {temperatureCheck.canDecrypt
            ? "Decrypt Results"
            : temperatureCheck.isDecrypting
              ? "Decrypting..."
              : temperatureCheck.isTemperatureDecrypted && temperatureCheck.isFeverResultDecrypted
                ? "Already Decrypted"
                : "Nothing to decrypt"}
        </button>
        <button
          className={buttonClass}
          disabled={!temperatureCheck.canGetTemperature}
          onClick={temperatureCheck.refreshTemperature}
        >
          {temperatureCheck.canGetTemperature
            ? "Refresh Data"
            : "TemperatureCheck is not available"}
        </button>
      </div>

      {/* Message */}
      <div className="panel-card">
        {printProperty("Message", temperatureCheck.message)}
        {temperatureCheck.message?.includes("Relayer") && (
          <div className="mt-4 p-4 bg-gradient-to-br from-yellow-50 to-amber-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800 font-semibold mb-2">ℹ️ Relayer Service Notice:</p>
            <p className="text-sm text-yellow-700">
              The FHEVM Relayer service on Sepolia testnet may be temporarily unavailable. 
              For testing, you can switch to local Hardhat network (localhost:8545) which uses mock FHEVM.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

function printProperty(name: string, value: unknown) {
  if (typeof value === "boolean") {
    return printBooleanProperty(name, value);
  } else if (typeof value === "string" || typeof value === "number") {
    return (
      <div className="mb-2">
        <span className="text-sm font-semibold text-gray-600">{name}:</span>{" "}
        <span className="font-mono font-semibold text-gray-800">{String(value)}</span>
      </div>
    );
  } else if (typeof value === "bigint") {
    return (
      <div className="mb-2">
        <span className="text-sm font-semibold text-gray-600">{name}:</span>{" "}
        <span className="font-mono font-semibold text-gray-800">{String(value)}</span>
      </div>
    );
  } else if (value === null) {
    return (
      <div className="mb-2">
        <span className="text-sm font-semibold text-gray-600">{name}:</span>{" "}
        <span className="font-mono text-gray-400">null</span>
      </div>
    );
  } else if (value === undefined) {
    return (
      <div className="mb-2">
        <span className="text-sm font-semibold text-gray-600">{name}:</span>{" "}
        <span className="font-mono text-gray-400">undefined</span>
      </div>
    );
  } else if (value instanceof Error) {
    return (
      <div className="mb-2">
        <span className="text-sm font-semibold text-gray-600">{name}:</span>{" "}
        <span className="font-mono text-red-600">{value.message}</span>
      </div>
    );
  } else if (React.isValidElement(value)) {
    return (
      <div className="mb-2">
        <span className="text-sm font-semibold text-gray-600">{name}:</span>{" "}
        {value}
      </div>
    );
  } else {
    return (
      <div className="mb-2">
        <span className="text-sm font-semibold text-gray-600">{name}:</span>{" "}
        <span className="font-mono font-semibold text-gray-800">{JSON.stringify(value)}</span>
      </div>
    );
  }
}

function printBooleanProperty(name: string, value: boolean) {
  if (value) {
    return (
      <div className="mb-2">
        <span className="text-sm font-semibold text-gray-600">{name}:</span>{" "}
        <span className="badge badge-success">true</span>
      </div>
    );
  }

  return (
    <div className="mb-2">
      <span className="text-sm font-semibold text-gray-600">{name}:</span>{" "}
      <span className="badge badge-danger">false</span>
    </div>
  );
}
