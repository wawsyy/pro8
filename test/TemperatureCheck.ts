import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers, fhevm } from "hardhat";
import { EncryptedTemperatureCheck, EncryptedTemperatureCheck__factory } from "../types";
import { expect } from "chai";
import { FhevmType } from "@fhevm/hardhat-plugin";

type Signers = {
  deployer: HardhatEthersSigner;
  alice: HardhatEthersSigner;
  bob: HardhatEthersSigner;
};

async function deployFixture() {
  const factory = (await ethers.getContractFactory("EncryptedTemperatureCheck")) as EncryptedTemperatureCheck__factory;
  const temperatureCheckContract = (await factory.deploy()) as EncryptedTemperatureCheck;
  const temperatureCheckContractAddress = await temperatureCheckContract.getAddress();

  return { temperatureCheckContract, temperatureCheckContractAddress };
}

describe("EncryptedTemperatureCheck", function () {
  let signers: Signers;
  let temperatureCheckContract: EncryptedTemperatureCheck;
  let temperatureCheckContractAddress: string;
  const FEVER_THRESHOLD = 375; // 37.5°C in tenths

  before(async function () {
    const ethSigners: HardhatEthersSigner[] = await ethers.getSigners();
    signers = { deployer: ethSigners[0], alice: ethSigners[1], bob: ethSigners[2] };
  });

  beforeEach(async function () {
    // Check whether the tests are running against an FHEVM mock environment
    if (!fhevm.isMock) {
      console.warn(`This hardhat test suite cannot run on Sepolia Testnet`);
      this.skip();
    }

    ({ temperatureCheckContract, temperatureCheckContractAddress } = await deployFixture());
  });

  it("encrypted temperature should be uninitialized after deployment", async function () {
    const encryptedTemperature = await temperatureCheckContract.getTemperature();
    // Expect initial temperature to be bytes32(0) after deployment,
    // (meaning the encrypted temperature value is uninitialized)
    expect(encryptedTemperature).to.eq(ethers.ZeroHash);
  });

  it("should submit normal temperature (36.5°C) and check no fever", async function () {
    const clearTemperature = 365; // 36.5°C in tenths
    const clearThreshold = FEVER_THRESHOLD; // 37.5°C

    // Encrypt temperature as a euint32
    const encryptedTemperature = await fhevm
      .createEncryptedInput(temperatureCheckContractAddress, signers.alice.address)
      .add32(clearTemperature)
      .encrypt();

    // Encrypt threshold as a euint32
    const encryptedThreshold = await fhevm
      .createEncryptedInput(temperatureCheckContractAddress, signers.alice.address)
      .add32(clearThreshold)
      .encrypt();

    const tx = await temperatureCheckContract
      .connect(signers.alice)
      .submitAndCheck(
        encryptedTemperature.handles[0],
        encryptedThreshold.handles[0],
        encryptedTemperature.inputProof,
        encryptedThreshold.inputProof
      );
    await tx.wait();

    const encryptedTempResult = await temperatureCheckContract.getTemperature();
    const clearTempResult = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      encryptedTempResult,
      temperatureCheckContractAddress,
      signers.alice,
    );

    expect(clearTempResult).to.eq(clearTemperature);

    const encryptedFeverResult = await temperatureCheckContract.getFeverResult();
    const clearFeverResult = await fhevm.userDecryptEbool(
      encryptedFeverResult,
      temperatureCheckContractAddress,
      signers.alice,
    );

    expect(clearFeverResult).to.eq(false); // 36.5°C < 37.5°C, no fever
  });

  it("should submit fever temperature (38.0°C) and check fever detected", async function () {
    const clearTemperature = 380; // 38.0°C in tenths
    const clearThreshold = FEVER_THRESHOLD; // 37.5°C

    // Encrypt temperature as a euint32
    const encryptedTemperature = await fhevm
      .createEncryptedInput(temperatureCheckContractAddress, signers.alice.address)
      .add32(clearTemperature)
      .encrypt();

    // Encrypt threshold as a euint32
    const encryptedThreshold = await fhevm
      .createEncryptedInput(temperatureCheckContractAddress, signers.alice.address)
      .add32(clearThreshold)
      .encrypt();

    const tx = await temperatureCheckContract
      .connect(signers.alice)
      .submitAndCheck(
        encryptedTemperature.handles[0],
        encryptedThreshold.handles[0],
        encryptedTemperature.inputProof,
        encryptedThreshold.inputProof
      );
    await tx.wait();

    const encryptedTempResult = await temperatureCheckContract.getTemperature();
    const clearTempResult = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      encryptedTempResult,
      temperatureCheckContractAddress,
      signers.alice,
    );

    expect(clearTempResult).to.eq(clearTemperature);

    const encryptedFeverResult = await temperatureCheckContract.getFeverResult();
    const clearFeverResult = await fhevm.userDecryptEbool(
      encryptedFeverResult,
      temperatureCheckContractAddress,
      signers.alice,
    );

    expect(clearFeverResult).to.eq(true); // 38.0°C >= 37.5°C, fever detected
  });

  it("should submit boundary temperature (37.5°C) and check fever detected", async function () {
    const clearTemperature = 375; // 37.5°C in tenths (exactly at threshold)
    const clearThreshold = FEVER_THRESHOLD; // 37.5°C

    // Encrypt temperature as a euint32
    const encryptedTemperature = await fhevm
      .createEncryptedInput(temperatureCheckContractAddress, signers.alice.address)
      .add32(clearTemperature)
      .encrypt();

    // Encrypt threshold as a euint32
    const encryptedThreshold = await fhevm
      .createEncryptedInput(temperatureCheckContractAddress, signers.alice.address)
      .add32(clearThreshold)
      .encrypt();

    const tx = await temperatureCheckContract
      .connect(signers.alice)
      .submitAndCheck(
        encryptedTemperature.handles[0],
        encryptedThreshold.handles[0],
        encryptedTemperature.inputProof,
        encryptedThreshold.inputProof
      );
    await tx.wait();

    const encryptedFeverResult = await temperatureCheckContract.getFeverResult();
    const clearFeverResult = await fhevm.userDecryptEbool(
      encryptedFeverResult,
      temperatureCheckContractAddress,
      signers.alice,
    );

    expect(clearFeverResult).to.eq(true); // 37.5°C >= 37.5°C, fever detected
  });
});


// Implement unit tests for encrypted operations

// Add tests for boundary conditions and error scenarios
