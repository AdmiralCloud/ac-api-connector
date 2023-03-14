const https = require('https')
const acsignature = require('ac-signature')
const axios = require('axios')

class APIConnector {
  constructor({ baseURL = 'https://api.admiralcloud.com', maxCachedSession, clientId, accessKey, accessSecret, headers = {} }) {
    const httpOptions = {
      keepAlive: true
    }
    if (maxCachedSession) httpOptions.maxCachedSession = maxCachedSession
    const httpsAgent = new https.Agent(httpOptions)

    this.api = axios.create({
      baseURL,
      httpsAgent,
      headers
    })

    this.clientId = clientId
    this.accessKey = accessKey
    this.accessSecret = accessSecret
  }

  async request({ method = 'get', path, controller, action, params = {}, payload = {}, headers = {}, identifier }) {

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
    
    const pick = ({ status, statusText, config, data }) => ({ status, statusText, headers: config?.headers, data })
    const response = await this.api(axiosParams)
    const filteredResponse = pick(response)

    return filteredResponse
  }

}

module.exports = APIConnector