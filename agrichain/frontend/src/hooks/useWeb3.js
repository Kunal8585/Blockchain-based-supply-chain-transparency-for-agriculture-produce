import { useState, useCallback } from 'react';
import { ethers } from 'ethers';

// Defining minimal abi to prevent hard dependency crashes if contract not compiled
const minimalAbi = [
  "function createBatch(string _cropType, string _location)",
  "function transferBatch(uint _id, address _nextCustodian, string _newLocation)",
  "function verifyQuality(uint _id)",
  "function batches(uint) view returns (uint id, string cropType, address currentOwner, string location, uint timestamp, bool isQualityVerified)",
  "event BatchCreated(uint indexed id, string cropType, address indexed owner, string location, uint timestamp)",
  "event BatchTransferred(uint indexed id, address indexed previousOwner, address indexed newOwner, string newLocation, uint timestamp)",
  "event QualityVerified(uint indexed id, address indexed inspector, uint timestamp)"
];

export function useWeb3() {
    const [provider, setProvider] = useState(null);
    const [contract, setContract] = useState(null);
    const [address, setAddress] = useState("");

    const connectWallet = async () => {
        if (!window.ethereum) return alert("Please install MetaMask or a Web3 provider");
        try {
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            const web3Provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await web3Provider.getSigner();
            const addr = await signer.getAddress();
            
            // Expected contract address from Hardhat local node once deployed
            const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS || "0x5FbDB2315678afecb367f032d93F642f64180aa3";
            const agrichainContract = new ethers.Contract(contractAddress, minimalAbi, signer);

            setProvider(web3Provider);
            setContract(agrichainContract);
            setAddress(addr);
        } catch(e) {
            console.error("Connection failed", e);
        }
    };

    const getBatchHistory = useCallback(async (batchId) => {
        if (!contract) return null;
        try {
            const batch = await contract.batches(batchId);
            // In a production app, we would query `queryFilter` for events to get complete history
            // Here we return the latest state
            return {
                id: batch.id.toString(),
                cropType: batch.cropType,
                currentOwner: batch.currentOwner,
                location: batch.location,
                timestamp: new Date(Number(batch.timestamp) * 1000).toLocaleString(),
                isQualityVerified: batch.isQualityVerified
            };
        } catch(e) {
            console.error("Failed to fetch batch", e);
            throw e;
        }
    }, [contract]);

    return { connectWallet, address, contract, getBatchHistory };
}
