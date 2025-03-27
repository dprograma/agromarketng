-- Add images array and timestamps to Ad model
ALTER TABLE "Ad" ADD COLUMN "images" TEXT[];
ALTER TABLE "Ad" ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Ad" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Update existing rows to have empty arrays for images
UPDATE "Ad" SET "images" = '{}' WHERE "images" IS NULL;

-- Make images column NOT NULL after setting default values
ALTER TABLE "Ad" ALTER COLUMN "images" SET NOT NULL;
