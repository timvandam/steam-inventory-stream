const SteamInventoryStream = require('../SteamInventoryStream')
const SteamItemBatch = require('../SteamItemBatch')
const request = require('request')

jest.mock('request')

describe('constructor works', () => {
  const validSteamId = '111'
  const invalidSteamId = 111
  const validAppId = 111
  const invalidAppId = '111'
  const validContextId = '111'
  const invalidContextId = 111
  const validLanguage = undefined
  const invalidLanguage = 123
  const validMaxSequentialErrors = undefined
  const invalidMaxSequentialErrors = '111'
  const validMaxChunkSize = undefined
  const invalidMaxChunkSize = '111'
  it('when providing invalid items', () => {
    // Missing required values
    expect(() => new SteamInventoryStream(undefined, validAppId, validContextId)).toThrow()
    expect(() => new SteamInventoryStream(validSteamId, undefined, validContextId)).toThrow()
    expect(() => new SteamInventoryStream(validSteamId, validAppId, undefined)).toThrow()
    // Missing optional values
    expect(() => new SteamInventoryStream(validSteamId, validAppId, validContextId, null)).toThrow()
    expect(() => new SteamInventoryStream(validSteamId, validAppId, validContextId, validLanguage, null)).toThrow()
    expect(() => new SteamInventoryStream(validSteamId, validAppId, validContextId, validLanguage, validMaxSequentialErrors, null)).toThrow()

    // Invalid values
    expect(() => new SteamInventoryStream(invalidSteamId, validAppId, validContextId)).toThrow()
    expect(() => new SteamInventoryStream(validSteamId, invalidAppId, validContextId)).toThrow()
    expect(() => new SteamInventoryStream(validSteamId, validAppId, invalidContextId)).toThrow()
    expect(() => new SteamInventoryStream(validSteamId, validAppId, validContextId, invalidLanguage)).toThrow()
    expect(() => new SteamInventoryStream(validSteamId, validAppId, validContextId, validLanguage, invalidMaxSequentialErrors)).toThrow()
    expect(() => new SteamInventoryStream(validSteamId, validAppId, validContextId, validLanguage, validMaxSequentialErrors, invalidMaxChunkSize)).toThrow()
  })

  it('when providing valid items', () => {
    expect(() => new SteamInventoryStream(validSteamId, validAppId, validContextId, validLanguage, validMaxSequentialErrors, validMaxChunkSize)).not.toThrow()
  })
})

describe('methods work', () => {
  const inventoryLoader = new SteamInventoryStream('123', 123, '123')

  const assets = [{
    appid: 753,
    contextid: '6',
    assetid: '123',
    classid: '333',
    instanceid: '0',
    amount: '1'
  }]
  const descriptions = [{
    appid: 753,
    classid: '333',
    instanceid: '0'
  }]
  const expectedBatch = new SteamItemBatch(assets, descriptions, true, '123', '123')

  describe('getBatch works', () => {
    it('when requests fail', async () => {
      request.get
        .mockReset()
        .mockImplementationOnce((url, options, callback) => callback(new Error('Request Error')))
        .mockImplementationOnce((url, options, callback) => callback(undefined, { statusCode: 500 }))
        .mockImplementationOnce((url, options, callback) => callback(undefined, { statusCode: 200 }, { success: 0 }))
        .mockImplementationOnce((url, options, callback) => callback(undefined, { statusCode: 200 }, { success: 1 }))
        .mockImplementationOnce((url, options, callback) => callback(undefined, { statusCode: 200 }, { success: 1, assets: {} }))
      await expect(inventoryLoader.getBatch()).rejects.toThrow(new Error('Request Error'))
      await expect(inventoryLoader.getBatch()).rejects.toThrow(new Error('Status code 500'))
      await expect(inventoryLoader.getBatch()).rejects.toThrow(new Error('No success'))
      await expect(inventoryLoader.getBatch()).rejects.toThrow(new Error('No assets'))
      await expect(inventoryLoader.getBatch()).rejects.toThrow(new Error('No descriptions'))
    })

    it('when requests succeed', async () => {
      request.get
        .mockReset()
        .mockImplementation((url, options, callback) => {
          callback(undefined, { statusCode: 200 }, {
            success: 1,
            more_items: 0,
            last_assetid: '123',
            assets,
            descriptions
          })
        })
      expect(await inventoryLoader.getBatch()).toEqual(expectedBatch)
    })
  })

  describe('_read works', () => {
    it('when it is already reading', async () => {
      inventoryLoader.reading = true
      await expect(inventoryLoader._read()).resolves.toBe(false)
      inventoryLoader.reading = false
    })

    it('when it stops reading after .push returns false', async () => {
      const inventoryLoader = new SteamInventoryStream('123', 123, '123')
      jest.spyOn(inventoryLoader, 'push')
      inventoryLoader.push.mockReturnValueOnce(false)
      await expect(inventoryLoader._read()).resolves.toBe(false)
      expect(inventoryLoader.push).toHaveBeenCalled()
    })

    describe('when requests succeed', () => {
      it('returns the right values', async () => {
        const received = []
        const done = new Promise(resolve => inventoryLoader.once('end', resolve))
        inventoryLoader.on('data', data => received.push(...data))
        await done
        inventoryLoader.removeAllListeners()
        expect(received).toEqual(expectedBatch.getItems())
      })
    })

    it('when requests fail', async () => {
      request.get
        .mockReset()
        .mockImplementationOnce((url, options, callback) =>
          callback(undefined, { statusCode: 200 }, {
            success: 1,
            more_items: 1,
            last_assetid: '123',
            assets,
            descriptions
          }))
        .mockImplementation((url, options, callback) => callback(new Error('Request Error')))
      const inventoryLoader = new SteamInventoryStream('123', 123, '123')
      const received = []
      let receivedError
      const done = new Promise(resolve => inventoryLoader.once('close', resolve))
      inventoryLoader.on('data', data => received.push(...data))
      inventoryLoader.on('error', error => { receivedError = error })
      await done
      inventoryLoader.removeAllListeners()
      expect(received).toEqual(expectedBatch.getItems())
      expect(receivedError).toEqual(new Error('Failed to load steam inventory'))
    })
  })
})
