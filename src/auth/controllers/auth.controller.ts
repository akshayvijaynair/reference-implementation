import {Controller, Post, Body, HttpException, HttpStatus, HttpCode} from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { User } from '../models/user.dto';
import { Actor } from '../models/account.response.dto';
import * as crypto from 'crypto';
import {Observable} from "rxjs";
import {map} from "rxjs/operators";
import {ActorType} from "../models/accounts.entity";
import {LoginDto} from "../models/login.dto";

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() userDto: User): Promise<any> {
    // Create user in the 'users' table with basic registration information
    const user = await this.authService.createUser(userDto);

    // Generate RSA key pair
    const { publicKey, privateKey } = await this.generateKeyPair();

    // Create Actor and Webfinger data
    const actorRecord = this.createActor(userDto.userName, process.env.DOMAIN, publicKey);

    // Save the Actor record and keys to the 'accounts' table
    await this.authService.createAccount(
        this.createActor(userDto.userName, process.env.DOMAIN, publicKey),
        privateKey
    );

    return actorRecord;
  }

  private async generateKeyPair() {
    return new Promise<{ publicKey: string; privateKey: string }>((resolve, reject) => {
      crypto.generateKeyPair(
          'rsa',
          {
            modulusLength: 4096,
            publicKeyEncoding: { type: 'spki', format: 'pem' },
            privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
          },
          (err, publicKey, privateKey) => {
            if (err) {
              reject(new HttpException('Error generating keys', HttpStatus.INTERNAL_SERVER_ERROR));
            } else {
              resolve({ publicKey, privateKey });
            }
          }
      );
    });
  }

  // Helper Methods for Actor and Webfinger Creation
  private createActor(name: string, domain: string, pubkey: string): Actor {
    return {
      '@context': [
        'https://www.w3.org/ns/activitystreams',
        'https://w3id.org/security/v1',
      ],
      id: `https://${domain}/u/${name}`, // Corrected to use backticks
      type: 'Person' as ActorType,
      name: name,
      inbox: `https://${domain}/u/${name}/inbox`,
      outbox: `https://${domain}/u/${name}/outbox`,
      followers: `https://${domain}/u/${name}/followers`,
      following: `https://${domain}/u/${name}/following`,
      liked: `https://${domain}/u/${name}/liked`,
      summary: '', // Placeholder or custom summary
      publicKey: {
        id: `https://${domain}/u/${name}#main-key`,
        owner: `https://${domain}/u/${name}`,
        publicKeyPem: pubkey,
      },
      icon: {
        type: 'Image',
        mediaType: 'image/png',
        url: `https://${domain}/u/${name}/icon.png`, // Corrected to use backticks
      },
      endpoints: {
        sharedInbox: `https://${domain}/api/sharedInbox`, // Corrected to use backticks
      },
      webfinger: this.createWebfinger(name, domain),
    };
  }

  private createWebfinger(name: string, domain: string) {
    return {
      subject: `acct:${name}@${domain}`,
      links: [
        {
          rel: 'self',
          type: 'application/activity+json',
          href: `https://${domain}/u/${name}`,
        },
      ],
    };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() login: LoginDto): Observable<{ token: string }> {
    return this.authService
        .login(login)
        .pipe(map((jwt: string) => ({ token: jwt })));
  }
}
