const Address = require("./domain/Address");
const Customer = require("./domain/Customer");
const Order = require("./domain/Order");
const OrderItem = require("./domain/OrderItem");
const OrderService = require("./services/OrderService");
const OrderValidator = require("./services/OrderValidator");
const OrderPresenter = require("./services/OrderPresenter");
const NotificationService = require("./services/NotificationService");
const FreightCalculator = require("./services/FreightCalculator");
const DiscountCalculator = require("./services/discounts/DiscountCalculator");
const {
  VipDiscount,
  EmployeeDiscount,
  Tech10CouponDiscount,
  LargeOrderDiscount
} = require("./services/discounts/DiscountRules");
const PaymentProcessor = require("./services/payments/PaymentProcessor");
const { PixPayment, CreditCardPayment, BoletoPayment } = require("./services/payments/PaymentMethods");
const ProductRepository = require("./repositories/ProductRepository");
const OrderRepository = require("./repositories/OrderRepository");
const Logger = require("./utils/Logger");

// Composition root: all dependencies are created here and injected into the service.
const productRepository = new ProductRepository();
const orderRepository = new OrderRepository();
const logger = new Logger();

const service = new OrderService({
  productRepository,
  orderRepository,
  logger,
  notificationService: new NotificationService(),
  validator: new OrderValidator(productRepository),
  discountCalculator: new DiscountCalculator([
    new VipDiscount(),
    new EmployeeDiscount(),
    new Tech10CouponDiscount(),
    new LargeOrderDiscount()
  ]),
  freightCalculator: new FreightCalculator(),
  paymentProcessor: new PaymentProcessor({
    pix: new PixPayment(),
    credit_card: new CreditCardPayment(),
    boleto: new BoletoPayment()
  }),
  presenter: new OrderPresenter()
});

const customer = new Customer(
  "c1",
  "Ana Souza",
  "ana.souza@example.com",
  "18999990000",
  "vip",
  new Address("Rua das Palmeiras", "120", "Presidente Prudente", "SP", "19000-000", "sudeste")
);

const notebook = productRepository.findById("p1");
const mouse = productRepository.findById("p2");

const order = new Order(
  "o1001",
  customer,
  [new OrderItem(notebook, 1), new OrderItem(mouse, 2)],
  "TECH10",
  "credit_card",
  3
);

const result = service.process(order);

console.log(JSON.stringify(result, null, 2));
