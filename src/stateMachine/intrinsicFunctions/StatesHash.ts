import type { IntrinsicFunctionDefinition } from '../../typings/IntrinsicFunctionsImplementation';
import type { HashingAlgorithm } from '../../typings/IntrinsicFunctions';
import type { JSONValue } from '../../typings/JSONValue';
import { BaseIntrinsicFunction } from './BaseIntrinsicFunction';
import md5 from 'crypto-js/md5.js';
import sha1 from 'crypto-js/sha1.js';
import sha256 from 'crypto-js/sha256.js';
import sha384 from 'crypto-js/sha384.js';
import sha512 from 'crypto-js/sha512.js';

class StatesHash extends BaseIntrinsicFunction {
  protected readonly funcDefinition: IntrinsicFunctionDefinition;

  constructor() {
    super();

    this.funcDefinition = {
      name: 'States.Hash',
      exactArgs: 2,
      arguments: [
        {
          allowedTypes: ['string'],
        },
        {
          allowedTypes: ['string'],
        },
      ],
    };
  }

  protected execute(str: string, algorithm: HashingAlgorithm): JSONValue {
    switch (algorithm) {
      case 'MD5':
        return md5(str).toString();
      case 'SHA-1':
        return sha1(str).toString();
      case 'SHA-256':
        return sha256(str).toString();
      case 'SHA-384':
        return sha384(str).toString();
      case 'SHA-512':
        return sha512(str).toString();
    }
  }
}

export { StatesHash };
