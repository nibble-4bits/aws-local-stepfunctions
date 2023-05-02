import type { IntrinsicFunctionDefinition } from '../../typings/IntrinsicFunctionsImplementation';
import type { JSONValue } from '../../typings/JSONValue';
import { BaseIntrinsicFunction } from './BaseIntrinsicFunction';
import { byteToHex, getRandomNumber } from '../../util';

class StatesUUID extends BaseIntrinsicFunction {
  protected readonly funcDefinition: IntrinsicFunctionDefinition;

  constructor() {
    super();

    this.funcDefinition = {
      name: 'States.UUID',
    };
  }

  protected execute(): JSONValue {
    // Implementation of UUIDv4 according to RFC4122: https://datatracker.ietf.org/doc/html/rfc4122#section-4.4
    const octets = new Uint8Array(16);

    for (let i = 0; i < octets.length; i++) {
      octets[i] = getRandomNumber(0, 255);
    }

    octets[6] = octets[6] & 0b01111111;
    octets[6] = octets[6] | 0b01000000;
    octets[6] = octets[6] & 0b11011111;
    octets[6] = octets[6] & 0b11101111;

    octets[8] = octets[8] | 0b10000000;
    octets[8] = octets[8] & 0b10111111;

    const b0 = byteToHex(octets[0]);
    const b1 = byteToHex(octets[1]);
    const b2 = byteToHex(octets[2]);
    const b3 = byteToHex(octets[3]);
    const b4 = byteToHex(octets[4]);
    const b5 = byteToHex(octets[5]);
    const b6 = byteToHex(octets[6]);
    const b7 = byteToHex(octets[7]);
    const b8 = byteToHex(octets[8]);
    const b9 = byteToHex(octets[9]);
    const b10 = byteToHex(octets[10]);
    const b11 = byteToHex(octets[11]);
    const b12 = byteToHex(octets[12]);
    const b13 = byteToHex(octets[13]);
    const b14 = byteToHex(octets[14]);
    const b15 = byteToHex(octets[15]);

    return `${b0}${b1}${b2}${b3}-${b4}${b5}-${b6}${b7}-${b8}${b9}-${b10}${b11}${b12}${b13}${b14}${b15}`;
  }
}

export { StatesUUID };
