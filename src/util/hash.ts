import { MD5 } from './hash/MD5';
import { SHA1 } from './hash/SHA1';
import { SHA256 } from './hash/SHA256';
import { SHA384 } from './hash/SHA384';
import { SHA512 } from './hash/SHA512';

export const md5 = new MD5();
export const sha1 = new SHA1();
export const sha256 = new SHA256();
export const sha384 = new SHA384();
export const sha512 = new SHA512();
