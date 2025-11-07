import { FhevmType } from "@fhevm/hardhat-plugin";
import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

/**
 * Tutorial: Deploy and Interact Locally (--network localhost)
 * ===========================================================
 *
 * 1. From a separate terminal window:
 *
 *   npx hardhat node
 *
 * 2. Deploy the EncryptedTemperatureCheck contract
 *
 *   npx hardhat --network localhost deploy
 *
 * 3. Interact with the EncryptedTemperatureCheck contract
 *
 *   npx hardhat --network localhost task:decrypt-temperature
 *   npx hardhat --network localhost task:submit-temperature --temp 375
 *   npx hardhat --network localhost task:decrypt-fever
 *
 *
 * Tutorial: Deploy and Interact on Sepolia (--network sepolia)
 * ===========================================================
 *
 * 1. Deploy the EncryptedTemperatureCheck contract
 *
 *   npx hardhat --network sepolia deploy
 *
 * 2. Interact with the EncryptedTemperatureCheck contract
 *
 *   npx hardhat --network sepolia task:decrypt-temperature
 *   npx hardhat --network sepolia task:submit-temperature --temp 375
 *   npx hardhat --network sepolia task:decrypt-fever
 *
 */

/**
 * Example:
 *   - npx hardhat --network localhost task:address
 *   - npx hardhat --network sepolia task:address
 */
task("task:address", "Prints the EncryptedTemperatureCheck address").setAction(async function (_taskArguments: TaskArguments, hre) {
  const { deployments } = hre;

  const temperatureCheck = await deployments.get("EncryptedTemperatureCheck");

  console.log("EncryptedTemperatureCheck address is " + temperatureCheck.address);
});

/**
 * Example:
 *   - npx hardhat --network localhost task:decrypt-temperature
 *   - npx hardhat --network sepolia task:decrypt-temperature
 */
task("task:decrypt-temperature", "Calls the getTemperature() function of EncryptedTemperatureCheck Contract")
  .addOptionalParam("address", "Optionally specify the EncryptedTemperatureCheck contract address")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, deployments, fhevm } = hre;

    await fhevm.initializeCLIApi();

    const TemperatureCheckDeployement = taskArguments.address
      ? { address: taskArguments.address }
      : await deployments.get("EncryptedTemperatureCheck");
    console.log(`EncryptedTemperatureCheck: ${TemperatureCheckDeployement.address}`);

    const signers = await ethers.getSigners();

    const temperatureCheckContract = await ethers.getContractAt("EncryptedTemperatureCheck", TemperatureCheckDeployement.address);

    const encryptedTemperature = await temperatureCheckContract.getTemperature();
    if (encryptedTemperature === ethers.ZeroHash) {
      console.log(`encrypted temperature: ${encryptedTemperature}`);
      console.log("clear temperature    : 0 (no reading submitted)");
      return;
    }

    const clearTemperature = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      encryptedTemperature,
      TemperatureCheckDeployement.address,
      signers[0],
    );
    console.log(`Encrypted temperature: ${encryptedTemperature}`);
    console.log(`Clear temperature    : ${clearTemperature / 10}°C (${clearTemperature} tenths)`);
  });

/**
 * Example:
 *   - npx hardhat --network localhost task:decrypt-fever
 *   - npx hardhat --network sepolia task:decrypt-fever
 */
task("task:decrypt-fever", "Calls the getFeverResult() function of EncryptedTemperatureCheck Contract")
  .addOptionalParam("address", "Optionally specify the EncryptedTemperatureCheck contract address")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, deployments, fhevm } = hre;

    await fhevm.initializeCLIApi();

    const TemperatureCheckDeployement = taskArguments.address
      ? { address: taskArguments.address }
      : await deployments.get("EncryptedTemperatureCheck");
    console.log(`EncryptedTemperatureCheck: ${TemperatureCheckDeployement.address}`);

    const signers = await ethers.getSigners();

    const temperatureCheckContract = await ethers.getContractAt("EncryptedTemperatureCheck", TemperatureCheckDeployement.address);

    const encryptedFeverResult = await temperatureCheckContract.getFeverResult();
    if (encryptedFeverResult === ethers.ZeroHash) {
      console.log(`encrypted fever result: ${encryptedFeverResult}`);
      console.log("clear fever result    : No check performed yet");
      return;
    }

    const clearFeverResult = await fhevm.userDecryptEbool(
      encryptedFeverResult,
      TemperatureCheckDeployement.address,
      signers[0],
    );
    console.log(`Encrypted fever result: ${encryptedFeverResult}`);
    console.log(`Clear fever result    : ${clearFeverResult ? "FEVER (>= 37.5°C)" : "NORMAL (< 37.5°C)"}`);
  });

/**
 * Example:
 *   - npx hardhat --network localhost task:submit-temperature --temp 375
 *   - npx hardhat --network sepolia task:submit-temperature --temp 380
 */
task("task:submit-temperature", "Calls the submitAndCheck() function of EncryptedTemperatureCheck Contract")
  .addOptionalParam("address", "Optionally specify the EncryptedTemperatureCheck contract address")
  .addParam("temp", "The temperature value in tenths of degrees Celsius (e.g., 375 = 37.5°C)")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, deployments, fhevm } = hre;

    const temp = parseInt(taskArguments.temp);
    if (!Number.isInteger(temp)) {
      throw new Error(`Argument --temp is not an integer`);
    }

    await fhevm.initializeCLIApi();

    const TemperatureCheckDeployement = taskArguments.address
      ? { address: taskArguments.address }
      : await deployments.get("EncryptedTemperatureCheck");
    console.log(`EncryptedTemperatureCheck: ${TemperatureCheckDeployement.address}`);

    const signers = await ethers.getSigners();

    const temperatureCheckContract = await ethers.getContractAt("EncryptedTemperatureCheck", TemperatureCheckDeployement.address);

    // Encrypt the temperature value
    const encryptedTemperature = await fhevm
      .createEncryptedInput(TemperatureCheckDeployement.address, signers[0].address)
      .add32(temp)
      .encrypt();

    // Encrypt the threshold value (375 = 37.5°C)
    const FEVER_THRESHOLD = 375;
    const encryptedThreshold = await fhevm
      .createEncryptedInput(TemperatureCheckDeployement.address, signers[0].address)
      .add32(FEVER_THRESHOLD)
      .encrypt();

    console.log(`Submitting temperature: ${temp / 10}°C (${temp} tenths)`);
    console.log(`Fever threshold: ${FEVER_THRESHOLD / 10}°C (${FEVER_THRESHOLD} tenths)`);

    const tx = await temperatureCheckContract
      .connect(signers[0])
      .submitAndCheck(
        encryptedTemperature.handles[0],
        encryptedThreshold.handles[0],
        encryptedTemperature.inputProof,
        encryptedThreshold.inputProof
      );
    console.log(`Wait for tx:${tx.hash}...`);

    const receipt = await tx.wait();
    console.log(`tx:${tx.hash} status=${receipt?.status}`);

    const newEncryptedTemperature = await temperatureCheckContract.getTemperature();
    console.log("Encrypted temperature after submission:", newEncryptedTemperature);

    console.log(`EncryptedTemperatureCheck submitAndCheck(${temp / 10}°C) succeeded!`);
  });

