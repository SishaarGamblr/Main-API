import { Service } from "typedi";
import { League } from "../entities/League";
import { FindOneOptions } from "typeorm";


@Service()
export class LeaguesService {
  async findOne(id: string, params?: FindOneDTO) {
    const options: FindOneOptions<League> = {
      where: {
        id,
        deleted: params?.deleted ? params.deleted : false,
      },
    };

    return await League.findOne(options);
  }

  async create(options: CreateLeagueDTO): Promise<League | never> {
    const league = await League.create({
      name: options.name,
      owner: { id: options.ownerId }
    }).save();

    return await League.findOneOrFail({where: { id: league.id }});
  }

  async delete(id: string) {
    const league = await this.findOne(id);
    if (league) {
      league.deleted = true;
      await league.save();
    }
  }
}

interface FindOneDTO {
  deleted?: boolean;
}

interface CreateLeagueDTO {
  name: string;
  ownerId: string;
}