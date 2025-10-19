export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  phone: string;
}
export interface LoginPayload {
  email: string;
  password: string;
}
