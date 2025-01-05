// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MalawiKwachaToken is ERC20 {
    address public admin;

    constructor(uint256 initialSupply) ERC20("Malawi Kwacha Token", "MWK") {
        admin = msg.sender;
        _mint(admin, initialSupply);
    }

    function mint(address to, uint256 amount) external {
        require(msg.sender == admin, "Only admin can mint tokens");
        _mint(to, amount);
    }

    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }
}
