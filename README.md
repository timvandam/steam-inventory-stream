# steam-inventory-stream

The 'usual' way Steam inventories are usually fetched is using [steam-tradeoffer-manager](https://github.com/DoctorMcKay/node-steam-tradeoffer-manage) or [steamcommunity](https://github.com/DoctorMcKay/node-steamcommunity). Unfortunately these modules don't support streams, which means that all items in the inventory being loaded will be saved to memory.

This package provides an alternative by streaming these items instead, reducing memory usage when used correctly.

```javascript
const SteamInventoryStream = require('steam-inventory-stream')
const inventoryStream = new SteamInventoryStream(
  steamId,
  appId,
  contextId,
  [language=en],
  [maxSequentialErrors=5],
  [maxChunkSize=5000]
)

/**
 * steamId must be a string
 * appId must be a number
 * contextId must be a string
 * language must be a string (default = en)
 * maxSequentialErrors is the amount of times Steam can return an error code in a row before stopping loading items (default = 5)
 * maxChunkSize is the maximum amount of items to fetch per request (default = 5000). Values above 5000 are not allowed by Steam
 */

// You can now use `inventoryStream` just like any other readable stream, e.g.:

inventoryStream.on('data', items => {
  console.log(`Fetched ${items.length} items`)
})

inventoryStream.on('end', () => {
  console.log('All items have been fetched')
})
```
