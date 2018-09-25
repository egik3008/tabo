import React from 'react';
import { Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import { History } from './services'
import store from './store';

// Styles
// CoreUI Icons Set
import '@coreui/icons/css/coreui-icons.min.css'
// Import Font Awesome Icons Set
import 'font-awesome/css/font-awesome.min.css'
// Import Main styles for this application
import './scss/style.css'

// Containers
import { DefaultLayout } from './containers'

const App = props => (
  <Provider store={store}>
    <Router history={History}>
      <DefaultLayout />
    </Router>
  </Provider>
)

export default App
