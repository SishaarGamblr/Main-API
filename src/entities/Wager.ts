import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { League } from './League';
import { User } from './User';

@Entity()
export class Wager extends BaseEntity {
  prefix = 'wagr_';

  @Column({ default: 0, nullable: false })
  amount!: number;

  @Column({ nullable: false })
  line!: string;

  @Column({ nullable: false, type: 'jsonb', default: {} })
  gameJson: {};

  @ManyToOne(() => League, (league) => league.wagers)
  league: League;

  @ManyToOne(() => User)
  bettor: User;

  @ManyToOne(() => User)
  taker: User;
}
