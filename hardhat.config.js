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
        "8a5a05cba138e0974b172b62f985225fcfe865319806039821f67786e180e511",
      ],
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
