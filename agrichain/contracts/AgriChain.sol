// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract AgriChain {
    enum Role { None, Admin, Farmer, Distributor, Inspector, Retailer }
    
    struct Batch {
        uint256 id;
        string cropType;
        address currentOwner;
        string location;
        uint256 timestamp;
        bool isQualityVerified;
        Role ownerRole;
    }

    mapping(address => Role) public roles;
    mapping(uint256 => Batch) public batches;
    uint256 public batchCount;

    // Add this Event to your contract
    event StatusUpdated(uint256 indexed id, Role handlerRole, string newLocation, uint256 timestamp);

    modifier onlyRole(Role _role) {
        require(roles[msg.sender] == _role, "Not authorized");
        _;
    }

    // Assign roles (In a real app, Admin would do this)
    function assignRole(address _user, Role _role) public {
        roles[_user] = _role;
    }

    function createBatch(string memory _crop, string memory _loc) public onlyRole(Role.Farmer) {
        batchCount++;
        batches[batchCount] = Batch(batchCount, _crop, msg.sender, _loc, block.timestamp, false, Role.Farmer);
    }

    function verifyQuality(uint256 _id) public onlyRole(Role.Inspector) {
        batches[_id].isQualityVerified = true;
    }

    function updateStatus(uint256 _id, string memory _newLoc) public {
        Role senderRole = roles[msg.sender];
        require(senderRole == Role.Distributor || senderRole == Role.Inspector || senderRole == Role.Retailer || senderRole == Role.Farmer, "Not authorized to update status");
        
        Batch storage b = batches[_id];
        b.location = _newLoc;
        b.timestamp = block.timestamp;
        
        emit StatusUpdated(_id, senderRole, _newLoc, block.timestamp);
    }

    function getBatch(uint256 _id) public view returns (Batch memory) {
        return batches[_id];
    }
}