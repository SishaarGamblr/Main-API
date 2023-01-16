import { Service } from 'typedi';
import { League } from '../entities/League';
import { FindOneOptions } from 'typeorm';
import { UserService } from './users';
import { ForbiddenError, NotFoundError } from '../lib/errors/errors';
import { UsersToLeagues } from '../entities/UsersInLeagues';

@Service()
export class LeaguesService {

  constructor(private readonly usersService: UserService) {}

  async findOne(id: string, params?: FindOneDTO) {
    const options: FindOneOptions<League> = {
      where: {
        id,
        deleted: params?.deleted ? params.deleted : false,
      },
    };

    return await League.findOne(options);
  }

  async findOneOrFail(id: string, params?: FindOneDTO) {
    const league = await this.findOne(id, params);

    if (!league) {
      throw new NotFoundError('league');
    }

    return league;
  }

  async create(options: CreateLeagueDTO): Promise<League | never> {
    const league = await League.create({
      name: options.name,
      ownerId: options.ownerId,
    }).save();

    await UsersToLeagues.create({
      accepted: true,
      isOwner: true,
      league,
      user: { id: options.ownerId }
    }).save();

    return await this.findOneOrFail(league.id);
  }

  async delete(id: string, params?: DeleteDTO) {
    const league = await this.findOne(id);

    if (league) {
      if (params?.ownerId && league.ownerId !== params.ownerId) {
        throw new ForbiddenError()
      }

      league.deleted = true;
      await league.save();
    }
  }

  async inviteUser(id: string, userId: string, invitedById?: string) {
    const league = await this.findOneOrFail(id);

    const user = await this.usersService.findOneOrFail(userId);

    await UsersToLeagues.create({
      invitedBy: { id: invitedById },
      league,
      user,
    }).save();
  }
}

interface FindOneDTO {
  deleted?: boolean;
}

interface CreateLeagueDTO {
  name: string;
  ownerId: string;
}

interface DeleteDTO {
  ownerId: string;
}