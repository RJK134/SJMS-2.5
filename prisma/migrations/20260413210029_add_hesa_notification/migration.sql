-- CreateEnum
CREATE TYPE "HESANotificationStatus" AS ENUM ('PENDING', 'SUBMITTED', 'ACKNOWLEDGED', 'REJECTED');

-- CreateTable
CREATE TABLE "hesa_notifications" (
    "id" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "change_type" TEXT NOT NULL,
    "status" "HESANotificationStatus" NOT NULL DEFAULT 'PENDING',
    "submitted_at" TIMESTAMP(3),
    "acknowledged_at" TIMESTAMP(3),
    "payload" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "hesa_notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "hesa_notifications_entity_type_entity_id_idx" ON "hesa_notifications"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "hesa_notifications_status_idx" ON "hesa_notifications"("status");
