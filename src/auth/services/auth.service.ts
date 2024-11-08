import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { from, Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import {DeepPartial, FindOneOptions, Repository} from 'typeorm';
import { UserEntity } from '../models/user.entity';
import { User } from '../models/user.dto'; //userDTO
import { Actor } from '../models/account.response.dto'; //actorDTO
import {AccountEntity} from "../models/accounts.entity";
import {LoginDto} from "../models/login.dto";

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,
        @InjectRepository(AccountEntity)
        private readonly accountRepository: Repository<AccountEntity>,
        private jwtService: JwtService,
    ) {}

    async createUser(userDto: User): Promise<UserEntity> {
        try {
            const checkUserName = await this.userRepository.findOne({ userName: userDto.userName });

            if (checkUserName) {
                throw new HttpException('Account already exists', HttpStatus.BAD_REQUEST);
            }

            const hashedPassword = await bcrypt.hash(userDto.password, 12);
            const user = this.userRepository.create({
                ...userDto,
                password: hashedPassword,
            });

            return await this.userRepository.save(user);
        } catch (error) {
            throw new HttpException('Failed to create user', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async createAccount(actorDto: Actor , privateKey: string) {

        try {
            const account = this.accountRepository.create({
                name: actorDto.name,
                type: actorDto.type,
                pubkey: actorDto.publicKey,
                privkey: privateKey,
                webfinger: actorDto.webfinger,
                summary: actorDto.summary,
                icon: actorDto.icon,
                followers: actorDto.followers,
                following: actorDto.following,
                liked: actorDto.liked,
                endpoints: actorDto.endpoints,
            }as DeepPartial<AccountEntity>);

            return await this.accountRepository.save(account);
        } catch (error) {
            throw new HttpException('Failed to create account', error);
        }
    }

    validateUser(email: string, password: string): Observable<User> {
        const findOptions: FindOneOptions<UserEntity> = {
            where: { email },
            select: ['id', 'firstName', 'lastName', 'email', 'password'],
        };
        return from(this.userRepository.findOne(findOptions)).pipe(
            switchMap((user: UserEntity) => {
                if (!user) {
                    throw new HttpException(
                        { status: HttpStatus.FORBIDDEN, error: 'Invalid Credentials' },
                        HttpStatus.FORBIDDEN,
                    );
                }
                return from(bcrypt.compare(password, user.password)).pipe(
                    map((isValidPassword: boolean) => {
                        if (isValidPassword) {
                            delete user.password;
                            return user;
                        }
                    }),
                );
            }),
        );
    }

    login(login: LoginDto): Observable<string> {
        const {email, password} = login;
        return this.validateUser(email, password).pipe(
            switchMap((user: User) => {
                if (user) {
                    // create JWT - credentials
                    return from(this.jwtService.signAsync({user}));
                }
            }),
        );
    }

    getJwtUser(jwt: string): Observable<User | null> {
        return from(this.jwtService.verifyAsync(jwt)).pipe(
            map(({user}: { user: User }) => {
                return user;
            }),
            catchError(() => {
                return of(null);
            }),
        );
    }
}
