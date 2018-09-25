const TYPE = {
  countries: "countries",
  currencies: "currencies"
}

export const selectCountries = (countriesSource, type = null) => {
  let countriesList = [];
  let currenciesObjects = {};

  for (let key in countriesSource) {
    const countryCode = countriesSource[key]['iso3166alpha2'];
    countriesList.push({
      value: countryCode,
      label: countriesSource[key].name,
      continent: countriesSource[key].continent,
      phoneDialCode: countriesSource[key].phone_dial_code
    });

    currenciesObjects[countryCode] = countriesSource[key].currency_code;
  }

  if (!type) return { countries: countriesList, currencies: currenciesObjects }
  else if (type === TYPE.countries) return countriesList;
  else if (type === TYPE.currencies) return currenciesObjects;
}

export const selectOnlyCountries = (countriesSource) => {
  return selectCountries(countriesSource, TYPE.countries);
}

export const selectOnlyCurrencies = (countriesSource) => {
  return selectCountries(countriesSource, TYPE.currencies);
}