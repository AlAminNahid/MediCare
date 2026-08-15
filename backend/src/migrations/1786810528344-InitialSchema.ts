import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1786810528344 implements MigrationInterface {
    name = 'InitialSchema1786810528344'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "admin" ("adminId" SERIAL NOT NULL, "fullName" character varying(100) NOT NULL, "phoneNumber" character varying(20), "email" character varying(100), CONSTRAINT "PK_abce4cc3fe598f242ab45e529b6" PRIMARY KEY ("adminId"))`);
        await queryRunner.query(`CREATE TABLE "chamber" ("chamberId" SERIAL NOT NULL, "doctorId" integer NOT NULL, "name" character varying(150) NOT NULL, "address" character varying(255) NOT NULL, "days" text NOT NULL, "startTime" TIME NOT NULL, "endTime" TIME NOT NULL, "visitFee" numeric(10,2), CONSTRAINT "PK_0fc4098892669885a6642233536" PRIMARY KEY ("chamberId"))`);
        await queryRunner.query(`CREATE TABLE "prescription_medicine" ("id" SERIAL NOT NULL, "prescriptionId" integer NOT NULL, "medicineName" character varying(200) NOT NULL, "dosage" character varying(100) NOT NULL, "duration" character varying(100) NOT NULL, CONSTRAINT "PK_19dc5835b78b390e334379fc49d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "prescription" ("prescriptionId" SERIAL NOT NULL, "doctorId" integer NOT NULL, "patientId" integer NOT NULL, "chamberId" integer, "date" date NOT NULL, "diagnosis" text, "tests" text, "notes" text, CONSTRAINT "PK_12ed14cd0536a8bd675d28a5ab8" PRIMARY KEY ("prescriptionId"))`);
        await queryRunner.query(`CREATE TABLE "patient" ("patientId" SERIAL NOT NULL, "fullName" character varying(100) NOT NULL, "phoneNumber" character varying(20), "age" integer, "gender" character varying(10), "address" character varying(255), CONSTRAINT "PK_9e4aae494b9d607dd7476c49f03" PRIMARY KEY ("patientId"))`);
        await queryRunner.query(`CREATE TYPE "public"."appointment_status_enum" AS ENUM('Waiting', 'Serving', 'Done', 'Cancelled', 'No Show')`);
        await queryRunner.query(`CREATE TABLE "appointment" ("appointmentId" SERIAL NOT NULL, "doctorId" integer NOT NULL, "patientId" integer NOT NULL, "chamberId" integer NOT NULL, "date" date NOT NULL, "serialNumber" integer NOT NULL, "status" "public"."appointment_status_enum" NOT NULL DEFAULT 'Waiting', "reason" text, CONSTRAINT "UQ_954276166ae5bcb6947edd2224c" UNIQUE ("chamberId", "date", "serialNumber"), CONSTRAINT "PK_5daff29f32be6b2c25740d67384" PRIMARY KEY ("appointmentId"))`);
        await queryRunner.query(`CREATE TABLE "doctor" ("doctorId" SERIAL NOT NULL, "fullName" character varying(100) NOT NULL, "phoneNumber" character varying(20), "specialization" character varying(100), "visitFee" numeric(10,2), "degrees" text, CONSTRAINT "PK_36ae3cd9fc1f175ed367e4ecb9f" PRIMARY KEY ("doctorId"))`);
        await queryRunner.query(`CREATE TYPE "public"."login_role_enum" AS ENUM('admin', 'doctor', 'patient')`);
        await queryRunner.query(`CREATE TABLE "login" ("loginId" SERIAL NOT NULL, "email" character varying(100) NOT NULL, "password" character varying(255) NOT NULL, "refreshTokenHash" character varying(255), "role" "public"."login_role_enum" NOT NULL, "adminId" integer, "doctorId" integer, "patientId" integer, CONSTRAINT "UQ_a1fa377d7cba456bebaa6922edf" UNIQUE ("email"), CONSTRAINT "PK_3d4063a2061d7c30e4d777b50fc" PRIMARY KEY ("loginId"))`);
        await queryRunner.query(`CREATE TABLE "backup" ("backupId" SERIAL NOT NULL, "fileName" character varying(255) NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "createdBy" character varying(100) NOT NULL, CONSTRAINT "PK_011706e9259f28eb378e779acd2" PRIMARY KEY ("backupId"))`);
        await queryRunner.query(`CREATE TABLE "medicine" ("medicineId" SERIAL NOT NULL, "name" character varying(100) NOT NULL, "type" character varying(50) NOT NULL, "strength" character varying(50) NOT NULL, "manufacturerName" character varying(100) NOT NULL, CONSTRAINT "UQ_913974a03c525f2b7681706fcc8" UNIQUE ("name"), CONSTRAINT "PK_1190e4d499697ccd85685976eb4" PRIMARY KEY ("medicineId"))`);
        await queryRunner.query(`CREATE TYPE "public"."feedback_senderrole_enum" AS ENUM('doctor', 'patient')`);
        await queryRunner.query(`CREATE TYPE "public"."feedback_status_enum" AS ENUM('pending', 'reviewed')`);
        await queryRunner.query(`CREATE TABLE "feedback" ("feedbackId" SERIAL NOT NULL, "senderRole" "public"."feedback_senderrole_enum" NOT NULL, "doctorId" integer, "patientId" integer, "subject" character varying(200) NOT NULL, "message" text NOT NULL, "status" "public"."feedback_status_enum" NOT NULL DEFAULT 'pending', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_3b500d42f7115ffdbfd1190b2e0" PRIMARY KEY ("feedbackId"))`);
        await queryRunner.query(`ALTER TABLE "chamber" ADD CONSTRAINT "FK_6c482c4529d87ca996338b3f57e" FOREIGN KEY ("doctorId") REFERENCES "doctor"("doctorId") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "prescription_medicine" ADD CONSTRAINT "FK_f5abb709c739834ac0ee95750bf" FOREIGN KEY ("prescriptionId") REFERENCES "prescription"("prescriptionId") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "prescription" ADD CONSTRAINT "FK_3e4a39a72939d42f31039f25ae6" FOREIGN KEY ("doctorId") REFERENCES "doctor"("doctorId") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "prescription" ADD CONSTRAINT "FK_d9d1ecabc97e4de5c07a1795279" FOREIGN KEY ("patientId") REFERENCES "patient"("patientId") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "prescription" ADD CONSTRAINT "FK_fd79df7f8569b4a6d2575b5683a" FOREIGN KEY ("chamberId") REFERENCES "chamber"("chamberId") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "appointment" ADD CONSTRAINT "FK_514bcc3fb1b8140f85bf1cde6e2" FOREIGN KEY ("doctorId") REFERENCES "doctor"("doctorId") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "appointment" ADD CONSTRAINT "FK_5ce4c3130796367c93cd817948e" FOREIGN KEY ("patientId") REFERENCES "patient"("patientId") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "appointment" ADD CONSTRAINT "FK_50736df8b34b9cbe709feb7a693" FOREIGN KEY ("chamberId") REFERENCES "chamber"("chamberId") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "login" ADD CONSTRAINT "FK_b52a45424ce3b63220f8c7af3d7" FOREIGN KEY ("adminId") REFERENCES "admin"("adminId") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "login" ADD CONSTRAINT "FK_34765b066b0f55a9ac7d195e4bb" FOREIGN KEY ("doctorId") REFERENCES "doctor"("doctorId") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "login" ADD CONSTRAINT "FK_59fef1ebcbbec1dc0382cd757c8" FOREIGN KEY ("patientId") REFERENCES "patient"("patientId") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "feedback" ADD CONSTRAINT "FK_8c23be3c6dd95628e6effa1bb9e" FOREIGN KEY ("doctorId") REFERENCES "doctor"("doctorId") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "feedback" ADD CONSTRAINT "FK_ae15a523f30d24d11803d90e402" FOREIGN KEY ("patientId") REFERENCES "patient"("patientId") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "feedback" DROP CONSTRAINT "FK_ae15a523f30d24d11803d90e402"`);
        await queryRunner.query(`ALTER TABLE "feedback" DROP CONSTRAINT "FK_8c23be3c6dd95628e6effa1bb9e"`);
        await queryRunner.query(`ALTER TABLE "login" DROP CONSTRAINT "FK_59fef1ebcbbec1dc0382cd757c8"`);
        await queryRunner.query(`ALTER TABLE "login" DROP CONSTRAINT "FK_34765b066b0f55a9ac7d195e4bb"`);
        await queryRunner.query(`ALTER TABLE "login" DROP CONSTRAINT "FK_b52a45424ce3b63220f8c7af3d7"`);
        await queryRunner.query(`ALTER TABLE "appointment" DROP CONSTRAINT "FK_50736df8b34b9cbe709feb7a693"`);
        await queryRunner.query(`ALTER TABLE "appointment" DROP CONSTRAINT "FK_5ce4c3130796367c93cd817948e"`);
        await queryRunner.query(`ALTER TABLE "appointment" DROP CONSTRAINT "FK_514bcc3fb1b8140f85bf1cde6e2"`);
        await queryRunner.query(`ALTER TABLE "prescription" DROP CONSTRAINT "FK_fd79df7f8569b4a6d2575b5683a"`);
        await queryRunner.query(`ALTER TABLE "prescription" DROP CONSTRAINT "FK_d9d1ecabc97e4de5c07a1795279"`);
        await queryRunner.query(`ALTER TABLE "prescription" DROP CONSTRAINT "FK_3e4a39a72939d42f31039f25ae6"`);
        await queryRunner.query(`ALTER TABLE "prescription_medicine" DROP CONSTRAINT "FK_f5abb709c739834ac0ee95750bf"`);
        await queryRunner.query(`ALTER TABLE "chamber" DROP CONSTRAINT "FK_6c482c4529d87ca996338b3f57e"`);
        await queryRunner.query(`DROP TABLE "feedback"`);
        await queryRunner.query(`DROP TYPE "public"."feedback_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."feedback_senderrole_enum"`);
        await queryRunner.query(`DROP TABLE "medicine"`);
        await queryRunner.query(`DROP TABLE "backup"`);
        await queryRunner.query(`DROP TABLE "login"`);
        await queryRunner.query(`DROP TYPE "public"."login_role_enum"`);
        await queryRunner.query(`DROP TABLE "doctor"`);
        await queryRunner.query(`DROP TABLE "appointment"`);
        await queryRunner.query(`DROP TYPE "public"."appointment_status_enum"`);
        await queryRunner.query(`DROP TABLE "patient"`);
        await queryRunner.query(`DROP TABLE "prescription"`);
        await queryRunner.query(`DROP TABLE "prescription_medicine"`);
        await queryRunner.query(`DROP TABLE "chamber"`);
        await queryRunner.query(`DROP TABLE "admin"`);
    }

}
