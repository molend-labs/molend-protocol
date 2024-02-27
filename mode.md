# Mode Deployment Notes

## Full deployment steps

### A. Prerequisite 
The following components are required by AAVE, but not handled by this project.      

1. Deploy Pyth Oracle Adaptors for All Assets
  https://github.com/molend-labs/pyth-adaptor
  See readme for instructions.
  *This only needs to be done once.*

2. Run Price Oracle Nodes
  https://github.com/molend-labs/pyth-crosschain
  Follow the instructions in `price_pusher/mode.md`

3. Deploy AaveCollector
   https://github.com/molend-labs/molend-collector/tree/main
   Follow the instructions in `README.md`

### B. Deploy Molend
1. Update IncentivesController address in `markets/mode/commons.ts` with `0x0`
2. Update price oracle addresses in `markets/mode/commons.ts`
3. Update ETH price oracle address in `helpers/constants.ts`
3. Update reserve assets addresses in `markets/mode/index.ts`
4. Update treasury address in `markets/mode/commons.ts` with AaveCollector address
5. Update WETH address in `markets/mode/commons.ts`
6. Delete all entries in `deployed-contracts.json`, if mock tokens are needed you can leave these entries there.
7. `npm run mode:full:migration`
8. Grab aToken and vToken address from `npx hardhat --network mode dev:info`, put into IncentivesController `config-incentives.ts`.
9. Go to incentives controller and run `npx hardhat --network mode config-assets --proxy <inc_ctrl_addr>`
10. In order to use the protocol, the pool need to be unpaused:    
  `npx hardhat --network mode dev:unpause`

## Add New Asset
1. Add asset address in `markets/mode/index.ts`
2. Deploy a new pyth oracle adaptor from: https://github.com/molend-labs/pyth-adaptor
3. Put oracle address in `markets/mode/commons.ts`
4. Set oracle source by `npx hardhat --network mode dev:set-source --asset --source`
5. Define asset reserve config in `markets/mode/reservesConfigs.ts`
6. Define asset rate strategy in `markets/mode/rateStrategies.ts`
7. Run `npx hardhat --network mode dev:new-asset --pool Mode --asset WBTC`
