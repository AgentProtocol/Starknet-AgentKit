import { Account, ec, stark, RpcProvider, hash, CallData } from 'starknet';
import { RPC_URL, STARKNET_ACCOUNT_ADDRESS, STARKNET_PRIVATE_KEY } from '../constants.js';
import { readFromStorage } from './storage.js';
// connect provider (Mainnet or Sepolia)
const provider = new RpcProvider({ nodeUrl: `${RPC_URL}` });

const OZaccountClassHash = '0x061dac032f228abef9c6626f995015233097ae253a7f72d68552db02f2971b8f';

const generateAccountFromPrivateKey = (privateKey: string) => {
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
  
  return { starkKeyPub, OZcontractAddress };
}

export const generateAccount = () => {
  // new Open Zeppelin account v0.8.1
  // Generate public and private key pair.
  const privateKey = stark.randomAddress();
  const { starkKeyPub, OZcontractAddress } = generateAccountFromPrivateKey(privateKey);
  
  return { privateKey, starkKeyPub, OZcontractAddress };
}

export const deployAccount = async (privateKey: string) => {
  const { starkKeyPub, OZcontractAddress } = generateAccountFromPrivateKey(privateKey);
  const OZaccount = new Account(provider, OZcontractAddress, privateKey);

  const { transaction_hash } = await OZaccount.deployAccount({
    classHash: OZaccountClassHash,
    constructorCalldata: CallData.compile({ publicKey: starkKeyPub }),
    addressSalt: starkKeyPub,
  });

  await provider.waitForTransaction(transaction_hash);
  return { OZcontractAddress };
}


// Get a starknet account or generate a new one
export const getAccount = async (chatId: string) => {
  // check if account is set in env
  if (STARKNET_ACCOUNT_ADDRESS && STARKNET_PRIVATE_KEY) {
    return new Account(provider, STARKNET_ACCOUNT_ADDRESS, STARKNET_PRIVATE_KEY);
  }

  // check if account exists in storage
  const storedAccountAddress = await readFromStorage(`${chatId}:accountAddress`);
  const storedPrivateKey = await readFromStorage(`${chatId}:privateKey`);

  if (storedPrivateKey && storedPrivateKey) {
    return new Account(provider, storedAccountAddress, storedPrivateKey);
  } 

  // account does not exist
  return;
}