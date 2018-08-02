import React from 'react'
import Loadable from 'react-loadable'

function Loading() {
  return <div>Loading...</div>
}

const Dashboard = Loadable({
  loader: () => import('./components/Dashboard'),
  loading: Loading,
})

const User = Loadable({
  loader: () => import('./components/Users'),
  loading: Loading,
})

// https://github.com/ReactTraining/react-router/tree/master/packages/react-router-config
const routes = [
  { path: '/dashboard', name: 'Dashboard', component: Dashboard },
  { path: '/user/:type', name: 'User', component: User },
]

export default routes
