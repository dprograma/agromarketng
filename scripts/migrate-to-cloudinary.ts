/**
 * Migration script: Upload local /public/uploads/ images to Cloudinary
 * and update database records with new URLs.
 *
 * Usage: npx ts-node --compiler-options '{"module":"commonjs"}' scripts/migrate-to-cloudinary.ts
 *
 * Requires CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET in .env
 */

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { v2 as cloudinary } from 'cloudinary';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

const prisma = new PrismaClient();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function uploadLocalFile(localPath: string, folder: string): Promise<string | null> {
  try {
    const fullPath = join(process.cwd(), 'public', localPath);

    if (!existsSync(fullPath)) {
      console.warn(`  File not found: ${fullPath}`);
      return null;
    }

    const buffer = await readFile(fullPath);

    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: `agromarket/${folder}`,
          resource_type: 'image',
          transformation: [
            { quality: 'auto', fetch_format: 'auto' },
            { width: 1200, crop: 'limit' },
          ],
        },
        (error, result) => {
          if (error || !result) {
            reject(error || new Error('No result'));
            return;
          }
          resolve(result.secure_url);
        }
      );
      stream.end(buffer);
    });
  } catch (error) {
    console.error(`  Failed to upload ${localPath}:`, error);
    return null;
  }
}

async function migrateAdImages() {
  console.log('\n=== Migrating Ad Images ===\n');

  const ads = await prisma.ad.findMany({
    select: { id: true, title: true, images: true },
  });

  let migratedAds = 0;
  let skippedAds = 0;
  let failedImages = 0;
  let totalImages = 0;

  for (const ad of ads) {
    const localImages = ad.images.filter(img => img.startsWith('/uploads/'));
    if (localImages.length === 0) {
      skippedAds++;
      continue;
    }

    console.log(`Ad "${ad.title}" (${ad.id}): ${localImages.length} local image(s)`);

    const newImages: string[] = [];
    let hasFailure = false;

    for (const img of ad.images) {
      totalImages++;

      if (!img.startsWith('/uploads/')) {
        newImages.push(img); // Already a Cloudinary URL
        continue;
      }

      const cloudinaryUrl = await uploadLocalFile(img, 'ads');
      if (cloudinaryUrl) {
        newImages.push(cloudinaryUrl);
        console.log(`  OK: ${img} -> ${cloudinaryUrl}`);
      } else {
        newImages.push(img); // Keep old URL on failure
        hasFailure = true;
        failedImages++;
        console.log(`  FAIL: ${img}`);
      }
    }

    await prisma.ad.update({
      where: { id: ad.id },
      data: { images: newImages },
    });

    if (!hasFailure) migratedAds++;
  }

  console.log(`\nAd results: ${migratedAds} fully migrated, ${skippedAds} skipped (already done), ${failedImages}/${totalImages} images failed`);
}

async function migrateProfileImages() {
  console.log('\n=== Migrating Profile Images ===\n');

  const users = await prisma.user.findMany({
    where: {
      image: { startsWith: '/uploads/' },
    },
    select: { id: true, name: true, image: true },
  });

  if (users.length === 0) {
    console.log('No profile images to migrate.');
    return;
  }

  let migrated = 0;
  let failed = 0;

  for (const user of users) {
    if (!user.image) continue;

    console.log(`User "${user.name}" (${user.id}): ${user.image}`);

    const cloudinaryUrl = await uploadLocalFile(user.image, 'profiles');
    if (cloudinaryUrl) {
      await prisma.user.update({
        where: { id: user.id },
        data: { image: cloudinaryUrl },
      });
      console.log(`  OK: -> ${cloudinaryUrl}`);
      migrated++;
    } else {
      console.log(`  FAIL`);
      failed++;
    }
  }

  console.log(`\nProfile results: ${migrated} migrated, ${failed} failed`);
}

async function main() {
  // Verify Cloudinary config
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    console.error('ERROR: Missing Cloudinary environment variables.');
    console.error('Required: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET');
    process.exit(1);
  }

  console.log('Starting Cloudinary migration...');
  console.log(`Cloud name: ${process.env.CLOUDINARY_CLOUD_NAME}`);

  await migrateAdImages();
  await migrateProfileImages();

  await prisma.$disconnect();
  console.log('\nMigration complete!');
}

main().catch((error) => {
  console.error('Migration failed:', error);
  prisma.$disconnect();
  process.exit(1);
});
