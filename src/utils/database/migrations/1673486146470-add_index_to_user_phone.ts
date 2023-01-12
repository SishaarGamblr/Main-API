import { MigrationInterface, QueryRunner } from "typeorm";

export class addIndexToUserPhone1673486146470 implements MigrationInterface {
    name = 'addIndexToUserPhone1673486146470'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE INDEX "IDX_8e1f623798118e629b46a9e629" ON "user" ("phone")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP INDEX "public"."IDX_8e1f623798118e629b46a9e629"
        `);
    }

}
