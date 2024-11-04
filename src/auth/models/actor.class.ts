import {IsOptional, IsString} from "class-validator";

export class Actor {
    '@context': string[];
    id: string;
    type: string = "Person";
    @IsString()
    preferredUsername: string;
    @IsString()
    inbox: string;
    @IsString()
    outbox: string;
    @IsString()
    @IsOptional()
    followers: string;
    @IsString()
    @IsOptional()
    following: string;
    @IsString()
    @IsOptional()
    liked?: string; // URL for the user's "liked" collection
    @IsString()
    @IsOptional()
    summary?: string; // A short bio or summary for the actor
    publicKey: {
        id: string;
        owner: string;
        publicKeyPem: string;
    };
    @IsOptional()
    icon?: {
        type: string;
        mediaType: string;
        url: string;
    };
    @IsOptional()
    endpoints?: {
        sharedInbox: string; // A shared inbox endpoint for the user
    };
    webfinger: {
        subject: string;
        links: { rel: string; type: string; href: string }[];
    };
}
