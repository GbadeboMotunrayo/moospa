// Price update script — run once with: node update_prices.js
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'data', 'products.js');
let code = fs.readFileSync(filePath, 'utf8');

// Confident prices: { id: [price, originalPrice] }
const PRICES = {
  1:  [10000, null],
  3:  [13000, null],
  4:  [30000, null],
  5:  [15000, null],
  6:  [30000, null],
  7:  [10000, null],
  8:  [15000, null],
  9:  [12000, null],
  10: [10000, null],
  12: [35000, null],
  13: [15000, null],
  14: [20000, null],
  15: [5000,  null],
  16: [20000, null],
  17: [25000, null],
  19: [14000, null],
  20: [15000, null],
  21: [20000, null],
  22: [10000, null],
  24: [40000, null],
  25: [15000, null],
  26: [15000, null],
  27: [12000, null],
  28: [12000, null],
  29: [15000, null],
  31: [30000, null],
  32: [30000, null],
  33: [27000, null],
  35: [10000, null],
  36: [15000, null],
  40: [30000, null],
  41: [30000, null],
  42: [35000, null],
  43: [30000, null],
  47: [35000, null],
  48: [10000, null],
  49: [35000, null],
  50: [10000, null],
  54: [30000, null],
  55: [15000, null],
  57: [15000, null],
  58: [15000, null],
  60: [30000, null],
  61: [15000, null],
  62: [40000, null],
  63: [20000, null],
  64: [15000, null],
  65: [15000, null],
  66: [10000, null],
  67: [10000, null],
  70: [15000, null],
  73: [10000, null],
  74: [30000, null],
};

// Uncertain — mark as restocking
const RESTOCKING = [2, 11, 18, 23, 30, 34, 37, 38, 39, 44, 45, 46, 51, 52, 53, 56, 59, 68, 69, 71, 72];

// Split into individual product blocks
// Each product starts with "  {\n    id: X,"
const blocks = code.split(/(?=  \{\n    id: \d+,)/);

const updated = blocks.map(block => {
  const idMatch = block.match(/id: (\d+),/);
  if (!idMatch) return block;
  const id = parseInt(idMatch[1]);

  if (PRICES[id]) {
    const [price, origPrice] = PRICES[id];
    // Update price
    block = block.replace(/price: \d+,/, `price: ${price},`);
    // Update originalPrice
    const origStr = origPrice === null ? 'originalPrice: null,' : `originalPrice: ${origPrice},`;
    block = block.replace(/originalPrice: (\d+|null),/, origStr);
  }

  if (RESTOCKING.includes(id)) {
    block = block.replace(/inStock: true,/, 'inStock: false,');
    // Set badge to Restocking Soon
    block = block.replace(/badge: (null|'[^']*'|"[^"]*"),/, "badge: 'Restocking Soon',");
  }

  return block;
});

fs.writeFileSync(filePath, updated.join(''), 'utf8');
console.log('✅ Prices updated. Restocking IDs:', RESTOCKING.join(', '));
