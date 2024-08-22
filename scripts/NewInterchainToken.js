const { ethers } = require("hardhat");
const { randomBytes } = require("crypto");
const {
  AxelarQueryAPI,
  Environment,
  EvmChain,
  GasToken,
} = require("@axelar-network/axelarjs-sdk");

const interchainTokenServiceContractABI = require("../utils/interchainTokenServiceABI.json");
const interchainTokenFactoryContractABI = require("../utils/interchainTokenFactoryABI.json");
const interchainTokenContractABI = require("../utils/interchainTokenABI.json");

const interchainTokenServiceContractAddress =
  "0xB5FB4BE02232B1bBA4dC8f81dc24C26980dE9e3C";
const interchainTokenFactoryContractAddress =
  "0x83a93500d23Fbc3e82B410aD07A6a9F7A0670D66";

const getContractInstance = async (contractAddress, contractABI, signer) => {
  return new ethers.Contract(contractAddress, contractABI, signer);
};

async function deployInterchainToken() {
    const salt = `0x${randomBytes(32).toString("hex")}`;
    const name = "Avax Token Interchain";
    const symbol = "ATIC";
    const decimals = 18;

    const initialSupply = ethers.parseEther("10000");
    const [signer] = await ethers.getSigners();

    console.log(`Deploying Interchain Token with salt: ${salt}`);
    console.log(`Deploying Interchain Token with signer: ${signer.address}`);
    
    // Create contract instances
    const interchainTokenFactoryContract = await getContractInstance(
        interchainTokenFactoryContractAddress,
        interchainTokenFactoryContractABI,
        signer
    );
    const interchainTokenServiceContract = await getContractInstance(
        interchainTokenServiceContractAddress,
        interchainTokenServiceContractABI,
        signer
    );

   // Generate a unique token ID using the signer's address and salt
  const tokenId = await interchainTokenFactoryContract.interchainTokenId(
    signer.address,
    salt
  );

  // Retrieve new token address
  const tokenAddress =
   await interchainTokenServiceContract.interchainTokenAddress(tokenId);

  // Retrieve token manager address
  const expectedTokenManagerAddress =
    await interchainTokenServiceContract.tokenManagerAddress(tokenId);

  // Deploy new Interchain Token
  const deployTxData =
    await interchainTokenFactoryContract.deployInterchainToken(
      salt,
      name,
      symbol,
      decimals,
      initialSupply,
      signer.address
    );

    console.log(
    `
      Deployed Token ID: ${tokenId},
      Token Address: ${tokenAddress},
      Transaction Hash: ${deployTxData.hash},
      salt: ${salt},
      Expected Token Manager Address: ${expectedTokenManagerAddress},
    `
    );
};

// deployInterchainToken().catch(console.error);

const axelarQueryAPI = new AxelarQueryAPI({ environment: Environment.TESTNET });

const gasEstimator = async() => {
  const gas = await axelarQueryAPI.estimateGasFee(
    EvmChain.AVALANCHE,
    EvmChain.BASE_SEPOLIA,
    8000000,
    "auto",
    GasToken.AVAX,
    //225000000000,
  )
  console.log(`Estimated gas fee: ${gas}`);
  return gas;
};

// gasEstimator().catch(console.error);

async function deployToRemoteChain() {

  // Get a signer for authorizing transactions
  const [signer] = await ethers.getSigners();

  // Get contract for remote deployment
  const interchainTokenFactoryContract = await getContractInstance(
    interchainTokenFactoryContractAddress,
    interchainTokenFactoryContractABI,
    signer
  );

  console.log('-------------', interchainTokenFactoryContract.deployRemoteInterchainToken);
  // Estimate gas fees
  const gasAmount = await gasEstimator();

  console.log('GAS: ', gasAmount)
  // Salt value from deployInterchainToken(). Replace with your own
  const salt =
    "0xa6fb7365c59dd47ba71a3395bc4b254e362df645bd72f1f84c39a9619c464f53";

  console.log(">>>>>>>>>>>>> Signer Address: ", signer.address);
  // Initiate transaction
  // For the chain names view https://docs.axelar.dev/resources/contract-addresses/testnet
  const txn = await interchainTokenFactoryContract.deployRemoteInterchainToken(
    EvmChain.AVALANCHE,
    salt,
    signer.address,
    EvmChain.BASE_SEPOLIA,
    gasAmount,
    { value: gasAmount, gasLimit: 8000000 }
  );

  console.log(`Transaction Hash: ${txn.hash}`);
}

deployToRemoteChain().catch(console.error);