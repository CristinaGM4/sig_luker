-- CreateTable
CREATE TABLE "instruments" (
    "code" TEXT NOT NULL,

    CONSTRAINT "instruments_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "instrument_versions" (
    "instrument_code" TEXT NOT NULL,
    "variant" TEXT NOT NULL,
    "source_version" TEXT NOT NULL,
    "rule_version" TEXT NOT NULL,
    "source_sha256" CHAR(64) NOT NULL,
    "item_count" INTEGER NOT NULL,

    CONSTRAINT "instrument_versions_pkey" PRIMARY KEY ("instrument_code","variant","source_version")
);

-- AddForeignKey
ALTER TABLE "instrument_versions" ADD CONSTRAINT "instrument_versions_instrument_code_fkey" FOREIGN KEY ("instrument_code") REFERENCES "instruments"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "instrument_versions"
  ADD CONSTRAINT "instrument_versions_positive_item_count" CHECK ("item_count" > 0);
