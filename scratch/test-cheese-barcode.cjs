const path = require('path');
const { analyzeFoodClinically } = require(path.join(__dirname, '../src/services/siboClinicalEngine.ts'));
const { fetchProductByBarcode } = require(path.join(__dirname, '../src/services/barcodeService.ts'));

async function testBarcode() {
  console.log('--- Testing Barcode 3073781190595 ---');
  const prod = await fetchProductByBarcode('3073781190595');
  console.log('Product Found:', prod.found, prod.productName, prod.brand);

  const res1 = analyzeFoodClinically('3073781190595', 'phase1_strict');
  console.log('Clinical Analysis (Barcode):', res1.status, '|', res1.foodName, '|', res1.shortVerdict);

  const res2 = analyzeFoodClinically('גבינה מותכת 18.5% שומן', 'phase1_strict');
  console.log('Clinical Analysis (Name):', res2.status, '|', res2.foodName, '|', res2.shortVerdict);
}

testBarcode();
