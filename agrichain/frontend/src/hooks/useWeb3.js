import { useState, useCallback } from 'react';
import { ethers } from 'ethers';
import AgriChainArtifact from '../artifacts/AgriChain.json';

const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS || "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const GANACHE_RPC = "http://127.0.0.1:7545";

export function useWeb3() {
    const [contract, setContract] = useState(null);
    const [address, setAddress] = useState('');
    const [role, setRole] = useState(null); // fetched from contract

    const ROLES = ['None', 'Admin', 'Farmer', 'Distributor', 'Inspector', 'Retailer'];

    const connectWallet = async () => {
        if (!window.ethereum) return alert('Please install MetaMask!');
        try {
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            const web3Provider = new ethers.BrowserProvider(window.ethereum);
            const _signer = await web3Provider.getSigner();
            const addr = await _signer.getAddress();

            const signedContract = new ethers.Contract(CONTRACT_ADDRESS, AgriChainArtifact.abi, _signer);

            setContract(signedContract);
            setAddress(addr);

            // Fetch this wallet's role from the smart contract
            try {
                const roleIndex = await signedContract.roles(addr);
                setRole(ROLES[Number(roleIndex)]);
            } catch(e) {
                setRole('None');
            }

            return signedContract;
        } catch(e) {
            console.error('MetaMask connection failed', e);
        }
    };

    // Read-only: uses Ganache JsonRpcProvider, no MetaMask needed
    const getBatchHistory = useCallback(async (batchId) => {
        try {
            const readProvider = new ethers.JsonRpcProvider(GANACHE_RPC);
            const readContract = new ethers.Contract(CONTRACT_ADDRESS, AgriChainArtifact.abi, readProvider);
            const batch = await readContract.getBatch(batchId);

            if (Number(batch.id) === 0) return null;

            return {
                id: Number(batch.id),
                cropType: batch.cropType,
                currentOwner: batch.currentOwner,
                location: batch.location,
                timestamp: Number(batch.timestamp),
                isQualityVerified: batch.isQualityVerified,
                ownerRole: ROLES[Number(batch.ownerRole)],
            };
        } catch(e) {
            console.error('Failed to fetch batch from chain', e);
            throw e;
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Signed write: create a new batch (Farmer only)
    const createBatch = useCallback(async (cropType, location) => {
        let _contract = contract;
        if (!_contract) _contract = await connectWallet();
        const tx = await _contract.createBatch(cropType, location);
        const receipt = await tx.wait();
        return receipt;
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [contract]);

    // Signed write: assign a role to a wallet (open for demo; in prod, admin only)
    const assignRole = useCallback(async (walletAddress, roleIndex) => {
        let _contract = contract;
        if (!_contract) _contract = await connectWallet();
        const tx = await _contract.assignRole(walletAddress, roleIndex);
        await tx.wait();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [contract]);

    return { connectWallet, address, role, contract, getBatchHistory, createBatch, assignRole };
}
