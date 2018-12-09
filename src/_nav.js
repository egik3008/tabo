import { USER_TYPE } from './constants/user';
export default {
  items: [
    {
      name: 'Dashboard',
      url: '/dashboard',
      icon: 'fa fa-tachometer fa-fw',
    },
    {
      name: 'Traveler',
      url: '/users/' + USER_TYPE.TRAVELLER,
      icon: 'fa fa-suitcase fa-fw',
    },
    {
      name: 'Photographer',
      url: '/users/' + USER_TYPE.PHOTOGRAPHER,
      icon: 'fa fa-camera fa-fw',
    },
    {
      name: 'Reservation',
      url: '/reservations',
      icon: 'fa fa-address-book fa-fw',
    },
    {
      name: 'Photo Album',
      url: '/photo-album',
      icon: 'fa fa-book fa-fw',
    },
    {
      name: 'Finance',
      url: '/finance',
      icon: 'fa fa-money fa-fw',
      children: [
        {
          name: 'Currency Rates',
          url: '/finance/currency-rates'
        },
        {
          name: 'Cash Out',
          url: '/finance/cashout'
        },
      ] 
    },
    {
      name: 'Coupon Vouchers',
      url: '/vouchers',
      icon: 'fa fa-tasks fa-fw',
      children: [
        {
          name: 'Coupon Manage',
          url: '/vouchers'
        },
        {
          name: 'Coupon Usage',
          url: '/vouchers/usage'
        },
      ] 
    },
    {
      name: 'Management',
      url: '/management',
      icon: 'fa fa-tasks fa-fw',
    },
  ],
}
