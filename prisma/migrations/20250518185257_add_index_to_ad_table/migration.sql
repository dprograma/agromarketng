-- CreateIndex
CREATE INDEX "Ad_category_idx" ON "Ad"("category");

-- CreateIndex
CREATE INDEX "Ad_location_idx" ON "Ad"("location");

-- CreateIndex
CREATE INDEX "Ad_createdAt_idx" ON "Ad"("createdAt");

-- CreateIndex
CREATE INDEX "Ad_price_idx" ON "Ad"("price");
