-- AlterTable
ALTER TABLE "StoreSettings" ALTER COLUMN "bannerVelocidadSeg" SET DEFAULT 5;

-- La semántica del campo cambió de "segundos por vuelta completa del
-- marquee" a "segundos que cada banner permanece visible" (rediseño del
-- carrusel a Splide, un slide a la vez) — 30s quedaría demasiado lento
-- bajo el nuevo comportamiento, así que se reinicia al nuevo default.
UPDATE "StoreSettings" SET "bannerVelocidadSeg" = 5 WHERE "id" = 'default' AND "bannerVelocidadSeg" = 30;
