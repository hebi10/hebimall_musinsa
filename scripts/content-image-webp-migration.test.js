const {
  buildFieldUpdate,
  collectConfiguredImageUrls,
  getConfiguredTargets,
  parseFirebaseStorageUrl,
} = require("./content-image-webp-migration");

describe("content image WebP migration helpers", () => {
  test("uses configured non-product image targets", () => {
    const targets = getConfiguredTargets();

    expect(targets.map((target) => target.collection)).toEqual([
      "categories",
      "events",
      "reviews",
      "qna",
    ]);
    expect(targets.find((target) => target.collection === "events").fields).toEqual([
      "bannerImage",
      "thumbnailImage",
      "detailImage",
    ]);
  });

  test("collects string and array image URLs from configured fields", () => {
    const urls = collectConfiguredImageUrls(
      {
        imageUrl: "category-image",
        bannerImage: "banner",
        images: ["review-a", "review-b"],
      },
      ["imageUrl", "bannerImage", "images"]
    );

    expect(urls).toEqual(["category-image", "banner", "review-a", "review-b"]);
  });

  test("builds field updates for string and array image fields", () => {
    const update = buildFieldUpdate(
      {
        bannerImage: "old-banner",
        images: ["old-a", "old-b"],
      },
      ["bannerImage", "images"],
      new Map([
        ["old-banner", "new-banner"],
        ["old-b", "new-b"],
      ])
    );

    expect(update).toEqual({
      bannerImage: "new-banner",
      images: ["old-a", "new-b"],
    });
  });

  test("parses Firebase Storage download URLs", () => {
    expect(
      parseFirebaseStorageUrl(
        "https://firebasestorage.googleapis.com/v0/b/hebimall.firebasestorage.app/o/events%2Fbanner%2Fimage.jpg?alt=media&token=abc"
      )
    ).toEqual({
      bucket: "hebimall.firebasestorage.app",
      path: "events/banner/image.jpg",
    });
  });
});
