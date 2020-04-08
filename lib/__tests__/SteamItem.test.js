const SteamItem = require('../SteamItem')

it('constructor works', () => {
  const item = new SteamItem({
    appid: 123,
    contextid: '50',
    assetid: '12345678',
    classid: '1234',
    instanceid: '2',
    amount: '6'
  }, {
    appid: 123,
    classid: '1234',
    instanceid: '2',
    currency: 0,
    icon_url: 'random_url',
    tradable: 0,
    name: 'My Item Name',
    market_name: 'My Item Name',
    market_hash_name: 'My Item Name',
    commodity: 0,
    market_tradable_restriction: 7,
    marketable: 1
  })
  expect(item).toEqual(expect.objectContaining({
    appId: 123,
    contextId: '50',
    assetId: '12345678',
    classId: '1234',
    instanceId: '2',
    amount: '6',
    currency: false,
    iconUrl: 'random_url',
    tradable: false,
    name: 'My Item Name',
    marketName: 'My Item Name',
    marketHashName: 'My Item Name',
    commodity: false,
    marketTradableRestriction: 7,
    marketable: true
  }))
})
