import { HttpException, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AuthService } from '../auth';
import { User } from '../entities';
import { UserUpdateInput } from '../interfaces';
import { CryptoUtil } from '../utils/crypto.util';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User) private readonly userRepo: Repository<User>,
        @Inject(CryptoUtil) private readonly cryptoUtil: CryptoUtil,
        @Inject(AuthService) private readonly authService: AuthService
    ) { }

    /**
     * 创建用户
     *
     * @param operatorId 操作员ID
     * @param user 用户对象
     */
    async createUser(operatorId: number, user: User): Promise<void> {
        if (await this.findOneByUsername(user.username)) {
            throw new HttpException('用户名已存在', 409);
        }
        user.createBy = user.updateBy = operatorId;
        this.userRepo.save(this.userRepo.create(user));
    }

    /**
     * 删除用户
     * @param id 用户ID
     */
    async deleteUser(id: number): Promise<void> {
        await this.findOneById(id);
        this.userRepo.delete(id);
    }

    /**
     * 更新用户
     *
     * @param id 用户ID
     * @param userUpdateInput 用户更新的信息数据
     */
    async updateUser(id: number, userUpdateInput: UserUpdateInput): Promise<void> {
        const exist = await this.findOneById(id);
        this.userRepo.save({ ...exist, ...userUpdateInput });
    }

    /**
     * 通过用户名查找用户
     *
     * @param username 用户名
     */
    async findOneByUsername(username: string): Promise<User> {
        const exist = this.userRepo.findOne(username);
        if (!exist) {
            throw new HttpException('用户名错误', 406);
        }
        return exist;
    }

    /**
     * 通过ID查找用户
     * @param id 用户ID
     */
    async findOneById(id: number): Promise<User> {
        const exist = this.userRepo.findOne(id);
        if (!exist) {
            throw new HttpException('该用户不存在', 404);
        }
        return exist;
    }

    async login(username: string, password: string) {
        // TODO: 查询用户时，同时查询用户所拥有的所有权限
        const user = await this.findOneByUsername(username);
        if (user.password !== await this.cryptoUtil.encryptPassword(password)) {
            throw new HttpException('登录密码错误', 406);
        }
        // TODO: 生成 accessToken 时，需要把权限加密后传入options中
        return this.authService.createToken({ username, options: {} });
    }
}