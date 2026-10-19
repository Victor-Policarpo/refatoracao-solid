class PixPayment {
  process(order, subtotal) {
    return { status: "approved", fee: 0, discount: subtotal * 0.03 };
  }
}

class CreditCardPayment {
  process(order, subtotal) {
    const fee = order.getInstallments() > 1 ? subtotal * 0.025 : 0;
    return { status: "approved", fee, discount: 0 };
  }
}

class BoletoPayment {
  process(order) {
    return { status: "waiting_payment", fee: 0, discount: 0 };
  }
}

module.exports = {
  PixPayment,
  CreditCardPayment,
  BoletoPayment
};
