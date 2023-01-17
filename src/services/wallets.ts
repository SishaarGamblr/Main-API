import { Service } from 'typedi';
import { Wallet } from '../entities/Wallet';
import { FindOneOptions } from 'typeorm';
import { NotFoundError } from '../lib/errors/errors';

@Service()
export class WalletsService {
  async findOneOrFail(id: string | undefined, params?: FindOneDTO) {
    const options: FindOneOptions<Wallet> = {
      where: {
        id,
        deleted: params?.deleted ? params.deleted : false,
        owner: params?.ownerId ? { id: params?.ownerId } : undefined
      },
    };

    const wallet = await Wallet.findOne(options);

    if (!wallet) {
      throw new NotFoundError('Wallet');
    }

    return wallet;
  }

  async delete(id: string) {
    const wallet = await this.findOneOrFail(id);
    wallet.deleted = true;
    await wallet.save();
  }
}

interface FindOneDTO {
  deleted?: boolean;
  ownerId?: string;
}
