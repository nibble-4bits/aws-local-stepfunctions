import { BaseHash } from './BaseHash';

/**
 * Implemented according to: https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.180-4.pdf
 */
export class SHA512 extends BaseHash {
  // SHA-512 constants
  private static k = new BigUint64Array([
    0x428a2f98d728ae22n,
    0x7137449123ef65cdn,
    0xb5c0fbcfec4d3b2fn,
    0xe9b5dba58189dbbcn,
    0x3956c25bf348b538n,
    0x59f111f1b605d019n,
    0x923f82a4af194f9bn,
    0xab1c5ed5da6d8118n,
    0xd807aa98a3030242n,
    0x12835b0145706fben,
    0x243185be4ee4b28cn,
    0x550c7dc3d5ffb4e2n,
    0x72be5d74f27b896fn,
    0x80deb1fe3b1696b1n,
    0x9bdc06a725c71235n,
    0xc19bf174cf692694n,
    0xe49b69c19ef14ad2n,
    0xefbe4786384f25e3n,
    0x0fc19dc68b8cd5b5n,
    0x240ca1cc77ac9c65n,
    0x2de92c6f592b0275n,
    0x4a7484aa6ea6e483n,
    0x5cb0a9dcbd41fbd4n,
    0x76f988da831153b5n,
    0x983e5152ee66dfabn,
    0xa831c66d2db43210n,
    0xb00327c898fb213fn,
    0xbf597fc7beef0ee4n,
    0xc6e00bf33da88fc2n,
    0xd5a79147930aa725n,
    0x06ca6351e003826fn,
    0x142929670a0e6e70n,
    0x27b70a8546d22ffcn,
    0x2e1b21385c26c926n,
    0x4d2c6dfc5ac42aedn,
    0x53380d139d95b3dfn,
    0x650a73548baf63den,
    0x766a0abb3c77b2a8n,
    0x81c2c92e47edaee6n,
    0x92722c851482353bn,
    0xa2bfe8a14cf10364n,
    0xa81a664bbc423001n,
    0xc24b8b70d0f89791n,
    0xc76c51a30654be30n,
    0xd192e819d6ef5218n,
    0xd69906245565a910n,
    0xf40e35855771202an,
    0x106aa07032bbd1b8n,
    0x19a4c116b8d2d0c8n,
    0x1e376c085141ab53n,
    0x2748774cdf8eeb99n,
    0x34b0bcb5e19b48a8n,
    0x391c0cb3c5c95a63n,
    0x4ed8aa4ae3418acbn,
    0x5b9cca4f7763e373n,
    0x682e6ff3d6b2b8a3n,
    0x748f82ee5defb2fcn,
    0x78a5636f43172f60n,
    0x84c87814a1f0ab72n,
    0x8cc702081a6439ecn,
    0x90befffa23631e28n,
    0xa4506cebde82bde9n,
    0xbef9a3f7b2c67915n,
    0xc67178f2e372532bn,
    0xca273eceea26619cn,
    0xd186b8c721c0c207n,
    0xeada7dd6cde0eb1en,
    0xf57d4f7fee6ed178n,
    0x06f067aa72176fban,
    0x0a637dc5a2c898a6n,
    0x113f9804bef90daen,
    0x1b710b35131c471bn,
    0x28db77f523047d84n,
    0x32caab7b40c72493n,
    0x3c9ebe0a15c9bebcn,
    0x431d67c49c100d4cn,
    0x4cc5d4becb3e42b6n,
    0x597f299cfc657e2an,
    0x5fcb6fab3ad6faecn,
    0x6c44198c4a475817n,
  ]);

  protected override padMessage(message: Uint8Array): ArrayBuffer {
    const msgLenMod128 = message.length % 128;
    let bytesToAdd = 128 - msgLenMod128;
    if (msgLenMod128 >= 112) {
      bytesToAdd += 128;
    }

    const padding = new Uint8Array(bytesToAdd);
    const paddedMsg = new Uint8Array([...message, ...padding]);
    const dataView = new DataView(paddedMsg.buffer);

    dataView.setUint8(message.length, 0x80);
    // No need to set the upper 8 bytes, as we'll never hash a message with a length >=2^64 bits,
    // so we only set the lower 8 bytes
    dataView.setBigUint64(paddedMsg.length - 8, BigInt(message.length * 8));

    return paddedMsg.buffer;
  }

  protected override computeHash(paddedMessage: ArrayBuffer): ArrayBuffer {
    const b1 = new BigUint64Array(8); // a, b, c, d, e
    const b2 = new BigUint64Array([
      0x6a09e667f3bcc908n,
      0xbb67ae8584caa73bn,
      0x3c6ef372fe94f82bn,
      0xa54ff53a5f1d36f1n,
      0x510e527fade682d1n,
      0x9b05688c2b3e6c1fn,
      0x1f83d9abfb41bd6bn,
      0x5be0cd19137e2179n,
    ]); // hash
    const seq = new BigUint64Array(80); // message schedule
    const dataView = new DataView(paddedMessage);

    for (let i = 0; i < paddedMessage.byteLength / 8; i += 16) {
      for (let t = 0; t < 16; t++) {
        seq[t] = dataView.getBigUint64(i + t * 8);
      }

      for (let t = 16; t < 80; t++) {
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

      for (let t = 0; t < 80; t++) {
        const temp1 = b1[7] + this.bigSigma1(b1[4]) + this.ch(b1[4], b1[5], b1[6]) + SHA512.k[t] + seq[t];
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
    return [...new BigUint64Array(hash)].map((w) => w.toString(16).padStart(16, '0')).join('');
  }
}
