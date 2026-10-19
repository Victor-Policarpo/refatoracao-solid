class OrderItem {
  constructor(product, quantity) {
    this.product = product;
    this.quantity = quantity;
  }

  getProduct() {
    return this.product;
  }

  getQuantity() {
    return this.quantity;
  }

  getProductId() {
    return this.product.getId();
  }

  getProductName() {
    return this.product.getName();
  }

  getSubtotal() {
    return this.product.getPrice() * this.quantity;
  }

  getWeight() {
    return this.product.getWeight() * this.quantity;
  }
}

module.exports = OrderItem;
