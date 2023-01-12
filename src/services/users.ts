import { FindOptionsWhere, QueryFailedError } from 'typeorm';
import { User } from '../entities/User';
import { Service } from 'typedi';
import { AlreadyExistsError, NotFoundError } from '../lib/errors/errors';
import bcrypt from 'bcrypt';
import Config from 'config';

@Service()
export class UserService {
  async findOne(id: string | null, params?: FindOneDTO) {
    const where: FindOptionsWhere<User> = {
      deleted: params?.deleted ? params.deleted : false,
    }

    if (id) {
      where.id = id;
    }

    if (params?.phone) {
      where.phone = params.phone;
    }

    return await User.findOne({ where });
  }

  async findOneOrFail(id: string, params?: FindOneDTO) {
    const user = await this.findOne(id, params);

    if (!user) {
      throw new NotFoundError('user');
    }

    return user;
  }

  async create(options: CreateUserDTO): Promise<User | never> {
    try {
      const user = await User.create({
        email: options.email,
        phone: options.phone,
        name: options.name,
        password: await this.getEncryptedPassword(options.password),
        wallet: {},
      }).save();

      return await User.findOneOrFail({ where: { id: user.id } });
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

  /**
   * Generates an encrypted password via the Blowfish Cipher + Salt
   * @param plaintextPassword the plain-text password to encrypt
   * @returns the encrypted password
   */
  private async getEncryptedPassword(plaintextPassword: string): Promise<string> {
    return bcrypt.hash(plaintextPassword, Config.get<number>('security.salt_rounds'));
  }

  /**
   * Verifies whether a provided plain-text password matches the user's set password
   * @param userId the ID of the user to check
   * @param plaintextPassword the plain-text password provided by the attempt
   * @returns true if the password matches the user's set password
   */
  async checkPassword(userId: string, plaintextPassword: string): Promise<boolean> {
    const user = await this.findOne(userId);
    if (!user) {
      return false;
    }

    const encryptedPassword = user.password;

    return await bcrypt.compare(plaintextPassword, encryptedPassword);
  }
}

interface FindOneDTO {
  deleted?: boolean;
  phone?: string;
}

interface CreateUserDTO {
  email: string;
  phone: string;
  name: string;
  password: string;
}
