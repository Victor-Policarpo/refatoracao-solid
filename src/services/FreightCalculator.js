const REGION_RATES = {
  sudeste: { base: 20, perKg: 4 },
  sul: { base: 28, perKg: 5 },
  "centro-oeste": { base: 35, perKg: 6 },
  nordeste: { base: 45, perKg: 7 },
  norte: { base: 60, perKg: 9 }
};

const DEFAULT_RATE = { base: 50, perKg: 8 };

class FreightCalculator {
  calculate(order) {
    if (order.hasFreeShippingCoupon()) {
      return 0;
    }

    const rate = REGION_RATES[order.getShippingRegion()] || DEFAULT_RATE;

    return rate.base + order.getTotalWeight() * rate.perKg;
  }
}

module.exports = FreightCalculator;
