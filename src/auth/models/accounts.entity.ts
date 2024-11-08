import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

// Define supported Actor types
export enum ActorType {
    Application = 'Application',
    Group = 'Group',
    Organization = 'Organization',
    Person = 'Person',
    Service = 'Service',
}

@Entity('accounts')
export class AccountEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    name: string;

    @Column({
        type: 'enum',
        enum: ActorType,
        default: ActorType.Person,
    })
    type: string;

    @Column('text', { nullable: true })
    summary?: string;

    @Column('jsonb', { nullable: true })
    icon?: { type: string; mediaType: string; url: string };

    @Column('text', { nullable: true })
    followers?: string;

    @Column('text', { nullable: true })
    following?: string;

    @Column('text', { nullable: true })
    liked?: string;

    @Column('jsonb', { nullable: true })
    endpoints?: {
        proxyUrl?: string;
        oauthAuthorizationEndpoint?: string;
        oauthTokenEndpoint?: string;
        provideClientKey?: string;
        signClientKey?: string;
        sharedInbox?: string;
    };

    @Column('jsonb')
    webfinger: {
        subject: string;
        links: { rel: string; type: string; href: string }[];
    };

    @Column('jsonb' ,{ nullable: true })
    publicKey: {
        id: string;
        owner: string;
        publicKeyPem: string;
    };

    @Column('text')
    privkey: string;
}
