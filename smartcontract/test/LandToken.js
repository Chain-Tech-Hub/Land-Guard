const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("LandToken", function () {
  // Interface IDs
  const IERC1155_ID = "0xd9b67a26";
  const IACCESSCONTROL_ID = "0x7965db0b";
  const IERC165_ID = "0x01ffc9a7";

  // Enums mirror
  const LandStatus = {
    New: 0,
    Active: 1,
    Listed: 2,
    Inactive: 3,
    Disputed: 4,
  };

  async function deployFixture() {
    const [deployer, min, admin2, owner1, owner2, buyer, stranger] =
      await ethers.getSigners();
    const LandToken = await ethers.getContractFactory("LandToken");
    const landToken = await LandToken.deploy();
    await landToken.waitForDeployment();
    return {
      landToken,
      deployer,
      min,
      admin2,
      owner1,
      owner2,
      buyer,
      stranger,
    };
  }

  async function createLand(landToken, code, url) {
    await expect(landToken.createLandPacel(code, url))
      .to.emit(landToken, "LandMapCreated")
      .withArgs(code, url, anyUint());
    const id = await landToken.landIds();
    return Number(id);
  }

  async function prepareActiveParcel(
    landToken,
    min,
    owner,
    code = "CODE-1",
    url = "https://layout1"
  ) {
    await landToken.setMinOfLands(min.address);
    const id = await createLand(landToken, code, url);
    await expect(landToken.landRegistration(id, owner.address))
      .to.emit(landToken, "LandPacelMinted")
      .withArgs(id, owner.address, url);
    return id;
  }

  function anyUint() {
    return (v) => typeof v === "bigint";
  }

  describe("Deployment and basic properties", function () {
    it("assigns roles to deployer and sets baseURI/uri()", async function () {
      const { landToken, deployer } = await deployFixture();

      const DEFAULT_ADMIN_ROLE = await landToken.DEFAULT_ADMIN_ROLE();
      const MINTER_ROLE = await landToken.MINTER_ROLE();
      const RESOLVER_ROLE = await landToken.RESOLVER_ROLE();
      const LAND_ADMIN_ROLE = await landToken.LAND_ADMIN_ROLE();

      expect(
        await landToken.hasRole(DEFAULT_ADMIN_ROLE, deployer.address)
      ).to.equal(true);
      expect(await landToken.hasRole(MINTER_ROLE, deployer.address)).to.equal(
        true
      );
      expect(await landToken.hasRole(RESOLVER_ROLE, deployer.address)).to.equal(
        true
      );
      expect(
        await landToken.hasRole(LAND_ADMIN_ROLE, deployer.address)
      ).to.equal(true);

      // uri() should append token id to baseURI configured in constructor via set string
      expect(await landToken.uri(1)).to.be.a("string");
    });

    it("supports expected interfaces", async function () {
      const { landToken } = await deployFixture();
      expect(await landToken.supportsInterface(IERC1155_ID)).to.equal(true);
      expect(await landToken.supportsInterface(IACCESSCONTROL_ID)).to.equal(
        true
      );
      expect(await landToken.supportsInterface(IERC165_ID)).to.equal(true);
      // Random interface should be false
      expect(await landToken.supportsInterface("0xffffffff")).to.equal(false);
    });
  });

  describe("Admin functions", function () {
    it("only admin can setBaseURI", async function () {
      const { landToken, stranger } = await deployFixture();
      await expect(landToken.connect(stranger).setBaseURI("ipfs://new/")).to.be
        .reverted;
      await landToken.setBaseURI("ipfs://new/");
      expect(await landToken.uri(5)).to.equal("ipfs://new/5");
    });

    it("only admin can setLandAdmin and setMinOfLands; roles are granted", async function () {
      const { landToken, min, stranger } = await deployFixture();
      await expect(landToken.connect(stranger).setLandAdmin(min.address)).to.be
        .reverted;
      await landToken.setLandAdmin(min.address);
      const LAND_ADMIN_ROLE = await landToken.LAND_ADMIN_ROLE();
      expect(await landToken.hasRole(LAND_ADMIN_ROLE, min.address)).to.equal(
        true
      );

      await expect(landToken.connect(stranger).setMinOfLands(min.address)).to.be
        .reverted;
      await landToken.setMinOfLands(min.address);
      const MINTER_ROLE = await landToken.MINTER_ROLE();
      expect(await landToken.hasRole(LAND_ADMIN_ROLE, min.address)).to.equal(
        true
      );
      expect(await landToken.hasRole(MINTER_ROLE, min.address)).to.equal(true);
    });

    it("pause/unpause restricts state-changing functions", async function () {
      const { landToken } = await deployFixture();
      await landToken.pause();
      await expect(landToken.createLandPacel("X", "Y")).to.be.reverted;
      await landToken.unpause();
      await expect(landToken.createLandPacel("X", "Y")).to.emit(
        landToken,
        "LandMapCreated"
      );
    });
  });

  describe("Land management", function () {
    it("createLandPacel sets initial state and prevents duplicate codes", async function () {
      const { landToken, min } = await deployFixture();
      await landToken.setMinOfLands(min.address);

      const id1 = await createLand(landToken, "LAND-1", "url-1");
      const land1 = await landToken.getLandPacel(id1);
      expect(land1.landCode).to.equal("LAND-1");
      expect(land1.landPacelURL).to.equal("url-1");
      expect(land1.currentLandOwner).to.equal(min.address);
      expect(land1.landStatus).to.equal(LandStatus.New);
      expect(land1.landPacelValue).to.equal(ethers.parseEther("1"));

      await expect(
        landToken.createLandPacel("LAND-1", "dup")
      ).to.be.revertedWithCustomError(landToken, "LandToken_LandCodeExists");
    });

    it("landRegistration validates ID and owner; sets status Active and updates deeds", async function () {
      const { landToken, min, owner1 } = await deployFixture();
      await landToken.setMinOfLands(min.address);
      const id = await createLand(landToken, "REG-1", "url");

      await expect(
        landToken.landRegistration(0, owner1.address)
      ).to.be.revertedWithCustomError(landToken, "LandToken_InvalidLandID");
      await expect(
        landToken.landRegistration(999, owner1.address)
      ).to.be.revertedWithCustomError(landToken, "LandToken_InvalidLandID");
      await expect(
        landToken.landRegistration(id, ethers.ZeroAddress)
      ).to.be.revertedWith("Invalid owner");

      await expect(landToken.landRegistration(id, owner1.address))
        .to.emit(landToken, "LandPacelMinted")
        .withArgs(id, owner1.address, "url");

      const land = await landToken.getLandPacel(id);
      expect(land.currentLandOwner).to.equal(owner1.address);
      expect(land.landStatus).to.equal(LandStatus.Active);

      const deeds = await landToken.getOwnerDeeds(owner1.address);
      expect(deeds.map((v) => Number(v))).to.deep.equal([id]);
    });

    it("getLandPacel reverts for invalid id", async function () {
      const { landToken } = await deployFixture();
      await expect(landToken.getLandPacel(1)).to.be.revertedWithCustomError(
        landToken,
        "LandToken_InvalidLandID"
      );
    });
  });

  describe("Title deed minting (ERC1155)", function () {
    it("only currentLandOwner and only when Active", async function () {
      const { landToken, min, owner1, owner2 } = await deployFixture();

      // New land (status New), not registered to owner1 yet
      await landToken.setMinOfLands(min.address);
      const id = await createLand(landToken, "MINT-1", "layout");

      // Not owner
      await expect(
        landToken.connect(owner1).mintTitleDeed(id, "deed")
      ).to.be.revertedWithCustomError(landToken, "LandToken_NotLandOwner");

      // Register and mint
      await landToken.landRegistration(id, owner1.address);
      await expect(landToken.connect(owner1).mintTitleDeed(id, "deed-1"))
        .to.emit(landToken, "TitleDeedMinted")
        .withArgs(id, owner1.address, "deed-1");

      const bal = await landToken.balanceOf(owner1.address, id);
      expect(bal).to.equal(1n);

      // Other address cannot mint even when Active
      await expect(
        landToken.connect(owner2).mintTitleDeed(id, "nope")
      ).to.be.revertedWithCustomError(landToken, "LandToken_NotLandOwner");
    });

    it("reverts when paused", async function () {
      const { landToken, min, owner1 } = await deployFixture();
      await landToken.setMinOfLands(min.address);
      const id = await createLand(landToken, "PAUSE-MINT", "layout");
      await landToken.landRegistration(id, owner1.address);

      await landToken.pause();
      await expect(landToken.connect(owner1).mintTitleDeed(id, "deed")).to.be
        .reverted;
      await landToken.unpause();
      await expect(landToken.connect(owner1).mintTitleDeed(id, "deed")).to.emit(
        landToken,
        "TitleDeedMinted"
      );
    });
  });

  describe("Listing and unlisting", function () {
    it("only owner can list; land must be Active; unlist transitions back to Active", async function () {
      const { landToken, min, owner1, owner2 } = await deployFixture();
      await landToken.setMinOfLands(min.address);
      const id = await createLand(landToken, "LIST-1", "url");
      await landToken.landRegistration(id, owner1.address);

      await expect(
        landToken.connect(owner2).listLand(id, ethers.parseEther("2"))
      ).to.be.revertedWithCustomError(landToken, "LandToken_NotLandOwner");

      await expect(
        landToken.connect(owner1).listLand(id, ethers.parseEther("2"))
      )
        .to.emit(landToken, "LandPacelListed")
        .withArgs(id, owner1.address, ethers.parseEther("2"));

      let land = await landToken.getLandPacel(id);
      expect(land.landStatus).to.equal(LandStatus.Listed);
      expect(land.landPacelValue).to.equal(ethers.parseEther("2"));

      // Only owner can unlist
      await expect(
        landToken.connect(owner2).unlistLand(id)
      ).to.be.revertedWithCustomError(landToken, "LandToken_NotLandOwner");

      await expect(landToken.connect(owner1).unlistLand(id))
        .to.emit(landToken, "LandPacelUnlisted")
        .withArgs(id, owner1.address);

      land = await landToken.getLandPacel(id);
      expect(land.landStatus).to.equal(LandStatus.Active);

      // Unlist when not listed reverts
      await expect(
        landToken.connect(owner1).unlistLand(id)
      ).to.be.revertedWithCustomError(landToken, "LandToken_LandNotListed");
    });

    it("getListedLands returns only listed parcels", async function () {
      const { landToken, min, owner1, owner2 } = await deployFixture();
      await landToken.setMinOfLands(min.address);

      const id1 = await createLand(landToken, "L-1", "url-1");
      await landToken.landRegistration(id1, owner1.address);
      await landToken.connect(owner1).listLand(id1, ethers.parseEther("1"));

      const id2 = await createLand(landToken, "L-2", "url-2");
      await landToken.landRegistration(id2, owner2.address);
      // leave id2 Active, not listed

      const listed = await landToken.getListedLands();
      expect(listed.length).to.equal(1);
      expect(listed[0].landCode).to.equal("L-1");
      expect(listed[0].landStatus).to.equal(LandStatus.Listed);
    });
  });

  describe("Buying flow", function () {
    it("enforces listing and ownership rules", async function () {
      const { landToken, min, owner1, buyer } = await deployFixture();
      await landToken.setMinOfLands(min.address);
      const id = await createLand(landToken, "BUY-1", "url");
      await landToken.landRegistration(id, owner1.address);

      // Not listed
      await expect(
        landToken.connect(buyer).buyLand(id, { value: ethers.parseEther("1") })
      ).to.be.revertedWithCustomError(landToken, "LandToken_LandNotForSale");

      // List and buy with insufficient payment (requires at least price)
      await landToken.connect(owner1).listLand(id, ethers.parseEther("1"));
      await expect(
        landToken
          .connect(buyer)
          .buyLand(id, { value: ethers.parseEther("0.9") })
      ).to.be.revertedWith("Insufficient payment");
    });

    it("transfers ownership, updates deeds, and moves ERC1155 token if owner held one", async function () {
      const { landToken, min, owner1, buyer } = await deployFixture();
      await landToken.setMinOfLands(min.address);
      const id = await createLand(landToken, "BUY-2", "layout");
      await landToken.landRegistration(id, owner1.address);

      // Mint title deed to owner1, so ERC1155 balance exists and should transfer
      await landToken.connect(owner1).mintTitleDeed(id, "deed");

      // List and buy
      await landToken.connect(owner1).listLand(id, ethers.parseEther("1"));
      await expect(
        landToken.connect(buyer).buyLand(id, { value: ethers.parseEther("1") })
      )
        .to.emit(landToken, "LandPacelTransfer")
        .withArgs(id, owner1.address, buyer.address, ethers.parseEther("1"));

      const land = await landToken.getLandPacel(id);
      expect(land.currentLandOwner).to.equal(buyer.address);
      expect(land.landStatus).to.equal(LandStatus.Active);

      // Deeds updated
      const deedsOldOwner = await landToken.getOwnerDeeds(owner1.address);
      const deedsNewOwner = await landToken.getOwnerDeeds(buyer.address);
      expect(deedsOldOwner.length).to.equal(0);
      expect(deedsNewOwner.map((x) => Number(x))).to.deep.equal([id]);

      // ERC1155 token moved
      const balOwner1 = await landToken.balanceOf(owner1.address, id);
      const balBuyer = await landToken.balanceOf(buyer.address, id);
      expect(balOwner1).to.equal(0n);
      expect(balBuyer).to.equal(1n);
    });

    it("leaves excess ETH in contract; admin can emergencyWithdraw it", async function () {
      const { landToken, min, owner2, buyer, deployer } = await deployFixture();
      await landToken.setMinOfLands(min.address);
      const id = await createLand(landToken, "BUY-EXCESS", "layout");
      await landToken.landRegistration(id, owner2.address);

      // List and buy with extra value (no refund logic -> contract retains extra)
      await landToken.connect(owner2).listLand(id, ethers.parseEther("1"));
      await landToken
        .connect(buyer)
        .buyLand(id, { value: ethers.parseEther("1.1") });

      const contractBalBefore = await ethers.provider.getBalance(
        landToken.target
      );
      expect(contractBalBefore).to.equal(ethers.parseEther("0.1"));

      // Only admin can withdraw
      await expect(landToken.connect(buyer).emergencyWithdraw()).to.be.reverted;

      await landToken.emergencyWithdraw();
      const contractBalAfter = await ethers.provider.getBalance(
        landToken.target
      );
      expect(contractBalAfter).to.equal(0n);
    });
  });

  describe("Pause affects marketplace functions", function () {
    it("list/buy/unlist revert when paused", async function () {
      const { landToken, min, owner1, buyer } = await deployFixture();
      await landToken.setMinOfLands(min.address);
      const id = await createLand(landToken, "PAUSE-MKT", "layout");
      await landToken.landRegistration(id, owner1.address);

      await landToken.pause();

      await expect(
        landToken.connect(owner1).listLand(id, ethers.parseEther("1"))
      ).to.be.reverted;
      await expect(landToken.connect(owner1).unlistLand(id)).to.be.reverted;
      await expect(
        landToken.connect(buyer).buyLand(id, { value: ethers.parseEther("1") })
      ).to.be.reverted;

      await landToken.unpause();
      await expect(
        landToken.connect(owner1).listLand(id, ethers.parseEther("1"))
      ).to.emit(landToken, "LandPacelListed");
    });
  });
});
