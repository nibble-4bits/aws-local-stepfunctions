// TypeScript's DOM library has to be referenced for `TextEncoder` to be recognized as a type
/// <reference lib="dom" />

export abstract class BaseHash {
  private textEncoder: TextEncoder;

  constructor() {
    this.textEncoder = new TextEncoder();
  }

  getDigest(input: string): string {
    const message = this.textEncoder.encode(input);

    const paddedMessage = this.padMessage(message);
    const hash = this.computeHash(paddedMessage);
    const digest = this.hashToString(hash);

    return digest;
  }

  protected abstract padMessage(message: Uint8Array): ArrayBuffer;

  protected abstract computeHash(paddedMessage: ArrayBuffer): ArrayBuffer;

  protected abstract hashToString(hash: ArrayBuffer): string;

  protected rotl(n: number, x: number): number;
  protected rotl(n: bigint, x: bigint): bigint;
  protected rotl(n: number | bigint, x: number | bigint): number | bigint {
    if (typeof n === 'number' && typeof x === 'number') return (x << n) | (x >>> (32 - n));
    if (typeof n === 'bigint' && typeof x === 'bigint') return (x << n) | (x >> (64n - n));

    throw new Error('Both arguments must be of the same type');
  }

  protected rotr(n: number, x: number): number;
  protected rotr(n: bigint, x: bigint): bigint;
  protected rotr(n: number | bigint, x: number | bigint): number | bigint {
    if (typeof n === 'number' && typeof x === 'number') return (x >>> n) | (x << (32 - n));
    if (typeof n === 'bigint' && typeof x === 'bigint') return (x >> n) | (x << (64n - n));

    throw new Error('Both arguments must be of the same type');
  }

  protected ch(x: number, y: number, z: number): number;
  protected ch(x: bigint, y: bigint, z: bigint): bigint;
  protected ch(x: number | bigint, y: number | bigint, z: number | bigint): number | bigint {
    if (typeof x === typeof y && typeof y === typeof z) {
      // @ts-expect-error TypeScript can't disambiguate between number and bigint
      return (x & y) ^ (~x & z);
    }

    throw new Error('All arguments must be of the same type');
  }

  protected parity(x: number, y: number, z: number): number;
  protected parity(x: bigint, y: bigint, z: bigint): bigint;
  protected parity(x: number | bigint, y: number | bigint, z: number | bigint): number | bigint {
    if (typeof x === typeof y && typeof y === typeof z) {
      // @ts-expect-error TypeScript can't disambiguate between number and bigint
      return x ^ y ^ z;
    }

    throw new Error('All arguments must be of the same type');
  }

  protected maj(x: number, y: number, z: number): number;
  protected maj(x: bigint, y: bigint, z: bigint): bigint;
  protected maj(x: number | bigint, y: number | bigint, z: number | bigint): number | bigint {
    if (typeof x === typeof y && typeof y === typeof z) {
      // @ts-expect-error TypeScript can't disambiguate between number and bigint
      return (x & y) ^ (x & z) ^ (y & z);
    }

    throw new Error('All arguments must be of the same type');
  }

  protected bigSigma0(x: number): number;
  protected bigSigma0(x: bigint): bigint;
  protected bigSigma0(x: number | bigint): number | bigint {
    if (typeof x === 'number') {
      // number version used by SHA1 and SHA256
      return this.rotr(2, x) ^ this.rotr(13, x) ^ this.rotr(22, x);
    }

    // BigInt version used by SHA384 and SHA512
    return this.rotr(28n, x) ^ this.rotr(34n, x) ^ this.rotr(39n, x);
  }

  protected bigSigma1(x: number): number;
  protected bigSigma1(x: bigint): bigint;
  protected bigSigma1(x: number | bigint): number | bigint {
    if (typeof x === 'number') {
      // number version used by SHA1 and SHA256
      return this.rotr(6, x) ^ this.rotr(11, x) ^ this.rotr(25, x);
    }

    // BigInt version used by SHA384 and SHA512
    return this.rotr(14n, x) ^ this.rotr(18n, x) ^ this.rotr(41n, x);
  }

  protected smallSigma0(x: number): number;
  protected smallSigma0(x: bigint): bigint;
  protected smallSigma0(x: number | bigint): number | bigint {
    if (typeof x === 'number') {
      // number version used by SHA1 and SHA256
      return this.rotr(7, x) ^ this.rotr(18, x) ^ (x >>> 3);
    }

    // BigInt version used by SHA384 and SHA512
    return this.rotr(1n, x) ^ this.rotr(8n, x) ^ (x >> 7n);
  }

  protected smallSigma1(x: number): number;
  protected smallSigma1(x: bigint): bigint;
  protected smallSigma1(x: number | bigint): number | bigint {
    if (typeof x === 'number') {
      // number version used by SHA1 and SHA256
      return this.rotr(17, x) ^ this.rotr(19, x) ^ (x >>> 10);
    }

    // BigInt version used by SHA384 and SHA512
    return this.rotr(19n, x) ^ this.rotr(61n, x) ^ (x >> 6n);
  }
}
