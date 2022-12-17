import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from "typeorm";
import { BaseEntity } from "./BaseEntity";
import { User } from "./User";
import { Wallet } from "./Wallet";

@Entity()
export class Transaction extends BaseEntity {
  protected prefix = 'trax_';

  @Column({ nullable: false })
  amount!: number
  
  @ManyToOne(() => Wallet, (wallet) => wallet.transactionsFrom)
  from: Wallet;

  @ManyToOne(() => Wallet, (wallet) => wallet.transactionsTo)
  to: Wallet;
}