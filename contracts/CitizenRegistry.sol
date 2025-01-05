// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// Citizen Registry contract
// This contract is used to store citizen data and verify citizens
// The National Registration Bureau (NRB) can verify citizens
// Citizens can register themselves and provide their data
// The NRB can verify citizens by setting their status to Verified
// Citizens can be checked if they are verified


// author: Born To Code Foundation
// email: born2code265@gmail.com
// version: 1.0.0
// created: 2024-12-27
// 
contract CitizenRegistry {
    // Owner address (National Registration Bureau)
    address public nrb;

    // Enum for ID status
    enum IDStatus {
        New,
        Verified,
        Suspended
    }

    // Struct to store citizen data
    struct Citizen {
        string name;
        string email;
        string country;
        string nationalId;
        string phoneNumber;
        uint256 age;
        IDStatus status;
    }

    // Mapping from wallet address to Citizen
    mapping(address => Citizen) public citizens;

    // Events
    event CitizenRegistered(
        address indexed citizen,
        string name,
        string nationalId
    );
    event CitizenVerified(address indexed citizen, string nationalId);

    // Modifier to restrict functions to NRB
    modifier onlyNRB() {
        require(msg.sender == nrb, "Only NRB can perform this action");
        _;
    }

    // Constructor to set NRB address
    constructor() {
        nrb = msg.sender;
    }

    // Function for citizens to register themselves
    function registerCitizen(
        string memory _name,
        string memory _email,
        string memory _country,
        string memory _nationalId,
        string memory _phoneNumber,
        uint256 _age
    ) public {
        require(bytes(_nationalId).length > 0, "National ID cannot be empty");
        require(bytes(_email).length > 0, "Email cannot be empty");

        citizens[msg.sender] = Citizen({
            name: _name,
            email: _email,
            country: _country,
            nationalId: _nationalId,
            phoneNumber: _phoneNumber,
            age: _age,
            status: IDStatus.New
        });

        emit CitizenRegistered(msg.sender, _name, _nationalId);
    }

    // Function for NRB to verify a citizen
    function verifyCitizen(address _citizenAddress) public onlyNRB {
        Citizen storage citizen = citizens[_citizenAddress];

        require(
            citizen.status != IDStatus.Verified,
            "Citizen is already verified"
        );

        citizen.status = IDStatus.Verified;

        emit CitizenVerified(_citizenAddress, citizen.nationalId);
    }

    // Function to check if a citizen is verified
    function isCitizenVerified(
        address _citizenAddress
    ) public view returns (bool) {
        Citizen storage citizen = citizens[_citizenAddress];

        return citizen.status == IDStatus.Verified;
    }
}
