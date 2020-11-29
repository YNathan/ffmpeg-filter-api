import * as bcrypt from "bcrypt";

export class BcryptSupport {
  public static generate(plainText: string, saltRounds = 2): Promise<string> {
    return bcrypt.hash(plainText, saltRounds);
  }

  public static compare(plainText: any, hash: any): boolean {
    return bcrypt.compare(plainText, hash);
  }
}
