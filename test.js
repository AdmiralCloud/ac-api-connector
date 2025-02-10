const { expect } = require('chai')
const accon = require('./index')
const acsignature = require('ac-signature')



describe('Try API connecion', () => {
  const apiConfig = {
    clientId: 'abc',
    accessKey: 'my-access-key',
    accessSecret: 'my-access-secret',
    headers: {
      'x-admiralcloud-test': true,
    }
  }
  
  const expectedResponse = (response, { clientId = apiConfig.clientId } = {}) => {
    const { headers, data } = response
    expect(headers).to.have.property('x-admiralcloud-test', 'true')
    expect(headers).to.have.property('x-admiralcloud-clientid', clientId)
    expect(headers).to.have.property('x-admiralcloud-accesskey', apiConfig.accessKey)
    expect(headers).not.to.have.property('x-admiralcloud-accesssecret')
    expect(headers).to.have.property('x-admiralcloud-rts')
    expect(headers).to.have.property('x-admiralcloud-hash')
    expect(headers).to.have.property('x-admiralcloud-identifier', 'my-identifier')
    // response from API 
    expect(data).to.have.property('version')
  }

  let apiConnector

  it('Prepare connector', (done) => {
    apiConnector = new accon(apiConfig)
    done()
  })
  it('Try to connect', async() => {
    const response = await apiConnector.request({ 
      path: '/',
      identifier: 'my-identifier'
    })
    expectedResponse(response)
  })

  it('Try to connect again using the same socket', async() => {
    const response = await apiConnector.request({ 
      path: '/',
      identifier: 'my-identifier',
      debug: true
    })
    expectedResponse(response)
    expect(response?.reuseSocket).to.be.true
  })

  it('Check that signature is sent properly', async() => {
    const query = { id: 123 }
    const body = { title: 'my_title' }

    const signParams = {
      path: '/',
      accessSecret: apiConfig.accessSecret,
      payload: Object.assign(query, body),
      identifier: 'my-identifier'
    }
    const signedValues = acsignature.sign5(signParams)

    const response = await apiConnector.request({ 
      path: '/',
      identifier: 'my-identifier',
      params: query, 
      payload: body
    })
    expectedResponse(response)
    expect(response?.headers).to.have.property('x-admiralcloud-hash', signedValues.hash)
  })

  it('Check request with different clientId', async() => {
    const query = { id: 123 }
    const body = { title: 'my_title' }

    const signParams = {
      path: '/',
      accessSecret: apiConfig.accessSecret,
      payload: Object.assign(query, body),
      identifier: 'my-identifier'
    }
    const signedValues = acsignature.sign5(signParams)

    const response = await apiConnector.request({ 
      path: '/',
      identifier: 'my-identifier',
      params: query, 
      payload: body,
      clientId: 'my-special-clientId'
    })
    expectedResponse(response, { clientId: 'my-special-clientId' })
    expect(response?.headers).to.have.property('x-admiralcloud-hash', signedValues.hash)
  })

})
