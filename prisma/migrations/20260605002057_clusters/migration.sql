-- AlterTable
ALTER TABLE "ArrestReport" ADD COLUMN "armedWith" TEXT;
ALTER TABLE "ArrestReport" ADD COLUMN "disposition" TEXT;
ALTER TABLE "ArrestReport" ADD COLUMN "offenseCode" TEXT;

-- AlterTable
ALTER TABLE "IncidentReport" ADD COLUMN "disposition" TEXT;
ALTER TABLE "IncidentReport" ADD COLUMN "offenseCode" TEXT;
ALTER TABLE "IncidentReport" ADD COLUMN "victimOffenderRelationship" TEXT;
ALTER TABLE "IncidentReport" ADD COLUMN "weapon" TEXT;

-- CreateTable
CREATE TABLE "DeathCertificate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "subjectId" TEXT NOT NULL,
    "mannerOfDeath" TEXT NOT NULL DEFAULT 'undetermined',
    "causeOfDeath" TEXT,
    "pronouncedAt" TEXT,
    "certifierId" TEXT,
    "enteredById" TEXT NOT NULL,
    "motive" TEXT,
    "fidelity" TEXT NOT NULL DEFAULT 'true',
    "lastEditedById" TEXT
);

-- CreateTable
CREATE TABLE "AutopsyReport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "subjectId" TEXT NOT NULL,
    "deathCertId" TEXT,
    "causeFindings" TEXT,
    "woundPattern" TEXT,
    "timeOfDeath" TEXT,
    "examinerId" TEXT,
    "enteredById" TEXT NOT NULL,
    "motive" TEXT,
    "fidelity" TEXT NOT NULL DEFAULT 'true'
);

-- CreateTable
CREATE TABLE "ToxicologyReport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "subjectId" TEXT NOT NULL,
    "autopsyId" TEXT,
    "substances" TEXT NOT NULL DEFAULT '[]',
    "levels" TEXT NOT NULL DEFAULT '{}',
    "findings" TEXT,
    "analystId" TEXT,
    "enteredById" TEXT NOT NULL,
    "fidelity" TEXT NOT NULL DEFAULT 'true'
);

-- CreateTable
CREATE TABLE "MEInvestigationReport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "subjectId" TEXT NOT NULL,
    "locationId" TEXT,
    "sceneSummary" TEXT,
    "bodyPosition" TEXT,
    "investigatorId" TEXT,
    "enteredById" TEXT NOT NULL,
    "fidelity" TEXT NOT NULL DEFAULT 'true'
);

-- CreateTable
CREATE TABLE "BodyChart" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "subjectId" TEXT NOT NULL,
    "diagram" TEXT NOT NULL DEFAULT '[]',
    "notes" TEXT,
    "enteredById" TEXT NOT NULL,
    "fidelity" TEXT NOT NULL DEFAULT 'true'
);

-- CreateTable
CREATE TABLE "ChainOfCustody" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "itemRef" TEXT NOT NULL,
    "events" TEXT NOT NULL DEFAULT '[]',
    "enteredById" TEXT NOT NULL,
    "fidelity" TEXT NOT NULL DEFAULT 'true'
);

-- CreateTable
CREATE TABLE "BodyReleaseForm" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "subjectId" TEXT NOT NULL,
    "releasedTo" TEXT,
    "releasedAt" TEXT,
    "enteredById" TEXT NOT NULL,
    "fidelity" TEXT NOT NULL DEFAULT 'true'
);

-- CreateTable
CREATE TABLE "CourtRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "caseRef" TEXT,
    "court" TEXT,
    "judgeId" TEXT,
    "rulingType" TEXT,
    "ruling" TEXT,
    "ruledAt" TEXT,
    "parties" TEXT NOT NULL DEFAULT '[]',
    "enteredById" TEXT NOT NULL,
    "motive" TEXT,
    "fidelity" TEXT NOT NULL DEFAULT 'true',
    "lastEditedById" TEXT
);

-- CreateTable
CREATE TABLE "CADDispatchLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "policeRecordId" TEXT NOT NULL,
    "callType" TEXT,
    "dispatchedAt" TEXT,
    "units" TEXT NOT NULL DEFAULT '[]',
    "callerInfo" TEXT,
    "timeline" TEXT NOT NULL DEFAULT '[]',
    CONSTRAINT "CADDispatchLog_policeRecordId_fkey" FOREIGN KEY ("policeRecordId") REFERENCES "PoliceRecord" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FieldInterviewCard" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "policeRecordId" TEXT NOT NULL,
    "intervieweeId" TEXT,
    "contactInfo" TEXT,
    "circumstances" TEXT,
    "officerId" TEXT,
    CONSTRAINT "FieldInterviewCard_policeRecordId_fkey" FOREIGN KEY ("policeRecordId") REFERENCES "PoliceRecord" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BookingReport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "policeRecordId" TEXT NOT NULL,
    "arresteeId" TEXT,
    "charges" TEXT NOT NULL DEFAULT '[]',
    "property" TEXT NOT NULL DEFAULT '[]',
    "bookedAt" TEXT,
    CONSTRAINT "BookingReport_policeRecordId_fkey" FOREIGN KEY ("policeRecordId") REFERENCES "PoliceRecord" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SupplementalReport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "policeRecordId" TEXT NOT NULL,
    "parentRecordId" TEXT NOT NULL,
    "addendum" TEXT,
    "supplementedAt" TEXT,
    CONSTRAINT "SupplementalReport_policeRecordId_fkey" FOREIGN KEY ("policeRecordId") REFERENCES "PoliceRecord" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BOLO" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "policeRecordId" TEXT NOT NULL,
    "targetType" TEXT,
    "description" TEXT,
    "issuedAt" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "BOLO_policeRecordId_fkey" FOREIGN KEY ("policeRecordId") REFERENCES "PoliceRecord" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Warrant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "policeRecordId" TEXT NOT NULL,
    "warrantType" TEXT,
    "subjectId" TEXT,
    "issuingJudgeId" TEXT,
    "charges" TEXT NOT NULL DEFAULT '[]',
    "bail" TEXT,
    "issuedAt" TEXT,
    CONSTRAINT "Warrant_policeRecordId_fkey" FOREIGN KEY ("policeRecordId") REFERENCES "PoliceRecord" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EvidenceLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "policeRecordId" TEXT NOT NULL,
    "items" TEXT NOT NULL DEFAULT '[]',
    "custodyId" TEXT,
    "collectedAt" TEXT,
    CONSTRAINT "EvidenceLog_policeRecordId_fkey" FOREIGN KEY ("policeRecordId") REFERENCES "PoliceRecord" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "CADDispatchLog_policeRecordId_key" ON "CADDispatchLog"("policeRecordId");

-- CreateIndex
CREATE UNIQUE INDEX "FieldInterviewCard_policeRecordId_key" ON "FieldInterviewCard"("policeRecordId");

-- CreateIndex
CREATE UNIQUE INDEX "BookingReport_policeRecordId_key" ON "BookingReport"("policeRecordId");

-- CreateIndex
CREATE UNIQUE INDEX "SupplementalReport_policeRecordId_key" ON "SupplementalReport"("policeRecordId");

-- CreateIndex
CREATE UNIQUE INDEX "BOLO_policeRecordId_key" ON "BOLO"("policeRecordId");

-- CreateIndex
CREATE UNIQUE INDEX "Warrant_policeRecordId_key" ON "Warrant"("policeRecordId");

-- CreateIndex
CREATE UNIQUE INDEX "EvidenceLog_policeRecordId_key" ON "EvidenceLog"("policeRecordId");
