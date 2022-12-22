import { MigrationInterface, QueryRunner } from "typeorm";

export class createUsersLeaguesTransactionsWallet1672665617217 implements MigrationInterface {
    name = 'createUsersLeaguesTransactionsWallet1672665617217'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "transaction" (
                "id" character varying NOT NULL,
                "date_created" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "date_modified" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deleted" boolean NOT NULL DEFAULT false,
                "amount" integer NOT NULL,
                "fromId" character varying,
                "toId" character varying,
                CONSTRAINT "PK_89eadb93a89810556e1cbcd6ab9" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "wallet" (
                "id" character varying NOT NULL,
                "date_created" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "date_modified" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deleted" boolean NOT NULL DEFAULT false,
                "balance" integer NOT NULL DEFAULT '0',
                CONSTRAINT "PK_bec464dd8d54c39c54fd32e2334" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "user" (
                "id" character varying NOT NULL,
                "date_created" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "date_modified" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deleted" boolean NOT NULL DEFAULT false,
                "name" character varying NOT NULL,
                "email" character varying,
                "phone" character varying NOT NULL,
                "password" character varying NOT NULL,
                "walletId" character varying,
                CONSTRAINT "UQ_8e1f623798118e629b46a9e6299" UNIQUE ("phone"),
                CONSTRAINT "REL_922e8c1d396025973ec81e2a40" UNIQUE ("walletId"),
                CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "wager" (
                "id" character varying NOT NULL,
                "date_created" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "date_modified" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deleted" boolean NOT NULL DEFAULT false,
                "amount" integer NOT NULL DEFAULT '0',
                "line" character varying NOT NULL,
                "gameJson" jsonb NOT NULL DEFAULT '{}',
                "leagueId" character varying,
                "bettorId" character varying,
                "takerId" character varying,
                CONSTRAINT "PK_156862dd0b704f2fd7dd5ecf5f0" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "league" (
                "id" character varying NOT NULL,
                "date_created" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "date_modified" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deleted" boolean NOT NULL DEFAULT false,
                "name" character varying NOT NULL,
                "ownerId" character varying,
                CONSTRAINT "PK_0bd74b698f9e28875df738f7864" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "users_to_leagues" (
                "id" character varying NOT NULL,
                "date_created" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "date_modified" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deleted" boolean NOT NULL DEFAULT false,
                "userId" character varying NOT NULL,
                "leagueId" character varying NOT NULL,
                "isOwner" boolean NOT NULL DEFAULT false,
                "accepted" boolean NOT NULL DEFAULT false,
                "invitedById" character varying,
                CONSTRAINT "UQ_b201460e8a92b9433f020cdfbde" UNIQUE ("userId", "leagueId"),
                CONSTRAINT "PK_d58d302a3af307236250545310b" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "transaction"
            ADD CONSTRAINT "FK_ac3d6711c8adf322a76c0d1a227" FOREIGN KEY ("fromId") REFERENCES "wallet"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "transaction"
            ADD CONSTRAINT "FK_a02bf62a801914225fc2cad7ff7" FOREIGN KEY ("toId") REFERENCES "wallet"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "user"
            ADD CONSTRAINT "FK_922e8c1d396025973ec81e2a402" FOREIGN KEY ("walletId") REFERENCES "wallet"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "wager"
            ADD CONSTRAINT "FK_8058a3e28917d07be7f75d373ba" FOREIGN KEY ("leagueId") REFERENCES "league"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "wager"
            ADD CONSTRAINT "FK_a742771dc259c32367567469731" FOREIGN KEY ("bettorId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "wager"
            ADD CONSTRAINT "FK_107b567b949db34936efa7f7029" FOREIGN KEY ("takerId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "league"
            ADD CONSTRAINT "FK_96e35857cf176619917da040885" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "users_to_leagues"
            ADD CONSTRAINT "FK_fbab0056e31c08adebc9218ad14" FOREIGN KEY ("invitedById") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "users_to_leagues"
            ADD CONSTRAINT "FK_d0d49bbfcb6c3d681feac91886d" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "users_to_leagues"
            ADD CONSTRAINT "FK_03e313bbc9333c20da733151ff3" FOREIGN KEY ("leagueId") REFERENCES "league"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "users_to_leagues" DROP CONSTRAINT "FK_03e313bbc9333c20da733151ff3"
        `);
        await queryRunner.query(`
            ALTER TABLE "users_to_leagues" DROP CONSTRAINT "FK_d0d49bbfcb6c3d681feac91886d"
        `);
        await queryRunner.query(`
            ALTER TABLE "users_to_leagues" DROP CONSTRAINT "FK_fbab0056e31c08adebc9218ad14"
        `);
        await queryRunner.query(`
            ALTER TABLE "league" DROP CONSTRAINT "FK_96e35857cf176619917da040885"
        `);
        await queryRunner.query(`
            ALTER TABLE "wager" DROP CONSTRAINT "FK_107b567b949db34936efa7f7029"
        `);
        await queryRunner.query(`
            ALTER TABLE "wager" DROP CONSTRAINT "FK_a742771dc259c32367567469731"
        `);
        await queryRunner.query(`
            ALTER TABLE "wager" DROP CONSTRAINT "FK_8058a3e28917d07be7f75d373ba"
        `);
        await queryRunner.query(`
            ALTER TABLE "user" DROP CONSTRAINT "FK_922e8c1d396025973ec81e2a402"
        `);
        await queryRunner.query(`
            ALTER TABLE "transaction" DROP CONSTRAINT "FK_a02bf62a801914225fc2cad7ff7"
        `);
        await queryRunner.query(`
            ALTER TABLE "transaction" DROP CONSTRAINT "FK_ac3d6711c8adf322a76c0d1a227"
        `);
        await queryRunner.query(`
            DROP TABLE "users_to_leagues"
        `);
        await queryRunner.query(`
            DROP TABLE "league"
        `);
        await queryRunner.query(`
            DROP TABLE "wager"
        `);
        await queryRunner.query(`
            DROP TABLE "user"
        `);
        await queryRunner.query(`
            DROP TABLE "wallet"
        `);
        await queryRunner.query(`
            DROP TABLE "transaction"
        `);
    }

}
