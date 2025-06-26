// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// Import Hardhat's console for debugging
import "hardhat/console.sol";

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

// Custom errors for revert statements, all prefixed with LandTitleDeed_
error LandTitleDeed_NotLandOwner();
error LandTitleDeed_InvalidLandAdmin();
error LandTitleDeed_LandCodeExists();
error LandTitleDeed_LandNotActive();
error LandTitleDeed_LandNotListed();
error LandTitleDeed_LandNotOwned();
error LandTitleDeed_InvalidLandOwner();
error LandTitleDeed_LandNotForSale();

/ This contract manages land title deeds using ERC1155 tokens.
// It allows land registration, minting title deeds, listing land for sale, and transferring ownership.
// The contract includes functionalities for land administration, land ownership, and land transactions.
// It uses OpenZeppelin's libraries for token standards, ownership management, and security against reentrancy attacks.
// The contract is designed to handle land layouts, ownership, and transactions securely and efficiently.
// It includes features for land layout creation, registration, minting title deeds, listing and unlisting land, and buying land.
// The contract also provides view functions to retrieve land details, title deeds, and ownership information.

// This contract handles three users:
// 1. Land Admin
// 2. Land Owners (requires user address owns one of the lands in the struct below)
// 3. New users can buy land layouts and mint title deeds

contract LandTitleDeed is ERC1155, Ownable, ReentrancyGuard {
    // Address of the land admin
    address payable public landAdmin;

    // Enum for land status
    enum LandStatus {
        New,
        Active,
        Listed,
        Inactive
    }

    using Counters for Counters.Counter;
    Counters.Counter private _landIds; // Counter for land IDs

    uint256 initialLandValue = 1 ether; // Initial value for land

    // Struct to store land layout details
    struct LandLayout {
        string landCode; // Unique code for the land
        string layoutUrl; // IPFS URL for the land layout
        address landOwner; // Owner of the land
        string titleDeedUrl; // IPFS URL for the title deed
        LandStatus landStatus; // Status of the land
        uint256 landValue; // Value of the land
    }

    // Mapping from land ID to LandLayout struct
    mapping(uint256 land_id => LandLayout land_layout) private landLayouts;

    // Mapping from owner address to array of owned land IDs
    mapping(address landOwner => uint256[] landOwnerIds) private titleDeeds;

    // Mapping to track used land codes
    mapping(string => bool) private usedLandCodes;

    // Events for various actions
    event LandLayoutCreated(string landCode, string layoutUrl);
    event landRegistrationEvent(uint256 indexed landId, address landOwner);
    event TitleDeedMinted(
        uint256 indexed landId,
        address indexed owner,
        string titleDeedUrl
    );
    event LandListed(uint256 indexed landId, uint256 price);
    event LandUnlisted(uint256 indexed landId, uint256 price);
    event LandSold(
        uint256 indexed landId,
        address indexed from,
        address indexed to,
        uint256 amount
    );

    // Constructor sets the ERC1155 URI and the contract owner
    constructor() ERC1155("https://api.landregistry.com/metadata/{id}") {}

    //     Ownable(msg.sender)
    // Set a new land admin address, only callable by contract owner
    function setLandAdmin(address _landAdmin) public onlyOwner {
        landAdmin = payable(_landAdmin); // Set the new land admin
        console.log("Land admin set to:", _landAdmin); // Debug log
    }

    // Admin function to create a new land layout
    function createLandLayout(
        string memory landCode,
        string memory layoutUrl
    ) external {
        // Only land admin can call
        if (msg.sender != landAdmin) {
            console.log("Unauthorized land layout creation by:", msg.sender);
            revert LandTitleDeed_InvalidLandAdmin();
        }
        // Check for duplicate land code
        if (usedLandCodes[landCode]) {
            console.log("Land code already exists:", landCode);
            revert LandTitleDeed_LandCodeExists();
        }

        _landIds.increment(); // Increment land ID counter
        uint256 landId = _landIds.current(); // Get new land ID

        // Create new land layout
        landLayouts[landId] = LandLayout({
            landCode: landCode,
            layoutUrl: layoutUrl,
            landOwner: msg.sender,
            titleDeedUrl: layoutUrl,
            landStatus: LandStatus.New,
            landValue: initialLandValue
        });

        usedLandCodes[landCode] = true; // Mark land code as used
        emit LandLayoutCreated(landCode, layoutUrl); // Emit event
        console.log("Land layout created:", landCode, layoutUrl); // Debug log
    }

    // Admin function to register a land to an owner
    function landRegistration(uint256 _landId, address landOwner) external {
        // Only land admin can call
        if (msg.sender != landAdmin) {
            console.log("Unauthorized land registration by:", msg.sender);
            revert LandTitleDeed_InvalidLandAdmin();
        }
        landLayouts[_landId].landOwner = landOwner; // Assign owner
        landLayouts[_landId].landStatus = LandStatus.Active; // Set status to active
        emit landRegistrationEvent(_landId, landOwner); // Emit event
        console.log("Land registered:", _landId, landOwner); // Debug log
    }

    // Land owner function to mint a title deed
    function mintTitleDeed(
        uint256 _landId,
        string memory _titleDeedUrl
    ) external nonReentrant {
        // Only land owner can call
        if (landLayouts[_landId].landOwner != msg.sender) {
            console.log("Unauthorized mint attempt by:", msg.sender);
            revert LandTitleDeed_NotLandOwner();
        }
        // Land must be active
        if (landLayouts[_landId].landStatus != LandStatus.Active) {
            console.log("Land not active for minting:", _landId);
            revert LandTitleDeed_LandNotActive();
        }

        string memory landLayoutUrl = landLayouts[_landId].layoutUrl; // Get layout URL
        _mint(msg.sender, _landId, 1, bytes(landLayoutUrl)); // Mint the token

        landLayouts[_landId].titleDeedUrl = _titleDeedUrl; // Set title deed URL

        emit TitleDeedMinted(_landId, msg.sender, _titleDeedUrl); // Emit event
        console.log("Title deed minted for land:", _landId, _titleDeedUrl); // Debug log
    }

    // List land for sale, only callable by land owner
    function listLand(uint256 _landId) public {
        // Only land owner can call
        if (landLayouts[_landId].landOwner != msg.sender) {
            console.log("Unauthorized list attempt by:", msg.sender);
            revert LandTitleDeed_NotLandOwner();
        }
        // Land must be active
        if (landLayouts[_landId].landStatus != LandStatus.Active) {
            console.log("Land not active for listing:", _landId);
            revert LandTitleDeed_LandNotActive();
        }
        landLayouts[_landId].landStatus = LandStatus.Listed; // Set status to listed

        string memory landUrl = landLayouts[_landId].layoutUrl; // Get layout URL

        setApprovalForAll(address(this), true); // Approve contract to handle token

        _safeTransferFrom(
            msg.sender,
            address(this),
            _landId,
            1,
            bytes(landUrl)
        ); // Transfer token to contract
        console.log("Land listed for sale:", _landId); // Debug log
    }

    // IERC1155Receiver implementation
    function onERC1155Received() external pure returns (bytes4) {
        return this.onERC1155Received.selector;
    }

    function onERC1155BatchReceived() external pure returns (bytes4) {
        return this.onERC1155BatchReceived.selector;
    }

    // Unlist land from sale, only callable by land owner
    function unlistLand(uint256 _landId) public {
        // Only land owner can call
        if (landLayouts[_landId].landOwner != msg.sender) {
            console.log("Unauthorized unlist attempt by:", msg.sender);
            revert LandTitleDeed_NotLandOwner();
        }
        // Land must be listed
        if (landLayouts[_landId].landStatus != LandStatus.Listed) {
            console.log("Land not listed for unlisting:", _landId);
            revert LandTitleDeed_LandNotListed();
        }

        landLayouts[_landId].landStatus = LandStatus.Active; // Reset status
        console.log("Land unlisted:", _landId); // Debug log
    }

    // Buy land that is listed for sale
    function buyLand(uint256 _landId) public payable nonReentrant {
        LandLayout storage land = landLayouts[_landId]; // Get land layout

        // Land must be listed for sale
        if (land.landStatus != LandStatus.Listed) {
            console.log("Land not listed for sale:", _landId);
            revert LandTitleDeed_LandNotForSale();
        }

        // Land must have a valid owner
        if (land.landOwner == address(0)) {
            console.log("Invalid land owner for land:", _landId);
            revert LandTitleDeed_InvalidLandOwner();
        }

        address previousOwner = land.landOwner; // Store previous owner
        payable(previousOwner).transfer(msg.value); // Transfer payment

        land.landOwner = msg.sender; // Update owner
        land.landStatus = LandStatus.Active; // Set status to active

        safeTransferFrom(address(this), msg.sender, _landId, 1, ""); // Transfer token
        emit LandSold(_landId, previousOwner, msg.sender, msg.value); // Emit event

        //         console.log(
        //             "Land sold:",
        //             _landId,
        //             previousOwner,
        //             msg.sender,
        //             msg.value
        //         ); // Debug log
    }

    // View function to get a title deed by land ID
    function getTitleDeed(
        uint256 _landId
    ) public view returns (LandLayout memory) {
        return landLayouts[_landId];
    }

    // View function to get total land count
    function getTotalLandCount() public view returns (uint256) {
        return _landIds.current();
    }

    // View function to get land layout by ID
    function getLandLayout(
        uint256 _landId
    ) public view returns (LandLayout memory) {
        return landLayouts[_landId];
    }

    // View function to get all land layouts
    function getAllLandLayouts() external view returns (LandLayout[] memory) {
        uint256 totalLands = _landIds.current();
        LandLayout[] memory allLands = new LandLayout[](totalLands);

        for (uint256 i = 1; i <= totalLands; i++) {
            allLands[i - 1] = landLayouts[i];
        }

        return allLands;
    }

    // View function to get all land owned by the caller
    function getOwnerDeeds() public view returns (LandLayout[] memory) {
        uint[] memory MyTitleIDs = titleDeeds[msg.sender];
        LandLayout[] memory landArray = new LandLayout[](MyTitleIDs.length);

        for (uint256 i = 0; i < MyTitleIDs.length; i++) {
            LandLayout memory land_layout = getLandLayout(MyTitleIDs[i]);
            landArray[i] = land_layout;
        }
        return landArray;
    }
}
