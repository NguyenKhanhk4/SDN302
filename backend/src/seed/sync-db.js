/**
 * sync-db.js — Đồng bộ dữ liệu 2 chiều giữa MongoDB Atlas và Local
 *
 * Cách dùng:
 *   node src/seed/sync-db.js atlas-to-local   ← Trước khi đến trường (kéo Atlas → Local)
 *   node src/seed/sync-db.js local-to-atlas   ← Sau khi về nhà (đẩy Local → Atlas)
 *
 * Hoặc qua npm scripts:
 *   npm run sync:to-local    ← Trước khi đến trường
 *   npm run sync:to-atlas    ← Sau khi về nhà
 *
 * ⚠️  Script này THAY THẾ TOÀN BỘ dữ liệu ở đích bằng dữ liệu từ nguồn.
 *     Không merge — không giữ lại document cũ ở đích nếu không có ở nguồn.
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const { MongoClient } = require('mongoose').mongo;

// ── Config ──────────────────────────────────────────────────────────────────

const ATLAS_URI = process.env.MONGO_URI_ATLAS;
const LOCAL_URI = process.env.MONGO_URI_LOCAL || 'mongodb://localhost:27017/sdn302_db';
const TIMEOUT_MS = 8000;

// Tên collection KHÔNG đồng bộ (ví dụ: log tạm, cache...)
const SKIP_COLLECTIONS = [];

// ── Helpers ──────────────────────────────────────────────────────────────────

const DIVIDER = '═'.repeat(50);

function log(msg) {
  console.log(msg);
}

/**
 * Kết nối đến một MongoDB URI với timeout.
 * @param {string} uri
 * @param {string} label  - tên hiển thị trong log
 * @returns {Promise<MongoClient>}
 */
async function connect(uri, label) {
  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: TIMEOUT_MS,
    connectTimeoutMS: TIMEOUT_MS,
  });
  log(`  → Đang kết nối ${label}...`);
  await client.connect();
  log(`  ✓ Kết nối ${label} thành công`);
  return client;
}

/**
 * Lấy tên database từ URI (phần cuối trước dấu ?)
 * Fallback về 'sdn302_db' nếu không parse được.
 */
function getDbName(uri) {
  try {
    const withoutQuery = uri.split('?')[0];
    const parts = withoutQuery.split('/');
    const name = parts[parts.length - 1];
    return name && name.length > 0 ? name : 'sdn302_db';
  } catch {
    return 'sdn302_db';
  }
}

// ── Core Sync ────────────────────────────────────────────────────────────────

/**
 * Đồng bộ toàn bộ dữ liệu từ sourceClient → targetClient.
 * Với mỗi collection: xóa sạch target rồi insert toàn bộ document từ source.
 */
async function syncData(sourceClient, sourceDbName, targetClient, targetDbName) {
  const sourceDb = sourceClient.db(sourceDbName);
  const targetDb = targetClient.db(targetDbName);

  // Lấy danh sách collection từ source (loại bỏ collection hệ thống)
  const collections = (await sourceDb.listCollections().toArray())
    .map((c) => c.name)
    .filter((name) => !name.startsWith('system.') && !SKIP_COLLECTIONS.includes(name));

  log(`\n  📋 Tìm thấy ${collections.length} collection: ${collections.join(', ')}`);
  log('');

  let totalDocs = 0;
  let errors = 0;

  for (const collName of collections) {
    try {
      const sourceColl = sourceDb.collection(collName);
      const targetColl = targetDb.collection(collName);

      // Đọc toàn bộ document từ source
      const docs = await sourceColl.find({}).toArray();

      // Xóa sạch collection ở target
      await targetColl.deleteMany({});

      // Chèn lại toàn bộ từ source (nếu có document)
      if (docs.length > 0) {
        await targetColl.insertMany(docs, { ordered: false });
      }

      log(`  [✓] ${collName.padEnd(25)} ${docs.length} documents`);
      totalDocs += docs.length;
    } catch (err) {
      log(`  [✗] ${collName.padEnd(25)} LỖI: ${err.message}`);
      errors++;
    }
  }

  return { totalDocs, errors, collCount: collections.length };
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const direction = process.argv[2];

  if (!['atlas-to-local', 'local-to-atlas'].includes(direction)) {
    log('');
    log('❌ Thiếu hoặc sai tham số. Cách dùng:');
    log('');
    log('   node src/seed/sync-db.js atlas-to-local');
    log('   node src/seed/sync-db.js local-to-atlas');
    log('');
    log('   npm run sync:to-local   (trước khi đến trường)');
    log('   npm run sync:to-atlas   (sau khi về nhà)');
    log('');
    process.exit(1);
  }

  // Kiểm tra URI có được cấu hình không
  if (!ATLAS_URI) {
    log('❌ MONGO_URI_ATLAS chưa được đặt trong .env');
    process.exit(1);
  }

  const isAtlasToLocal = direction === 'atlas-to-local';

  const sourceLabel = isAtlasToLocal ? 'Atlas (nguồn)' : 'Local (nguồn)';
  const targetLabel = isAtlasToLocal ? 'Local (đích)' : 'Atlas (đích)';
  const sourceUri = isAtlasToLocal ? ATLAS_URI : LOCAL_URI;
  const targetUri = isAtlasToLocal ? LOCAL_URI : ATLAS_URI;

  log('');
  log(DIVIDER);

  if (isAtlasToLocal) {
    log('  🔽  ĐỒNG BỘ: Atlas  →  Local');
    log('  (Chạy script này TRƯỚC KHI ĐẾN TRƯỜNG)');
  } else {
    log('  🔼  ĐỒNG BỘ: Local  →  Atlas');
    log('  (Chạy script này SAU KHI VỀ NHÀ)');
  }

  log(DIVIDER);
  log('');
  log('  Bước 1 — Kết nối databases');

  let sourceClient, targetClient;

  try {
    sourceClient = await connect(sourceUri, sourceLabel);
  } catch (err) {
    log(`  ✗ Không kết nối được ${sourceLabel}: ${err.message}`);
    log('');
    log('  ❌ Đồng bộ thất bại — không đọc được nguồn.');
    log(DIVIDER);
    process.exit(1);
  }

  try {
    targetClient = await connect(targetUri, targetLabel);
  } catch (err) {
    log(`  ✗ Không kết nối được ${targetLabel}: ${err.message}`);
    await sourceClient.close();
    log('');
    log('  ❌ Đồng bộ thất bại — không ghi được đích.');
    log(DIVIDER);
    process.exit(1);
  }

  log('');
  log('  Bước 2 — Đồng bộ dữ liệu');

  const sourceDbName = getDbName(sourceUri);
  const targetDbName = getDbName(targetUri);

  let result;
  try {
    result = await syncData(sourceClient, sourceDbName, targetClient, targetDbName);
  } catch (err) {
    log(`\n  ❌ Lỗi trong quá trình đồng bộ: ${err.message}`);
    await sourceClient.close();
    await targetClient.close();
    process.exit(1);
  }

  await sourceClient.close();
  await targetClient.close();

  log('');
  log(DIVIDER);

  if (result.errors === 0) {
    log(`  ✅ Đồng bộ hoàn tất!`);
  } else {
    log(`  ⚠️  Đồng bộ hoàn tất nhưng có ${result.errors} collection bị lỗi.`);
  }

  log(`     ${result.collCount} collections | ${result.totalDocs} documents`);
  log('');

  if (isAtlasToLocal) {
    log('  💡 Local đã sẵn sàng — bạn có thể đến trường và làm việc.');
    log('  💡 Sau khi về nhà, chạy: npm run sync:to-atlas');
  } else {
    log('  💡 Atlas đã được cập nhật — các thành viên khác có thể pull mới nhất.');
    log('  💡 Trước khi đến trường, chạy: npm run sync:to-local');
  }

  log(DIVIDER);
  log('');
  process.exit(0);
}

main().catch((err) => {
  console.error('Lỗi không xác định:', err);
  process.exit(1);
});
