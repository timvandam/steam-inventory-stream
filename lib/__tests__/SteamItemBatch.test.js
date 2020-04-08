const SteamItemBatch = require('../SteamItemBatch')
const SteamItem = require('../SteamItem')

const assets = [{
  appid: 753,
  contextid: '6',
  assetid: '123',
  classid: '333',
  instanceid: '1',
  amount: '1'
}]
const descriptions = [{
  appid: 753,
  classid: '333',
  instanceid: '0'
}, {
  appid: 753,
  classid: '333',
  instanceid: '1'
}]
const expectedBatch = {
  assets,
  descriptions,
  isLast: true,
  lastAssetId: '123',
  owner: undefined
}
const itemBatch = new SteamItemBatch(assets, descriptions, true, '123')

it('constructor works', () => {
  expect(itemBatch).toEqual(expectedBatch)
})

it('getItems works', () => {
  expect(itemBatch.getItems()).toEqual([
    new SteamItem(assets[0], descriptions[1])
  ])
})
