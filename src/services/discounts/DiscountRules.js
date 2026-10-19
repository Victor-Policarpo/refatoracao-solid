class VipDiscount {
  calculate(order, subtotal) {
    return order.isCustomerVip() ? subtotal * 0.08 : 0;
  }
}

class EmployeeDiscount {
  calculate(order, subtotal) {
    return order.isCustomerEmployee() ? subtotal * 0.15 : 0;
  }
}

class Tech10CouponDiscount {
  calculate(order, subtotal) {
    return order.hasCoupon("TECH10") ? subtotal * 0.1 : 0;
  }
}

class LargeOrderDiscount {
  calculate(order, subtotal) {
    return subtotal > 8000 ? 250 : 0;
  }
}

module.exports = {
  VipDiscount,
  EmployeeDiscount,
  Tech10CouponDiscount,
  LargeOrderDiscount
};
