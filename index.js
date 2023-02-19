import { Network, Alchemy, AlchemySubscription } from "alchemy-sdk";
import { ethers } from "ethers";
import * as api from "etherscan-api";
import { config } from "dotenv";
config();

const settings = {
  apiKey: process.env.ARBITRUM,
  network: Network.ARB_MAINNET,
};

const arbiScanApi = process.env.ARBISCAN;

const api1 = api.init(arbiScanApi, "arbitrum", 10000);

const alchemy = new Alchemy(settings);

alchemy.ws.on(
  {
    method: AlchemySubscription.MINED_TRANSACTIONS,
    // address: "",
    // topics: [ethers.utils.id("Transfer(address,address,uint256)")],
  },
  (log) => {
    if (log.transaction.input.startsWith("0x60806040")) {
      console.log(log);
      (async () => {
        const hash = log.transaction.hash;
        const receipt = await alchemy.core.getTransactionReceipt(hash);
        const CA = receipt.contractAddress;
        console.log(CA);
        if (receipt.logs !== []) {
          const to = ethers.utils.defaultAbiCoder.decode(
            ["address"],
            receipt.logs[0].topics[2]
          );
          let name = await api1.account.tokentx(
            to,
            CA,
            "0",
            "9999999999",
            1,
            100,
            "asc"
          );
          while (name.result[0].tokenName == "") {
            let name = await api1.account.tokentx(
              to,
              CA,
              "0",
              "9999999999",
              1,
              100,
              "asc"
            );
          }
          console.log(name.result[0].tokenName);
        }
        // console.log(
        //
        //   )
        // );
      })();
    }
  }
);
