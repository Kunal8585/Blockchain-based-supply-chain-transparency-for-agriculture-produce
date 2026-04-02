// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract AgriChain {
    enum Role { None, Admin, Farmer, Distributor, Inspector, Retailer }
    
    mapping(address => Role) public roles;
    address public admin;
    
    struct Batch {
        uint id;
        string cropType;
        address currentOwner;
        string location;
        uint timestamp;
        bool isQualityVerified;
    }
    
    mapping(uint => Batch) public batches;
    uint public batchCounter;

    // Events to track history sequentially
    event BatchCreated(uint indexed id, string cropType, address indexed owner, string location, uint timestamp);
    event BatchTransferred(uint indexed id, address indexed previousOwner, address indexed newOwner, string newLocation, uint timestamp);
    event QualityVerified(uint indexed id, address indexed inspector, uint timestamp);
    
    modifier onlyRole(Role _role) {
        require(roles[msg.sender] == _role, "Unauthorized: Requires specific role");
        _;
    }
    
    modifier onlyAdmin() {
        require(msg.sender == admin, "Unauthorized: Admin only");
        _;
    }
    
    constructor() {
        admin = msg.sender;
        roles[msg.sender] = Role.Admin;
    }
    
    function assignRole(address _user, Role _role) public onlyAdmin {
        roles[_user] = _role;
    }
    
    function createBatch(string memory _cropType, string memory _location) public onlyRole(Role.Farmer) {
        batchCounter++;
        batches[batchCounter] = Batch({
            id: batchCounter,
            cropType: _cropType,
            currentOwner: msg.sender,
            location: _location,
            timestamp: block.timestamp,
            isQualityVerified: false
        });

        emit BatchCreated(batchCounter, _cropType, msg.sender, _location, block.timestamp);
    }
    
    function transferBatch(uint _id, address _nextCustodian, string memory _newLocation) public {
        require(batches[_id].id != 0, "Batch does not exist");
        require(batches[_id].currentOwner == msg.sender, "Only current owner can transfer");
        
        address previousOwner = batches[_id].currentOwner;
        batches[_id].currentOwner = _nextCustodian;
        batches[_id].location = _newLocation;
        batches[_id].timestamp = block.timestamp;

        emit BatchTransferred(_id, previousOwner, _nextCustodian, _newLocation, block.timestamp);
    }
    
    function verifyQuality(uint _id) public onlyRole(Role.Inspector) {
        require(batches[_id].id != 0, "Batch does not exist");
        batches[_id].isQualityVerified = true;

        emit QualityVerified(_id, msg.sender, block.timestamp);
    }
}
