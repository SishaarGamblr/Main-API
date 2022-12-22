import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { User } from './User';
import { UsersToLeagues } from './UsersInLeagues';
import { Wager } from './Wager';

@Entity()
export class League extends BaseEntity {
  prefix = 'leag_';

  @Column({ nullable: false })
  name!: string;

  @ManyToOne(() => User, (user) => user.id)
  owner: User;

  @OneToMany(() => UsersToLeagues, (userToLeague) => userToLeague.leagueId)
  leaguesToUsers!: UsersToLeagues[];

  @OneToMany(() => Wager, (wager) => wager.league)
  wagers: Wager[];
}
