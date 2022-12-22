import { Entity, Column, OneToMany, OneToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { UsersToLeagues } from './UsersInLeagues';
import { Wallet } from './Wallet';

@Entity()
export class User extends BaseEntity {
  prefix = 'user_';

  @Column({ nullable: false })
  name!: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: false, unique: true })
  phone!: string;

  @Column({ nullable: false })
  password!: string;

  @OneToMany(() => UsersToLeagues, (userToLeague) => userToLeague.userId)
  userToLeagues!: UsersToLeagues[];

  @OneToOne(() => Wallet, (wallet) => wallet.owner, { cascade: true })
  @JoinColumn()
  wallet: Wallet;
}
