const { expect } = require('chai')
const accon = require('./index')
const acsignature = require('ac-signature')

describe('Try API connecion', () => {
  const controller = 'bootstrap'
  const action = 'find'
  const apiConfig = {
    clientId: 'abc',
    accessKey: 'my-access-key',
    accessSecret: 'my-access-secret',
    headers: {
      'x-admiralcloud-test': true,
    }
  }
  let apiConnector

  it('Prepare connector', (done) => {
    apiConnector = new accon(apiConfig)
    done()
  })
  it('Try to connect', async() => {
    let response = await apiConnector.callAPI({ 
      path: '/',
      controller,
      action,
      identifier: 'my-identifier'
    })
    const headers = response?.headers
    expect(headers).to.have.property('x-admiralcloud-test', 'true')
    expect(headers).to.have.property('x-admiralcloud-clientid', apiConfig.clientId)
    expect(headers).to.have.property('x-admiralcloud-accesskey', apiConfig.accessKey)
    expect(headers).not.to.have.property('x-admiralcloud-accesssecret')
    expect(headers).to.have.property('x-admiralcloud-rts')
    expect(headers).to.have.property('x-admiralcloud-hash')
    expect(headers).to.have.property('x-admiralcloud-identifier', 'my-identifier')

    // response from API 
    expect(response?.data).to.have.property('version')
  })

  it('Check that signature is sent properly', async() => {
    const query = { id: 123 }
    const body = { title: 'my_title' }

    const signParams = {
      accessSecret: apiConfig.accessSecret,
      controller,
      action,
      payload: Object.assign(query, body)
    }
    const signedValues = acsignature.sign(signParams)

    const response = await apiConnector.callAPI({ 
      path: '/',
      controller,
      action,
      identifier: 'my-identifier',
      params: query, 
      payload: body
    })
    const headers = response?.headers
    expect(headers).to.have.property('x-admiralcloud-test', 'true')
    expect(headers).to.have.property('x-admiralcloud-clientid', apiConfig.clientId)
    expect(headers).to.have.property('x-admiralcloud-accesskey', apiConfig.accessKey)
    expect(headers).not.to.have.property('x-admiralcloud-accesssecret')
    expect(headers).to.have.property('x-admiralcloud-rts')
    expect(headers).to.have.property('x-admiralcloud-hash', signedValues.hash)
    expect(headers).to.have.property('x-admiralcloud-identifier', 'my-identifier')

    // response from API 
    expect(response?.data).to.have.property('version')
  })
})
