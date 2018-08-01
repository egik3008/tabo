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
  loader: () => import('./components/Users/Users'),
  loading: Loading,
})

// https://github.com/ReactTraining/react-router/tree/master/packages/react-router-config
const routes = [
  { path: '/dashboard', name: 'Dashboard', component: Dashboard },
  { path: '/traveler', name: 'Traveler', component: User },
  { path: '/photographer', name: 'Photographer', component: User },
]

export default routes
