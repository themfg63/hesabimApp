export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

// Register için yeni interface'ler
export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  passwordConfirm?: string;
}

export interface RegisterResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}