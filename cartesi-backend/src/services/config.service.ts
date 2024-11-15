import { Error_out } from "cartesi-wallet";
import { Config } from "../models";
import { RepositoryService } from "./repository.service";

class ConfigService {
  createConfig(configData: Config) {
    if (RepositoryService.config) {
      return new Error_out("Config already exists. Update it instead.");
    }
    if (
      !configData.adminWalletAddresses ||
      !configData.cartesiTokenContractAddress ||
      !configData.artistPercentage ||
      !configData.poolPercentage ||
      !configData.feesPercentage ||
      !configData.serverAddress ||
      !configData.dappContractAddress ||
      !configData.melodiousNftAddress
    ) {
      return new Error_out("All fields are required.");
    }
    RepositoryService.config = configData;
    return RepositoryService.config;
  }
  getConfig() {
    return RepositoryService.config;
  }

  updateConfig(updatedConfigData: Partial<Config>) {
    if (!RepositoryService.config) {
      return new Error_out("No config exists. Please create it first.");
    }

    const { vaultBalance, ...rest } = updatedConfigData;

    Object.assign(RepositoryService.config, { ...rest });
    return RepositoryService.config;
  }
}

export { ConfigService };
