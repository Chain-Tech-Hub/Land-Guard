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
    struct LandPacel {
        string landCode;
        string landPacelURL;
        address currentLandOwner;
        string titleDeedUrl;
        LandStatus landStatus;
        uint256 landPacelValue;
    }

    // ============ STORAGE ============
    uint256 public landPacelIds; // total number of land parcels mapped
    address payable[] public landAdmins;
    address payable private _minOfLand;
    uint256 public landTaxFee;
    string private _baseURI;
    uint256 public landIds;

    mapping(uint256 landId => LandPacel landPacel) public landPacels;

    mapping(address landOwner => EnumerableSet.UintSet landIds)
        private titleDeeds;
    mapping(string landCode => bool status) private usedLandCodes;

    // ============ EVENTS ============
    event LandMapCreated(
        string indexed landCode,
        string LandPacelURL,
        uint256 indexed landId
    );
    event LandPacelMinted(
        uint256 indexed landId,
        address indexed currentLandOwner,
        string LandPacelURL
    );
    event TitleDeedMinted(
        uint256 indexed landId,
        address indexed owner,
        string titleDeedUrl
    );
    event LandPacelListed(
        uint256 indexed landId,
        address indexed owner,
        uint256 price
    );
    event LandPacelUnlisted(uint256 indexed landId, address indexed owner);
    event LandPacelTransfer(
        uint256 indexed landId,
        address indexed from,
        address indexed to,
        uint256 amount
    );
    event LandDisputeStatusChanged(uint256 indexed landId, bool inDispute);

    // ============ ERRORS ============
    error LandToken_NotLandOwner();
    error LandToken_InvalidLandAdmin();
    error LandToken_LandCodeExists();
    error LandToken_LandNotActive();
    error LandToken_LandNotListed();
    error LandToken_LandNotOwned();
    error LandToken_InvalidLandOwner();
    error LandToken_LandNotForSale();
    error LandToken_ArrayMismatch();
    error LandToken_AlreadyPermanent();
    error LandToken_TemporaryToken();
    error LandToken_ParcelInDispute();
    error LandToken_InvalidLandID();

    // ============ MODIFIERS ============
    modifier onlyValidLandId(uint256 _landId) {
        if (!(_landId > 0 && _landId <= landIds))
            revert LandToken_InvalidLandID();

        _;
    }

    // ============ CONSTRUCTOR ============
    constructor(
        string memory baseURI
    )
        ERC1155(
            "https://pink-capitalist-rook-863.mypinata.cloud/ipfs/bafybeid7jx4uwvqvowbgtbsndrgyq456qwqhpioj2ei35qchqbwzrw6g7e?pinataGatewayToken=5_ZRQldcSlOv5HRMhzYcFbT0JxK_-8UGEpOn8He3vI-XcvSVPmryoXJxOFdLY1Ul"
        )
    {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(RESOLVER_ROLE, msg.sender);
        _grantRole(LAND_ADMIN_ROLE, msg.sender);
        landAdmins[0] = payable(msg.sender);
        _baseURI = baseURI;
    }

    // ============ ADMIN FUNCTIONS ============
    function setLandAdmin(
        address _landAdmin
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _landAdmin = payable(_landAdmin);
        _grantRole(LAND_ADMIN_ROLE, _landAdmin);
    }

    function setMinOfLands(
        address _newMinOfLand
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _minOfLand = payable(_newMinOfLand);
        _grantRole(LAND_ADMIN_ROLE, _newMinOfLand);
        _grantRole(MINTER_ROLE, _newMinOfLand);
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
    function createLandPacel(
        string memory _landCode,
        string memory _layoutUrl
    ) external onlyRole(LAND_ADMIN_ROLE) whenNotPaused {
        if (usedLandCodes[_landCode]) revert LandToken_LandCodeExists();

        landIds++;
        uint256 landId = landIds;

        landPacels[landId] = LandPacel({
            landCode: _landCode,
            landPacelURL: _layoutUrl,
            currentLandOwner: _minOfLand,
            titleDeedUrl: _layoutUrl,
            landStatus: LandStatus.New,
            landPacelValue: INITIAL_LAND_VALUE
        });

        usedLandCodes[_landCode] = true;
        emit LandMapCreated(_landCode, _layoutUrl, landId);
    }

    function landRegistration(
        uint256 _landId,
        address _landOwner
    )
        external
        onlyRole(LAND_ADMIN_ROLE)
        whenNotPaused
        onlyValidLandId(_landId)
    {
        require(_landOwner != address(0), "Invalid owner");

        LandPacel storage land = landPacels[_landId];
        land.currentLandOwner = _landOwner;
        land.landStatus = LandStatus.Active;

        titleDeeds[_landOwner].add(_landId);
        emit LandPacelMinted(_landId, _landOwner, land.landPacelURL);
    }

    // ============ TITLE DEED FUNCTIONS ============
    function mintTitleDeed(
        uint256 _landId,
        string memory _titleDeedUrl
    ) external whenNotPaused nonReentrant onlyValidLandId(_landId) {
        LandPacel storage land = landPacels[_landId];

        if (land.currentLandOwner != msg.sender)
            revert LandToken_NotLandOwner();
        if (land.landStatus != LandStatus.Active)
            revert LandToken_LandNotActive();

        _mint(msg.sender, _landId, 1, bytes(_titleDeedUrl));
        land.titleDeedUrl = _titleDeedUrl;

        emit TitleDeedMinted(_landId, msg.sender, _titleDeedUrl);
    }

    // ============ MARKETPLACE FUNCTIONS ============
    function listLand(
        uint256 _landId,
        uint256 _price
    ) external whenNotPaused onlyValidLandId(_landId) {
        LandPacel storage land = landPacels[_landId];

        if (land.currentLandOwner != msg.sender)
            revert LandToken_NotLandOwner();
        if (land.landStatus != LandStatus.Active)
            revert LandToken_LandNotActive();

        land.landStatus = LandStatus.Listed;
        land.landPacelValue = _price;

        emit LandPacelListed(_landId, msg.sender, _price);
    }

    function unlistLand(
        uint256 landId
    ) external whenNotPaused onlyValidLandId(landId) {
        LandPacel storage land = landPacels[landId];

        if (land.currentLandOwner != msg.sender)
            revert LandToken_NotLandOwner();
        if (land.landStatus != LandStatus.Listed)
            revert LandToken_LandNotListed();

        land.landStatus = LandStatus.Active;
        emit LandPacelUnlisted(landId, msg.sender);
    }

    function buyLand(
        uint256 _landId
    ) external payable whenNotPaused nonReentrant onlyValidLandId(_landId) {
        LandPacel storage land = landPacels[_landId];

        if (land.landStatus != LandStatus.Listed)
            revert LandToken_LandNotForSale();
        if (land.currentLandOwner == address(0))
            revert LandToken_InvalidLandOwner();

        if (msg.value + landTaxFee < land.landPacelValue)
            revert("Insufficient payment");

        address previousOwner = land.currentLandOwner;
        uint256 landValue = land.landPacelValue;
        uint256 currentlandTaxFee = _calculateLandTax(landValue);
        payable(previousOwner).transfer(landValue - landTaxFee);
        payable(_minOfLand).transfer(currentlandTaxFee);

        land.currentLandOwner = msg.sender;
        land.landStatus = LandStatus.Active;

        titleDeeds[previousOwner].remove(_landId);
        titleDeeds[msg.sender].add(_landId);

        if (balanceOf(previousOwner, _landId) > 0) {
            _safeTransferFrom(previousOwner, msg.sender, _landId, 1, "");
        }

        emit LandPacelTransfer(_landId, previousOwner, msg.sender, msg.value);
    }

    // ============ DISPUTE MANAGEMENT ============

    // ============ VIEW FUNCTIONS ============
    function uri(uint256 tokenId) public view override returns (string memory) {
        return string(abi.encodePacked(_baseURI, tokenId.toString()));
    }

    function getLandPacel(
        uint256 _landId
    ) external view onlyValidLandId(_landId) returns (LandPacel memory) {
        return landPacels[_landId];
    }

    function getOwnerDeeds(
        address owner
    ) external view returns (uint256[] memory) {
        return titleDeeds[owner].values();
    }

    function getListedLands() external view returns (LandPacel[] memory) {
        uint256 count = 0;
        for (uint256 i = 1; i <= landIds; i++) {
            if (landPacels[i].landStatus == LandStatus.Listed) {
                count++;
            }
        }

        LandPacel[] memory listedLands = new LandPacel[](count);
        uint256 currentIndex = 0;

        for (uint256 i = 1; i <= landIds; i++) {
            if (landPacels[i].landStatus == LandStatus.Listed) {
                listedLands[currentIndex] = landPacels[i];
                currentIndex++;
            }
        }
        return listedLands;
    }

    // ============ INTERNAL FUNCTIONS ============
    function _calculateLandTax(
        uint256 landValue
    ) internal view returns (uint256) {
        return (landValue * landTaxFee) / 10000; // Assuming landTaxFee is in basis points
    }

    function _update(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts
    ) internal virtual override {
        super._update(from, to, ids, amounts);
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
