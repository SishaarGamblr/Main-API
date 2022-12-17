import { Exclude } from 'class-transformer';
import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  PrimaryColumn,
  Timestamp,
  BaseEntity as TypeormBaseEntity,
  UpdateDateColumn,
} from 'typeorm';
import crypto from 'crypto';

const ID_LENGTH = 20;

export abstract class BaseEntity extends TypeormBaseEntity {
  @Exclude()
  protected abstract prefix: string;

  @PrimaryColumn()
  id!: string;

  @BeforeInsert()
  setId() {
    this.id = `${this.prefix}${crypto
      .randomBytes(ID_LENGTH)
      .toString('hex')
      .slice(0, ID_LENGTH - this.prefix.length)}`;
  }

  @CreateDateColumn({ name: 'date_created', type: 'timestamptz' }) // automatically set to the entity's insertion date
  dateCreated!: Timestamp;

  @UpdateDateColumn({ name: 'date_modified', type: 'timestamptz' }) // automatically set to the entity's update time each time save is called
  dateModified!: Timestamp;

  @Column({
    type: 'boolean',
    name: 'deleted',
    default: false,
  })
  deleted!: boolean;
}
