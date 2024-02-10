import { BaseHash } from './BaseHash';

/**
 * Implemented according to: https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.180-4.pdf
 */
export class SHA256 extends BaseHash {
  // SHA-256 constants
  private static k = new Uint32Array([
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5, 0xd807aa98,
    0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786,
    0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da, 0x983e5152, 0xa831c66d, 0xb00327c8,
    0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
    0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819,
    0xd6990624, 0xf40e3585, 0x106aa070, 0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a,
    0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7,
    0xc67178f2,
  ]);

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
    const b1 = new Uint32Array(8); // a, b, c, d, e
    const b2 = new Uint32Array([
      0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19,
    ]); // hash
    const seq = new Uint32Array(64); // message schedule
    const dataView = new DataView(paddedMessage);

    for (let i = 0; i < paddedMessage.byteLength / 4; i += 16) {
      for (let t = 0; t < 16; t++) {
        seq[t] = dataView.getUint32(i + t * 4);
      }

      for (let t = 16; t < 64; t++) {
        seq[t] = this.smallSigma1(seq[t - 2]) + seq[t - 7] + this.smallSigma0(seq[t - 15]) + seq[t - 16];
      }

      b1[0] = b2[0];
      b1[1] = b2[1];
      b1[2] = b2[2];
      b1[3] = b2[3];
      b1[4] = b2[4];
      b1[5] = b2[5];
      b1[6] = b2[6];
      b1[7] = b2[7];

      for (let t = 0; t < 64; t++) {
        const temp1 = b1[7] + this.bigSigma1(b1[4]) + this.ch(b1[4], b1[5], b1[6]) + SHA256.k[t] + seq[t];
        const temp2 = this.bigSigma0(b1[0]) + this.maj(b1[0], b1[1], b1[2]);

        b1[7] = b1[6];
        b1[6] = b1[5];
        b1[5] = b1[4];
        b1[4] = b1[3] + temp1;
        b1[3] = b1[2];
        b1[2] = b1[1];
        b1[1] = b1[0];
        b1[0] = temp1 + temp2;
      }

      b2[0] += b1[0];
      b2[1] += b1[1];
      b2[2] += b1[2];
      b2[3] += b1[3];
      b2[4] += b1[4];
      b2[5] += b1[5];
      b2[6] += b1[6];
      b2[7] += b1[7];
    }

    return b2.buffer;
  }

  protected override hashToString(hash: ArrayBuffer): string {
    return [...new Uint32Array(hash)].map((w) => w.toString(16).padStart(8, '0')).join('');
  }
}
