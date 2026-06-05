-- CreateTable
CREATE TABLE "GroundTruthLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "eventId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "culpritId" TEXT NOT NULL,
    "victimId" TEXT,
    "locationId" TEXT,
    "at" TEXT NOT NULL,
    "truth" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "ColdCase" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "eventId" TEXT NOT NULL,
    "state" TEXT NOT NULL DEFAULT 'cold',
    "determination" TEXT
);

-- CreateTable
CREATE TABLE "SimRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "caseId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "fidelity" TEXT NOT NULL,
    "claims" TEXT NOT NULL,
    "enteredById" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "GroundTruthLog_eventId_key" ON "GroundTruthLog"("eventId");
