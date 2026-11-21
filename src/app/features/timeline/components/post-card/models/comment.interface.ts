export interface Comment {
    _id:          string;
    image:        string;
    content : string ;
    commentCreator: CommentCreator;
    post:         string;
    parentComment: null | string; 
    likes:        any[];
    createdAt:    Date;
    repliesCount: number;
  }
  
  export interface CommentCreator {
    _id:      string;
    name:     string;
    username: string;
    photo:    string;
  }