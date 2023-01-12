import { MigrationInterface, QueryRunner } from "typeorm";

export class updatesToUserToSupportJwt1673488428235 implements MigrationInterface {
    name = 'updatesToUserToSupportJwt1673488428235'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "user"
            ADD "refreshToken" character varying
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_8e1f623798118e629b46a9e629" ON "user" ("phone")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_03585d421deb10bbc326fffe4c" ON "user" ("refreshToken")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP INDEX "public"."IDX_03585d421deb10bbc326fffe4c"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_8e1f623798118e629b46a9e629"
        `);
        await queryRunner.query(`
            ALTER TABLE "user" DROP COLUMN "refreshToken"
        `);
    }

}
