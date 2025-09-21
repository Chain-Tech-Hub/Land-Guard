// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("LandSystem", (m) => {
  // 1) Deploy LandToken (no constructor args)
  const landToken = m.contract("LandToken");

  // 2) Deploy LandRegistry with LandToken address
  const landRegistry = m.contract("LandRegistry", [landToken]);

  return { landToken, landRegistry };
});
