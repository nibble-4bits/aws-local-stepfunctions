import type { IntrinsicFunctionDefinition } from '../../typings/IntrinsicFunctionsImplementation';
import type { HashingAlgorithm } from '../../typings/IntrinsicFunctions';
import type { JSONValue } from '../../typings/JSONValue';
import { StatesRuntimeError } from '../../error/predefined/StatesRuntimeError';
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
    if (str.length > 10000) {
      throw new StatesRuntimeError(
        `Intrinsic function ${this.funcDefinition.name} cannot hash a string with more than 10,000 characters`
      );
    }

    const algorithms: HashingAlgorithm[] = ['MD5', 'SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'];
    const supportedAlgorithms = algorithms.join(', ');
    if (!algorithms.includes(algorithm)) {
      throw new StatesRuntimeError(
        `Unsupported hashing algorithm provided to intrinsic function ${this.funcDefinition.name}. The supported algorithms are: ${supportedAlgorithms}`
      );
    }

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
