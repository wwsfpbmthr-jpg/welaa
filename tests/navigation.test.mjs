import {test} from 'node:test';
import assert from 'node:assert/strict';
import {safeReturnPath} from '../lib/navigation.ts';
test('login preserves the full booking selection',()=>assert.equal(safeReturnPath('/checkout?listingId=abc&date=2026-10-04&start=9&end=11&guests=2'),'/checkout?listingId=abc&date=2026-10-04&start=9&end=11&guests=2'));
test('reject external redirects, encoded control tricks and login loops',()=>{for(const path of ['https://evil.test','//evil.test','/\\evil.test','/\nevil.test','/login?next=/','/auth/callback',null])assert.equal(safeReturnPath(path),'/')});
