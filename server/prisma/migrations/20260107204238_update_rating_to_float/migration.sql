/*
  Warnings:

  - You are about to alter the column `rating` on the `Game` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Float`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Game" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "pcStore" TEXT,
    "status" TEXT NOT NULL,
    "rating" REAL,
    "imageUrl" TEXT,
    "description" TEXT,
    "targetYear" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Game" ("createdAt", "description", "id", "imageUrl", "pcStore", "platform", "rating", "status", "targetYear", "title") SELECT "createdAt", "description", "id", "imageUrl", "pcStore", "platform", "rating", "status", "targetYear", "title" FROM "Game";
DROP TABLE "Game";
ALTER TABLE "new_Game" RENAME TO "Game";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
