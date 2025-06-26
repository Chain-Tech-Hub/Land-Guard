// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

// This contract manages land title deeds using ERC1155 tokens.
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
    // This Contract handles three users
    //
    // Land Admin
    //Land Owners (requires user address owns the one of the Land in the struct below
    // new u
    address payable public landAdmin;

    // Structs and Enums
    enum LandStatus {
        New,
        Active,
        Listed,
        Inactive
    }

    using Counters for Counters.Counter;
    Counters.Counter private _landIds;

    uint256 initialLandValue = 1 ether; // Initial value for land

    //tracts the credibitlity of the land, ipfs hash of the land layout and the title deeds
    //
    struct LandLayout {
        string landCode;
        string layoutUrl;
        address landOwner;
        string titleDeedUrl;
        LandStatus landStatus;
        uint256 landValue;
    }

    //maps the land IDs  to the specific land layout created  by physical planning as evidence of boundries
    // of the land. through this, the land can be tracked and verified
    mapping(uint256 land_id => LandLayout land_layout) private landLayouts;

    //this tracks  ownership of the land by mapping the land owner to the land layout to form atitle deed
    mapping(address landOwner => uint256[] landOwnerIds) private titleDeeds;

    // tracks  already used land codes to prevent duplicates or conflicts of boundaries
    mapping(string => bool) private usedLandCodes;

    modifier landOwnerOnly(uint256 _landId) {
        require(
            landLayouts[_landId].landOwner == msg.sender,
            "Not the land owner"
        );
        _;
    }

    modifier onlyLandAdmin(address _landAdmin) {
        require(_landAdmin == landAdmin, "Invalid Land Admin");
        _;
    }

    // event  for  land layout creation
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

    constructor()
        ERC1155("https://api.landregistry.com/metadata/{id}")
        Ownable(msg.sender)
    {}

    // function to set new land admin address
    function setLandAdmin(address _landAdmin) public onlyOwner {
        landAdmin = payable(_landAdmin);
    }

    // Admin Functions
    // physical planning mint the land layout for the citizen
    function createLandLayout(
        string memory landCode,
        string memory layoutUrl
    ) external onlyLandAdmin(msg.sender) {
        require(!usedLandCodes[landCode], "Land code already exists");

        _landIds.increment();
        uint256 landId = _landIds.current();

        landLayouts[landId] = LandLayout({
            landCode: landCode,
            layoutUrl: layoutUrl,
            landOwner: msg.sender,
            titleDeedUrl: layoutUrl,
            landStatus: LandStatus.New
        });

        usedLandCodes[landCode] = true;
        emit LandLayoutCreated(landCode, layoutUrl);
    }

    // registration  by land admin for fresh land pacel
    //assigning owners address
    function landRegistration(
        uint256 _landId,
        address landOwner
    ) external onlyLandAdmin(msg.sender) {
        landLayouts[_landId].landOwner = landOwner;
        landLayouts[_landId].landStatus = LandStatus.Active;
        emit landRegistrationEvent(_landId, landOwner);
    }

    // Land owner Functions
    function mintTitleDeed(
        uint256 _landId,
        string memory _titleDeedUrl
    ) external nonReentrant landOwnerOnly(_landId) {
        require(
            landLayouts[_landId].landStatus == LandStatus.Active,
            "Land layout is not active"
        );

        string memory landLayoutUrl = landLayouts[_landId].layoutUrl;
        _mint(msg.sender, _landId, 1, bytes(landLayoutUrl));

        landLayouts[_landId].titleDeedUrl = _titleDeedUrl;

        emit TitleDeedMinted(_landId, msg.sender, _titleDeedUrl);
    }

    // Function to list land for sale
    // This function allows the land owner to list their land for sale at a specified price
    function listLand(uint256 _landId) public landOwnerOnly(_landId) {
        require(
            landLayouts[_landId].landStatus == LandStatus.Active,
            "Land is not active"
        );
        landLayouts[_landId].landStatus = LandStatus.Listed;

        string memory landUrl = landLayouts[_landId].layoutUrl;

        // First approve the contract to handle the token

        setApprovalForAll(address(this), true);

        _safeTransferFrom(
            msg.sender,
            address(this),
            _landId,
            1,
            bytes(landUrl)
        );
    }

    // Add IERC1155Receiver implementation
    function onERC1155Received() external pure returns (bytes4) {
        return this.onERC1155Received.selector;
    }

    function onERC1155BatchReceived() external pure returns (bytes4) {
        return this.onERC1155BatchReceived.selector;
    }

    // Function to unlist land from sale
    // This function allows the land owner to remove their land from the market
    function unlistLand(uint256 _landId) public landOwnerOnly(_landId) {
        require(
            landLayouts[_landId].landStatus == LandStatus.Listed,
            "Land is not listed"
        );

        // Reset land status and value
        landLayouts[_landId].landStatus = LandStatus.Active;
    }

    // Function to buy land
    // This function allows users to buy land that is listed for sale
    function buyLand(uint256 _landId) public payable nonReentrant {
        LandLayout storage land = landLayouts[_landId];

        require(
            land.landStatus == LandStatus.Listed,
            "Land not listed for sale"
        );

        require(land.landOwner != address(0), "Invalid land owner");

        address previousOwner = land.landOwner;
        // Transfer payment to previous owner
        payable(previousOwner).transfer(msg.value);
        // Update land ownership
        land.landOwner = msg.sender;
        land.landStatus = LandStatus.Active;

        safeTransferFrom(address(this), msg.sender, _landId, 1, "");
        emit LandSold(_landId, previousOwner, msg.sender, msg.value);
    }

    // View Functions
    function getTitleDeed(
        uint256 _landId
    ) public view returns (LandLayout memory) {
        return landLayouts[_landId];
    }

    function getTotalLandCount() public view returns (uint256) {
        return _landIds.current();
    }

    function getLandLayout(
        uint256 _landId
    ) public view returns (LandLayout memory) {
        return landLayouts[_landId];
    }

    function getAllLandLayouts() external view returns (LandLayout[] memory) {
        uint256 totalLands = _landIds.current();
        LandLayout[] memory allLands = new LandLayout[](totalLands);

        for (uint256 i = 1; i <= totalLands; i++) {
            allLands[i - 1] = landLayouts[i];
        }

        return allLands;
    }

    // Function to get all land owned by a specific owner

    function getOwnerDeeds() public view returns (LandLayout[] memory) {
        uint[] memory MyTitleIDs = titleDeeds[msg.sender];
        LandLayout[] memory landArray;

        for (uint256 i = 0; i < MyTitleIDs.length; i++) {
            LandLayout memory land_layout = getLandLayout(MyTitleIDs[i]);

            landArray[0] = land_layout;
        }
        return landArray;
    }
}
