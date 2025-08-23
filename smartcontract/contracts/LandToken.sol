// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

/**
 * @title LandToken - Optimized Land Registry and Token Management System
 * @notice Manages land registration, tokenization, and trading using ERC1155 standard
 * @dev Optimized for gas efficiency and reduced contract size
 */
contract LandToken is ERC1155, AccessControl, ReentrancyGuard, Pausable {
    using EnumerableSet for EnumerableSet.UintSet;
    using Strings for uint256;

    // ============ CONSTANTS ============
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant RESOLVER_ROLE = keccak256("RESOLVER_ROLE");
    bytes32 public constant LAND_ADMIN_ROLE = keccak256("LAND_ADMIN_ROLE");
    uint256 public constant INITIAL_LAND_VALUE = 1 ether;

    // ============ ENUMS ============
    enum LandStatus {
        New,
        Active,
        Listed,
        Inactive,
        Disputed
    }

    // ============ STRUCTS ============
    struct LandLayout {
        string landCode;
        string layoutUrl;
        address landOwner;
        string titleDeedUrl;
        LandStatus landStatus;
        uint256 landValue;
        bool inDispute;
    }

    // ============ STORAGE ============
    uint256 public landIds;
    address payable public landAdmin;
    string private _baseURI;

    mapping(uint256 => LandLayout) private landLayouts;
    mapping(address => EnumerableSet.UintSet) private titleDeeds;
    mapping(string => bool) private usedLandCodes;

    // ============ EVENTS ============
    event LandLayoutCreated(
        string indexed landCode,
        string layoutUrl,
        uint256 indexed landId
    );
    event LandRegistrationEvent(
        uint256 indexed landId,
        address indexed landOwner,
        string layoutUrl
    );
    event TitleDeedMinted(
        uint256 indexed landId,
        address indexed owner,
        string titleDeedUrl
    );
    event LandListed(
        uint256 indexed landId,
        address indexed owner,
        uint256 price
    );
    event LandUnlisted(uint256 indexed landId, address indexed owner);
    event LandSold(
        uint256 indexed landId,
        address indexed from,
        address indexed to,
        uint256 amount
    );
    event LandDisputeStatusChanged(uint256 indexed landId, bool inDispute);

    // ============ ERRORS ============
    error NotLandOwner();
    error InvalidLandAdmin();
    error LandCodeExists();
    error LandNotActive();
    error LandNotListed();
    error LandNotOwned();
    error InvalidLandOwner();
    error LandNotForSale();
    error ArrayMismatch();
    error AlreadyPermanent();
    error TemporaryToken();
    error ParcelInDispute();

    // ============ MODIFIERS ============
    modifier onlyValidLandId(uint256 landId) {
        require(landId > 0 && landId <= landIds, "Invalid land ID");
        _;
    }

    // ============ CONSTRUCTOR ============
    constructor(string memory baseURI) ERC1155("") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(RESOLVER_ROLE, msg.sender);
        _grantRole(LAND_ADMIN_ROLE, msg.sender);

        landAdmin = payable(msg.sender);
        _baseURI = baseURI;
    }

    // ============ ADMIN FUNCTIONS ============
    function setLandAdmin(
        address _landAdmin
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        landAdmin = payable(_landAdmin);
        _grantRole(LAND_ADMIN_ROLE, _landAdmin);
    }

    function setBaseURI(
        string memory newBaseURI
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _baseURI = newBaseURI;
    }

    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }

    // ============ LAND MANAGEMENT ============
    function createLandLayout(
        string memory landCode,
        string memory layoutUrl
    ) external onlyRole(LAND_ADMIN_ROLE) whenNotPaused {
        if (usedLandCodes[landCode]) revert LandCodeExists();

        landIds++;
        uint256 landId = landIds;

        landLayouts[landId] = LandLayout({
            landCode: landCode,
            layoutUrl: layoutUrl,
            landOwner: address(0),
            titleDeedUrl: "",
            landStatus: LandStatus.New,
            landValue: INITIAL_LAND_VALUE,
            inDispute: false
        });

        usedLandCodes[landCode] = true;
        emit LandLayoutCreated(landCode, layoutUrl, landId);
    }

    function landRegistration(
        uint256 landId,
        address landOwner
    ) external onlyRole(LAND_ADMIN_ROLE) whenNotPaused onlyValidLandId(landId) {
        require(landOwner != address(0), "Invalid owner");

        LandLayout storage land = landLayouts[landId];
        land.landOwner = landOwner;
        land.landStatus = LandStatus.Active;

        titleDeeds[landOwner].add(landId);
        emit LandRegistrationEvent(landId, landOwner, land.layoutUrl);
    }

    // ============ TITLE DEED FUNCTIONS ============
    function mintTitleDeed(
        uint256 landId,
        string memory titleDeedUrl
    ) external whenNotPaused nonReentrant onlyValidLandId(landId) {
        LandLayout storage land = landLayouts[landId];

        if (land.landOwner != msg.sender) revert NotLandOwner();
        if (land.landStatus != LandStatus.Active) revert LandNotActive();
        if (land.inDispute) revert ParcelInDispute();

        _mint(msg.sender, landId, 1, "");
        land.titleDeedUrl = titleDeedUrl;

        emit TitleDeedMinted(landId, msg.sender, titleDeedUrl);
    }

    // ============ MARKETPLACE FUNCTIONS ============
    function listLand(
        uint256 landId,
        uint256 price
    ) external whenNotPaused onlyValidLandId(landId) {
        LandLayout storage land = landLayouts[landId];

        if (land.landOwner != msg.sender) revert NotLandOwner();
        if (land.landStatus != LandStatus.Active) revert LandNotActive();
        if (land.inDispute) revert ParcelInDispute();

        land.landStatus = LandStatus.Listed;
        land.landValue = price;

        emit LandListed(landId, msg.sender, price);
    }

    function unlistLand(
        uint256 landId
    ) external whenNotPaused onlyValidLandId(landId) {
        LandLayout storage land = landLayouts[landId];

        if (land.landOwner != msg.sender) revert NotLandOwner();
        if (land.landStatus != LandStatus.Listed) revert LandNotListed();

        land.landStatus = LandStatus.Active;
        emit LandUnlisted(landId, msg.sender);
    }

    function buyLand(
        uint256 landId
    ) external payable whenNotPaused nonReentrant onlyValidLandId(landId) {
        LandLayout storage land = landLayouts[landId];

        if (land.landStatus != LandStatus.Listed) revert LandNotForSale();
        if (land.landOwner == address(0)) revert InvalidLandOwner();
        if (land.inDispute) revert ParcelInDispute();
        if (msg.value < land.landValue) revert("Insufficient payment");

        address previousOwner = land.landOwner;
        payable(previousOwner).transfer(msg.value);

        land.landOwner = msg.sender;
        land.landStatus = LandStatus.Active;

        titleDeeds[previousOwner].remove(landId);
        titleDeeds[msg.sender].add(landId);

        if (balanceOf(previousOwner, landId) > 0) {
            _safeTransferFrom(previousOwner, msg.sender, landId, 1, "");
        }

        emit LandSold(landId, previousOwner, msg.sender, msg.value);
    }

    // ============ DISPUTE MANAGEMENT ============
    function setLandDisputeStatus(
        uint256 landId,
        bool inDispute
    ) external onlyRole(RESOLVER_ROLE) onlyValidLandId(landId) {
        landLayouts[landId].inDispute = inDispute;
        if (inDispute) {
            landLayouts[landId].landStatus = LandStatus.Disputed;
        }
        emit LandDisputeStatusChanged(landId, inDispute);
    }

    // ============ VIEW FUNCTIONS ============
    function uri(uint256 tokenId) public view override returns (string memory) {
        return string(abi.encodePacked(_baseURI, tokenId.toString()));
    }

    function getLandLayout(
        uint256 landId
    ) external view onlyValidLandId(landId) returns (LandLayout memory) {
        return landLayouts[landId];
    }

    function getOwnerDeeds(
        address owner
    ) external view returns (uint256[] memory) {
        return titleDeeds[owner].values();
    }

    function getListedLands() external view returns (LandLayout[] memory) {
        uint256 count = 0;
        for (uint256 i = 1; i <= landIds; i++) {
            if (landLayouts[i].landStatus == LandStatus.Listed) {
                count++;
            }
        }

        LandLayout[] memory listedLands = new LandLayout[](count);
        uint256 currentIndex = 0;

        for (uint256 i = 1; i <= landIds; i++) {
            if (landLayouts[i].landStatus == LandStatus.Listed) {
                listedLands[currentIndex] = landLayouts[i];
                currentIndex++;
            }
        }
        return listedLands;
    }

    // ============ INTERNAL FUNCTIONS ============
    function _update(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts
    ) internal virtual override {
        super._update(from, to, ids, amounts);

        if (from != address(0)) {
            for (uint256 i = 0; i < ids.length; i++) {
                if (landLayouts[ids[i]].inDispute) {
                    revert ParcelInDispute();
                }
            }
        }
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override(ERC1155, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    // ============ EMERGENCY FUNCTIONS ============
    function emergencyWithdraw() external onlyRole(DEFAULT_ADMIN_ROLE) {
        payable(msg.sender).transfer(address(this).balance);
    }
}
