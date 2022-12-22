import { Column, Entity, ManyToOne, Unique } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { User } from './User';
import { League } from './League';

@Entity()
@Unique(['userId', 'leagueId'])
export class UsersToLeagues extends BaseEntity {
  prefix = 'usr_lea';

  @Column()
  userId!: string;

  @Column()
  leagueId!: string;

  @Column({ nullable: false, default: false })
  isOwner!: boolean;

  @Column({ nullable: false })
  invitedById: string;

  @ManyToOne(() => User)
  invitedBy: User;

  @ManyToOne(() => User, (user) => user.userToLeagues)
  user!: User;

  @ManyToOne(() => League, (league) => league.leaguesToUsers)
  league!: League;
}
