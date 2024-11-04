import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { from, Observable, of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import {FindOneOptions, Repository} from 'typeorm';
import { UserEntity } from '../models/user.entity';
import { User } from '../models/user.class'; //userDTO
import { Actor } from '../models/actor.class'; //actorDTO
import {AccountEntity} from "../models/accounts.entity";

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,
        @InjectRepository(AccountEntity)
        private readonly accountRepository: Repository<AccountEntity>,
        private jwtService: JwtService,
    ) {
    }

    async createUser(userDto: User): Promise<UserEntity> {
        const existingUser = await this.userRepository.findOne({ email: userDto.email });
        if (existingUser) {
            throw new HttpException('User already exists', HttpStatus.BAD_REQUEST);
        }

        const hashedPassword = await bcrypt.hash(userDto.password, 12);
        const user = this.userRepository.create({
            ...userDto,
            password: hashedPassword,
        });

        return this.userRepository.save(user);
    }

    async createAccount(actorDto: Actor & { privateKey: string }) {
        const account = this.accountRepository.create({
            name: actorDto.preferredUsername,
            actor: JSON.stringify(actorDto), // Storing actor as JSON string
            pubkey: actorDto.publicKey.publicKeyPem,
            privkey: actorDto.privateKey,
            webfinger: JSON.stringify(actorDto.webfinger),
            summary: actorDto.summary,
            icon: JSON.stringify(actorDto.icon), // Store icon as JSON if including media metadata
            followers: actorDto.followers,
            following: actorDto.following,
            liked: actorDto.liked,
            endpoints: JSON.stringify(actorDto.endpoints),
        });

        return this.accountRepository.save(account);
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

    login(user: User): Observable<string> {
        const {email, password} = user;
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
