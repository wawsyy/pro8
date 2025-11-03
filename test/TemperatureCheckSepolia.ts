import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers, fhevm, deployments } from "hardhat";
import { EncryptedTemperatureCheck } from "../types";
import { expect } from "chai";
import { FhevmType } from "@fhevm/hardhat-plugin";

type Signers = {
  alice: HardhatEthersSigner;
};

describe("TemperatureCheckSepolia", function () {
  let signers: Signers;
  let temperatureCheckContract: EncryptedTemperatureCheck;
  let temperatureCheckContractAddress: string;
  let step: number;
  let steps: number;
  const FEVER_THRESHOLD = 375; // 37.5°C in tenths

  function progress(message: string) {
    console.log(`${++step}/${steps} ${message}`);
  }

  before(async function () {
    if (fhevm.isMock) {
      console.warn(`This hardhat test suite can only run on Sepolia Testnet`);
      this.skip();
    }

    try {
      const TemperatureCheckDeployment = await deployments.get("EncryptedTemperatureCheck");
      temperatureCheckContractAddress = TemperatureCheckDeployment.address;
      temperatureCheckContract = await ethers.getContractAt("EncryptedTemperatureCheck", TemperatureCheckDeployment.address);
    } catch (e) {
      (e as Error).message += ". Call 'npx hardhat deploy --network sepolia'";
      throw e;
    }

    const ethSigners: HardhatEthersSigner[] = await ethers.getSigners();
    signers = { alice: ethSigners[0] };
  });

  beforeEach(async () => {
    step = 0;
    steps = 0;
  });

  it("should submit temperature and check fever result", async function () {
    steps = 12;

    this.timeout(4 * 40000);

    const clearTemperature = 380; // 38.0°C in tenths
    const clearThreshold = FEVER_THRESHOLD; // 37.5°C

    progress(`Encrypting temperature ${clearTemperature / 10}°C...`);
    const encryptedTemperature = await fhevm
      .createEncryptedInput(temperatureCheckContractAddress, signers.alice.address)
      .add32(clearTemperature)
      .encrypt();

    progress(`Encrypting threshold ${clearThreshold / 10}°C...`);
    const encryptedThreshold = await fhevm
      .createEncryptedInput(temperatureCheckContractAddress, signers.alice.address)
      .add32(clearThreshold)
      .encrypt();

    progress(
      `Call submitAndCheck() TemperatureCheck=${temperatureCheckContractAddress} temperature=${clearTemperature / 10}°C signer=${signers.alice.address}...`,
    );
    let tx = await temperatureCheckContract
      .connect(signers.alice)
      .submitAndCheck(
        encryptedTemperature.handles[0],
        encryptedThreshold.handles[0],
        encryptedTemperature.inputProof,
        encryptedThreshold.inputProof
      );
    await tx.wait();

    progress(`Call TemperatureCheck.getTemperature()...`);
    const encryptedTempAfterSubmit = await temperatureCheckContract.getTemperature();
    expect(encryptedTempAfterSubmit).to.not.eq(ethers.ZeroHash);

    progress(`Decrypting TemperatureCheck.getTemperature()=${encryptedTempAfterSubmit}...`);
    const clearTempAfterSubmit = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      encryptedTempAfterSubmit,
      temperatureCheckContractAddress,
      signers.alice,
    );
    progress(`Clear TemperatureCheck.getTemperature()=${clearTempAfterSubmit / 10}°C (${clearTempAfterSubmit} tenths)`);

    expect(clearTempAfterSubmit).to.eq(clearTemperature);

    progress(`Call TemperatureCheck.getFeverResult()...`);
    const encryptedFeverResult = await temperatureCheckContract.getFeverResult();

    progress(`Decrypting TemperatureCheck.getFeverResult()=${encryptedFeverResult}...`);
    const clearFeverResult = await fhevm.userDecryptEbool(
      encryptedFeverResult,
      temperatureCheckContractAddress,
      signers.alice,
    );
    progress(`Clear TemperatureCheck.getFeverResult()=${clearFeverResult ? "FEVER" : "NORMAL"}`);

    expect(clearFeverResult).to.eq(true); // 38.0°C >= 37.5°C, fever detected
  });
});


// Add network-specific test scenarios
