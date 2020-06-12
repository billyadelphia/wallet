import Vue from 'vue'
import { random } from 'lodash-es'
import axios from 'axios'
import { mnemonicToSeedSync } from 'bip39'
import hdkey from 'ethereumjs-wallet/hdkey'

export const TIMEOUTS = []

export const INTERVALS = []

export const CHAIN_LOCK = {}

export const emitter = new Vue()

export const waitForRandom = (min, max) => new Promise(resolve => setTimeout(() => resolve(), random(min, max)))

export const timestamp = () => Math.ceil(Date.now() / 1000)

export const generateAddressesFromSeed = (seed, count = 1) => {
  const hdWallet = hdkey.fromMasterSeed(mnemonicToSeedSync(seed))
  const walletHdpath = "m/44'/60'/0'/"

  const accounts = []
  for (let i = 0; i < count; i++) {
    const wallet = hdWallet.derivePath(walletHdpath + `0/${i}`).getWallet()
    const address = '0x' + wallet.getAddress().toString('hex')
    const privateKey = wallet.getPrivateKey().toString('hex')
    accounts.push({ address: address, privateKey: privateKey })
  }

  return count === 1 ? accounts[0] : accounts
}

export const getChainFromAsset = asset => {
  if (['DAI', 'USDC'].includes(asset)) return 'ETH'

  return asset
}

export const attemptToLockAsset = (network, walletId, asset) => {
  const chain = getChainFromAsset(asset)
  const key = [network, walletId, chain].join('-')

  if (CHAIN_LOCK[key]) {
    return {
      key,
      success: false
    }
  }

  CHAIN_LOCK[key] = true

  return {
    key,
    success: true
  }
}

export const unlockAsset = key => {
  CHAIN_LOCK[key] = false

  emitter.$emit(`unlock:${key}`)
}

export const newOrder = (agent, data) => {
  return axios({
    url: agent + '/api/swap/order',
    method: 'post',
    data,
    headers: {
      'x-requested-with': 'wallet',
      'x-liquality-user-agent': 'wallet'
    }
  }).then(res => res.data)
}

export const updateOrder = (agent, id, data) => {
  return axios({
    url: agent + '/api/swap/order/' + id,
    method: 'post',
    data,
    headers: {
      'x-requested-with': 'wallet',
      'x-liquality-user-agent': 'wallet'
    }
  }).then(res => res.data)
}

export const getMarketData = agent => {
  return axios({
    url: agent + '/api/swap/marketinfo',
    method: 'get',
    headers: {
      'x-requested-with': 'wallet',
      'x-liquality-user-agent': 'wallet'
    }
  }).then(res => res.data)
}
