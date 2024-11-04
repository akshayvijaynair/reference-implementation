import {Column, Entity, ManyToMany, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {FeedPostEntity} from "../../feed/models/post.entity";
import {FriendRequestEntity} from "./friend-request.entity";
import {ConversationEntity} from "../../chat/models/conversation.entity";
import {MessageEntity} from "../../chat/models/message.entity";

@Entity('account')
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: string; // Updated to string to support URI format

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  password: string;

  @Column({ nullable: true })
  imagePath: string;

/*  @OneToMany(() => FeedPostEntity, (feedPostEntity) => feedPostEntity.author)
  feedPosts: FeedPostEntity[];

  @OneToMany(() => FriendRequestEntity, (friendRequestEntity) => friendRequestEntity.creator)
  sentFriendRequests: FriendRequestEntity[];

  @OneToMany(() => FriendRequestEntity, (friendRequestEntity) => friendRequestEntity.receiver)
  receivedFriendRequests: FriendRequestEntity[];

  @ManyToMany(() => ConversationEntity, (conversationEntity) => conversationEntity.users)
  conversations: ConversationEntity[];

  @OneToMany(() => MessageEntity, (messageEntity) => messageEntity.user)
  messages: MessageEntity[];*/
}