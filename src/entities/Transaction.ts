import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { Wallet } from './Wallet';

@Entity()
export class Transaction extends BaseEntity {
  prefix = 'trax_';

  @Column({ nullable: false })
  amount!: number;

  @ManyToOne(() => Wallet, (wallet) => wallet.transactionsFrom)
  from: Wallet;

  @ManyToOne(() => Wallet, (wallet) => wallet.transactionsTo)
  to: Wallet;
}
