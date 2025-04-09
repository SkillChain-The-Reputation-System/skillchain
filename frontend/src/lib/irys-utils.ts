import { Uploader } from "@irys/upload";
import { Ethereum } from "@irys/upload-ethereum";

export const getIrysUploader = async () => {
  const irysUploader = await Uploader(Ethereum)
    .withWallet(process.env.SKILLCHAIN_WALLET_PRIVATE_KEY as string)
    .withRpc(process.env.POLYGON_AMOY_RPC_URL as string)
    .devnet();
  return irysUploader;
};

export const uploadData = async (data: any): Promise<string | undefined> => {
  const irysUploader = await getIrysUploader();
  const dataToUpload = data;
  try {
    const receipt = await irysUploader.upload(dataToUpload);
    console.log(`Data uploaded ==> https://gateway.irys.xyz/${receipt.id}`);
    return receipt.id;
  } catch (e) {
    console.log("Error when uploading ", e);
    return undefined;
  }
};

export const uploadFile = async (
  filepath: any
): Promise<string | undefined> => {
  const irysUploader = await getIrysUploader();

  try {
    const receipt = await irysUploader.uploadFile(filepath);
    console.log(`File uploaded ==> https://gateway.irys.xyz/${receipt.id}`);
    return receipt.id;
  } catch (e) {
    console.log("Error when uploading ", e);
    return undefined;
  }
};
