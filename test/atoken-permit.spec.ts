import {MAX_UINT_AMOUNT, ZERO_ADDRESS} from '../helpers/constants';
import {BUIDLEREVM_CHAINID} from '../helpers/buidler-constants';
import {buildPermitParams, getSignatureFromTypedData} from '../helpers/contracts-helpers';
import {expect} from 'chai';
import {ethers} from 'ethers';
import {eEthereumNetwork} from '../helpers/types';
import {makeSuite, TestEnv} from './helpers/make-suite';
import {BRE} from '../helpers/misc-utils';
import {
  ConfigNames,
  getATokenDomainSeparatorPerNetwork,
  loadPoolConfig,
} from '../helpers/configuration';
import {waitForTx} from '../helpers/misc-utils';

const {parseEther} = ethers.utils;

makeSuite('AToken: Permit', (testEnv: TestEnv) => {
  const poolConfig = loadPoolConfig(ConfigNames.Commons);

  it('Checks the domain separator', async () => {
    const DOMAIN_SEPARATOR_ENCODED = getATokenDomainSeparatorPerNetwork(
      eEthereumNetwork.buidlerevm,
      poolConfig
    );

    const {aDai} = testEnv;

    const separator = await aDai.DOMAIN_SEPARATOR();

    expect(separator).to.be.equal(DOMAIN_SEPARATOR_ENCODED, 'Invalid domain separator');
  });

  it('Get aDAI for tests', async () => {
    const {dai, pool, deployer, addressesProvider} = testEnv;
    const addre = await addressesProvider.getLendingPool();
    console.log('pool', pool.address, addre);

    await dai.mint(parseEther('20000'));
    await dai.approve(pool.address, parseEther('20000'));

    const some = await pool.getReserveData(dai.address);
    const aa = await pool.getReservesList();
    console.log('some', some);
    console.log('aa', aa);
    await pool.deposit(dai.address, parseEther('20000'), deployer.address, 0);
  });

  it('Reverts submitting a permit with 0 expiration', async () => {
    const {aDai, deployer, users} = testEnv;
    const owner = deployer;
    const spender = users[1];

    const tokenName = await aDai.name();

    const chainId = BRE.network.config.chainId || BUIDLEREVM_CHAINID;
    const expiration = 0;
    const nonce = (await aDai._nonces(owner.address)).toNumber();
    const permitAmount = ethers.utils.parseEther('2').toString();
    const msgParams = buildPermitParams(
      chainId,
      aDai.address,
      '1',
      tokenName,
      owner.address,
      spender.address,
      nonce,
      permitAmount,
      expiration.toFixed()
    );

    const ownerPrivateKey = require('../test-wallets.js').accounts[0].secretKey;
    if (!ownerPrivateKey) {
      throw new Error('INVALID_OWNER_PK');
    }

    expect((await aDai.allowance(owner.address, spender.address)).toString()).to.be.equal(
      '0',
      'INVALID_ALLOWANCE_BEFORE_PERMIT'
    );

    const {v, r, s} = getSignatureFromTypedData(ownerPrivateKey, msgParams);

    await expect(
      aDai
        .connect(spender.signer)
        .permit(owner.address, spender.address, permitAmount, expiration, v, r, s)
    ).to.be.revertedWith('INVALID_EXPIRATION');

    expect((await aDai.allowance(owner.address, spender.address)).toString()).to.be.equal(
      '0',
      'INVALID_ALLOWANCE_AFTER_PERMIT'
    );
  });

  it('Submits a permit with maximum expiration length', async () => {
    const {aDai, deployer, users} = testEnv;
    const owner = deployer;
    const spender = users[1];

    const chainId = BRE.network.config.chainId || BUIDLEREVM_CHAINID;
    const deadline = MAX_UINT_AMOUNT;
    const nonce = (await aDai._nonces(owner.address)).toNumber();
    const permitAmount = parseEther('2').toString();
    const msgParams = buildPermitParams(
      chainId,
      aDai.address,
      '1',
      await aDai.name(),
      owner.address,
      spender.address,
      nonce,
      deadline,
      permitAmount
    );

    const ownerPrivateKey = require('../test-wallets.js').accounts[0].secretKey;
    if (!ownerPrivateKey) {
      throw new Error('INVALID_OWNER_PK');
    }

    expect((await aDai.allowance(owner.address, spender.address)).toString()).to.be.equal(
      '0',
      'INVALID_ALLOWANCE_BEFORE_PERMIT'
    );

    const {v, r, s} = getSignatureFromTypedData(ownerPrivateKey, msgParams);

    await waitForTx(
      await aDai
        .connect(spender.signer)
        .permit(owner.address, spender.address, permitAmount, deadline, v, r, s)
    );

    expect((await aDai._nonces(owner.address)).toNumber()).to.be.equal(1);
  });

  it('Cancels the previous permit', async () => {
    const {aDai, deployer, users} = testEnv;
    const owner = deployer;
    const spender = users[1];

    const chainId = BRE.network.config.chainId || BUIDLEREVM_CHAINID;
    const deadline = MAX_UINT_AMOUNT;
    const nonce = (await aDai._nonces(owner.address)).toNumber();
    const permitAmount = '0';
    const msgParams = buildPermitParams(
      chainId,
      aDai.address,
      '1',
      await aDai.name(),
      owner.address,
      spender.address,
      nonce,
      deadline,
      permitAmount
    );

    const ownerPrivateKey = require('../test-wallets.js').accounts[0].secretKey;
    if (!ownerPrivateKey) {
      throw new Error('INVALID_OWNER_PK');
    }

    const {v, r, s} = getSignatureFromTypedData(ownerPrivateKey, msgParams);

    expect((await aDai.allowance(owner.address, spender.address)).toString()).to.be.equal(
      ethers.utils.parseEther('2'),
      'INVALID_ALLOWANCE_BEFORE_PERMIT'
    );

    await waitForTx(
      await aDai
        .connect(spender.signer)
        .permit(owner.address, spender.address, permitAmount, deadline, v, r, s)
    );
    expect((await aDai.allowance(owner.address, spender.address)).toString()).to.be.equal(
      permitAmount,
      'INVALID_ALLOWANCE_AFTER_PERMIT'
    );

    expect((await aDai._nonces(owner.address)).toNumber()).to.be.equal(2);
  });

  it('Tries to submit a permit with invalid nonce', async () => {
    const {aDai, deployer, users} = testEnv;
    const owner = deployer;
    const spender = users[1];

    const chainId = BRE.network.config.chainId || BUIDLEREVM_CHAINID;
    const deadline = MAX_UINT_AMOUNT;
    const nonce = 1000;
    const permitAmount = '0';
    const msgParams = buildPermitParams(
      chainId,
      aDai.address,
      '1',
      await aDai.name(),
      owner.address,
      spender.address,
      nonce,
      deadline,
      permitAmount
    );

    const ownerPrivateKey = require('../test-wallets.js').accounts[0].secretKey;
    if (!ownerPrivateKey) {
      throw new Error('INVALID_OWNER_PK');
    }

    const {v, r, s} = getSignatureFromTypedData(ownerPrivateKey, msgParams);

    await expect(
      aDai
        .connect(spender.signer)
        .permit(owner.address, spender.address, permitAmount, deadline, v, r, s)
    ).to.be.revertedWith('INVALID_SIGNATURE');
  });

  it('Tries to submit a permit with invalid expiration (previous to the current block)', async () => {
    const {aDai, deployer, users} = testEnv;
    const owner = deployer;
    const spender = users[1];

    const chainId = BRE.network.config.chainId || BUIDLEREVM_CHAINID;
    const expiration = '1';
    const nonce = (await aDai._nonces(owner.address)).toNumber();
    const permitAmount = '0';
    const msgParams = buildPermitParams(
      chainId,
      aDai.address,
      '1',
      await aDai.name(),
      owner.address,
      spender.address,
      nonce,
      expiration,
      permitAmount
    );

    const ownerPrivateKey = require('../test-wallets.js').accounts[0].secretKey;
    if (!ownerPrivateKey) {
      throw new Error('INVALID_OWNER_PK');
    }

    const {v, r, s} = getSignatureFromTypedData(ownerPrivateKey, msgParams);

    await expect(
      aDai
        .connect(spender.signer)
        .permit(owner.address, spender.address, expiration, permitAmount, v, r, s)
    ).to.be.revertedWith('INVALID_EXPIRATION');
  });

  it('Tries to submit a permit with invalid signature', async () => {
    const {aDai, deployer, users} = testEnv;
    const owner = deployer;
    const spender = users[1];

    const chainId = BRE.network.config.chainId || BUIDLEREVM_CHAINID;
    const deadline = MAX_UINT_AMOUNT;
    const nonce = (await aDai._nonces(owner.address)).toNumber();
    const permitAmount = '0';
    const msgParams = buildPermitParams(
      chainId,
      aDai.address,
      '1',
      await aDai.name(),
      owner.address,
      spender.address,
      nonce,
      deadline,
      permitAmount
    );

    const ownerPrivateKey = require('../test-wallets.js').accounts[0].secretKey;
    if (!ownerPrivateKey) {
      throw new Error('INVALID_OWNER_PK');
    }

    const {v, r, s} = getSignatureFromTypedData(ownerPrivateKey, msgParams);

    await expect(
      aDai
        .connect(spender.signer)
        .permit(owner.address, ZERO_ADDRESS, permitAmount, deadline, v, r, s)
    ).to.be.revertedWith('INVALID_SIGNATURE');
  });

  it('Tries to submit a permit with invalid owner', async () => {
    const {aDai, deployer, users} = testEnv;
    const owner = deployer;
    const spender = users[1];

    const chainId = BRE.network.config.chainId || BUIDLEREVM_CHAINID;
    const expiration = MAX_UINT_AMOUNT;
    const nonce = (await aDai._nonces(owner.address)).toNumber();
    const permitAmount = '0';
    const msgParams = buildPermitParams(
      chainId,
      aDai.address,
      '1',
      await aDai.name(),
      owner.address,
      spender.address,
      nonce,
      expiration,
      permitAmount
    );

    const ownerPrivateKey = require('../test-wallets.js').accounts[0].secretKey;
    if (!ownerPrivateKey) {
      throw new Error('INVALID_OWNER_PK');
    }

    const {v, r, s} = getSignatureFromTypedData(ownerPrivateKey, msgParams);

    await expect(
      aDai
        .connect(spender.signer)
        .permit(ZERO_ADDRESS, spender.address, expiration, permitAmount, v, r, s)
    ).to.be.revertedWith('INVALID_OWNER');
  });
});
