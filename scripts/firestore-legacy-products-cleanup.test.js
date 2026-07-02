const {
  backupMatchesProducts,
  encodeFirestoreValue,
  parseArgs,
} = require("./firestore-legacy-products-cleanup");

describe("firestore-legacy-products-cleanup", () => {
  test("parses command and backup path", () => {
    expect(parseArgs(["execute", "--backup=tmp/backup.json"])).toEqual({
      command: "execute",
      options: {
        backup: "tmp/backup.json",
        output: "",
      },
    });
  });

  test("encodes Firestore-like timestamp values for JSON backup", () => {
    const value = {
      createdAt: {
        constructor: { name: "Timestamp" },
        seconds: 1,
        nanoseconds: 2,
        toDate: () => new Date("2026-01-01T00:00:00.000Z"),
      },
    };

    expect(encodeFirestoreValue(value)).toEqual({
      createdAt: {
        __type: "timestamp",
        seconds: 1,
        nanoseconds: 2,
      },
    });
  });

  test("requires backup paths to match current legacy product paths", () => {
    expect(
      backupMatchesProducts(
        { documents: [{ path: "categories/a/products/1" }] },
        [{ path: "categories/a/products/1" }]
      )
    ).toBe(true);

    expect(
      backupMatchesProducts(
        { documents: [{ path: "categories/a/products/1" }] },
        [{ path: "categories/a/products/2" }]
      )
    ).toBe(false);
  });
});
