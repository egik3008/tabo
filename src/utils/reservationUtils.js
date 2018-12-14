import VOUCHER from '../constants/vouchers';

export const countReservationDiscount = (reservation) => {
    let currency = "IDR";
    if (reservation.paymentCurrency) {
        currency = reservation.paymentCurrency;
    }
    let pFee = Number(reservation["photographerFee" + currency]);

    let discount = 0;
    if (reservation.voucher) {
        if (reservation.voucher.type === VOUCHER.TYPE_FIXED) {
            discount = Number(reservation.voucher['amount' + currency]);
            discount = discount > pFee ? pFee : discount;
        } else {
            discount = Math.round((pFee * Number(reservation.voucher.amountIDR) / 100));
            if (reservation.voucher['maxPercentAmount' + currency]) {
                const max = Number(reservation.voucher['maxPercentAmount' + currency]);
                discount = discount > max ? max : discount;
            }
        }
    }

    return discount;
}

export const countReservationDiscountForPhotographer = (reservation) => {
    let pFee = Number(reservation["photographerFee"]);

    let discount = 0;
    if (reservation.voucher) {
        if (reservation.voucher.type === VOUCHER.TYPE_FIXED) {
            discount = Number(reservation.voucher['amount']);
            discount = discount > pFee ? pFee : discount;
        } else {
            discount = Math.round((pFee * Number(reservation.voucher.amount) / 100));
            if (reservation.voucher['maxPercentAmount']) {
                const max = Number(reservation.voucher['maxPercentAmount']);
                discount = discount > max ? max : discount;
            }
        }
    }

    return discount;
}