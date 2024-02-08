import { ethers } from 'ethers';
import { task } from 'hardhat/config';
import { getFirstSigner } from '../../helpers/contracts-getters';
import { getParamPerNetwork, registerContractInJsonDb } from '../../helpers/contracts-helpers';
import { getDb, waitForTx } from '../../helpers/misc-utils';
import { ERC20Factory } from '../../types';

task('dev:approve', 'Approve WNEAR for incentive controller').setAction(async ({}, localBRE) => {
  await localBRE.run('set-DRE');
  const signer = await getFirstSigner();
  const totalSupply = ethers.utils.parseEther('1000000000000');

  console.log('signer', await signer.getAddress());
  console.log('signer balance');
  const balance = await signer.getBalance();
  console.log(balance.toBigInt());

  // approve
  const controller = process.env.CONTROLLER;
  if (!controller) {
    throw new Error('missing controller');
  }
  const wnear = process.env.WNEAR;
  if (!wnear) {
    throw new Error('missing wnear');
  }
  const token = await ERC20Factory.connect(wnear, signer);

  await waitForTx(await token.connect(signer).approve(controller, totalSupply));
  console.log(`Approved ${totalSupply.toString()} WNEAR to incentive controller`);
});
