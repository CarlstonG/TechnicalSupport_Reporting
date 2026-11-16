import test from 'node:test';
import assert from 'node:assert/strict';
import { providerError } from '../lib/provider-error.ts';
test('distinguishes exhausted billing quota from temporary rate limits',()=>{
  assert.match(providerError('openai',429,'insufficient_quota'),/quota is exhausted/);
  assert.match(providerError('openai',429,'rate_limit_exceeded'),/rate limit reached/);
  assert.match(providerError('openai',401),/key was rejected/);
  assert.match(providerError('openai',404),/Model not found/);
});
test('never reflects arbitrary provider error content into the UI',()=>{
  assert.equal(providerError('openai',429,'private-provider-error-content').includes('private-provider-error-content'),false);
});
