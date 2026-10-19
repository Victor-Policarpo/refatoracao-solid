const ProductRepository = require("../repositories/ProductRepository");
const OrderRepository = require("../repositories/OrderRepository");
const NotificationService = require("./NotificationService");
const OrderValidator = require("./OrderValidator");
const Logger = require("../utils/Logger");

class OrderService {
  constructor() {
    this.productRepository = new ProductRepository();
    this.orderRepository = new OrderRepository();
    this.notificationService = new NotificationService();
    this.validator = new OrderValidator(this.productRepository);
    this.logger = new Logger();
  }

  process(order) {
    this.logger.info(`Iniciando processamento do pedido ${order.getId()}.`);

    this.validator.validate(order);

    const subtotal = order.getSubtotal();

    let discount = 0;

    if (order.isCustomerVip()) {
      discount += subtotal * 0.08;
    }

    if (order.isCustomerEmployee()) {
      discount += subtotal * 0.15;
    }

    if (order.hasCoupon("TECH10")) {
      discount += subtotal * 0.1;
    }

    if (order.hasCoupon("FRETEGRATIS")) {
      discount += 0;
    }

    if (subtotal > 8000) {
      discount += 250;
    }

    const totalWeight = order.getTotalWeight();

    let freight = 0;

    if (order.getShippingRegion() === "sudeste") {
      freight = 20 + totalWeight * 4;
    } else if (order.getShippingRegion() === "sul") {
      freight = 28 + totalWeight * 5;
    } else if (order.getShippingRegion() === "centro-oeste") {
      freight = 35 + totalWeight * 6;
    } else if (order.getShippingRegion() === "nordeste") {
      freight = 45 + totalWeight * 7;
    } else if (order.getShippingRegion() === "norte") {
      freight = 60 + totalWeight * 9;
    } else {
      freight = 50 + totalWeight * 8;
    }

    if (order.hasFreeShippingCoupon()) {
      freight = 0;
    }

    let paymentFee = 0;
    let paymentStatus = "pending";

    if (order.getPaymentMethod() === "pix") {
      paymentStatus = "approved";
      discount += subtotal * 0.03;
    } else if (order.getPaymentMethod() === "credit_card") {
      if (order.getInstallments() > 1) {
        paymentFee = subtotal * 0.025;
      }
      paymentStatus = "approved";
    } else if (order.getPaymentMethod() === "boleto") {
      paymentStatus = "waiting_payment";
    } else {
      throw new Error("Forma de pagamento invalida.");
    }

    const total = Number((subtotal - discount + freight + paymentFee).toFixed(2));

    if (total <= 0) {
      throw new Error("Total do pedido invalido.");
    }

    for (const item of order.getItems()) {
      this.productRepository.updateStock(item.getProductId(), item.getQuantity());
    }

    order.setStatus(paymentStatus === "approved" ? "confirmed" : "waiting_payment");

    const orderSummary = {
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

    this.orderRepository.save(orderSummary);

    if (order.getStatus() === "confirmed") {
      this.notificationService.sendOrderConfirmation(order.getCustomer(), order.getId(), total);
    } else {
      this.logger.warn(`Pedido ${order.getId()} aguardando pagamento.`);
    }

    console.log("Resumo do pedido");
    console.log(`Cliente: ${order.getCustomerName()}`);
    console.log(`Cidade: ${order.getCustomerCity()}/${order.getCustomerState()}`);
    console.log(`Itens: ${order.getTotalItems()}`);
    console.log(`Subtotal: R$ ${subtotal.toFixed(2)}`);
    console.log(`Desconto: R$ ${discount.toFixed(2)}`);
    console.log(`Frete: R$ ${freight.toFixed(2)}`);
    console.log(`Taxas: R$ ${paymentFee.toFixed(2)}`);
    console.log(`Total: R$ ${total.toFixed(2)}`);

    return orderSummary;
  }
}

module.exports = OrderService;
