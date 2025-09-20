// SPDX-License-Identifier: AGPL-3.0
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "./LandToken.sol";

contract LandRegistry is AccessControl, EIP712 {
    using ECDSA for bytes32;

    bytes32 public constant STEWARD_ROLE = keccak256("STEWARD_ROLE");
    bytes32 private constant RESOLUTION_TYPEHASH =
        keccak256("Resolution(uint256 tokenId,address rightfulOwner)");

    LandToken public landToken;
    mapping(uint256 => bool) public conflictStatus;
    mapping(uint256 => string[]) public conflictEvidence;
    mapping(address => bool) public stewards;

    event ConflictFlagged(uint256 tokenId, string evidenceHash);
    event ConflictResolved(uint256 tokenId, address newOwner);
    event StewardAdded(address steward);
    event StewardRemoved(address steward);

    constructor(address _landToken) EIP712("LandRegistry", "1") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        landToken = LandToken(_landToken);
    }

    function addSteward(address steward) external onlyRole(DEFAULT_ADMIN_ROLE) {
        stewards[steward] = true;
        _grantRole(STEWARD_ROLE, steward);
        emit StewardAdded(steward);
    }

    function removeSteward(
        address steward
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        stewards[steward] = false;
        _revokeRole(STEWARD_ROLE, steward);
        emit StewardRemoved(steward);
    }

    function flagConflict(
        uint256 tokenId,
        string calldata evidenceHash
    ) external {
        conflictStatus[tokenId] = true;
        conflictEvidence[tokenId].push(evidenceHash);
        emit ConflictFlagged(tokenId, evidenceHash);
    }

    function resolveConflict(
        uint256 tokenId,
        address rightfulOwner,
        bytes[] calldata signatures
    ) external onlyRole(STEWARD_ROLE) {
        require(conflictStatus[tokenId], "No conflict");
        require(
            _validateSignatures(tokenId, rightfulOwner, signatures),
            "Invalid signatures"
        );

        conflictStatus[tokenId] = false;

        LandToken.LandPacel memory landPacels = landToken.getLandPacel(tokenId);
        address currentOwner = landPacels.currentLandOwner;

        if (landToken.balanceOf(currentOwner, tokenId) > 0) {
            landToken.safeTransferFrom(
                currentOwner,
                rightfulOwner,
                tokenId,
                1,
                ""
            );
        }

        emit ConflictResolved(tokenId, rightfulOwner);
    }

    function _validateSignatures(
        uint256 tokenId,
        address rightfulOwner,
        bytes[] calldata signatures
    ) internal view returns (bool) {
        bytes32 structHash = keccak256(
            abi.encode(RESOLUTION_TYPEHASH, tokenId, rightfulOwner)
        );
        bytes32 digest = _hashTypedDataV4(structHash);

        address[] memory signers = new address[](signatures.length);
        for (uint256 i = 0; i < signatures.length; i++) {
            signers[i] = ECDSA.recover(digest, signatures[i]);
        }

        return _hasValidStewardSignatures(signers);
    }

    function _hasValidStewardSignatures(
        address[] memory signers
    ) internal view returns (bool) {
        if (signers.length < 2) return false; // At least 2 stewards required

        uint256 validSignatures = 0;
        for (uint256 i = 0; i < signers.length; i++) {
            if (stewards[signers[i]] && !_isDuplicate(signers, i)) {
                validSignatures++;
            }
        }

        return validSignatures >= 2; // Minimum 2 unique steward signatures
    }

    function _isDuplicate(
        address[] memory signers,
        uint256 index
    ) internal pure returns (bool) {
        for (uint256 i = 0; i < index; i++) {
            if (signers[i] == signers[index]) {
                return true;
            }
        }
        return false;
    }
}
