class Order {
  constructor(id, customer, items, couponCode, paymentMethod, installments) {
    this.id = id;
    this.customer = customer;
    this.items = items;
    this.couponCode = couponCode;
    this.paymentMethod = paymentMethod;
    this.installments = installments;
    this.status = "created";
    this.createdAt = new Date();
  }

  getId() {
    return this.id;
  }

  getCustomer() {
    return this.customer;
  }

  getItems() {
    return this.items;
  }

  getCouponCode() {
    return this.couponCode;
  }

  hasCoupon(couponCode) {
    return this.couponCode === couponCode;
  }

  hasFreeShippingCoupon() {
    return this.hasCoupon("FRETEGRATIS");
  }

  getPaymentMethod() {
    return this.paymentMethod;
  }

  getInstallments() {
    return this.installments;
  }

  getStatus() {
    return this.status;
  }

  setStatus(status) {
    this.status = status;
  }

  getCreatedAt() {
    return this.createdAt;
  }

  getCustomerName() {
    return this.customer.getName();
  }

  getCustomerEmail() {
    return this.customer.getEmail();
  }

  getCustomerCity() {
    return this.customer.getCity();
  }

  getCustomerState() {
    return this.customer.getState();
  }

  getShippingRegion() {
    return this.customer.getRegion();
  }

  isCustomerVip() {
    return this.customer.isVip();
  }

  isCustomerEmployee() {
    return this.customer.isEmployee();
  }

  getTotalItems() {
    return this.items.reduce((total, item) => total + item.getQuantity(), 0);
  }

  getSubtotal() {
    return this.items.reduce((total, item) => total + item.getSubtotal(), 0);
  }

  getTotalWeight() {
    return this.items.reduce((total, item) => total + item.getWeight(), 0);
  }
}

module.exports = Order;
