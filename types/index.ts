export interface SignUpRequest {
    name: string;
    email: string;
    password: string;
  }
  
  export interface SignInRequest {
    email: string;
    password: string;
  }
  
  export interface User {
    id: number;
    name: string;
    email: string;
    password: string;
    createdAt: Date;
    updatedAt: Date;
  }
  