import { Column, Entity, JoinColumn, ManyToOne, RelationId, Unique } from 'typeorm';
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

  @RelationId((user: UsersToLeagues) => user.invitedBy)
  invitedById: string;

  @Column({ default: false })
  accepted: boolean;

  @ManyToOne(() => User)
  invitedBy: User;

  @ManyToOne(() => User, (user) => user.userToLeagues)
  user!: User;

  @ManyToOne(() => League, (league) => league.leaguesToUsers, { onDelete: 'CASCADE'})
  @JoinColumn()
  league!: League;
}
