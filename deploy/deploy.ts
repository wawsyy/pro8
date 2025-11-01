import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  const deployedTemperatureCheck = await deploy("EncryptedTemperatureCheck", {
    from: deployer,
    log: true,
  });

  console.log(`EncryptedTemperatureCheck contract: `, deployedTemperatureCheck.address);
};
export default func;
func.id = "deploy_temperatureCheck"; // id required to prevent reexecution
func.tags = ["EncryptedTemperatureCheck"];

// Add deployment logic with proper configuration
