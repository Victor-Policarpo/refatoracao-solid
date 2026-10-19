class NotificationService {
  sendOrderConfirmation(customer, orderId, total) {
    const message = `Pedido ${orderId} confirmado. Notificacao enviada para ${customer.getEmail()} (total R$ ${total.toFixed(2)}).`;
    console.log(`[NOTIFICACAO] ${message}`);
    return message;
  }
}

module.exports = NotificationService;
