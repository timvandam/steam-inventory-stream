const { Readable } = require('stream')
const request = require('request')

const SteamItemBatch = require('./SteamItemBatch')

/**
 * Class that loads Steam inventories and allows for stream-like processing of items
 */
class SteamInventoryStream extends Readable {
  /**
   * Constructs a SteamInventoryStream instance
   * @param {String} steamId - steamid of whom we want to fetch the inventory
   * @param {Number} appId - appid of the inventory we want to fetch
   * @param {String} contextId - contextid of the inventory we want to fetch
   * @param {String} [language=en] - the language of the description for items to fetch
   * @param {Number} [maxSequentialErrors=5] - the amount of times a inventory request is allowed to fail before destroying the stream
   * @param {Number} [maxChunkSize=5000] - the maximum amount of items to fetch per request (Steam doesn't allow above 5000 - 8/4/20)
   */
  constructor (steamId, appId, contextId, language = 'en', maxSequentialErrors = 5, maxChunkSize = 5000) {
    super({ objectMode: true })
    if (!steamId) throw new Error('No steamid was provided')
    if (!appId) throw new Error('No appid was provided')
    if (!contextId) throw new Error('No contextid was provided')
    if (!language) throw new Error('No language was provided')
    if (maxSequentialErrors === undefined) throw new Error('No maxSequentialErrors was provided')
    if (maxChunkSize === undefined) throw new Error('No maxChunkSize was provided')
    if (typeof steamId !== 'string') throw new Error('Steamid must be a string')
    if (typeof appId !== 'number') throw new Error('Appid must be a number')
    if (typeof contextId !== 'string') throw new Error('Contextid must be a string')
    if (typeof language !== 'string') throw new Error('Language must be a string')
    if (typeof maxSequentialErrors !== 'number') throw new Error('MaxSequentialErrors must be a number')
    if (typeof maxChunkSize !== 'number') throw new Error('MaxChunkSize must be a number')
    this.steamId = steamId
    this.appId = appId
    this.contextId = contextId
    this.language = language
    this.maxSequentialErrors = maxSequentialErrors
    this.maxChunkSize = maxChunkSize

    this.errors = 0
    this.moreItems = true
    this.lastAssetId = undefined
    this.count = 75
  }

  /**
   * Reads from the readable stream
   * @todo detect when the inventory is private
   */
  async _read () {
    if (this.reading) return false
    this.reading = true
    while (this.moreItems) {
      if (this.errors >= this.maxSequentialErrors) {
        this.destroy(new Error('Failed to load steam inventory'))
        break
      }

      try {
        // Gets a batch of items
        const batch = await this.getBatch(this.lastAssetId, this.count)

        // Updates amount of items to fetch in the next request
        this.count = Math.min(2 * this.count, this.maxChunkSize)
        this.moreItems = !batch.isLast
        this.lastAssetId = batch.lastAssetId

        // Gets a list of SteamItems and processes them
        const items = batch.getItems()

        // Only keep reading when this.push is true
        this.reading = this.push(items)
        if (!this.reading) return false
      } catch (error) {
        if (this.count === 75) this.errors++
        this.count /= 2
        this.count = Math.max(this.count, 75)
      }
    }
    if (!this.moreItems) this.push(null)
    return true
  }

  /**
   * Fetch a batch of items
   * @param {String} [startAssetId] - assetid of the last item that was fetched
   * @param {Number} count - the size of the batch to fetch
   * @returns {Promise<SteamItemBatch>} batch of fetched items
   */
  getBatch (startAssetId, count) {
    return new Promise((resolve, reject) => {
      // Compose querystring
      const qs = {
        l: this.language,
        start_assetid: startAssetId,
        count
      }
      // Do the request
      request.get(
        `https://steamcommunity.com/inventory/${this.steamId}/${this.appId}/${this.contextId}`,
        { json: true, qs },
        (error, response, body) => {
          // Either return errors or return body
          if (error) return reject(error)
          if (response.statusCode !== 200) return reject(new Error(`Status code ${response.statusCode}`))
          if (!body.success) return reject(new Error('No success'))
          if (!body.assets) return reject(new Error('No assets'))
          if (!body.descriptions) return reject(new Error('No descriptions'))
          resolve(new SteamItemBatch(body.assets, body.descriptions, !body.more_items, body.last_assetid))
        })
    })
  }
}

module.exports = SteamInventoryStream
