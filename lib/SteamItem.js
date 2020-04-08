/**
 * @typedef {Object} SteamItemAsset
 * @property {Number} appid
 * @property {String} contextid
 * @property {String} assetid
 * @property {String} classid
 * @property {String} instanceid
 * @property {String} amount
 */

/**
* @typedef {Object} SteamItemDescription
* @property {Number} appid
* @property {String} classid
* @property {String} instanceid
* @property {0 | 1} currency
* @property {String} icon_url
* @property {0 | 1} tradable
* @property {String} name
* @property {String} market_name
* @property {String} market_hash_name
* @property {0 | 1} commodity
* @property {Number} market_tradable_restriction
* @property {0 | 1} marketable
*/

/**
 * Class that represents a Steam Item
 * @property {Number} appId
 * @property {String} contextId
 * @property {String} assetId
 * @property {String} classId
 * @property {String} instanceId
 * @property {String} amount
 * @property {Boolean} currency
 * @property {String} iconUrl
 * @property {Boolean} tradable
 * @property {String} name
 * @property {String} type
 * @property {String} marketName
 * @property {String} marketHashName
 * @property {Boolean} commodity - whether this item uses buy/sell orders
 * @property {Number} marketTradableRestriction - trade restriction after buying from market in days
 * @property {Boolean} marketable
 */
class SteamItem {
  /**
   * Constructs a SteamItem
   * @param {SteamItemAsset} asset
   * @param {SteamItemDescription} description
   */
  constructor (asset, description) {
    const { appid, contextid, assetid, classid, instanceid, amount } = asset
    this.appId = appid
    this.contextId = contextid
    this.assetId = assetid
    this.classId = classid
    this.instanceId = instanceid
    this.amount = amount

    const { currency, icon_url: iconUrl, tradable, name, type, market_name: marketName, market_hash_name: marketHashName, commodity, market_tradable_restriction: marketTradableRestriction, marketable } = description
    this.currency = currency
    this.iconUrl = iconUrl
    this.tradable = !!tradable
    this.name = name
    this.type = type
    this.marketName = marketName
    this.marketHashName = marketHashName
    this.commodity = !!commodity
    this.marketTradableRestriction = marketTradableRestriction
    this.marketable = !!marketable
  }

  /**
   * Casts an object into a SteamItem
   * @param {Object} obj - SteamItem object
   * @returns {SteamItem} SteamItem instance
   */
  static fromObject (obj) {
    return Object.assign(Object.create(SteamItem.prototype), obj)
  }
}

module.exports = SteamItem
