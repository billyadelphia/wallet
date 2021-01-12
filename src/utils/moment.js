import moment from 'moment'

const locale = window.navigator.userLanguage || window.navigator.language
moment.locale(locale)

export default moment
