import { User } from 'src/auth/models/user.dto';
import { Conversation } from './conversation.interface';

export interface Message {
  id?: number;
  message?: string;
  user?: User;
  conversation: Conversation;
  createdAt?: Date;
}
