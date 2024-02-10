import { BaseHash } from './BaseHash';

/**
 * Implemented according to: https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.180-4.pdf
 */
export class SHA1 extends BaseHash {
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
    dataView.setBigUint64(paddedMsg.length - 8, BigInt(message.length * 8));

    return paddedMsg.buffer;
  }

  protected override computeHash(paddedMessage: ArrayBuffer): ArrayBuffer {
    const b1 = new Uint32Array(5); // a, b, c, d, e
    const b2 = new Uint32Array([0x67452301, 0xefcdab89, 0x98badcfe, 0x10325476, 0xc3d2e1f0]); // hash
    const seq = new Uint32Array(80); // message schedule
    const dataView = new DataView(paddedMessage);

    for (let i = 0; i < paddedMessage.byteLength / 4; i += 16) {
      for (let t = 0; t < 16; t++) {
        seq[t] = dataView.getUint32(i + t * 4);
      }

      for (let t = 16; t < 80; t++) {
        seq[t] = this.rotl(1, seq[t - 3] ^ seq[t - 8] ^ seq[t - 14] ^ seq[t - 16]);
      }

      b1[0] = b2[0];
      b1[1] = b2[1];
      b1[2] = b2[2];
      b1[3] = b2[3];
      b1[4] = b2[4];

      for (let t = 0; t < 80; t++) {
        const temp = this.rotl(5, b1[0]) + this.lf(t, b1[1], b1[2], b1[3]) + b1[4] + seq[t] + this.cw(t);

        b1[4] = b1[3];
        b1[3] = b1[2];
        b1[2] = this.rotl(30, b1[1]);
        b1[1] = b1[0];
        b1[0] = temp;
      }

      b2[0] += b1[0];
      b2[1] += b1[1];
      b2[2] += b1[2];
      b2[3] += b1[3];
      b2[4] += b1[4];
    }

    return b2.buffer;
  }

  protected override hashToString(hash: ArrayBuffer): string {
    return [...new Uint32Array(hash)].map((w) => w.toString(16).padStart(8, '0')).join('');
  }

  // logical function
  private lf(t: number, x: number, y: number, z: number): number {
    if (t < 20) return this.ch(x, y, z);
    else if (t < 40) return this.parity(x, y, z);
    else if (t < 60) return this.maj(x, y, z);
    else return this.parity(x, y, z);
  }

  // constant words
  private cw(t: number): number {
    if (t < 20) return 0x5a827999;
    else if (t < 40) return 0x6ed9eba1;
    else if (t < 60) return 0x8f1bbcdc;
    else return 0xca62c1d6;
  }
}
