import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { User } from './User';
import { UsersToLeagues } from './UsersInLeagues';
import { Wager } from './Wager';

@Entity()
export class League extends BaseEntity {
  prefix = 'leag_';

  @Column({ nullable: false })
  name!: string;

  @Column({ name: 'ownerId'})
  ownerId: string

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'ownerId'})
  owner: User;

  @OneToMany(() => UsersToLeagues, (userToLeague) => userToLeague.leagueId)
  leaguesToUsers!: UsersToLeagues[];

  @OneToMany(() => Wager, (wager) => wager.league)
  wagers: Wager[];
}
