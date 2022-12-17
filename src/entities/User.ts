import { Entity, PrimaryGeneratedColumn, Column, Unique, OneToMany, OneToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { UsersToLeagues } from './UsersInLeagues';
import { Wallet } from './Wallet';

@Entity()
export class User extends BaseEntity {
  protected prefix = 'user_';

  @Column({ nullable: false })
  name!: string;

  @Column({ nullable: true, unique: true })
  email: string;

  @Column({ nullable: false, unique: true })
  phone!: string;

  @OneToMany(() => UsersToLeagues, (userToLeague) => userToLeague.userId)
  userToLeagues!: UsersToLeagues[]

  @OneToOne(() => Wallet)
  @JoinColumn()
  wallet: Wallet;
}
