const {
  analyzeFields,
  parseArgs,
  redactPath,
  redactValue,
} = require("./firestore-ai-summary");

describe("firestore-ai-summary", () => {
  test("redacts sensitive keys deeply and trims sampled arrays", () => {
    const value = redactValue("profile", {
      email: "user@example.com",
      shippingAddress: "Seoul",
      items: [
        { name: "A", price: 1000 },
        { name: "B", price: 2000 },
        { name: "C", price: 3000 },
        { name: "D", price: 4000 },
      ],
    });

    expect(value).toEqual({
      email: "[REDACTED]",
      shippingAddress: "[REDACTED]",
      items: [
        { name: "[REDACTED]", price: 1000 },
        { name: "[REDACTED]", price: 2000 },
        { name: "[REDACTED]", price: 3000 },
      ],
    });
  });

  test("summarizes field types and sample presence", () => {
    const docs = [
      { data: () => ({ name: "A", price: 1000, tags: ["new"] }) },
      { data: () => ({ name: "B", price: null, active: true }) },
    ];

    expect(analyzeFields(docs)).toEqual({
      active: { existsInSampleDocs: 1, types: ["boolean"] },
      name: { existsInSampleDocs: 2, types: ["string"] },
      price: { existsInSampleDocs: 2, types: ["number", "null"] },
      tags: { existsInSampleDocs: 1, types: ["array"] },
    });
  });

  test("parses output, sample limit, and depth flags", () => {
    expect(parseArgs(["--output=tmp/summary.json", "--sample-limit=2", "--max-depth=1"])).toEqual({
      maxDepth: 1,
      output: "tmp/summary.json",
      sampleLimit: 2,
    });
  });

  test("redacts document id segments in Firestore paths", () => {
    expect(redactPath("users/abc123/wishlist/product-1")).toBe(
      "users/[DOC_ID]/wishlist/[DOC_ID]"
    );
  });
});
