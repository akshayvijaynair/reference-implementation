import {IsEnum, IsJSON, IsOptional, IsString, IsUrl} from "class-validator";
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

    @IsUrl()
    following: string;

    @IsUrl()
    followers: string;

    @IsString()
    name: string;

    @IsOptional()
    @IsUrl()
    liked?: string;

    @IsOptional()
    @IsString()
    summary?: string;

    @IsJSON()
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

    @IsJSON()
    webfinger: {
        subject: string;
        links: { rel: string; type: string; href: string }[];
    };

    @IsOptional()
    @IsUrl()
    streams?: string;

    @IsOptional()
    @IsUrl()
    url?: string;

    @IsOptional()
    nameMap?: { [language: string]: string };

    @IsOptional()
    summaryMap?: { [language: string]: string };

}
