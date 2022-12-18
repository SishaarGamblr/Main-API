import { FindOneOptions, QueryFailedError } from 'typeorm';
import { CreateUserDTO, FindOneDTO, User } from '../entities/User';
import { Service } from 'typedi';
import { AlreadyExistsError } from '../lib/errors/errors';

@Service()
export class UserService {
  async findOne(id: string, params?: FindOneDTO) {
    const options: FindOneOptions<User> = {
      where: {
        id,
        deleted: params?.deleted ? params.deleted : false,
      },
    };

    return await User.findOne(options);
  }

  async create(options: CreateUserDTO) {
    try {
      const user = await User.create({
        email: options.email,
        phone: options.phone,
        name: options.name,
        wallet: {},
      }).save();

      return await this.findOne(user.id);
    } catch (err) {
      if (err instanceof QueryFailedError && err.driverError.code === '23505') {
        throw new AlreadyExistsError('User');
      }
      throw err;
    }
  }

  async delete(id: string) {
    const user = await this.findOne(id);
    if (user) {
      user.deleted = true;
      await user.save();
    }
  }
}
