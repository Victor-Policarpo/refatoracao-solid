class OrderValidator {
  constructor(productRepository) {
    this.productRepository = productRepository;
  }

  validate(order) {
    this.validateCustomer(order);
    this.validateItems(order);
  }

  validateCustomer(order) {
    const customer = order.getCustomer();

    if (!customer) {
      throw new Error("Cliente obrigatorio.");
    }

    const email = customer.getEmail();

    if (!email || !email.includes("@")) {
      throw new Error("E-mail do cliente invalido.");
    }
  }

  validateItems(order) {
    const items = order.getItems();

    if (!items || items.length === 0) {
      throw new Error("Pedido sem itens.");
    }

    for (const item of items) {
      this.validateItem(item);
    }
  }

  validateItem(item) {
    if (!item.getProduct()) {
      throw new Error("Item sem produto.");
    }

    if (item.getQuantity() <= 0) {
      throw new Error("Quantidade invalida.");
    }

    const product = this.productRepository.findById(item.getProductId());

    if (!product) {
      throw new Error(`Produto ${item.getProductId()} nao encontrado.`);
    }

    if (!product.hasStockFor(item.getQuantity())) {
      throw new Error(`Estoque insuficiente para ${product.getName()}.`);
    }
  }
}

module.exports = OrderValidator;
