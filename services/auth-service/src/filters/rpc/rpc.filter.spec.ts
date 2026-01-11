import { AllRpcExceptionsFilter } from './rpc.filter';

describe('RpcFilter', () => {
  it('should be defined', () => {
    expect(new AllRpcExceptionsFilter()).toBeDefined();
  });
});
