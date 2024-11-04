import {Controller, Post, Body, HttpException, HttpStatus, HttpCode} from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { User } from '../models/user.class';
import { Actor } from '../models/actor.class';
import * as crypto from 'crypto';
import {Observable} from "rxjs";
import {map} from "rxjs/operators";

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
    const actorRecord = this.createActor(userDto.email, process.env.DOMAIN, publicKey);
    const webfingerRecord = this.createWebfinger(userDto.email, process.env.DOMAIN);

    // Save the Actor record and keys to the 'accounts' table
    await this.authService.createAccount({
      ...actorRecord,
      webfinger: webfingerRecord,
      privateKey
    });

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

  private createActor(name: string, domain: string, pubkey: string): Actor {
    return {
      '@context': [
        'https://www.w3.org/ns/activitystreams',
        'https://w3id.org/security/v1'
      ],
      id: `https://${domain}/u/${name}`,
      type: 'Person',
      preferredUsername: name,
      inbox: `https://${domain}/api/inbox`,
      outbox: `https://${domain}/u/${name}/outbox`,
      followers: `https://${domain}/u/${name}/followers`,
      following: `https://${domain}/u/${name}/following`,
      liked: `https://${domain}/u/${name}/liked`, // URL for liked collection
      summary: '', // Placeholder or custom summary
      publicKey: {
        id: `https://${domain}/u/${name}#main-key`,
        owner: `https://${domain}/u/${name}`,
        publicKeyPem: pubkey,
      },
      icon: {
        type: 'Image',
        mediaType: 'image/png',
        url: `https://${domain}/u/${name}/icon.png`, // Placeholder for the user’s icon URL
      },
      endpoints: {
        sharedInbox: `https://${domain}/api/sharedInbox`, // Shared inbox endpoint
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
        }
      ]
    };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() user: User): Observable<{ token: string }> {
    return this.authService
        .login(user)
        .pipe(map((jwt: string) => ({ token: jwt })));
  }
}
