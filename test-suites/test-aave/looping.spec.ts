import { makeSuite, TestEnv } from './helpers/make-suite';
import { expect } from 'chai';

makeSuite('Looping', (testEnv: TestEnv) => {
  it('Looping', async () => {
    const { users, looping } = testEnv;

    console.log(await looping.LENDING_POOL());
  });
});
