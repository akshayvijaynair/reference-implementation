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

    @Column('text')
    actor: string; // JSON string of the Actor data

    @Column('text')
    pubkey: string;

    @Column('text')
    privkey: string;

    @Column('text')
    webfinger: string;

    @Column('text', { nullable: true })
    summary?: string;

    @Column('text', { nullable: true })
    icon?: string; // JSON string if storing additional icon metadata

    @Column('text', { nullable: true })
    followers?: string;

    @Column('text', { nullable: true })
    following?: string;

    @Column('text', { nullable: true })
    liked?: string;

    @Column('text', { nullable: true })
    endpoints?: string; // JSON string of endpoints, e.g., shared inbox
}
