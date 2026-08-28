/**
 * Enterprise Protected Global Food & Barcode Catalog Storage
 * Implements:
 * 1. Immutable Base Catalog Anchor (compiled-in zero-loss baseline)
 * 2. Persistent Non-Destructive Storage with Atomic File Writes
 * 3. Anti-Wipe / Anti-Deletion Protection (refuses down-scaling or destructive overwrites)
 * 4. Automated Backup Snapshots & Instant Self-Healing Recovery
 * 5. Weekly Background Auto-Updater (queries Open Food Facts for new and refreshed products)
 */

import fs from 'fs';
import path from 'path';
import { BarcodeProductInfo } from '../types';
import { ISRAELI_SUPERMARKET_CATALOG } from '../data/israeliSupermarketDatabase';
import { COMMON_ISRAELI_BARCODES } from './barcodeService';

const DATA_DIR = path.join(process.cwd(), 'data');
const BACKUPS_DIR = path.join(DATA_DIR, 'backups');
const CATALOG_FILE = path.join(DATA_DIR, 'protected_global_catalog.json');
const METADATA_FILE = path.join(DATA_DIR, 'catalog_metadata.json');

// In-Memory Fast Lookup Cache
let inMemoryCatalog: Record<string, Partial<BarcodeProductInfo>> = {};
let lastSyncTimestamp = 0;
let isSyncInProgress = false;

/**
 * Ensure storage directories exist
 */
function ensureDirectories() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(BACKUPS_DIR)) {
    fs.mkdirSync(BACKUPS_DIR, { recursive: true });
  }
}

/**
 * Recover catalog from the best available backup snapshot if main file is damaged
 */
function recoverFromLatestBackup(): Record<string, Partial<BarcodeProductInfo>> | null {
  try {
    if (!fs.existsSync(BACKUPS_DIR)) return null;
    const backupFiles = fs
      .readdirSync(BACKUPS_DIR)
      .filter((f) => f.startsWith('catalog_backup_') && f.endsWith('.json'))
      .sort()
      .reverse();

    for (const file of backupFiles) {
      const filePath = path.join(BACKUPS_DIR, file);
      try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const parsed = JSON.parse(content);
        if (parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0) {
          console.log(`[ProtectedCatalog] 🛡️ Successfully recovered ${Object.keys(parsed).length} products from backup: ${file}`);
          return parsed;
        }
      } catch (err) {
        console.warn(`[ProtectedCatalog] Backup file ${file} was unreadable:`, err);
      }
    }
  } catch (e) {
    console.error('[ProtectedCatalog] Error during backup recovery scan:', e);
  }
  return null;
}

/**
 * Write a timestamped backup snapshot (keeps the last 10 backups)
 */
function createBackupSnapshot(catalog: Record<string, Partial<BarcodeProductInfo>>) {
  try {
    ensureDirectories();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(BACKUPS_DIR, `catalog_backup_${timestamp}.json`);
    fs.writeFileSync(backupPath, JSON.stringify(catalog, null, 2), 'utf-8');

    // Keep only last 10 backups
    const backupFiles = fs
      .readdirSync(BACKUPS_DIR)
      .filter((f) => f.startsWith('catalog_backup_') && f.endsWith('.json'))
      .sort();

    while (backupFiles.length > 10) {
      const oldest = backupFiles.shift();
      if (oldest) {
        try {
          fs.unlinkSync(path.join(BACKUPS_DIR, oldest));
        } catch {}
      }
    }
  } catch (err) {
    console.warn('[ProtectedCatalog] Failed to write backup snapshot:', err);
  }
}

/**
 * Atomic Safe Write with Anti-Wipe / Anti-Deletion Verification
 */
function persistCatalogSafely(catalog: Record<string, Partial<BarcodeProductInfo>>) {
  try {
    ensureDirectories();
    const newCount = Object.keys(catalog).length;
    const oldCount = Object.keys(inMemoryCatalog).length;

    // Anti-Wipe Rule: Never allow a write that shrinks the database
    if (oldCount > 0 && newCount < oldCount) {
      console.error(
        `[ProtectedCatalog] 🚨 BLOCKED DESTRUCTIVE WRITE ATTEMPT: attempted to write ${newCount} items, but catalog has ${oldCount} items!`
      );
      return;
    }

    const tmpFile = `${CATALOG_FILE}.tmp`;
    const jsonStr = JSON.stringify(catalog, null, 2);

    fs.writeFileSync(tmpFile, jsonStr, 'utf-8');
    fs.renameSync(tmpFile, CATALOG_FILE);

    // Save metadata
    fs.writeFileSync(
      METADATA_FILE,
      JSON.stringify(
        {
          totalProducts: newCount,
          lastUpdated: new Date().toISOString(),
          lastSyncTimestamp,
        },
        null,
        2
      ),
      'utf-8'
    );
  } catch (err) {
    console.error('[ProtectedCatalog] Failed to persist catalog safely:', err);
  }
}

/**
 * Initialize Protected Catalog on Server Startup
 */
export function initProtectedCatalog(): Record<string, Partial<BarcodeProductInfo>> {
  ensureDirectories();

  // 1. Load Hardcoded Compiled Baseline (Immune to deletion)
  const merged: Record<string, Partial<BarcodeProductInfo>> = {
    ...ISRAELI_SUPERMARKET_CATALOG,
    ...COMMON_ISRAELI_BARCODES,
  };

  // 2. Load Persisted Catalog from Disk if present
  let diskCatalog: Record<string, Partial<BarcodeProductInfo>> | null = null;
  if (fs.existsSync(CATALOG_FILE)) {
    try {
      const content = fs.readFileSync(CATALOG_FILE, 'utf-8');
      diskCatalog = JSON.parse(content);
    } catch (err) {
      console.warn('[ProtectedCatalog] Main catalog file corrupted, attempting backup recovery...', err);
    }
  }

  // 3. Fallback to Backup Snapshot if disk file failed
  if (!diskCatalog || Object.keys(diskCatalog).length === 0) {
    diskCatalog = recoverFromLatestBackup();
  }

  // 4. Merge disk items into baseline (Non-destructive merge)
  if (diskCatalog) {
    for (const [code, item] of Object.entries(diskCatalog)) {
      if (item && item.productName) {
        merged[code] = {
          ...merged[code],
          ...item,
        };
      }
    }
  }

  inMemoryCatalog = merged;

  // Read metadata timestamp
  if (fs.existsSync(METADATA_FILE)) {
    try {
      const meta = JSON.parse(fs.readFileSync(METADATA_FILE, 'utf-8'));
      lastSyncTimestamp = meta.lastSyncTimestamp || 0;
    } catch {}
  }

  // Save current unified state and initial backup
  persistCatalogSafely(inMemoryCatalog);
  createBackupSnapshot(inMemoryCatalog);

  console.log(`[ProtectedCatalog] 🛡️ Protected Global Catalog initialized with ${Object.keys(inMemoryCatalog).length} products!`);
  return inMemoryCatalog;
}

/**
 * Look up a product in the protected catalog
 */
export function getProductFromProtectedCatalog(barcode: string): Partial<BarcodeProductInfo> | null {
  const clean = barcode.trim().replace(/[^0-9]/g, '');
  if (!clean) return null;

  return inMemoryCatalog[clean] || inMemoryCatalog['0' + clean] || inMemoryCatalog[clean.replace(/^0+/, '')] || null;
}

/**
 * Save / Upsert a product into the protected catalog permanently
 */
export function saveProductToProtectedCatalog(product: Partial<BarcodeProductInfo>) {
  const clean = (product.barcode || '').trim().replace(/[^0-9]/g, '');
  if (!clean || !product.productName) return;

  const existing = inMemoryCatalog[clean] || {};
  inMemoryCatalog[clean] = {
    ...existing,
    ...product,
    barcode: clean,
  };

  persistCatalogSafely(inMemoryCatalog);
}

/**
 * Get catalog size and health status
 */
export function getCatalogStats() {
  return {
    totalProducts: Object.keys(inMemoryCatalog).length,
    lastSyncTimestamp,
    lastSyncDate: lastSyncTimestamp ? new Date(lastSyncTimestamp).toLocaleString('he-IL') : 'טרם עודכן השבוע',
    isSyncInProgress,
    backupsCount: fs.existsSync(BACKUPS_DIR)
      ? fs.readdirSync(BACKUPS_DIR).filter((f) => f.startsWith('catalog_backup_')).length
      : 0,
  };
}

/**
 * Weekly Automated Sync Worker (Queries Open Food Facts for updates & adds new items)
 */
export async function performWeeklyCatalogSync(): Promise<{ success: boolean; addedCount: number; total: number }> {
  if (isSyncInProgress) {
    return { success: false, addedCount: 0, total: Object.keys(inMemoryCatalog).length };
  }

  isSyncInProgress = true;
  console.log('[ProtectedCatalog] 🔄 Starting Weekly Global & Israeli Catalog Synchronization...');
  let addedCount = 0;

  try {
    // Categories and searches to query from Open Food Facts Israel & World
    const searchQueries = [
      'lactose-free',
      'gluten-free',
      'almond-milk',
      'tuna-in-olive-oil',
      'rice-cakes',
      'tofu',
      'dark-chocolate',
      'hummus',
      'tahini',
      'olive-oil',
    ];

    for (const query of searchQueries) {
      try {
        const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(
          query
        )}&search_simple=1&action=process&json=1&page_size=20`;

        const res = await fetch(url, {
          headers: {
            'User-Agent': 'SiboSafeNirApp/1.0 (https://sibo4nir-1.onrender.com; hagai.hilman@gmail.com)',
            Accept: 'application/json',
          },
        });

        if (res.ok) {
          const data = await res.json();
          if (data && Array.isArray(data.products)) {
            for (const p of data.products) {
              const barcode = (p.code || p.id || '').trim().replace(/[^0-9]/g, '');
              const productName = p.product_name_he || p.product_name || p.product_name_en || '';
              if (barcode && productName && barcode.length >= 8) {
                if (!inMemoryCatalog[barcode]) {
                  addedCount++;
                }
                inMemoryCatalog[barcode] = {
                  ...inMemoryCatalog[barcode],
                  barcode,
                  productName,
                  brand: p.brands || p.brand || inMemoryCatalog[barcode]?.brand || '',
                  ingredientsText:
                    p.ingredients_text_he || p.ingredients_text || p.ingredients_text_en || inMemoryCatalog[barcode]?.ingredientsText || '',
                  allergens: p.allergens_he || p.allergens || p.allergens_en || inMemoryCatalog[barcode]?.allergens || '',
                  categories: p.categories_he || p.categories || p.categories_en || inMemoryCatalog[barcode]?.categories || '',
                  imageUrl: p.image_url || p.image_front_url || inMemoryCatalog[barcode]?.imageUrl || '',
                  found: true,
                };
              }
            }
          }
        }
      } catch (qErr) {
        console.warn(`[ProtectedCatalog] Query "${query}" failed during weekly sync:`, qErr);
      }
    }

    lastSyncTimestamp = Date.now();
    persistCatalogSafely(inMemoryCatalog);
    createBackupSnapshot(inMemoryCatalog);

    console.log(
      `[ProtectedCatalog] ✅ Weekly Sync Complete! Added/Updated ${addedCount} products. Total protected catalog: ${
        Object.keys(inMemoryCatalog).length
      } products.`
    );

    return {
      success: true,
      addedCount,
      total: Object.keys(inMemoryCatalog).length,
    };
  } catch (err) {
    console.error('[ProtectedCatalog] Weekly sync encountered an error:', err);
    return { success: false, addedCount, total: Object.keys(inMemoryCatalog).length };
  } finally {
    isSyncInProgress = false;
  }
}

/**
 * Start Weekly Background Interval Scheduler (Runs every 7 days)
 */
export function startWeeklyCatalogScheduler() {
  const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

  // Run initial weekly sync 15 seconds after server start if never synced or synced > 7 days ago
  const timeSinceLastSync = Date.now() - lastSyncTimestamp;
  if (!lastSyncTimestamp || timeSinceLastSync > ONE_WEEK_MS) {
    setTimeout(() => {
      performWeeklyCatalogSync();
    }, 15000);
  }

  // Set recurring 7-day interval
  setInterval(() => {
    performWeeklyCatalogSync();
  }, ONE_WEEK_MS);

  console.log('[ProtectedCatalog] ⏰ Weekly Catalog Updater scheduled to run every 7 days automatically.');
}
