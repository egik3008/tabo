import React from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter, Route } from 'react-router-dom';
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
    <BrowserRouter>
      <Route path="/" component={DefaultLayout} />
    </BrowserRouter>
  </Provider>
)

export default App
