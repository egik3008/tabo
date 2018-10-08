import CASHOUT_CONSTANT from '../constants/cashout';

export const displayMethodCashout = (method) => {
    if (method === CASHOUT_CONSTANT.BANK_METHOD)
        return 'Bank Transfer';
    else 
        return 'Online Money Transfer';
}