# ac-api-connector
Use this class to connect to AdmiralCloud APIs

[![Node.js CI](https://github.com/AdmiralCloud/ac-api-connector/actions/workflows/node.js.yml/badge.svg)](https://github.com/AdmiralCloud/ac-api-connector/actions/workflows/node.js.yml)

# BREAKING CHANGES Version 1
Starting with version 1 we use ac-signature with signature version 5 which does not require controller and action but use the path instead.

Note: With signature version 5, the identifier is also part of the signed payload, which makes the request even more secure.


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
let response = await apiConnector.request({ 
  path: '/v5/me',
  identifier: 'my-identifier',
  payload: {
    prop1: 'abc,
    prop2: 123,
    prop3: {
      subproc1: 'xyz'
    }
  }
})
```




# Links
- [Website](https://www.admiralcloud.com/)

# Run tests
```
yarn run test
```

## License

[MIT License](https://opensource.org/licenses/MIT) Copyright © 2009-present, AdmiralCloud AG, Mark Poepping