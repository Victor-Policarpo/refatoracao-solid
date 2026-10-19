class OrderService {
  constructor({
    productRepository,
    orderRepository,
    notificationService,
    validator,
    discountCalculator,
    freightCalculator,
    paymentProcessor,
    logger,
    presenter
  }) {
    this.productRepository = productRepository;
    this.orderRepository = orderRepository;
    this.notificationService = notificationService;
    this.validator = validator;
    this.discountCalculator = discountCalculator;
    this.freightCalculator = freightCalculator;
    this.paymentProcessor = paymentProcessor;
    this.logger = logger;
    this.presenter = presenter;
  }

  process(order) {
    this.logger.info(`Iniciando processamento do pedido ${order.getId()}.`);

    this.validator.validate(order);

    const subtotal = order.getSubtotal();

    let discount = this.discountCalculator.calculate(order, subtotal);

    const freight = this.freightCalculator.calculate(order);

    const payment = this.paymentProcessor.process(order, subtotal);

    discount += payment.discount;
    const paymentFee = payment.fee;
    const total = Number((subtotal - discount + freight + paymentFee).toFixed(2));

    if (total <= 0) {
      throw new Error("Total do pedido invalido.");
    }

    for (const item of order.getItems()) {
      this.productRepository.updateStock(item.getProductId(), item.getQuantity());
    }

    order.setStatus(payment.status === "approved" ? "confirmed" : "waiting_payment");

    const orderSummary = this.buildSummary(order, { subtotal, discount, freight, paymentFee, total });

    this.orderRepository.save(orderSummary);

    if (order.getStatus() === "confirmed") {
      this.notificationService.sendOrderConfirmation(order.getCustomer(), order.getId(), total);
    } else {
      this.logger.warn(`Pedido ${order.getId()} aguardando pagamento.`);
    }

    this.presenter.print(orderSummary);

    return orderSummary;
  }

  buildSummary(order, { subtotal, discount, freight, paymentFee, total }) {
    return {
      id: order.getId(),
      customerName: order.getCustomerName(),
      customerEmail: order.getCustomerEmail(),
      city: order.getCustomerCity(),
      state: order.getCustomerState(),
      items: order.getItems().map((item) => ({
        productId: item.getProductId(),
        name: item.getProductName(),
        quantity: item.getQuantity(),
        subtotal: item.getSubtotal()
      })),
      subtotal,
      discount: Number(discount.toFixed(2)),
      freight: Number(freight.toFixed(2)),
      paymentFee: Number(paymentFee.toFixed(2)),
      total,
      paymentMethod: order.getPaymentMethod(),
      status: order.getStatus(),
      createdAt: order.getCreatedAt()
    };
  }
}

module.exports = OrderService;
