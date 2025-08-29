import { hash, compare } from "bcrypt-ts";

export const hashPassword = async (password: string) => {
  return await hash(password, 11);
};

export const verifyPassword = async (password: string, hashValue: string) => {
  return await compare(password, hashValue);
};
