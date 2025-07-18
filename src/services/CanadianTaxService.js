/**
 * Canadian Tax Calculation Service
 * Handles HST, GST, and PST calculations by province
 */

const CANADIAN_TAX_RATES = {
  AB: { name: "Alberta", gst: 0.05, pst: 0.0, hst: 0.0 },
  BC: { name: "British Columbia", gst: 0.05, pst: 0.07, hst: 0.0 },
  MB: { name: "Manitoba", gst: 0.05, pst: 0.07, hst: 0.0 },
  NB: { name: "New Brunswick", gst: 0.0, pst: 0.0, hst: 0.15 },
  NL: { name: "Newfoundland and Labrador", gst: 0.0, pst: 0.0, hst: 0.15 },
  NT: { name: "Northwest Territories", gst: 0.05, pst: 0.0, hst: 0.0 },
  NS: { name: "Nova Scotia", gst: 0.0, pst: 0.0, hst: 0.15 },
  NU: { name: "Nunavut", gst: 0.05, pst: 0.0, hst: 0.0 },
  ON: { name: "Ontario", gst: 0.0, pst: 0.0, hst: 0.13 },
  PE: { name: "Prince Edward Island", gst: 0.0, pst: 0.0, hst: 0.15 },
  QC: { name: "Quebec", gst: 0.05, pst: 0.09975, hst: 0.0 },
  SK: { name: "Saskatchewan", gst: 0.05, pst: 0.06, hst: 0.0 },
  YT: { name: "Yukon", gst: 0.05, pst: 0.0, hst: 0.0 },
};

class CanadianTaxService {
  /**
   * Calculate taxes for a given amount and province
   */
  static calculateTaxes(amount, province) {
    const taxRates = CANADIAN_TAX_RATES[province] || CANADIAN_TAX_RATES["ON"];

    const gst = amount * taxRates.gst;
    const pst = amount * taxRates.pst;
    const hst = amount * taxRates.hst;
    const totalTax = gst + pst + hst;

    return {
      subtotal: Math.round(amount * 100) / 100,
      gst: Math.round(gst * 100) / 100,
      pst: Math.round(pst * 100) / 100,
      hst: Math.round(hst * 100) / 100,
      totalTax: Math.round(totalTax * 100) / 100,
      totalAmount: Math.round((amount + totalTax) * 100) / 100,
      province: taxRates.name,
      breakdown: {
        gstRate: `${(taxRates.gst * 100).toFixed(1)}%`,
        pstRate: `${(taxRates.pst * 100).toFixed(1)}%`,
        hstRate: `${(taxRates.hst * 100).toFixed(1)}%`,
      },
    };
  }

  /**
   * Get all supported provinces
   */
  static getSupportedProvinces() {
    return Object.entries(CANADIAN_TAX_RATES).map(([code, info]) => ({
      code,
      name: info.name,
      taxType: info.hst > 0 ? "HST" : "GST + PST",
      totalRate: `${((info.gst + info.pst + info.hst) * 100).toFixed(1)}%`,
    }));
  }

  /**
   * Validate province code
   */
  static isValidProvince(province) {
    return province && CANADIAN_TAX_RATES.hasOwnProperty(province);
  }
}

module.exports = CanadianTaxService;
