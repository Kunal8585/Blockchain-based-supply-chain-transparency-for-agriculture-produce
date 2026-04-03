import "@nomicfoundation/hardhat-ethers";

/** @type import('hardhat/config').HardhatUserConfig */
export default {
  solidity: "0.8.20",
  networks: {
    ganache: {
      url: "http://127.0.0.1:7545",
      // IMPORTANT: Get the PRIVATE KEY from the Key Icon in Ganache
      accounts: ["0xd24828f3cf47a00e2ef31f23bf8c59bce0a599dd7e4a5960448e761fba92cd3f"],
    },
  },
};