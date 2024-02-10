import type { IntrinsicFunctionDefinition } from '../../typings/IntrinsicFunctionsImplementation';
import type { HashingAlgorithm } from '../../typings/IntrinsicFunctions';
import type { JSONValue } from '../../typings/JSONValue';
import { StatesRuntimeError } from '../../error/predefined/StatesRuntimeError';
import { BaseIntrinsicFunction } from './BaseIntrinsicFunction';
import { md5, sha1, sha256, sha384, sha512 } from '../../util/hash';

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
        return md5.getDigest(str);
      case 'SHA-1':
        return sha1.getDigest(str);
      case 'SHA-256':
        return sha256.getDigest(str);
      case 'SHA-384':
        return sha384.getDigest(str);
      case 'SHA-512':
        return sha512.getDigest(str);
    }
  }
}

export { StatesHash };
