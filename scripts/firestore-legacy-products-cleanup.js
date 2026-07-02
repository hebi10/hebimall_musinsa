const fs = require("fs/promises");
const path = require("path");

const DEFAULT_OPTIONS = {
  output: "",
  backup: "",
};

function parseArgs(argv) {
  const [command = "dry-run", ...flags] = argv;
  const options = { ...DEFAULT_OPTIONS };

  flags.forEach((flag) => {
    if (!flag.startsWith("--")) {
      return;
    }

    const [key, rawValue] = flag.slice(2).split("=");
    const value = rawValue === undefined ? true : rawValue;

    if (key === "output") {
      options.output = String(value);
    }

    if (key === "backup") {
      options.backup = String(value);
    }
  });

  return { command, options };
}

function encodeFirestoreValue(value) {
  if (value === null || value === undefined) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map(encodeFirestoreValue);
  }

  if (value && typeof value.toDate === "function" && value.constructor?.name === "Timestamp") {
    return {
      __type: "timestamp",
      seconds: value.seconds,
      nanoseconds: value.nanoseconds,
    };
  }

  if (value && typeof value.latitude === "number" && typeof value.longitude === "number") {
    return {
      __type: "geopoint",
      latitude: value.latitude,
      longitude: value.longitude,
    };
  }

  if (value instanceof Date) {
    return {
      __type: "date",
      iso: value.toISOString(),
    };
  }

  if (Buffer.isBuffer(value)) {
    return {
      __type: "buffer",
      base64: value.toString("base64"),
    };
  }

  if (value && typeof value.path === "string" && value.constructor?.name === "DocumentReference") {
    return {
      __type: "reference",
      path: value.path,
    };
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, childValue]) => [key, encodeFirestoreValue(childValue)])
    );
  }

  return value;
}

async function collectLegacyProducts(db) {
  const categoriesSnapshot = await db.collection("categories").get();
  const products = [];

  for (const categoryDoc of categoriesSnapshot.docs) {
    const productsSnapshot = await categoryDoc.ref.collection("products").get();

    productsSnapshot.docs.forEach((productDoc) => {
      products.push({
        path: productDoc.ref.path,
        categoryId: categoryDoc.id,
        productId: productDoc.id,
        data: productDoc.data(),
        ref: productDoc.ref,
      });
    });
  }

  return products.sort((left, right) => left.path.localeCompare(right.path));
}

function toBackupDocument(product) {
  return {
    path: product.path,
    categoryId: product.categoryId,
    productId: product.productId,
    data: encodeFirestoreValue(product.data),
  };
}

function backupMatchesProducts(backup, products) {
  const backupPaths = (backup.documents || []).map((doc) => doc.path).sort();
  const productPaths = products.map((product) => product.path).sort();

  return (
    backupPaths.length === productPaths.length &&
    backupPaths.every((backupPath, index) => backupPath === productPaths[index])
  );
}

async function writeBackup(db, projectId, options) {
  const products = await collectLegacyProducts(db);
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const outputPath = path.resolve(
    process.cwd(),
    options.output || `tmp/legacy-products-backup-${timestamp}.json`
  );
  const backup = {
    projectId,
    createdAt: new Date().toISOString(),
    note: "Backup of legacy categories/{categoryId}/products documents before cleanup.",
    count: products.length,
    documents: products.map(toBackupDocument),
  };

  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, JSON.stringify(backup, null, 2), "utf-8");

  return { outputPath, count: products.length };
}

async function dryRun(db) {
  const products = await collectLegacyProducts(db);
  return {
    count: products.length,
    paths: products.map((product) => product.path),
  };
}

async function executeCleanup(db, backupPath) {
  if (!backupPath) {
    throw new Error("execute requires --backup=<path>");
  }

  const products = await collectLegacyProducts(db);
  const backup = JSON.parse(await fs.readFile(path.resolve(process.cwd(), backupPath), "utf-8"));

  if (!backupMatchesProducts(backup, products)) {
    throw new Error("Backup does not match current legacy product documents. Run backup and dry-run again.");
  }

  const writer = db.bulkWriter();
  products.forEach((product) => {
    writer.delete(product.ref);
  });
  await writer.close();

  return {
    deleted: products.length,
    backup: path.resolve(process.cwd(), backupPath),
  };
}

async function main() {
  const { command, options } = parseArgs(process.argv.slice(2));
  const { db, projectId } = require("./util-firestore-admin");

  switch (command) {
    case "backup":
      console.log(JSON.stringify(await writeBackup(db, projectId, options), null, 2));
      break;
    case "dry-run":
      console.log(JSON.stringify(await dryRun(db), null, 2));
      break;
    case "execute":
      console.log(JSON.stringify(await executeCleanup(db, options.backup), null, 2));
      break;
    default:
      console.log("Usage:");
      console.log("  node scripts/firestore-legacy-products-cleanup.js backup");
      console.log("  node scripts/firestore-legacy-products-cleanup.js dry-run");
      console.log("  node scripts/firestore-legacy-products-cleanup.js execute --backup=tmp/backup.json");
      process.exitCode = 1;
      break;
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

module.exports = {
  backupMatchesProducts,
  collectLegacyProducts,
  encodeFirestoreValue,
  parseArgs,
};
