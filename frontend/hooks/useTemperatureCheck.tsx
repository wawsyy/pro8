"use client";

import { ethers } from "ethers";
import {
  RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { FhevmInstance } from "@/fhevm/fhevmTypes";
import { FhevmDecryptionSignature } from "@/fhevm/FhevmDecryptionSignature";
import { GenericStringStorage } from "@/fhevm/GenericStringStorage";

import { EncryptedTemperatureCheckAddresses } from "@/abi/EncryptedTemperatureCheckAddresses";
import { EncryptedTemperatureCheckABI } from "@/abi/EncryptedTemperatureCheckABI";

export type ClearValueType = {
  handle: string;
  clear: string | bigint | boolean;
};

type TemperatureCheckInfoType = {
  abi: typeof EncryptedTemperatureCheckABI.abi;
  address?: `0x${string}`;
  chainId?: number;
  chainName?: string;
};

const FEVER_THRESHOLD = 375; // 37.5°C in tenths

// Type guard to check if entry has address property
function hasAddress(entry: any): entry is { address: string; chainId: number; chainName: string } {
  return entry && typeof entry === 'object' && 'address' in entry;
}

function getTemperatureCheckByChainId(
  chainId: number | undefined
): TemperatureCheckInfoType {
  if (!chainId) {
    return { abi: EncryptedTemperatureCheckABI.abi };
  }

  const entry =
    EncryptedTemperatureCheckAddresses[chainId.toString() as keyof typeof EncryptedTemperatureCheckAddresses];

  if (!entry || !hasAddress(entry) || entry.address === ethers.ZeroAddress) {
    return { abi: EncryptedTemperatureCheckABI.abi, chainId };
  }

  return {
    address: entry?.address as `0x${string}` | undefined,
    chainId: entry?.chainId ?? chainId,
    chainName: entry?.chainName,
    abi: EncryptedTemperatureCheckABI.abi,
  };
}

export const useTemperatureCheck = (parameters: {
  instance: FhevmInstance | undefined;
  fhevmDecryptionSignatureStorage: GenericStringStorage;
  eip1193Provider: ethers.Eip1193Provider | undefined;
  chainId: number | undefined;
  ethersSigner: ethers.JsonRpcSigner | undefined;
  ethersReadonlyProvider: ethers.ContractRunner | undefined;
  sameChain: RefObject<(chainId: number | undefined) => boolean>;
  sameSigner: RefObject<
    (ethersSigner: ethers.JsonRpcSigner | undefined) => boolean
  >;
}) => {
  const {
    instance,
    fhevmDecryptionSignatureStorage,
    chainId,
    ethersSigner,
    ethersReadonlyProvider,
    sameChain,
    sameSigner,
  } = parameters;

  const [temperatureHandle, setTemperatureHandle] = useState<string | undefined>(undefined);
  const [feverResultHandle, setFeverResultHandle] = useState<string | undefined>(undefined);
  const [clearTemperature, setClearTemperature] = useState<ClearValueType | undefined>(undefined);
  const [clearFeverResult, setClearFeverResult] = useState<ClearValueType | undefined>(undefined);
  
  const clearTemperatureRef = useRef<ClearValueType>(undefined);
  const clearFeverResultRef = useRef<ClearValueType>(undefined);
  
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isDecrypting, setIsDecrypting] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");

  const temperatureCheckRef = useRef<TemperatureCheckInfoType | undefined>(undefined);
  const isRefreshingRef = useRef<boolean>(isRefreshing);
  const isDecryptingRef = useRef<boolean>(isDecrypting);
  const isSubmittingRef = useRef<boolean>(isSubmitting);

  const isTemperatureDecrypted = temperatureHandle && temperatureHandle === clearTemperature?.handle;
  const isFeverResultDecrypted = feverResultHandle && feverResultHandle === clearFeverResult?.handle;

  const temperatureCheck = useMemo(() => {
    const c = getTemperatureCheckByChainId(chainId);
    temperatureCheckRef.current = c;

    if (!c.address) {
      setMessage(`TemperatureCheck deployment not found for chainId=${chainId}.`);
    }

    return c;
  }, [chainId]);

  const isDeployed = useMemo(() => {
    if (!temperatureCheck) {
      return undefined;
    }
    return (Boolean(temperatureCheck.address) && temperatureCheck.address !== ethers.ZeroAddress);
  }, [temperatureCheck]);

  const canGetTemperature = useMemo(() => {
    return temperatureCheck.address && ethersReadonlyProvider && !isRefreshing;
  }, [temperatureCheck.address, ethersReadonlyProvider, isRefreshing]);

  const refreshTemperature = useCallback(() => {
    if (isRefreshingRef.current) {
      return;
    }

    if (
      !temperatureCheckRef.current ||
      !temperatureCheckRef.current?.chainId ||
      !temperatureCheckRef.current?.address ||
      !ethersReadonlyProvider
    ) {
      setTemperatureHandle(undefined);
      setFeverResultHandle(undefined);
      return;
    }

    isRefreshingRef.current = true;
    setIsRefreshing(true);

    const thisChainId = temperatureCheckRef.current.chainId;
    const thisContractAddress = temperatureCheckRef.current.address;

    const contract = new ethers.Contract(
      thisContractAddress,
      temperatureCheckRef.current.abi,
      ethersReadonlyProvider
    );

    Promise.all([
      contract.getTemperature(),
      contract.getFeverResult()
    ])
      .then(([tempHandle, feverHandle]) => {
        if (
          sameChain.current(thisChainId) &&
          thisContractAddress === temperatureCheckRef.current?.address
        ) {
          setTemperatureHandle(tempHandle);
          setFeverResultHandle(feverHandle);
        }

        isRefreshingRef.current = false;
        setIsRefreshing(false);
      })
      .catch((e) => {
        setMessage("TemperatureCheck.getTemperature() call failed! error=" + e);
        isRefreshingRef.current = false;
        setIsRefreshing(false);
      });
  }, [ethersReadonlyProvider, sameChain]);

  useEffect(() => {
    refreshTemperature();
  }, [refreshTemperature]);

  const canDecrypt = useMemo(() => {
    return (
      temperatureCheck.address &&
      instance &&
      ethersSigner &&
      !isRefreshing &&
      !isDecrypting &&
      (temperatureHandle || feverResultHandle) &&
      ((temperatureHandle && temperatureHandle !== ethers.ZeroHash && temperatureHandle !== clearTemperature?.handle) ||
       (feverResultHandle && feverResultHandle !== ethers.ZeroHash && feverResultHandle !== clearFeverResult?.handle))
    );
  }, [
    temperatureCheck.address,
    instance,
    ethersSigner,
    isRefreshing,
    isDecrypting,
    temperatureHandle,
    feverResultHandle,
    clearTemperature,
    clearFeverResult,
  ]);

  const decryptResults = useCallback(() => {
    if (isRefreshingRef.current || isDecryptingRef.current) {
      return;
    }

    if (!temperatureCheck.address || !instance || !ethersSigner) {
      return;
    }

    if (!temperatureHandle && !feverResultHandle) {
      setClearTemperature(undefined);
      setClearFeverResult(undefined);
      clearTemperatureRef.current = undefined;
      clearFeverResultRef.current = undefined;
      return;
    }

    const thisChainId = chainId;
    const thisContractAddress = temperatureCheck.address;
    const thisTemperatureHandle = temperatureHandle;
    const thisFeverResultHandle = feverResultHandle;
    const thisEthersSigner = ethersSigner;

    isDecryptingRef.current = true;
    setIsDecrypting(true);
    setMessage("Start decrypting...");

    const run = async () => {
      const isStale = () =>
        thisContractAddress !== temperatureCheckRef.current?.address ||
        !sameChain.current(thisChainId) ||
        !sameSigner.current(thisEthersSigner);

      try {
        const sig: FhevmDecryptionSignature | null =
          await FhevmDecryptionSignature.loadOrSign(
            instance,
            [temperatureCheck.address as `0x${string}`],
            ethersSigner,
            fhevmDecryptionSignatureStorage
          );

        if (!sig) {
          setMessage("Unable to build FHEVM decryption signature");
          return;
        }

        if (isStale()) {
          setMessage("Ignore FHEVM decryption");
          return;
        }

        setMessage("Calling FHEVM userDecrypt...");

        const decryptHandles: Array<{ handle: string; contractAddress: string }> = [];
        if (thisTemperatureHandle && thisTemperatureHandle !== ethers.ZeroHash) {
          decryptHandles.push({ handle: thisTemperatureHandle, contractAddress: thisContractAddress });
        }
        if (thisFeverResultHandle && thisFeverResultHandle !== ethers.ZeroHash) {
          decryptHandles.push({ handle: thisFeverResultHandle, contractAddress: thisContractAddress });
        }

        if (decryptHandles.length === 0) {
          setMessage("No handles to decrypt");
          return;
        }

        const res = await instance.userDecrypt(
          decryptHandles,
          sig.privateKey,
          sig.publicKey,
          sig.signature,
          sig.contractAddresses,
          sig.userAddress,
          sig.startTimestamp,
          sig.durationDays
        );

        setMessage("FHEVM userDecrypt completed!");

        if (isStale()) {
          setMessage("Ignore FHEVM decryption");
          return;
        }

        if (thisTemperatureHandle && res[thisTemperatureHandle] !== undefined) {
          setClearTemperature({ handle: thisTemperatureHandle, clear: res[thisTemperatureHandle] });
          clearTemperatureRef.current = {
            handle: thisTemperatureHandle,
            clear: res[thisTemperatureHandle],
          };
        }

        if (thisFeverResultHandle && res[thisFeverResultHandle] !== undefined) {
          setClearFeverResult({ handle: thisFeverResultHandle, clear: res[thisFeverResultHandle] });
          clearFeverResultRef.current = {
            handle: thisFeverResultHandle,
            clear: res[thisFeverResultHandle],
          };
        }

        setMessage("Decryption completed!");
      } finally {
        isDecryptingRef.current = false;
        setIsDecrypting(false);
      }
    };

    run();
  }, [
    fhevmDecryptionSignatureStorage,
    ethersSigner,
    temperatureCheck.address,
    instance,
    temperatureHandle,
    feverResultHandle,
    chainId,
    sameChain,
    sameSigner,
  ]);

  const canSubmit = useMemo(() => {
    return (
      temperatureCheck.address &&
      instance &&
      ethersSigner &&
      !isRefreshing &&
      !isSubmitting
    );
  }, [temperatureCheck.address, instance, ethersSigner, isRefreshing, isSubmitting]);

  const submitTemperature = useCallback(
    (temperatureInTenths: number) => {
      if (isRefreshingRef.current || isSubmittingRef.current) {
        return;
      }

      if (!temperatureCheck.address || !instance || !ethersSigner) {
        return;
      }

      const thisChainId = chainId;
      const thisContractAddress = temperatureCheck.address;
      const thisEthersSigner = ethersSigner;

      const contract = new ethers.Contract(
        thisContractAddress,
        temperatureCheck.abi,
        thisEthersSigner
      );

      isSubmittingRef.current = true;
      setIsSubmitting(true);
      setMessage(`Submitting temperature: ${temperatureInTenths / 10}°C...`);

      const run = async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));

        const isStale = () =>
          thisContractAddress !== temperatureCheckRef.current?.address ||
          !sameChain.current(thisChainId) ||
          !sameSigner.current(thisEthersSigner);

        try {
          const tempInput = instance.createEncryptedInput(
            thisContractAddress,
            thisEthersSigner.address
          );
          tempInput.add32(temperatureInTenths);

          const thresholdInput = instance.createEncryptedInput(
            thisContractAddress,
            thisEthersSigner.address
          );
          thresholdInput.add32(FEVER_THRESHOLD);

          const encryptedTemp = await tempInput.encrypt();
          const encryptedThreshold = await thresholdInput.encrypt();

          if (isStale()) {
            setMessage("Ignore submission");
            return;
          }

          setMessage("Calling submitAndCheck...");

          const tx: ethers.TransactionResponse = await contract.submitAndCheck(
            encryptedTemp.handles[0],
            encryptedThreshold.handles[0],
            encryptedTemp.inputProof,
            encryptedThreshold.inputProof
          );

          setMessage(`Waiting for tx:${tx.hash}...`);

          const receipt = await tx.wait();

          setMessage(`Submission completed! status=${receipt?.status}`);

          if (isStale()) {
            setMessage("Ignore submission");
            return;
          }

          refreshTemperature();
        } catch (e: any) {
          const errorMessage = e?.message || String(e);
          // Check for relayer errors
          if (errorMessage.includes("Relayer") || errorMessage.includes("backend connection") || errorMessage.includes("Bad status")) {
            setMessage(
              "⚠️ FHEVM Relayer service is temporarily unavailable. " +
              "This may be due to Sepolia testnet maintenance. " +
              "Please try again later or use local Hardhat network for testing."
            );
          } else {
            setMessage(`Submission failed! error: ${errorMessage}`);
          }
        } finally {
          isSubmittingRef.current = false;
          setIsSubmitting(false);
        }
      };

      run();
    },
    [
      ethersSigner,
      temperatureCheck.address,
      temperatureCheck.abi,
      instance,
      chainId,
      refreshTemperature,
      sameChain,
      sameSigner,
    ]
  );

  return {
    contractAddress: temperatureCheck.address,
    canDecrypt,
    canGetTemperature,
    canSubmit,
    submitTemperature,
    decryptResults,
    refreshTemperature,
    isTemperatureDecrypted,
    isFeverResultDecrypted,
    message,
    clearTemperature: clearTemperature?.clear,
    clearFeverResult: clearFeverResult?.clear,
    temperatureHandle,
    feverResultHandle,
    isDecrypting,
    isRefreshing,
    isSubmitting,
    isDeployed,
  };
};


// Add custom hook for encrypted temperature operations
