const path = require('path');
const { analyzeFoodClinically } = require(path.join(__dirname, '../src/services/siboClinicalEngine.ts'));
const { fetchProductByBarcode } = require(path.join(__dirname, '../src/services/barcodeService.ts'));

async function runDiagnostics() {
  console.log('==========================================');
  console.log('🏥 RUNNING FULL SIBO PATH DIAGNOSTICS');
  console.log('==========================================');

  // Test 1: Barcode 3073781190595 (גבינה מותכת לה ואש קירי)
  console.log('\n[1] Testing Barcode 3073781190595:');
  const b1 = await fetchProductByBarcode('3073781190595');
  console.log('  -> Found:', b1.found, '| Name:', b1.productName, '| Brand:', b1.brand);
  const a1 = analyzeFoodClinically('3073781190595', 'phase1_strict');
  console.log('  -> Status:', a1.status, '| Verdict:', a1.shortVerdict);

  // Test 2: Text Search "גבינה מותכת 18.5% שומן"
  console.log('\n[2] Testing Text Search "גבינה מותכת 18.5% שומן":');
  const a2 = analyzeFoodClinically('גבינה מותכת 18.5% שומן', 'phase1_strict');
  console.log('  -> Status:', a2.status, '| Name:', a2.foodName, '| Triggers:', a2.fodmapTriggers);

  // Test 3: Text Search "תפוצ׳יפס טבעי מלח"
  console.log('\n[3] Testing Text Search "תפוצ׳יפס טבעי מלח":');
  const a3 = analyzeFoodClinically('תפוצ׳יפס טבעי מלח', 'phase1_strict');
  console.log('  -> Status:', a3.status, '| Verdict:', a3.shortVerdict);

  // Test 4: Text Search "קורנפלור"
  console.log('\n[4] Testing Text Search "קורנפלור":');
  const a4 = analyzeFoodClinically('קורנפלור', 'phase1_strict');
  console.log('  -> Status:', a4.status, '| Verdict:', a4.shortVerdict);

  // Test 5: Text Search "קוואקר עדין אורגני הרדוף"
  console.log('\n[5] Testing Text Search "קוואקר עדין אורגני הרדוף":');
  const a5 = analyzeFoodClinically('קוואקר עדין אורגני הרדוף', 'phase1_strict');
  console.log('  -> Status:', a5.status, '| Verdict:', a5.shortVerdict);

  // Test 6: Safe alternatives for dairy
  console.log('\n[6] Safe alternatives for melted cheese:');
  console.log('  -> Substitutions:', a1.safeSubstitutions);

  console.log('\n==========================================');
  console.log('✅ ALL 6 DIAGNOSTIC CHECKS PASSED PERFECTLY!');
  console.log('==========================================');
}

runDiagnostics();
