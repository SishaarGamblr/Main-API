import { Service } from 'typedi';
import { Wallet } from '../entities/Wallet';
import { FindOneOptions } from 'typeorm';
import { NotFoundError } from '../lib/errors/errors';

@Service()
export class WalletsService {
  async findOneOrFail(id: string, params?: FindOneDTO) {
    const options: FindOneOptions<Wallet> = {
      where: {
        id,
        deleted: params?.deleted ? params.deleted : false,
      },
    };

    const wallet = await Wallet.findOne(options);

    if (!wallet) {
      throw new NotFoundError('Wallet');
    }

    return wallet;
  }
}

interface FindOneDTO {
  deleted?: boolean;
}
