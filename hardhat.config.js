require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 1337,
    },
    mumbai: {
      url: `https://polygon-mumbai.g.alchemy.com/v2/nAhiCHKvZkhkp4A7PkkCIBON0-BXW26d`,
      //accounts: [process.env.privateKey]
    },
    rinkeby: {
      url: "https://eth-rinkeby.alchemyapi.io/v2/EhCczk92CtFVxUeyzDMZtkGGf-oQ4EH9",
      accounts: [
        "private key",
      ],
    },
    waterfall: {
      url: "https://rpc.waterfall.network/rpc",
      chainId: 333777333,
      accounts: ["private key"],
      from: '0xBcA2E96B6DAC862aC1a3984445f6fcdAADB51C25',
      gasPrice: 20000000000,
      gas: 3000000,
    },
  },
  solidity: {
    version: "0.8.4",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
};
