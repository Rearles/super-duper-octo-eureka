-- CreateTable
CREATE TABLE "PersonRegistration" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "aliases" TEXT NOT NULL DEFAULT '[]',
    "features" TEXT NOT NULL DEFAULT '{}'
);

-- CreateTable
CREATE TABLE "IdentityBinding" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "personId" TEXT NOT NULL,
    "trueName" TEXT NOT NULL,
    "trueFeatures" TEXT NOT NULL DEFAULT '{}',
    CONSTRAINT "IdentityBinding_personId_fkey" FOREIGN KEY ("personId") REFERENCES "PersonRegistration" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Location" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "kind" TEXT NOT NULL DEFAULT 'address',
    "zoneId" TEXT
);

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "kind" TEXT NOT NULL DEFAULT 'org'
);

-- CreateTable
CREATE TABLE "MorticianRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "subjectId" TEXT NOT NULL,
    "causeOfDeath" TEXT,
    "mannerHint" TEXT,
    "notes" TEXT,
    "enteredById" TEXT NOT NULL,
    "motive" TEXT,
    "fidelity" TEXT NOT NULL DEFAULT 'true',
    "lastEditedById" TEXT,
    "enteredAt" TEXT
);

-- CreateTable
CREATE TABLE "PoliceRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reportType" TEXT NOT NULL,
    "subjectId" TEXT,
    "locationId" TEXT,
    "occurredAt" TEXT,
    "narrative" TEXT,
    "enteredById" TEXT NOT NULL,
    "motive" TEXT,
    "fidelity" TEXT NOT NULL DEFAULT 'true',
    "lastEditedById" TEXT
);

-- CreateTable
CREATE TABLE "IncidentReport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "policeRecordId" TEXT NOT NULL,
    "involved" TEXT NOT NULL DEFAULT '[]',
    "witnesses" TEXT NOT NULL DEFAULT '[]',
    "conditions" TEXT,
    "preliminaryActions" TEXT,
    CONSTRAINT "IncidentReport_policeRecordId_fkey" FOREIGN KEY ("policeRecordId") REFERENCES "PoliceRecord" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ArrestReport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "policeRecordId" TEXT NOT NULL,
    "arresteeId" TEXT NOT NULL,
    "charges" TEXT NOT NULL DEFAULT '[]',
    "probableCause" TEXT,
    "evidence" TEXT NOT NULL DEFAULT '[]',
    "booking" TEXT,
    "mirandaGiven" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "ArrestReport_policeRecordId_fkey" FOREIGN KEY ("policeRecordId") REFERENCES "PoliceRecord" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AccidentReport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "policeRecordId" TEXT NOT NULL,
    "weather" TEXT,
    "vehicles" TEXT NOT NULL DEFAULT '[]',
    "driverId" TEXT,
    "passengers" TEXT NOT NULL DEFAULT '[]',
    "injuries" TEXT,
    "citations" TEXT NOT NULL DEFAULT '[]',
    CONSTRAINT "AccidentReport_policeRecordId_fkey" FOREIGN KEY ("policeRecordId") REFERENCES "PoliceRecord" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "InvestigationReport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "policeRecordId" TEXT NOT NULL,
    "leadInvestigatorId" TEXT,
    "evidenceLog" TEXT NOT NULL DEFAULT '[]',
    "interviews" TEXT NOT NULL DEFAULT '[]',
    "personsOfInterest" TEXT NOT NULL DEFAULT '[]',
    "status" TEXT,
    "findings" TEXT,
    CONSTRAINT "InvestigationReport_policeRecordId_fkey" FOREIGN KEY ("policeRecordId") REFERENCES "PoliceRecord" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AnalyticalReport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "policeRecordId" TEXT NOT NULL,
    "dataSources" TEXT NOT NULL DEFAULT '[]',
    "method" TEXT,
    "patterns" TEXT,
    "scope" TEXT,
    "conclusions" TEXT,
    "analystId" TEXT,
    CONSTRAINT "AnalyticalReport_policeRecordId_fkey" FOREIGN KEY ("policeRecordId") REFERENCES "PoliceRecord" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UseOfForceReport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "policeRecordId" TEXT NOT NULL,
    "officers" TEXT NOT NULL DEFAULT '[]',
    "subjectId" TEXT,
    "forceLevel" TEXT,
    "justification" TEXT,
    "injuries" TEXT,
    "supervisorReview" TEXT,
    CONSTRAINT "UseOfForceReport_policeRecordId_fkey" FOREIGN KEY ("policeRecordId") REFERENCES "PoliceRecord" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "InternalAffairsReport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "policeRecordId" TEXT NOT NULL,
    "subjectOfficerId" TEXT,
    "complainantId" TEXT,
    "allegation" TEXT,
    "findings" TEXT,
    "disposition" TEXT,
    "confidentiality" TEXT,
    CONSTRAINT "InternalAffairsReport_policeRecordId_fkey" FOREIGN KEY ("policeRecordId") REFERENCES "PoliceRecord" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CriminalCaseReport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "policeRecordId" TEXT NOT NULL,
    "caseNumber" TEXT,
    "defendants" TEXT NOT NULL DEFAULT '[]',
    "charges" TEXT NOT NULL DEFAULT '[]',
    "consolidatedEvidence" TEXT NOT NULL DEFAULT '[]',
    "witnessList" TEXT NOT NULL DEFAULT '[]',
    "linkedReports" TEXT NOT NULL DEFAULT '[]',
    "prosecutorId" TEXT,
    CONSTRAINT "CriminalCaseReport_policeRecordId_fkey" FOREIGN KEY ("policeRecordId") REFERENCES "PoliceRecord" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "IdentityBinding_personId_key" ON "IdentityBinding"("personId");

-- CreateIndex
CREATE UNIQUE INDEX "IncidentReport_policeRecordId_key" ON "IncidentReport"("policeRecordId");

-- CreateIndex
CREATE UNIQUE INDEX "ArrestReport_policeRecordId_key" ON "ArrestReport"("policeRecordId");

-- CreateIndex
CREATE UNIQUE INDEX "AccidentReport_policeRecordId_key" ON "AccidentReport"("policeRecordId");

-- CreateIndex
CREATE UNIQUE INDEX "InvestigationReport_policeRecordId_key" ON "InvestigationReport"("policeRecordId");

-- CreateIndex
CREATE UNIQUE INDEX "AnalyticalReport_policeRecordId_key" ON "AnalyticalReport"("policeRecordId");

-- CreateIndex
CREATE UNIQUE INDEX "UseOfForceReport_policeRecordId_key" ON "UseOfForceReport"("policeRecordId");

-- CreateIndex
CREATE UNIQUE INDEX "InternalAffairsReport_policeRecordId_key" ON "InternalAffairsReport"("policeRecordId");

-- CreateIndex
CREATE UNIQUE INDEX "CriminalCaseReport_policeRecordId_key" ON "CriminalCaseReport"("policeRecordId");
