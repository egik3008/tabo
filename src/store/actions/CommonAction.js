import { Database } from '../../services';
import ACTION_TYPE from "../actionTypes";


export const fetchCountries = () => {
  return (dispatch, getState) => {
    const { commons: { countries } } = getState();

    const isFethced = Object.keys(countries).length > 0;
  

    if (isFethced) {
      return Promise.resolve();
    }

    const db = Database.database();
    const countriesRef = db.ref('/countries');

    return countriesRef.once('value')
      .then(snapshot => {
        return snapshot.val();
      })
      .then(value => {
        return dispatch({
          type: ACTION_TYPE.FETCH_COUNTRIES,
          payload: value
        });
      })
    }
}

export const fetchCurrenciesRates = () => {
  return (dispatch, getState) => {
    const { commons: { currencies } } = getState();

    if (currencies.length > 0) {
      return Promise.resolve();
    }

    const db = Database.database();
    const ratesRef = db.ref('/currency_exchange_rates');

    return ratesRef.once('value')
      .then(snapshot => {
        return snapshot.val()
      })
      .then(value => {
        return dispatch({
          type: ACTION_TYPE.FETCH_CURRENCIES_RATES,
          payload: value
        });
      });
  };
}