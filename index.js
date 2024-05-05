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

  async request({ method = 'get', path, controller, action, params = {}, payload = {}, headers = {}, identifier, debug }) {

    const signParams = {
      accessSecret: this.accessSecret,
      controller,
      action,
      payload: Object.assign(JSON.parse(JSON.stringify(params)), payload) // BODY payload takes precedence
    }
    const signedValues = acsignature.sign(signParams)

    Object.assign(headers, {
      'x-admiralcloud-clientid': this.clientId,
      'x-admiralcloud-accesskey': this.accessKey,
      'x-admiralcloud-rts': signedValues.timestamp,
      'x-admiralcloud-hash': signedValues.hash,
    })
    if (identifier) {
      headers['x-admiralcloud-identifier'] = identifier
    }

    const axiosParams = {
      method,
      url: path,
      headers
    }
    if (Object.keys(params).length) axiosParams.params = params
    if (Object.keys(payload).length) axiosParams.data = payload
    
    if (this.debug || debug) {
      console.log('ac-api-connector | Request | %j', axiosParams)
    }

    const pick = ({ status, statusText, headers, config, data }) => ({ status, statusText, responseHeaders: headers, headers: config?.headers, data })
    const response = await this.api(axiosParams)
    const filteredResponse = pick(response)

    if (this.debug || debug) {
      console.log('ac-api-connector | Response | Status %s | Reuse socket %s | Total sockets %s', response?.status, response?.request?.reusedSocket, this.httpsAgent?.totalSocketCount)
      filteredResponse.reuseSocket = response?.request?.reusedSocket
    }

    return filteredResponse
  }

}

module.exports = APIConnector