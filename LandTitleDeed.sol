// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// @dev Chain Tech Hub 
// @author : Born To Code Foundation
// @ www.chaintechhub.com 

//imports
import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol ";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";


// Custom errors for revert statements, all prefixed with contract name 


error LandTitleDeed_NotLandOwner(); //if msg.sender has no land or new to platform
error LandTitleDeed_InvalidLandAdmin();  // if msg.sender is not regulator (land admin)
error LandTitleDeed_LandCodeExists(); // if you register already land 
error LandTitleDeed_LandNotActive(); // if land is not in active status
error LandTitleDeed_LandNotListed(); // if land hasnt been listed so far
error LandTitleDeed_LandNotOwned(); // new land
error LandTitleDeed_InvalidLandOwner();
error LandTitleDeed_LandNotForSale();



contract LandTitleDeed is ERC1155, Ownable{

    // land admin 
    address payable public landAdmin;

// land status
    enum LandStatus {
        New,
        Active,
        Listed,
        Inactive
    }

    using Counters for Counters.Counter;
    Counters.Counter private _landIds;

    uint256 initialLandValue = 1;

    struct LandLayout {
        string landCode;
        string layoutUrl;
        address landOwner;
        string titleDeedUrl;
        LandStatus landStatus;
        uint256 landValue;
    }


// 
    mapping(uint256 land_id => LandLayout land_layout) private landLayouts;
    mapping(address landOwner => uint256[] landOwnerIds) private titleDeeds;
    mapping(string => bool) private usedLandCodes;

    event LandLayoutCreated(string landCode, string layoutUrl);
    event landRegistrationEvent(uint256 indexed landId, address landOwner);
    event TitleDeedMinted(uint256 indexed landId, address indexed owner, string titleDeedUrl);
    event LandListed(uint256 indexed landId, address indexed owner);
    event LandUnlisted(uint256 indexed landId, address indexed owner);
    event LandSold(uint256 indexed landId, address indexed from, address indexed to, uint256 amount);

    constructor() ERC1155(" https://api.landregistry.com/metadata /{id}") Ownable(msg.sender) {
        landAdmin = payable(0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2);
    }

    function setLandAdmin(address _landAdmin) public onlyOwner {
        landAdmin = payable(_landAdmin);
        console.log("Land admin set to:", _landAdmin);
    }

    function createLandLayout(
        string memory landCode,
        string memory layoutUrl
    ) external {
        if (msg.sender != landAdmin) {
            console.log("Unauthorized land layout creation by:", msg.sender);
            revert LandTitleDeed_InvalidLandAdmin();
        }
        if (usedLandCodes[landCode]) {
            console.log("Land code already exists:", landCode);
            revert LandTitleDeed_LandCodeExists();
        }

        _landIds.increment();
        uint256 landId = _landIds.current();

        landLayouts[landId] = LandLayout({
            landCode: landCode,
            layoutUrl: layoutUrl,
            landOwner: msg.sender,
            titleDeedUrl: layoutUrl,
            landStatus: LandStatus.New,
            landValue: initialLandValue
        });

        usedLandCodes[landCode] = true;
        emit LandLayoutCreated(landCode, layoutUrl);
        console.log("Land layout created:", landCode, layoutUrl);
    }

    function landRegistration(uint256 _landId, address landOwner) external {
        if (msg.sender != landAdmin) {
            console.log("Unauthorized land registration by:", msg.sender);
            revert LandTitleDeed_InvalidLandAdmin();
        }
        landLayouts[_landId].landOwner = landOwner;
        landLayouts[_landId].landStatus = LandStatus.Active;
        emit landRegistrationEvent(_landId, landOwner);
        console.log("Land registered:", _landId, landOwner);
    }

    function mintTitleDeed(
        uint256 _landId,
        string memory _titleDeedUrl
    ) external {
        if (landLayouts[_landId].landOwner != msg.sender) {
            console.log("Unauthorized mint attempt by:", msg.sender);
            revert LandTitleDeed_NotLandOwner();
        }
        if (landLayouts[_landId].landStatus != LandStatus.Active) {
            console.log("Land not active for minting:", _landId);
            revert LandTitleDeed_LandNotActive();
        }

        string memory landLayoutUrl = landLayouts[_landId].layoutUrl;
        _mint(msg.sender, _landId, 1, bytes(landLayoutUrl));
        landLayouts[_landId].titleDeedUrl = _titleDeedUrl;

        emit TitleDeedMinted(_landId, msg.sender, _titleDeedUrl);
        console.log("Title deed minted for land:", _landId, _titleDeedUrl);
    }

    // --- ERC1155Receiver logic for listing ---
  function listLand(uint256 _landId) public {
        LandLayout storage land = landLayouts[_landId];
        if (land.landOwner != msg.sender) {
            console.log("Unauthorized ulist attempt by:", msg.sender);
            revert LandTitleDeed_NotLandOwner();
        }
        if (land.landStatus != LandStatus.Active) {
            console.log("Land not Active :", _landId);
            revert LandTitleDeed_LandNotListed();
        }

   
        land.landStatus = LandStatus.Listed;
        emit LandUnlisted(_landId, msg.sender);
        console.log("Land unlisted and returned to owner:", _landId, msg.sender);
    }
 
    // --- Buy land logic remains unchanged ---


function buyLand(uint256 _landId) public payable {
        LandLayout storage land = landLayouts[_landId];

        if (land.landStatus != LandStatus.Listed) {
            console.log("Land not listed for sale:", _landId);
            revert LandTitleDeed_LandNotForSale();
        }
        if (land.landOwner == address(0)) {
            console.log("Invalid land owner for land:", _landId);
            revert LandTitleDeed_InvalidLandOwner();
        }

        address previousOwner = land.landOwner;
        payable(previousOwner).transfer(msg.value);

        land.landOwner = msg.sender;
        land.landStatus = LandStatus.Active;

       
        emit LandSold(_landId, previousOwner, msg.sender, msg.value);
       // console.log("Land sold:", _landId, previousOwner, msg.sender, msg.value);
    }

    // --- View functions unchanged ---
function getTitleDeed(uint256 _landId) public view returns (LandLayout memory) {
        return landLayouts[_landId];
    }

function getTotalLandCount() public view returns (uint256) {
        return _landIds.current();
    }

function getLandLayout(uint256 _landId) public view returns (LandLayout memory) {
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