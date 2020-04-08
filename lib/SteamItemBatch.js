const SteamItem = require('./SteamItem')

/**
 * Class that represents a batch of items retrieved from steamcommunity.com
 */
class SteamItemBatch {
  /**
   * Constructs a SteamItemBatch instance
   * @param {Object[]} assets - an array of objects containing asset related item data
   * @param {Object[]} descriptions - an array of objects containing descriptive item data
   * @param {Boolean} isLast - a boolean indicating whether this is the last batch of a user's inventory
   * @param {String} lastAssetId - the last item's assetid
   */
  constructor (assets, descriptions, isLast, lastAssetId) {
    this.assets = assets
    this.descriptions = descriptions
    this.isLast = isLast
    this.lastAssetId = lastAssetId
  }

  /**
   * Uses assets and descriptions to compose SteamItem instances
   * @returns {SteamItem[]} array of SteamItem instances
   */
  getItems () {
    const items = []

    // Store descriptions by classid by instanceid. { classId: { instanceId: description } }
    const descriptions = {}
    for (let i = 0; i < this.descriptions.length; i++) {
      const description = this.descriptions[i]
      const { instanceid, classid } = description
      if (!descriptions[classid]) descriptions[classid] = {}
      descriptions[classid][instanceid] = description
    }

    // Create SteamItem instances and add them to the items array
    for (let i = 0; i < this.assets.length; i++) {
      const asset = this.assets[i]
      const description = descriptions[asset.classid][asset.instanceid]
      const item = new SteamItem(asset, description)
      items.push(item)
    }

    return items
  }
}

module.exports = SteamItemBatch
