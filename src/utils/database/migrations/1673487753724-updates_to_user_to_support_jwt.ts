import { MigrationInterface, QueryRunner } from "typeorm";

export class updatesToUserToSupportJwt1673487753724 implements MigrationInterface {
    name = 'updatesToUserToSupportJwt1673487753724'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "user"
            ADD "refreshToken" character varying
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_8e1f623798118e629b46a9e629" ON "user" ("phone")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP INDEX "public"."IDX_8e1f623798118e629b46a9e629"
        `);
        await queryRunner.query(`
            ALTER TABLE "user" DROP COLUMN "refreshToken"
        `);
    }

}
