import { User } from 'src/auth/models/user.dto';

export interface Conversation {
  id?: number;
  users?: User[];
  lastUpdated?: Date;
}
