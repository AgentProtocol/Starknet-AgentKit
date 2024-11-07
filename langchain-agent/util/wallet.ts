import { Account, constants, ec, json, stark, RpcProvider, hash, CallData } from 'starknet';
import { RPC_URL } from '../constants.js';
// connect provider (Mainnet or Sepolia)
const provider = new RpcProvider({ nodeUrl: `${RPC_URL}` });

const OZaccountClassHash = '0x061dac032f228abef9c6626f995015233097ae253a7f72d68552db02f2971b8f';

export const generateAccount = () => {
  // new Open Zeppelin account v0.8.1
  // Generate public and private key pair.
  const privateKey = stark.randomAddress();
  const starkKeyPub = ec.starkCurve.getStarkKey(privateKey);

  const OZaccountConstructorCallData = CallData.compile({ publicKey: starkKeyPub });
  let OZcontractAddress = hash.calculateContractAddressFromHash(
    starkKeyPub,
    OZaccountClassHash,
    OZaccountConstructorCallData,
    0
  );

  // Ensure address is 66 characters long by padding with zeros after 0x if needed
  if (OZcontractAddress.length < 66) {
    OZcontractAddress = OZcontractAddress.slice(0, 2) + '0'.repeat(66 - OZcontractAddress.length) + OZcontractAddress.slice(2);
  }
  
  return { privateKey, starkKeyPub, OZcontractAddress };
}

export const deployAccount = async (privateKey: string, starkKeyPub: string, OZcontractAddress: string) => {
  const OZaccount = new Account(provider, OZcontractAddress, privateKey);

  const { transaction_hash, contract_address } = await OZaccount.deployAccount({
    classHash: OZaccountClassHash,
    constructorCalldata: CallData.compile({ publicKey: starkKeyPub }),
    addressSalt: starkKeyPub,
  });

  await provider.waitForTransaction(transaction_hash);
}