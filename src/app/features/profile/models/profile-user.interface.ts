export interface ProfileUser {
    _id: string;
    id: string;
    name: string;
    username: string;
    email: string;
    dateOfBirth: string;
    gender: string;
    photo: string;
    cover: string;
    followers: string[];
    following: string[];
    createdAt: string;
    followersCount: number;
    followingCount: number;
    bookmarksCount: number;
  }