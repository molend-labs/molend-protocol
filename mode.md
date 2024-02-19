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
   `npx hardhat --network mode dev:collector`      

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
