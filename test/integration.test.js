const { expect } = require("chai");
const { ethers } = require("hardhat");
const { toChecksumAddress } = require("ethereumjs-util");
const EthDeployUtils = require("eth-deploy-utils");
const deployUtils = new EthDeployUtils();

const CrunaTestUtils = require("./helpers/CrunaTestUtils");

const { amount, normalize, addr0, getChainId, getTimestamp, cl } = require("./helpers");

describe("Integration test", function () {
  let crunaManagerProxy;
  let vault;
  let factory;
  let usdc;
  let deployer, bob, alice, fred, mike;

  before(async function () {
    [deployer, bob, alice, fred, mike] = await ethers.getSigners();
    await CrunaTestUtils.deployCanonical(deployer);
  });

  async function initAndDeploy() {
    crunaManagerProxy = await CrunaTestUtils.deployManager(deployer);
    vault = await deployUtils.deploy("SerpentShields", deployer.address);
    await vault.init(crunaManagerProxy.address, true, true, 1, 0);
    factory = await deployUtils.deployProxy("SerpentShieldsFactory", vault.address);
    await vault.setFactory(factory.address);
    usdc = await deployUtils.deploy("USDCoin", deployer.address);

    await usdc.mint(deployer.address, normalize("900"));
    await usdc.mint(bob.address, normalize("900"));
    await usdc.mint(fred.address, normalize("900"));
    await usdc.mint(alice.address, normalize("900"));
    await usdc.mint(mike.address, normalize("600"));

    await expect(factory.setPrice(990)).to.emit(factory, "PriceSet").withArgs(990);
    await expect(factory.setStableCoin(usdc.address, true)).to.emit(factory, "StableCoinSet").withArgs(usdc.address, true);
  }

  //here we test the contract
  beforeEach(async function () {
    await initAndDeploy();
  });

  it("should buy a vault", async function () {
    let price = await factory.finalPrice(usdc.address);
    await usdc.approve(factory.address, price);
    const nextTokenId = (await vault.nftConf()).nextTokenId;
    await expect(factory.buySerpents(usdc.address, 1))
      .to.emit(vault, "Transfer")
      .withArgs(addr0, deployer.address, nextTokenId);
  });

  async function buyVault(token, amount, buyer) {
    let price = await factory.finalPrice(token.address);
    await token.connect(buyer).approve(factory.address, price.mul(amount));
    let nextTokenId = (await vault.nftConf()).nextTokenId;

    await expect(factory.connect(buyer).buySerpents(token.address, amount))
      .to.emit(vault, "Transfer")
      .withArgs(addr0, buyer.address, nextTokenId)
      .to.emit(vault, "Transfer")
      .withArgs(addr0, buyer.address, nextTokenId.add(1))
      .to.emit(token, "Transfer")
      .withArgs(buyer.address, factory.address, price.mul(amount));
  }

  it("should allow bob and alice to purchase some vaults", async function () {
    let nextTokenId = (await vault.nftConf()).nextTokenId;
    await buyVault(usdc, 2, bob);
    await buyVault(usdc, 2, alice);

    let price = await factory.finalPrice(usdc.address);
    expect(price.toString()).to.equal("9900000000000000000");

    await expect(factory.withdrawProceeds(fred.address, usdc.address, normalize("10")))
      .to.emit(usdc, "Transfer")
      .withArgs(factory.address, fred.address, normalize("10"));

    await expect(factory.withdrawProceeds(fred.address, usdc.address, 0))
      .to.emit(usdc, "Transfer")
      .withArgs(factory.address, fred.address, amount("29.6"));

    const managerAddress = await vault.managerOf(nextTokenId);
    const manager = await ethers.getContractAt("CrunaManager", managerAddress);

    const selector = await CrunaTestUtils.selectorId("ICrunaManager", "setProtector");
    const chainId = await getChainId();
    const ts = (await getTimestamp()) - 100;

    let signature = (
      await CrunaTestUtils.signRequest(
        selector,
        bob.address,
        alice.address,
        vault.address,
        nextTokenId,
        1,
        0,
        0,
        ts,
        3600,
        chainId,
        alice.address,
        manager,
      )
    )[0];

    // set Alice as first Bob's protector
    await expect(manager.connect(bob).setProtector(alice.address, true, ts, 3600, signature))
      .to.emit(manager, "ProtectorChange")
      .withArgs(nextTokenId, alice.address, true)
      .to.emit(vault, "Locked")
      .withArgs(nextTokenId, true);
  });

  it("should allow bob and alice to purchase some vaults with a discount", async function () {
    expect((await vault.nftConf()).nextTokenId).equal(1);
    await vault.setMaxTokenId(100);
    await buyVault(usdc, 2, bob);
    await buyVault(usdc, 2, alice);

    expect((await vault.nftConf()).nextTokenId).equal(5);

    let price = await factory.finalPrice(usdc.address);
    expect(price.toString()).to.equal("9900000000000000000");
  });

  it("should fail if max supply reached", async function () {
    await buyVault(usdc, 2, bob);
    await expect(vault.setMaxTokenId(0)).revertedWith("InvalidMaxTokenId");
    expect((await vault.nftConf()).maxTokenId).equal(0);

    await vault.setMaxTokenId(3);
    expect((await vault.nftConf()).maxTokenId).equal(3);

    await expect(buyVault(usdc, 2, alice)).revertedWith("InvalidTokenId");
  });

  it("should remove a stableCoin when active is false", async function () {
    await expect(factory.setStableCoin(usdc.address, false)).to.emit(factory, "StableCoinSet").withArgs(usdc.address, false);

    const updatedStableCoins = await factory.getStableCoins();
    expect(updatedStableCoins).to.not.include(usdc.address);
  });
});
