ALTER TABLE "participants" ADD COLUMN "self_account_id" UUID;

CREATE UNIQUE INDEX "participants_self_account_id_key" ON "participants"("self_account_id");

ALTER TABLE "participants" ADD CONSTRAINT "participants_self_account_id_fkey"
FOREIGN KEY ("self_account_id") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
