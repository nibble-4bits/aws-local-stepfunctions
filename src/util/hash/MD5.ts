import { BaseHashAlgorithm } from './BaseHash';

/**
 * Implemented according to: https://datatracker.ietf.org/doc/html/rfc1321
 */
export class MD5 extends BaseHashAlgorithm {
  protected override padMessage(message: Uint8Array): ArrayBuffer {
    const msgLenMod64 = message.length % 64;
    let bytesToAdd = 64 - msgLenMod64;
    if (msgLenMod64 >= 56) {
      bytesToAdd += 64;
    }

    const padding = new Uint8Array(bytesToAdd);
    const paddedMsg = new Uint8Array([...message, ...padding]);
    const dataView = new DataView(paddedMsg.buffer);

    dataView.setUint8(message.length, 0x80);
    dataView.setBigUint64(paddedMsg.length - 8, BigInt(message.length * 8), true);

    return paddedMsg.buffer;
  }

  protected override computeHash(paddedMessage: ArrayBuffer): ArrayBuffer {
    const b1 = new Uint32Array(4); // a, b, c, d
    const b2 = new Uint32Array([0x67452301, 0xefcdab89, 0x98badcfe, 0x10325476]); // hash
    const seq = new Uint32Array(16);
    const table = new Uint32Array([
      0xd76aa478, 0xe8c7b756, 0x242070db, 0xc1bdceee, 0xf57c0faf, 0x4787c62a, 0xa8304613, 0xfd469501, 0x698098d8,
      0x8b44f7af, 0xffff5bb1, 0x895cd7be, 0x6b901122, 0xfd987193, 0xa679438e, 0x49b40821, 0xf61e2562, 0xc040b340,
      0x265e5a51, 0xe9b6c7aa, 0xd62f105d, 0x2441453, 0xd8a1e681, 0xe7d3fbc8, 0x21e1cde6, 0xc33707d6, 0xf4d50d87,
      0x455a14ed, 0xa9e3e905, 0xfcefa3f8, 0x676f02d9, 0x8d2a4c8a, 0xfffa3942, 0x8771f681, 0x6d9d6122, 0xfde5380c,
      0xa4beea44, 0x4bdecfa9, 0xf6bb4b60, 0xbebfbc70, 0x289b7ec6, 0xeaa127fa, 0xd4ef3085, 0x4881d05, 0xd9d4d039,
      0xe6db99e5, 0x1fa27cf8, 0xc4ac5665, 0xf4292244, 0x432aff97, 0xab9423a7, 0xfc93a039, 0x655b59c3, 0x8f0ccc92,
      0xffeff47d, 0x85845dd1, 0x6fa87e4f, 0xfe2ce6e0, 0xa3014314, 0x4e0811a1, 0xf7537e82, 0xbd3af235, 0x2ad7d2bb,
      0xeb86d391,
    ]);
    const dataView = new DataView(paddedMessage);

    for (let i = 0; i < paddedMessage.byteLength / 4; i += 16) {
      for (let t = 0; t < 16; t++) {
        seq[t] = dataView.getUint32(i + t * 4, true);
      }

      b1[0] = b2[0];
      b1[1] = b2[1];
      b1[2] = b2[2];
      b1[3] = b2[3];

      // Round 1
      //  [ABCD  0  7  1]  [DABC  1 12  2]  [CDAB  2 17  3]  [BCDA  3 22  4]
      b1[0] = b1[1] + this.rotl(7, b1[0] + this.F(b1[1], b1[2], b1[3]) + seq[0] + table[0]);
      b1[3] = b1[0] + this.rotl(12, b1[3] + this.F(b1[0], b1[1], b1[2]) + seq[1] + table[1]);
      b1[2] = b1[3] + this.rotl(17, b1[2] + this.F(b1[3], b1[0], b1[1]) + seq[2] + table[2]);
      b1[1] = b1[2] + this.rotl(22, b1[1] + this.F(b1[2], b1[3], b1[0]) + seq[3] + table[3]);
      //  [ABCD  4  7  5]  [DABC  5 12  6]  [CDAB  6 17  7]  [BCDA  7 22  8]
      b1[0] = b1[1] + this.rotl(7, b1[0] + this.F(b1[1], b1[2], b1[3]) + seq[4] + table[4]);
      b1[3] = b1[0] + this.rotl(12, b1[3] + this.F(b1[0], b1[1], b1[2]) + seq[5] + table[5]);
      b1[2] = b1[3] + this.rotl(17, b1[2] + this.F(b1[3], b1[0], b1[1]) + seq[6] + table[6]);
      b1[1] = b1[2] + this.rotl(22, b1[1] + this.F(b1[2], b1[3], b1[0]) + seq[7] + table[7]);
      //  [ABCD  8  7  9]  [DABC  9 12 10]  [CDAB 10 17 11]  [BCDA 11 22 12]
      b1[0] = b1[1] + this.rotl(7, b1[0] + this.F(b1[1], b1[2], b1[3]) + seq[8] + table[8]);
      b1[3] = b1[0] + this.rotl(12, b1[3] + this.F(b1[0], b1[1], b1[2]) + seq[9] + table[9]);
      b1[2] = b1[3] + this.rotl(17, b1[2] + this.F(b1[3], b1[0], b1[1]) + seq[10] + table[10]);
      b1[1] = b1[2] + this.rotl(22, b1[1] + this.F(b1[2], b1[3], b1[0]) + seq[11] + table[11]);
      //  [ABCD 12  7 13]  [DABC 13 12 14]  [CDAB 14 17 15]  [BCDA 15 22 16]
      b1[0] = b1[1] + this.rotl(7, b1[0] + this.F(b1[1], b1[2], b1[3]) + seq[12] + table[12]);
      b1[3] = b1[0] + this.rotl(12, b1[3] + this.F(b1[0], b1[1], b1[2]) + seq[13] + table[13]);
      b1[2] = b1[3] + this.rotl(17, b1[2] + this.F(b1[3], b1[0], b1[1]) + seq[14] + table[14]);
      b1[1] = b1[2] + this.rotl(22, b1[1] + this.F(b1[2], b1[3], b1[0]) + seq[15] + table[15]);

      // Round 2
      //  [ABCD  1  5 17]  [DABC  6  9 18]  [CDAB 11 14 19]  [BCDA  0 20 20]
      b1[0] = b1[1] + this.rotl(5, b1[0] + this.G(b1[1], b1[2], b1[3]) + seq[1] + table[16]);
      b1[3] = b1[0] + this.rotl(9, b1[3] + this.G(b1[0], b1[1], b1[2]) + seq[6] + table[17]);
      b1[2] = b1[3] + this.rotl(14, b1[2] + this.G(b1[3], b1[0], b1[1]) + seq[11] + table[18]);
      b1[1] = b1[2] + this.rotl(20, b1[1] + this.G(b1[2], b1[3], b1[0]) + seq[0] + table[19]);
      //  [ABCD  5  5 21]  [DABC 10  9 22]  [CDAB 15 14 23]  [BCDA  4 20 24]
      b1[0] = b1[1] + this.rotl(5, b1[0] + this.G(b1[1], b1[2], b1[3]) + seq[5] + table[20]);
      b1[3] = b1[0] + this.rotl(9, b1[3] + this.G(b1[0], b1[1], b1[2]) + seq[10] + table[21]);
      b1[2] = b1[3] + this.rotl(14, b1[2] + this.G(b1[3], b1[0], b1[1]) + seq[15] + table[22]);
      b1[1] = b1[2] + this.rotl(20, b1[1] + this.G(b1[2], b1[3], b1[0]) + seq[4] + table[23]);
      //  [ABCD  9  5 25]  [DABC 14  9 26]  [CDAB  3 14 27]  [BCDA  8 20 28]
      b1[0] = b1[1] + this.rotl(5, b1[0] + this.G(b1[1], b1[2], b1[3]) + seq[9] + table[24]);
      b1[3] = b1[0] + this.rotl(9, b1[3] + this.G(b1[0], b1[1], b1[2]) + seq[14] + table[25]);
      b1[2] = b1[3] + this.rotl(14, b1[2] + this.G(b1[3], b1[0], b1[1]) + seq[3] + table[26]);
      b1[1] = b1[2] + this.rotl(20, b1[1] + this.G(b1[2], b1[3], b1[0]) + seq[8] + table[27]);
      //  [ABCD 13  5 29]  [DABC  2  9 30]  [CDAB  7 14 31]  [BCDA 12 20 32]
      b1[0] = b1[1] + this.rotl(5, b1[0] + this.G(b1[1], b1[2], b1[3]) + seq[13] + table[28]);
      b1[3] = b1[0] + this.rotl(9, b1[3] + this.G(b1[0], b1[1], b1[2]) + seq[2] + table[29]);
      b1[2] = b1[3] + this.rotl(14, b1[2] + this.G(b1[3], b1[0], b1[1]) + seq[7] + table[30]);
      b1[1] = b1[2] + this.rotl(20, b1[1] + this.G(b1[2], b1[3], b1[0]) + seq[12] + table[31]);

      // Round 3
      //  [ABCD  5  4 33]  [DABC  8 11 34]  [CDAB 11 16 35]  [BCDA 14 23 36]
      b1[0] = b1[1] + this.rotl(4, b1[0] + this.H(b1[1], b1[2], b1[3]) + seq[5] + table[32]);
      b1[3] = b1[0] + this.rotl(11, b1[3] + this.H(b1[0], b1[1], b1[2]) + seq[8] + table[33]);
      b1[2] = b1[3] + this.rotl(16, b1[2] + this.H(b1[3], b1[0], b1[1]) + seq[11] + table[34]);
      b1[1] = b1[2] + this.rotl(23, b1[1] + this.H(b1[2], b1[3], b1[0]) + seq[14] + table[35]);
      //  [ABCD  1  4 37]  [DABC  4 11 38]  [CDAB  7 16 39]  [BCDA 10 23 40]
      b1[0] = b1[1] + this.rotl(4, b1[0] + this.H(b1[1], b1[2], b1[3]) + seq[1] + table[36]);
      b1[3] = b1[0] + this.rotl(11, b1[3] + this.H(b1[0], b1[1], b1[2]) + seq[4] + table[37]);
      b1[2] = b1[3] + this.rotl(16, b1[2] + this.H(b1[3], b1[0], b1[1]) + seq[7] + table[38]);
      b1[1] = b1[2] + this.rotl(23, b1[1] + this.H(b1[2], b1[3], b1[0]) + seq[10] + table[39]);
      //  [ABCD 13  4 41]  [DABC  0 11 42]  [CDAB  3 16 43]  [BCDA  6 23 44]
      b1[0] = b1[1] + this.rotl(4, b1[0] + this.H(b1[1], b1[2], b1[3]) + seq[13] + table[40]);
      b1[3] = b1[0] + this.rotl(11, b1[3] + this.H(b1[0], b1[1], b1[2]) + seq[0] + table[41]);
      b1[2] = b1[3] + this.rotl(16, b1[2] + this.H(b1[3], b1[0], b1[1]) + seq[3] + table[42]);
      b1[1] = b1[2] + this.rotl(23, b1[1] + this.H(b1[2], b1[3], b1[0]) + seq[6] + table[43]);
      //  [ABCD  9  4 45]  [DABC 12 11 46]  [CDAB 15 16 47]  [BCDA  2 23 48]
      b1[0] = b1[1] + this.rotl(4, b1[0] + this.H(b1[1], b1[2], b1[3]) + seq[9] + table[44]);
      b1[3] = b1[0] + this.rotl(11, b1[3] + this.H(b1[0], b1[1], b1[2]) + seq[12] + table[45]);
      b1[2] = b1[3] + this.rotl(16, b1[2] + this.H(b1[3], b1[0], b1[1]) + seq[15] + table[46]);
      b1[1] = b1[2] + this.rotl(23, b1[1] + this.H(b1[2], b1[3], b1[0]) + seq[2] + table[47]);

      // Round 4
      //  [ABCD  0  6 49]  [DABC  7 10 50]  [CDAB 14 15 51]  [BCDA  5 21 52]
      b1[0] = b1[1] + this.rotl(6, b1[0] + this.I(b1[1], b1[2], b1[3]) + seq[0] + table[48]);
      b1[3] = b1[0] + this.rotl(10, b1[3] + this.I(b1[0], b1[1], b1[2]) + seq[7] + table[49]);
      b1[2] = b1[3] + this.rotl(15, b1[2] + this.I(b1[3], b1[0], b1[1]) + seq[14] + table[50]);
      b1[1] = b1[2] + this.rotl(21, b1[1] + this.I(b1[2], b1[3], b1[0]) + seq[5] + table[51]);
      //  [ABCD 12  6 53]  [DABC  3 10 54]  [CDAB 10 15 55]  [BCDA  1 21 56]
      b1[0] = b1[1] + this.rotl(6, b1[0] + this.I(b1[1], b1[2], b1[3]) + seq[12] + table[52]);
      b1[3] = b1[0] + this.rotl(10, b1[3] + this.I(b1[0], b1[1], b1[2]) + seq[3] + table[53]);
      b1[2] = b1[3] + this.rotl(15, b1[2] + this.I(b1[3], b1[0], b1[1]) + seq[10] + table[54]);
      b1[1] = b1[2] + this.rotl(21, b1[1] + this.I(b1[2], b1[3], b1[0]) + seq[1] + table[55]);
      //  [ABCD  8  6 57]  [DABC 15 10 58]  [CDAB  6 15 59]  [BCDA 13 21 60]
      b1[0] = b1[1] + this.rotl(6, b1[0] + this.I(b1[1], b1[2], b1[3]) + seq[8] + table[56]);
      b1[3] = b1[0] + this.rotl(10, b1[3] + this.I(b1[0], b1[1], b1[2]) + seq[15] + table[57]);
      b1[2] = b1[3] + this.rotl(15, b1[2] + this.I(b1[3], b1[0], b1[1]) + seq[6] + table[58]);
      b1[1] = b1[2] + this.rotl(21, b1[1] + this.I(b1[2], b1[3], b1[0]) + seq[13] + table[59]);
      //  [ABCD  4  6 61]  [DABC 11 10 62]  [CDAB  2 15 63]  [BCDA  9 21 64]
      b1[0] = b1[1] + this.rotl(6, b1[0] + this.I(b1[1], b1[2], b1[3]) + seq[4] + table[60]);
      b1[3] = b1[0] + this.rotl(10, b1[3] + this.I(b1[0], b1[1], b1[2]) + seq[11] + table[61]);
      b1[2] = b1[3] + this.rotl(15, b1[2] + this.I(b1[3], b1[0], b1[1]) + seq[2] + table[62]);
      b1[1] = b1[2] + this.rotl(21, b1[1] + this.I(b1[2], b1[3], b1[0]) + seq[9] + table[63]);

      b2[0] += b1[0];
      b2[1] += b1[1];
      b2[2] += b1[2];
      b2[3] += b1[3];
    }

    return b2.buffer;
  }

  protected override hashToString(hash: ArrayBuffer): string {
    const dataView = new DataView(hash);

    dataView.setUint32(0, dataView.getUint32(0), true);
    dataView.setUint32(4, dataView.getUint32(4), true);
    dataView.setUint32(8, dataView.getUint32(8), true);
    dataView.setUint32(12, dataView.getUint32(12), true);

    return [...new Uint32Array(hash)].map((w) => w.toString(16).padStart(8, '0')).join('');
  }

  private F(x: number, y: number, z: number) {
    return this.ch(x, y, z);
  }

  private G(x: number, y: number, z: number) {
    return this.ch(z, x, y);
  }

  private H(x: number, y: number, z: number) {
    return this.parity(x, y, z);
  }

  private I(x: number, y: number, z: number) {
    return y ^ (x | ~z);
  }
}
