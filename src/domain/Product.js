class Product {
  constructor(id, name, category, price, weight, stock) {
    this.id = id;
    this.name = name;
    this.category = category;
    this.price = price;
    this.weight = weight;
    this.stock = stock;
  }

  getId() {
    return this.id;
  }

  getName() {
    return this.name;
  }

  getPrice() {
    return this.price;
  }

  getWeight() {
    return this.weight;
  }

  getStock() {
    return this.stock;
  }

  hasStockFor(quantity) {
    return this.stock >= quantity;
  }

  decreaseStock(quantity) {
    this.stock -= quantity;
    return this;
  }
}

module.exports = Product;
