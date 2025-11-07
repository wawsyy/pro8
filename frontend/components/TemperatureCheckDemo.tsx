"use client";

import { useFhevm } from "../fhevm/useFhevm";
import { useInMemoryStorage } from "../hooks/useInMemoryStorage";
import { useWagmiEthersSigner } from "@/hooks/wagmi/useWagmiEthersSigner";
import { useTemperatureCheck } from "@/hooks/useTemperatureCheck";
import { errorNotDeployed } from "./ErrorNotDeployed";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useState, useEffect } from "react";

export const TemperatureCheckDemo = () => {
  const { storage: fhevmDecryptionSignatureStorage } = useInMemoryStorage();
  const {
    provider,
    chainId,
    accounts,
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
    status: fhevmStatus,
    error: fhevmError,
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
    "inline-flex items-center justify-center rounded-xl bg-black px-4 py-4 font-semibold text-white shadow-sm " +
    "transition-colors duration-200 hover:bg-blue-700 active:bg-blue-800 " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 " +
    "disabled:opacity-50 disabled:pointer-events-none";

  const titleClass = "font-semibold text-black text-lg mt-4";

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <div className="mx-auto text-center">
        <p className="text-lg text-gray-700">Loading...</p>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="mx-auto text-center">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-black mb-4">
            Encrypted Temperature Check
          </h1>
          <p className="text-lg text-gray-700">
            Submit your temperature securely using Fully Homomorphic Encryption (FHE)
          </p>
          <p className="text-md text-gray-600 mt-2">
            The system checks for fever (�≥37.5°C) without ever seeing your actual temperature
          </p>
        </div>
        <div className="flex justify-center">
          <ConnectButton />
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
    <div className="grid w-full gap-4">
      <div className="col-span-full mx-20 bg-black text-white rounded-lg">
        <p className="font-semibold text-3xl m-5">
          Encrypted Temperature Check -{" "}
          <span className="font-mono font-normal text-gray-400">
            EncryptedTemperatureCheck.sol
          </span>
        </p>
      </div>

      <div className="col-span-full mx-20 mt-4 px-5 pb-4 rounded-lg bg-white border-2 border-black">
        <p className={titleClass}>Chain Information</p>
        {printProperty("ChainId", chainId)}
        {printProperty(
          "Wallet Address",
          accounts?.[0] || "Not connected"
        )}

        <p className={titleClass}>Contract</p>
        {printProperty("TemperatureCheck", temperatureCheck.contractAddress)}
        {printProperty("isDeployed", temperatureCheck.isDeployed)}
      </div>

      <div className="col-span-full mx-20">
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg bg-white border-2 border-black pb-4 px-4">
            <p className={titleClass}>FHEVM Instance</p>
            {printProperty(
              "Fhevm Instance",
              fhevmInstance ? "OK" : "undefined"
            )}
            {printProperty("Fhevm Status", fhevmStatus)}
            {printProperty("Fhevm Error", fhevmError ?? "No Error")}
          </div>
          <div className="rounded-lg bg-white border-2 border-black pb-4 px-4">
            <p className={titleClass}>Status</p>
            {printProperty("isRefreshing", temperatureCheck.isRefreshing)}
            {printProperty("isDecrypting", temperatureCheck.isDecrypting)}
            {printProperty("isSubmitting", temperatureCheck.isSubmitting)}
            {printProperty("canGetTemperature", temperatureCheck.canGetTemperature)}
            {printProperty("canDecrypt", temperatureCheck.canDecrypt)}
            {printProperty("canSubmit", temperatureCheck.canSubmit)}
          </div>
        </div>
      </div>

      <div className="col-span-full mx-20 px-4 pb-4 rounded-lg bg-white border-2 border-black">
        <p className={titleClass}>Encrypted Data</p>
        {printProperty("temperatureHandle", temperatureCheck.temperatureHandle)}
        {printProperty(
          "Decrypted Temperature",
          tempValue !== null ? `${tempValue}°C` : "Not decrypted"
        )}
        {printProperty("feverResultHandle", temperatureCheck.feverResultHandle)}
        {printProperty(
          "Fever Result",
          temperatureCheck.clearFeverResult !== undefined
            ? (hasFever ? "FEVER (�≥37.5°C)" : "NORMAL (<37.5°C)")
            : "Not decrypted"
        )}
      </div>

      <div className="col-span-full mx-20 px-4 pb-4 rounded-lg bg-white border-2 border-black">
        <p className={titleClass}>Submit Temperature Reading</p>
        <div className="mt-4 flex gap-4 items-center">
          <label className="font-semibold text-black">
            Temperature (°C):
          </label>
          <input
            type="number"
            step="0.1"
            min="30"
            max="45"
            value={tempInput}
            onChange={(e) => setTempInput(e.target.value)}
            className="border-2 border-gray-300 rounded px-3 py-2 text-black"
            placeholder="37.5"
          />
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
        <p className="text-sm text-gray-600 mt-2">
          Enter your temperature in Celsius. The system will check if it indicates fever (�≥37.5°C) without seeing the actual value.
        </p>
      </div>

      <div className="grid grid-cols-2 mx-20 gap-4">
        <button
          className={buttonClass}
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

      <div className="col-span-full mx-20 p-4 rounded-lg bg-white border-2 border-black">
        {printProperty("Message", temperatureCheck.message)}
        {temperatureCheck.message?.includes("Relayer") && (
          <div className="mt-4 p-3 bg-yellow-100 border border-yellow-400 rounded">
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
  let displayValue: string;

  if (typeof value === "boolean") {
    return printBooleanProperty(name, value);
  } else if (typeof value === "string" || typeof value === "number") {
    displayValue = String(value);
  } else if (typeof value === "bigint") {
    displayValue = String(value);
  } else if (value === null) {
    displayValue = "null";
  } else if (value === undefined) {
    displayValue = "undefined";
  } else if (value instanceof Error) {
    displayValue = value.message;
  } else {
    displayValue = JSON.stringify(value);
  }
  return (
    <p className="text-black">
      {name}:{" "}
      <span className="font-mono font-semibold text-black">{displayValue}</span>
    </p>
  );
}

function printBooleanProperty(name: string, value: boolean) {
  if (value) {
    return (
      <p className="text-black">
        {name}:{" "}
        <span className="font-mono font-semibold text-green-500">true</span>
      </p>
    );
  }

  return (
    <p className="text-black">
      {name}:{" "}
      <span className="font-mono font-semibold text-red-500">false</span>
    </p>
  );
}


// Build interactive temperature input component

// Add user feedback and loading indicators
