const ProductRepository = require("../repositories/ProductRepository");
const OrderRepository = require("../repositories/OrderRepository");
const NotificationService = require("./NotificationService");
const OrderValidator = require("./OrderValidator");
const DiscountCalculator = require("./discounts/DiscountCalculator");
const FreightCalculator = require("./FreightCalculator");
const PaymentProcessor = require("./payments/PaymentProcessor");
const { PixPayment, CreditCardPayment, BoletoPayment } = require("./payments/PaymentMethods");
const {
  VipDiscount,
  EmployeeDiscount,
  Tech10CouponDiscount,
  LargeOrderDiscount
} = require("./discounts/DiscountRules");
const Logger = require("../utils/Logger");
const OrderPresenter = require("./OrderPresenter");

class OrderService {
  constructor() {
    this.productRepository = new ProductRepository();
    this.orderRepository = new OrderRepository();
    this.notificationService = new NotificationService();
    this.validator = new OrderValidator(this.productRepository);
    this.discountCalculator = new DiscountCalculator([
      new VipDiscount(),
      new EmployeeDiscount(),
      new Tech10CouponDiscount(),
      new LargeOrderDiscount()
    ]);
    this.freightCalculator = new FreightCalculator();
    this.paymentProcessor = new PaymentProcessor({
      pix: new PixPayment(),
      credit_card: new CreditCardPayment(),
      boleto: new BoletoPayment()
    });
    this.logger = new Logger();
    this.presenter = new OrderPresenter();
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
