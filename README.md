# ac-api-connector
Use this class to connect to AdmiralCloud APIs

[![Node.js CI](https://github.com/AdmiralCloud/ac-api-connector/actions/workflows/node.js.yml/badge.svg)](https://github.com/AdmiralCloud/ac-api-connector/actions/workflows/node.js.yml)

## Usage
Init a class instance with your app's clientId and accessKey and accessSecret from your app or from a user.

```
const accon = require('ac-api-connector')

const apiConfig = {
  baseURL: 'url-of-the-api' // defaults to https://api.admiralcloud.com
  clientId: 'abc',
  accessKey: 'my-access-key',
  accessSecret: 'my-access-secret'
}
const apiConnector = new accon(apiConfig)
```

You can now use this connector for calls against the API.
```
let response = await apiConnector.callAPI({ 
  path: '/v5/me',
  controller,
  action,
  identifier: 'my-identifier'
})
```




# Links
- [Website](https://www.admiralcloud.com/)
- [Facebook](https://www.facebook.com/MediaAssetManagement/)

# Run tests
```
yarn run test
```

## License

[MIT License](https://opensource.org/licenses/MIT) Copyright © 2009-present, AdmiralCloud AG, Mark Poepping