-- CreateTable
CREATE TABLE "users" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "adsoyad" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "userType" TEXT NOT NULL DEFAULT 'NORMAL',
    "profilFoto" TEXT,
    "hakkimda" TEXT,
    "website" TEXT,
    "twitter" TEXT,
    "linkedin" TEXT,
    "instagram" TEXT,
    "github" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "teams" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "projectId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "teams_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "team_members" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "teamId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'MEMBER',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "joinedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "team_members_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "team_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "team_invitations" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "teamId" INTEGER NOT NULL,
    "inviterId" INTEGER NOT NULL,
    "inviteeId" INTEGER,
    "inviteeEmail" TEXT NOT NULL,
    "message" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "expiresAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "team_invitations_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "team_invitations_inviterId_fkey" FOREIGN KEY ("inviterId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "team_invitations_inviteeId_fkey" FOREIGN KEY ("inviteeId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "data" JSONB,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "sponsors" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "sponsorAdi" TEXT NOT NULL,
    "resim" TEXT,
    "video" TEXT,
    "hakkimizda" TEXT,
    "email" TEXT NOT NULL,
    "telefon" TEXT,
    "website" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "sponsors_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "projects" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "projeAdi" TEXT NOT NULL,
    "projeKonusu" TEXT NOT NULL,
    "takimAdi" TEXT NOT NULL,
    "takimKurulusYili" INTEGER NOT NULL,
    "takimEgitimSeviyesi" TEXT NOT NULL,
    "katilimIli" TEXT NOT NULL,
    "projeOzeti" TEXT NOT NULL DEFAULT '',
    "resim" TEXT,
    "presentationUrl" TEXT,
    "basarilar" JSONB,
    "ozgunluk" INTEGER,
    "pazarBuyuklugu" INTEGER,
    "pazardakiRekabet" INTEGER,
    "total" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "projects_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "forms" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "projeId" INTEGER NOT NULL,
    "projeAdi" TEXT NOT NULL,
    "problem" TEXT NOT NULL,
    "cozum" TEXT NOT NULL,
    "hedefKitle" TEXT NOT NULL,
    "etki" TEXT NOT NULL,
    "ayirtEdiciOzellikleri" TEXT NOT NULL,
    "projeTanitimVideosu" TEXT,
    "sunum" TEXT,
    "alakaliDokumanlar" JSONB,
    "projeEkibi" JSONB,
    "ozgunluk" TEXT,
    "pazarBuyuklugu" TEXT,
    "pazardakiRekabet" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "forms_projeId_fkey" FOREIGN KEY ("projeId") REFERENCES "projects" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "sponsor_yatirimlar" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "sponsorId" INTEGER NOT NULL,
    "projeId" INTEGER NOT NULL,
    "yatirimMiktari" REAL NOT NULL,
    "yatirimTarihi" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "mesaj" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "sponsor_yatirimlar_sponsorId_fkey" FOREIGN KEY ("sponsorId") REFERENCES "sponsors" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "sponsor_yatirimlar_projeId_fkey" FOREIGN KEY ("projeId") REFERENCES "projects" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "teams_projectId_key" ON "teams"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "team_members_teamId_userId_key" ON "team_members"("teamId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "team_invitations_teamId_inviteeEmail_key" ON "team_invitations"("teamId", "inviteeEmail");

-- CreateIndex
CREATE UNIQUE INDEX "sponsors_email_key" ON "sponsors"("email");

-- CreateIndex
CREATE UNIQUE INDEX "forms_projeId_key" ON "forms"("projeId");
