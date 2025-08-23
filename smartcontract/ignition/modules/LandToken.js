// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

const baseURI = "https://landguard.bf/metadata/";
module.exports = buildModule("LandTokenModule", (m) => {
  const tokken_url = m.getParameter("baseURI", baseURI);

  const landTokenUrl = m.contract("LandToken", [tokken_url]);

  return { landTokenUrl };
});
