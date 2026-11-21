export interface Post {
  _id: string;
  id: string;
  body: string;
  image: string;
  privacy: string;
  user: User;
  sharedPost: SharedPost | null;
  likes: any[];
  createdAt: Date;
  commentsCount: number;
  topComment: any;
  sharesCount: number;
  likesCount: number;
  isShare: boolean;
  bookmarked: boolean;
}

export interface SharedPost {
  _id: string;
  id?: string;
  body?: string;
  image?: string;
  createdAt?: Date;
  user: User;
}

export interface User {
  cover: any;
  _id: string;
  name: string;
  username: string;
  photo: string;
}