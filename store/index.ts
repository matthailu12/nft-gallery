import VuexPersist from 'vuex-persist'
import Connector from '@vue-polkadot/vue-api'
import correctFormat from '@/utils/ss58Format'
import { getKsmPrice } from '@/coingecko'
import { Commit } from 'vuex'

const vuexLocalStorage = new VuexPersist({
  key: 'vuex',
  storage: window.sessionStorage,
})

interface ChangeUrlAction {
  type: string;
  payload: string;
}

const apiPlugin = (store: any) => {
  const { getInstance: Api } = Connector

  Api().on('connect', async (api: any) => {
    const { chainSS58, chainDecimals, chainTokens  } = api.registry
    const {genesisHash} = api
    console.log('[API] Connect to <3', store.state.setting.apiUrl,
      { chainSS58, chainDecimals, chainTokens, genesisHash})
    store.commit('setChainProperties', {
      ss58Format: correctFormat(chainSS58),
      tokenDecimals: chainDecimals[0] || 12,
      tokenSymbol: chainTokens[0] || 'Unit',
      genesisHash: genesisHash || '',
    })

    const nodeInfo = store.getters.availableNodes
      .filter((o:any) => o.value === store.state.setting.apiUrl)
      .map((o:any) => {return o.info})[0]
    store.commit('setExplorer', { 'chain': nodeInfo })
  })
  Api().on('error', async (error: Error) => {
    store.commit('setError', error)
    console.warn('[API] error', error)
    // Api().disconnect()
  })
}

const myPlugin = (store: any) => {
  const { getInstance: Api } = Connector
  Api().connect(store.state.setting.apiUrl)


  store.subscribeAction(({type, payload}: ChangeUrlAction, _: any) => {
    if (type === 'setApiUrl' && payload) {
      store.commit('setLoading', true)
      Api().connect(payload)
    }
  })
}

// TODO: create instance of Texitle here as plugin


export const state = () => ({
  loading: false,
  keyringLoaded: false,
  chainProperties: {},
  explorer: {},
  lang: {},
  indexer: {
    indexerHealthy: true,
    lastProcessedHeight: undefined,
    lastProcessedTimestamp: undefined,
  },
  language: {
    userLang: process.env.VUE_APP_I18N_LOCALE || 'en',
    langsFlags: [
      {
        value: 'en',
        flag: '🇬🇧',
        label: 'English'
      },
      {
        value: 'bn',
        flag: '🇧🇩',
        label: 'বাংলা'
      },
      {
        value: 'cn',
        flag: '🇨🇳',
        label: '中文'
      },
      {
        value: 'cz',
        flag: '🇨🇿',
        label: 'Česky'
      },
      {
        value: 'es',
        flag: '🇪🇸',
        label: 'Español'
      },
      {
        value: 'fr',
        flag: '🇫🇷',
        label: 'Français'
      },
      {
        value: 'jp',
        flag: '🇯🇵',
        label: '日本語'
      },
      {
        value: 'ko',
        flag: '🇰🇷',
        label: '한국어'
      },
      {
        value: 'nl',
        flag: '🇳🇱',
        label: 'Vlaams'
      },
      {
        value: 'pl',
        flag: '🇵🇱',
        label: 'Polski'
      },
      {
        value: 'pt',
        flag: '🇵🇹',
        label: 'Português'
      },
      {
        value: 'sk',
        flag: '🇸🇰',
        label: 'Slovenčina'
      },
      {
        value: 'tu',
        flag: '🇹🇷',
        label: 'Türkçe'
      },
      {
        value: 'ur',
        flag: '🇵🇰',
        label: 'اردو'
      },
      {
        value: 'vt',
        flag: '🇻🇳',
        label: 'Tiếng Việt'
      },
      {
        value: 'ru',
        flag: '🇷🇺',
        label: 'Русский'
      },
      // {
      //   value: 'de',
      //   flag: '🇩🇪',
      //   label: 'Deutsch'
      // },
      // {
      //   value: 'ua',
      //   flag: '🇺🇦',
      //   label: 'Українська'
      // },
      // {
      //   value: 'it',
      //   flag: '🇮🇹',
      //   label: 'Italiano'
      // },
      // {
      //   value: 'hi',
      //   flag: '🇮🇳',
      //   label: 'हिन्दी'
      // }
    ]
  },
  explorerOptions: {},
  development: {},
  error: null,
  fiatPrice: {
    kusama: {
      usd: null
    }
  },
  layoutClass: 'is-one-third-desktop is-one-third-tablet'
})
export const mutations = {
  keyringLoaded(state: any) {
    state.keyringLoaded = true
  },
  setChainProperties(state: any, data : any) {
    state.chainProperties = Object.assign({}, data)
  },
  setDevelopment(state: any, data : any) {
    state.development = Object.assign(state.development, data)
  },
  setExplorer(state: any, data : any) {
    state.explorer = Object.assign(state.explorer, data)
  },
  setLanguage(state: any, data : any) {
    state.language = Object.assign(state.language, data)
  },
  setExplorerOptions(state: any, data : any) {
    state.explorerOptions = Object.assign({}, data)
  },
  setLoading(state: any, toggleTo: boolean) {
    state.loading = toggleTo
  },
  setError(state: any, error: Error) {
    state.loading = false
    state.error = error.message
  },
  setFiatPrice(state: any, data : any) {
    state.fiatPrice = Object.assign({}, state.fiatPrice, data)
  },
  setIndexerStatus(state: any, data : any) {
    state.indexer = Object.assign({}, state.indexer, data)
  },
  setLayoutClass(state: any, data) {
    state.layoutClass = data
  },
}

export const  actions = {
  async fetchFiatPrice({ commit }: { commit: Commit }) {
    const ksmPrice = await getKsmPrice()
    commit('setFiatPrice', ksmPrice)
  },
  setFiatPrice({ commit }: { commit: Commit }, data : any) {
    commit('setFiatPrice', data)
  },
  upateIndexerStatus({ commit }: { commit: Commit }, data : any) {
    commit('setIndexerStatus', data)
  },
  setLayoutClass({ commit }: { commit: Commit }, data) {
    commit('setLayoutClass', data)
  },
}

export const  getters = {
  getChainProperties: ({ chainProperties } : any ) => chainProperties,
  getChainProperties58Format: ({ chainProperties } : any ) => chainProperties.ss58Format,
  getChainPropertiesTokenDecimals: ({ chainProperties } : any ) => chainProperties.tokenDecimals,
  getUserLang: ({ language } : any) => language.userLang || 'en',
  getLangsFlags: ({ language } : any) => language.langsFlags,
  getUserFlag: ({ language } : any) => language.langsFlags.find((lang: {value: string}) => lang.value === language.userLang).flag,
  getCurrentKSMValue: ({ fiatPrice } : any) => fiatPrice['kusama']['usd'],
  getCurrentChain: ({ explorer } : any) => explorer.chain,
  getIndexer: ({ indexer } : any) => indexer,
  getLayoutClass: ({ layoutClass }) => layoutClass,
}

export const plugins = [vuexLocalStorage.plugin, apiPlugin, myPlugin ]
