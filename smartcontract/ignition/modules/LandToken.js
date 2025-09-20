// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

const baseURI = "https://pink-capitalist-rook-863.mypinata.cloud/ipfs/bafkreibkicyxpnlobomntg6sl5w6w5hqwarsm7cb575nq36gkdpnd5cfsq?pinataGatewayToken=5_ZRQldcSlOv5HRMhzYcFbT0JxK_-8UGEpOn8He3vI-XcvSVPmryoXJxOFdLY1Ul";
module.exports = buildModule("LandTokenModule", (m) => {
  const tokken_url = m.getParameter("baseURI", baseURI);

  const landTokenUrl = m.contract("LandToken", [tokken_url]);

  return { landTokenUrl };
});
