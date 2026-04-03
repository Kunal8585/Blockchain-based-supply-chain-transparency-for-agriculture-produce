import React, { createContext, useContext, useState, useCallback } from 'react';
import { ethers } from 'ethers';
import AgriChainArtifact from '../artifacts/AgriChain.json';

const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS || "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const GANACHE_RPC = "http://127.0.0.1:7545";
const ROLES = ['None', 'Admin', 'Farmer', 'Distributor', 'Inspector', 'Retailer'];

const Web3Context = createContext(null);

export const Web3Provider = ({ children }) => {
    const [contract, setContract] = useState(null);
    const [address, setAddress] = useState('');
    const [role, setRole] = useState(null);
    const [isConnected, setIsConnected] = useState(false);

    const connectWallet = async () => {
        if (!window.ethereum) {
            alert('MetaMask is not installed. Please install it to interact with the blockchain.');
            return;
        }
        try {
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            const web3Provider = new ethers.BrowserProvider(window.ethereum);
            const _signer = await web3Provider.getSigner();
            const addr = await _signer.getAddress();

            const signedContract = new ethers.Contract(CONTRACT_ADDRESS, AgriChainArtifact.abi, _signer);

            setContract(signedContract);
            setAddress(addr);
            setIsConnected(true);

            try {
                const roleIndex = await signedContract.roles(addr);
                setRole(ROLES[Number(roleIndex)]);
            } catch (e) {
                setRole('None');
            }

            return signedContract;
        } catch (e) {
            console.error('MetaMask connection failed', e);
        }
    };

    // Read-only fetch — no MetaMask required
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
        } catch (e) {
            console.error('getBatchHistory failed', e);
            throw e;
        }
    }, []);

    const assignRole = useCallback(async (walletAddress, roleIndex) => {
        let _contract = contract;
        if (!_contract) _contract = await connectWallet();
        const tx = await _contract.assignRole(walletAddress, roleIndex);
        await tx.wait();
    }, [contract]);

    const createBatch = useCallback(async (cropType, location) => {
        let _contract = contract;
        if (!_contract) _contract = await connectWallet();
        const tx = await _contract.createBatch(cropType, location);
        return await tx.wait();
    }, [contract]);

    return (
        <Web3Context.Provider value={{ connectWallet, address, role, contract, isConnected, getBatchHistory, assignRole, createBatch, ROLES }}>
            {children}
        </Web3Context.Provider>
    );
};

export const useWeb3Context = () => useContext(Web3Context);
