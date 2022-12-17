import { Column, Entity, JoinColumn, OneToMany, OneToOne } from "typeorm";
import { BaseEntity } from "./BaseEntity";
import { User } from "./User";
import { Transaction } from "./Transaction";

@Entity()
export class Wallet extends BaseEntity {
  protected prefix = 'wall_';

  @Column({ default: 0, nullable: false })
  balance!: 0;
  
  @OneToOne(() => User)
  owner!: User;

  @OneToMany(() => Transaction, (transaction) => transaction.to)
  transactionsTo: Transaction[];

  @OneToMany(() => Transaction, (transaction) => transaction.from)
  transactionsFrom: Transaction[];
}