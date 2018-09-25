import ACTION_TYPE from '../actionTypes';

const STATE_DEFAULT = {
    countries: {},
    currenciesRates: []
}

export default (state = STATE_DEFAULT, action) => {
    switch(action.type) {
        case ACTION_TYPE.FETCH_COUNTRIES:
            return {
                ...state,
                countries: action.payload
            }
        case ACTION_TYPE.FETCH_CURRENCIES_RATES:
            return {
                ...state,
                currenciesRates: action.payload
            };
        default: return state;
    }
}