-- CreateTable
CREATE TABLE "Tracking" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "trackingNumber" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tracking_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Tracking" ADD CONSTRAINT "Tracking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
