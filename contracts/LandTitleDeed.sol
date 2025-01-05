// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract LandTitleDeed is ERC1155 {
    using Counters for Counters.Counter;
    Counters.Counter private _deedIds;

    struct TitleDeed {
        uint256 titleDeedNumber;
        uint256 userId;
        string titleDeedName;
        string landCode;
        string ownerNationId;
        string landType;
        string landLayoutUrl;
        uint256 landValue; // Value of the land
        uint256 collateralAmount; // Amount taken as collateral
    }

    mapping(uint256 => TitleDeed) private titleDeeds;
    mapping(uint256 => uint256[]) private userToTitleDeeds;
    mapping(string => uint256) private landCodeToDeedId;

    event TitleDeedMinted(
        uint256 indexed titleDeedNumber,
        uint256 indexed userId,
        string titleDeedName,
        string landCode,
        string ownerNationId,
        string landType,
        string landLayoutUrl,
        uint256 landValue
    );

    event CollateralAssigned(
        uint256 indexed titleDeedNumber,
        uint256 collateralAmount
    );

    constructor() ERC1155("https://example.com/metadata/{id}.json") {}

    function mintTitleDeed(
        uint256 userId,
        string memory titleDeedName,
        string memory landCode,
        string memory ownerNationId,
        string memory landType,
        string memory landLayoutUrl,
        uint256 landValue // New parameter for land value
    ) public {
        require(landValue > 0, "Land value must be greater than zero");

        _deedIds.increment();
        uint256 newDeedId = _deedIds.current();

        _mint(msg.sender, newDeedId, 1, "");

        TitleDeed memory newTitleDeed = TitleDeed({
            titleDeedNumber: newDeedId,
            userId: userId,
            titleDeedName: titleDeedName,
            landCode: landCode,
            ownerNationId: ownerNationId,
            landType: landType,
            landLayoutUrl: landLayoutUrl,
            landValue: landValue,
            collateralAmount: 0
        });

        titleDeeds[newDeedId] = newTitleDeed;
        userToTitleDeeds[userId].push(newDeedId);
        landCodeToDeedId[landCode] = newDeedId;

        emit TitleDeedMinted(
            newDeedId,
            userId,
            titleDeedName,
            landCode,
            ownerNationId,
            landType,
            landLayoutUrl,
            landValue
        );
    }

    function assignCollateral(uint256 deedId, uint256 collateralAmount) public {
        require(isDeedValid(deedId), "Invalid title deed");
        TitleDeed storage deed = titleDeeds[deedId];
        require(collateralAmount > 0 && collateralAmount <= deed.landValue, "Invalid collateral amount");

        deed.collateralAmount = collateralAmount;

        emit CollateralAssigned(deedId, collateralAmount);
    }

    function getTitleDeedsByUser(
        uint256 userId
    ) public view returns (TitleDeed[] memory) {
        uint256[] memory deedIds = userToTitleDeeds[userId];
        TitleDeed[] memory deeds = new TitleDeed[](deedIds.length);

        for (uint256 i = 0; i < deedIds.length; i++) {
            deeds[i] = titleDeeds[deedIds[i]];
        }

        return deeds;
    }

    function getTitleDeedByLandCode(
        string memory landCode
    ) public view returns (TitleDeed memory) {
        uint256 deedId = landCodeToDeedId[landCode];
        require(
            isDeedValid(deedId),
            "Title deed does not exist for the provided land code"
        );
        return titleDeeds[deedId];
    }

    function getTitleDeedById(
        uint256 deedId
    ) public view returns (TitleDeed memory) {
        require(isDeedValid(deedId), "Title deed does not exist");
        return titleDeeds[deedId];
    }

    function isDeedValid(uint256 deedId) public view returns (bool) {
        return balanceOf(msg.sender, deedId) > 0;
    }

    function getLandValue(uint256 deedId) public view returns (uint256) {
        require(isDeedValid(deedId), "Invalid land deed");
        return titleDeeds[deedId].landValue;
    }

    function getCollateralAmount(uint256 deedId) public view returns (uint256) {
        require(isDeedValid(deedId), "Invalid land deed");
        return titleDeeds[deedId].collateralAmount;
    }
}
