import {IsEnum, IsOptional, IsString, IsUrl} from "class-validator";
import {ActorType} from "./accounts.entity";

export class Actor {
    '@context': string[];

    @IsEnum(ActorType)
    type: ActorType;

    @IsUrl()
    id: string;

    @IsUrl()
    inbox: string;

    @IsUrl()
    outbox: string;

    @IsOptional()
    @IsUrl()
    following?: string;

    @IsOptional()
    @IsUrl()
    followers?: string;

    @IsOptional()
    @IsString()
    preferredUsername?: string;

    @IsOptional()
    @IsUrl()
    liked?: string;

    @IsOptional()
    @IsString()
    summary?: string;

    publicKey: {
        id: string;
        owner: string;
        publicKeyPem: string;
    };

    @IsOptional()
    icon?: { type: string; mediaType: string; url: string };

    @IsOptional()
    endpoints?: {
        proxyUrl?: string;
        oauthAuthorizationEndpoint?: string;
        oauthTokenEndpoint?: string;
        provideClientKey?: string;
        signClientKey?: string;
        sharedInbox?: string;
    };

    webfinger: {
        subject: string;
        links: { rel: string; type: string; href: string }[];
    };


    @IsOptional()
    @IsUrl()
    streams?: string;

    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsUrl()
    url?: string;

    @IsOptional()
    nameMap?: { [language: string]: string };

    @IsOptional()
    summaryMap?: { [language: string]: string };

}
