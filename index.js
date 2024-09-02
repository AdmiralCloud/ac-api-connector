const https = require('https')
const acsignature = require('ac-signature')
const axios = require('axios')

class APIConnector {
  constructor({ baseURL = 'https://api.admiralcloud.com', maxCachedSessions, clientId, accessKey, accessSecret, headers = {}, debug } = {}) {
    const httpOptions = {
      keepAlive: true
    }
    if (maxCachedSessions) httpOptions.maxCachedSessions = maxCachedSessions
    const httpsAgent = new https.Agent(httpOptions)
    this.httpsAgent = httpsAgent

    this.api = axios.create({
      baseURL,
      httpsAgent,
      headers
    })

    this.clientId = clientId
    this.accessKey = accessKey
    this.accessSecret = accessSecret
    this.debug = debug
  }

  async request({ method = 'get', path, params = {}, payload = {}, headers = {}, identifier, debug }) {

    const signParams = {
      accessSecret: this.accessSecret,
      path,
      payload: Object.assign(JSON.parse(JSON.stringify(params)), payload), // BODY payload takes precedence
      debug
    }
    if (identifier) {
      signParams.identifier = identifier
    }
    const signedValues = acsignature.sign5(signParams)

    Object.assign(headers, {
      'x-admiralcloud-clientid': this.clientId,
      'x-admiralcloud-accesskey': this.accessKey,
      'x-admiralcloud-rts': signedValues.timestamp,
      'x-admiralcloud-hash': signedValues.hash,
      'x-admiralcloud-version': 5
    })
    if (identifier) {
      headers['x-admiralcloud-identifier'] = identifier
    }
    if (this.debug || debug) {
      headers['x-admiralcloud-debugsignature'] = true
    }

    const axiosParams = {
      method,
      url: path,
      headers
    }
    if (Object.keys(params).length) axiosParams.params = params
    if (Object.keys(payload).length) axiosParams.data = payload
    
    if (this.debug || debug) {
      console.info('ac-api-connector | Request | %j', axiosParams)
    }

    const pick = ({ status, statusText, headers, config, data }) => ({ status, statusText, responseHeaders: headers, headers: config?.headers, data })
    const response = await this.api(axiosParams)
    const filteredResponse = pick(response)

    if (this.debug || debug) {
      console.info('ac-api-connector | Response | Status %s | Reuse socket %s | Total sockets %s', response?.status, response?.request?.reusedSocket, this.httpsAgent?.totalSocketCount)
      filteredResponse.reuseSocket = response?.request?.reusedSocket
    }

    return filteredResponse
  }

}

module.exports = APIConnector