-- CreateTable
CREATE TABLE "RegistryUser" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'clerk',
    "clearance" INTEGER NOT NULL DEFAULT 1
);

-- CreateTable
CREATE TABLE "AuditLogEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "seq" INTEGER NOT NULL,
    "actorId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "payload" TEXT NOT NULL DEFAULT '{}',
    "prevHash" TEXT NOT NULL,
    "hash" TEXT NOT NULL,
    "at" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "SealedRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "tier" INTEGER NOT NULL DEFAULT 1,
    "reason" TEXT,
    "sealedById" TEXT NOT NULL,
    "sealedAt" TEXT
);

-- CreateTable
CREATE TABLE "UnsealPetition" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sealedRecordId" TEXT NOT NULL,
    "petitionerId" TEXT NOT NULL,
    "evidenceBundle" TEXT NOT NULL DEFAULT '[]',
    "status" TEXT NOT NULL DEFAULT 'open',
    "filedAt" TEXT
);

-- CreateTable
CREATE TABLE "UnsealRuling" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "petitionId" TEXT NOT NULL,
    "judgeId" TEXT NOT NULL,
    "granted" BOOLEAN NOT NULL,
    "reason" TEXT,
    "ruledAt" TEXT
);

-- CreateTable
CREATE TABLE "Publication" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "publishedById" TEXT NOT NULL,
    "publishedAt" TEXT
);

-- CreateIndex
CREATE UNIQUE INDEX "AuditLogEntry_seq_key" ON "AuditLogEntry"("seq");

-- CreateIndex
CREATE UNIQUE INDEX "UnsealRuling_petitionId_key" ON "UnsealRuling"("petitionId");
