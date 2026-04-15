import { useState, useCallback } from 'react';
import { ethers } from 'ethers';
import AgriChainArtifact from '../artifacts/AgriChain.json';

const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS || "0x06b7874759380197E25329348CB41eA9365cF773";
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
            } catch (e) {
                setRole('None');
            }

            return signedContract;
        } catch (e) {
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
                location: batch.location || "Location not found",
                timestamp: Number(batch.timestamp),
                isQualityVerified: batch.isQualityVerified,
                ownerRole: ROLES[Number(batch.ownerRole)],
            };
        } catch (e) {
            console.error('Failed to fetch batch from chain', e);
            throw e;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Direct write: create a new batch (Bypasses MetaMask, uses local node)
    const createBatch = useCallback(async (cropType, location) => {
        try {
            const provider = new ethers.JsonRpcProvider(GANACHE_RPC);
            const signer = await provider.getSigner(0); // Automatically grabs the first local Ganache account
            const directContract = new ethers.Contract(CONTRACT_ADDRESS, AgriChainArtifact.abi, signer);
            
            // Auto-assign Farmer role (2) to this Ganache account so the transaction won't revert
            const currentRole = await directContract.roles(signer.address);
            if (Number(currentRole) !== 2) {
                const roleTx = await directContract.assignRole(signer.address, 2);
                await roleTx.wait();
            }

            const tx = await directContract.createBatch(cropType, location);
            const receipt = await tx.wait();
            return receipt;
        } catch (e) {
            console.error('Direct createBatch failed', e);
            throw e;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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
