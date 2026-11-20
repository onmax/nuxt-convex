---
title: 'VUE_CONVEX_R0007: The upload response did not include a storageId'
description: 'The file was posted, but the response was not Convex storage''s { "storageId": "..." }. upload() returns null and passes this error to onError.'
navigation: false
---

Code: `VUE_CONVEX_R0007`<br>
Level: error<br>
Package: `vue-convex`

## What this error means

The file was posted, but the response was not Convex storage's `{ "storageId": "..." }`. `upload()` returns `null` and passes this error to `onError`.

## Why this happens

- `generateUploadUrl` returns a URL that isn't a Convex storage upload URL.

## How to fix it

Make the `generateUploadUrl` mutation return Convex's upload URL:

```ts [convex/storage.ts]
export const generateUploadUrl = mutation({
  handler: async ctx => await ctx.storage.generateUploadUrl(),
})
```
