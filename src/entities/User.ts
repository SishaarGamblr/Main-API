import {
  Entity,
  Column,
  OneToMany,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { BaseEntity, BasePropertiesSchema } from './BaseEntity';
import { UsersToLeagues } from './UsersInLeagues';
import { Wallet } from './Wallet';
import { ErrorPropertiesSchema } from '../lib/errors/schema';

@Entity()
export class User extends BaseEntity {
  prefix = 'user_';

  @Column({ nullable: false })
  name!: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: false, unique: true })
  phone!: string;

  @OneToMany(() => UsersToLeagues, (userToLeague) => userToLeague.userId)
  userToLeagues!: UsersToLeagues[];

  @OneToOne(() => Wallet, (wallet) => wallet.owner, { cascade: true })
  @JoinColumn()
  wallet: Wallet;
}

export const UserResponseSchema = {
  200: {
    type: 'object',
    properties: {
      ...BasePropertiesSchema,
      name: { type: 'string' },
      email: { type: 'string' },
      phone: { type: 'string' },
    },
  },
  '4xx': {
    type: 'object',
    properties: {
      ...ErrorPropertiesSchema,
    },
  },
};

export class CreateUserDTO {
  email: string;
  phone: string;
  name: string;
}

export class FindOneDTO {
  deleted?: boolean;
}
