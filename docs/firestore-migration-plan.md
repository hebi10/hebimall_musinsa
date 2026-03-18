# Firestore Migration Plan

This project currently reads products from `categories/{categoryId}/products/{productId}`.
The target structure is a top-level `products/{productId}` collection while keeping the
legacy documents intact until the application is fully switched over.

## Scope

- Firestore schema migration only
- No Firebase Storage file move
- No legacy data deletion during the migration phase

## Commands

```bash
npm run migrate:firestore:analyze
npm run migrate:firestore:products:dry-run
npm run migrate:firestore:products:execute
npm run migrate:firestore:validate
```

## Safety rules

1. Run a managed Firestore export before any write operation.
2. Run `analyze` first and stop immediately if duplicate product IDs are reported.
3. Do not run `--execute` against production until the dry-run output is reviewed.
4. Keep the old `categories/{categoryId}/products/{productId}` documents unchanged until:
   - the app reads from top-level `products`
   - dual-write has been running cleanly
   - validation has passed
   - a rollback window has elapsed

## What the migration script does

- scans every category subcollection product
- checks whether product IDs are globally unique
- aborts if the destination collection already has documents
- copies each source product to `products/{productId}`
- adds `categoryId`, `legacyPath`, `schemaVersion`, and `migration` metadata
- updates `categories/{categoryId}.productCount`
- normalizes `orders.deliveryAddress -> orders.shippingAddress` when needed
- stores execution metadata in `migrationRuns/{runId}` during real execution

## What the migration script does not do

- it does not delete legacy product documents
- it does not move Firebase Storage files
- it does not switch application code automatically
- it does not harden Firestore or Storage rules automatically

## Application cutover checklist

1. Update product read paths in `src/shared/services/productService.ts`.
2. Update review sync writes in `src/shared/utils/syncProductReviews.ts`.
3. Normalize all order reads to `shippingAddress`.
4. Add dual-read fallback during the first deployment.
5. Add dual-write for product create/update/delete during the transition window.
6. Deploy stricter Firestore/Storage rules only after the admin and migration paths are ready.

## Notes for this repository

- Existing scripts such as `scripts/migrate-products.js` are historical and move data in the
  opposite direction. They should not be reused for this migration.
- Current source code in `src/` is coupled to the nested category product structure, so
  the migration script alone is not enough for cutover.
