const fs = require("fs/promises");
const path = require("path");

const DEFAULT_OPTIONS = {
  output: "firestore-ai-summary.json",
  sampleLimit: 5,
  maxDepth: 2,
};

const SENSITIVE_KEYS = [
  "name",
  "username",
  "phone",
  "mobile",
  "tel",
  "email",
  "address",
  "addr",
  "password",
  "token",
  "accessToken",
  "refreshToken",
  "uid",
  "userId",
];

function parseArgs(argv) {
  const options = { ...DEFAULT_OPTIONS };

  for (const flag of argv) {
    if (!flag.startsWith("--")) {
      continue;
    }

    const [key, rawValue] = flag.slice(2).split("=");
    const value = rawValue === undefined ? true : rawValue;

    switch (key) {
      case "output":
        options.output = String(value);
        break;
      case "sample-limit":
        options.sampleLimit = Number(value) || DEFAULT_OPTIONS.sampleLimit;
        break;
      case "max-depth":
        options.maxDepth = Number(value) || DEFAULT_OPTIONS.maxDepth;
        break;
      default:
        break;
    }
  }

  return options;
}

function isSensitiveKey(key) {
  const lowerKey = key.toLowerCase();
  return SENSITIVE_KEYS.some((sensitive) => lowerKey.includes(sensitive.toLowerCase()));
}

function isTimestamp(value) {
  return value && typeof value.toDate === "function" && value.constructor?.name === "Timestamp";
}

function isGeoPoint(value) {
  return value && typeof value.latitude === "number" && typeof value.longitude === "number";
}

function getValueType(value) {
  if (value === null) {
    return "null";
  }

  if (Array.isArray(value)) {
    return "array";
  }

  if (isTimestamp(value)) {
    return "timestamp";
  }

  if (isGeoPoint(value)) {
    return "geopoint";
  }

  if (value instanceof Date) {
    return "date";
  }

  if (Buffer.isBuffer(value)) {
    return "buffer";
  }

  if (value && typeof value === "object") {
    return "object";
  }

  return typeof value;
}

function redactPath(firestorePath) {
  return firestorePath
    .split("/")
    .map((segment, index) => (index % 2 === 1 ? "[DOC_ID]" : segment))
    .join("/");
}

function redactValue(key, value) {
  if (isSensitiveKey(key)) {
    return "[REDACTED]";
  }

  if (isTimestamp(value)) {
    return "[Timestamp]";
  }

  if (isGeoPoint(value)) {
    return "[GeoPoint]";
  }

  if (value instanceof Date) {
    return "[Date]";
  }

  if (Buffer.isBuffer(value)) {
    return "[Buffer]";
  }

  if (value && typeof value.path === "string" && value.constructor?.name === "DocumentReference") {
    return "[DocumentReference]";
  }

  if (Array.isArray(value)) {
    return value.slice(0, 3).map((item) => redactValue(key, item));
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([childKey, childValue]) => [
        childKey,
        redactValue(childKey, childValue),
      ])
    );
  }

  return value;
}

function analyzeFields(docs) {
  const fieldMap = {};

  docs.forEach((doc) => {
    Object.entries(doc.data()).forEach(([key, value]) => {
      if (!fieldMap[key]) {
        fieldMap[key] = {
          types: new Set(),
          count: 0,
        };
      }

      fieldMap[key].types.add(getValueType(value));
      fieldMap[key].count += 1;
    });
  });

  return Object.fromEntries(
    Object.entries(fieldMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => [
        key,
        {
          existsInSampleDocs: value.count,
          types: Array.from(value.types),
        },
      ])
  );
}

async function summarizeCollection(collectionRef, options, depth = 0) {
  const countSnapshot = await collectionRef.count().get();
  const sampleSnapshot = await collectionRef.limit(options.sampleLimit).get();
  const sampleDocs = sampleSnapshot.docs.map((doc) => ({
    id: "[DOC_ID]",
    path: redactPath(doc.ref.path),
    data: Object.fromEntries(
      Object.entries(doc.data()).map(([key, value]) => [key, redactValue(key, value)])
    ),
  }));

  const summary = {
    path: redactPath(collectionRef.path),
    totalDocs: countSnapshot.data().count,
    fields: analyzeFields(sampleSnapshot.docs),
    sampleDocs,
  };

  if (depth >= options.maxDepth) {
    return summary;
  }

  const subcollections = [];
  for (const doc of sampleSnapshot.docs) {
    const refs = await doc.ref.listCollections();
    for (const subcollectionRef of refs) {
      console.log(`Exporting summary: ${subcollectionRef.path}`);
      subcollections.push(await summarizeCollection(subcollectionRef, options, depth + 1));
    }
  }

  if (subcollections.length > 0) {
    summary.sampleDocSubcollections = subcollections;
  }

  return summary;
}

async function createSummary(db, projectId, options) {
  const rootCollections = await db.listCollections();
  const collections = [];

  for (const collectionRef of rootCollections) {
    console.log(`Exporting summary: ${collectionRef.path}`);
    collections.push(await summarizeCollection(collectionRef, options));
  }

  return {
    projectId,
    exportedAt: new Date().toISOString(),
    note: "AI 분석용 Firestore 구조 요약입니다. 개인정보로 추정되는 값은 REDACTED 처리했습니다.",
    sampleLimit: options.sampleLimit,
    maxDepth: options.maxDepth,
    collections,
  };
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const { db, projectId } = require("./util-firestore-admin");
  const result = await createSummary(db, projectId, options);
  const outputPath = path.resolve(process.cwd(), options.output);

  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, JSON.stringify(result, null, 2), "utf-8");

  console.log(`완료: ${outputPath}`);
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

module.exports = {
  analyzeFields,
  createSummary,
  parseArgs,
  redactPath,
  redactValue,
};
