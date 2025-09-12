import { Error_out, Log, Notice } from "cartesi-wallet";
import { Config } from "../models";
import { ConfigService, RepositoryService } from "../services";

class ConfigController {
  private configService: ConfigService;

  constructor() {
    this.configService = new ConfigService();
  }

  createConfig(configData: Config) {
    const config = this.configService.createConfig(configData);

    console.log("configData", configData);
    if (config instanceof Error_out) {
      return config;
    }

    try {
      console.log("config created", JSON.stringify(config));

      // Create repository notice with config creation data
      const repositoryNotice = RepositoryService.createRepositoryNotice(
        "config_created",
        config
      );

      // Also create specific config notice
      const configNotice = RepositoryService.createDataNotice(
        "config",
        "created",
        config
      );

      return repositoryNotice;
    } catch (error) {
      console.log("Failed to create config", error);
      return new Error_out(`Failed to create config`);
    }
  }

  getConfig() {
    try {
      const config = this.configService.getConfig();
      const config_json = JSON.stringify(config);
      console.log("config", config_json);
      return new Log(config_json);
    } catch (error) {
      console.log("Failed to get config", error);
      return new Error_out(`Failed to get config`);
    }
  }

  updateConfig(configData: Config) {
    const updatedConfig = this.configService.updateConfig(configData);
    if (updatedConfig instanceof Error_out) {
      return updatedConfig;
    }
    try {
      console.log("updated config", JSON.stringify(updatedConfig));

      // Create repository notice with config update data
      const repositoryNotice = RepositoryService.createRepositoryNotice(
        "config_updated",
        updatedConfig
      );

      // Also create specific config notice
      const configNotice = RepositoryService.createDataNotice(
        "config",
        "updated",
        updatedConfig
      );

      return repositoryNotice;
    } catch (error) {
      console.log("Failed to update config", error);
      return new Error_out(`Failed to update config`);
    }
  }
}

export { ConfigController };
