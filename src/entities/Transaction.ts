import { Column, Entity, ManyToOne, RelationId } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { Wallet } from './Wallet';

@Entity()
export class Transaction extends BaseEntity {
  prefix = 'trax_';

  @Column({ nullable: false })
  amount!: number;

  @ManyToOne(() => Wallet, (wallet) => wallet.transactionsFrom)
  from: Wallet;

  @RelationId((trx: Transaction) => trx.from)
  fromId: string;

  @ManyToOne(() => Wallet, (wallet) => wallet.transactionsTo)
  to: Wallet;

  @RelationId((trx: Transaction) => trx.to)
  toId: string;
}
