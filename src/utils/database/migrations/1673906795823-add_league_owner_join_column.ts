import { MigrationInterface, QueryRunner } from "typeorm";

export class addLeagueOwnerJoinColumn1673906795823 implements MigrationInterface {
    name = 'addLeagueOwnerJoinColumn1673906795823'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "league" DROP CONSTRAINT "FK_96e35857cf176619917da040885"
        `);
        await queryRunner.query(`
            ALTER TABLE "league"
            ALTER COLUMN "ownerId"
            SET NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "league"
            ADD CONSTRAINT "FK_96e35857cf176619917da040885" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "league" DROP CONSTRAINT "FK_96e35857cf176619917da040885"
        `);
        await queryRunner.query(`
            ALTER TABLE "league"
            ALTER COLUMN "ownerId" DROP NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "league"
            ADD CONSTRAINT "FK_96e35857cf176619917da040885" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

}
