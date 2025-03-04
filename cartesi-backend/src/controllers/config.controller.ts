import { Error_out, Log, Notice } from "cartesi-wallet";
import { Config } from "../models";
import { ConfigService } from "../services";

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
      const config_json = JSON.stringify(config);
      console.log("config", config_json);

      const notice_payload = `{{"type":"create_config", "content":${config_json} }}`;

      return new Notice(notice_payload);
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
      const config_json = JSON.stringify(updatedConfig);
      console.log("updated config", config_json);

      const notice_payload = `{{"type":"update_config", "content":${config_json} }}`;

      return new Notice(notice_payload);
    } catch (error) {
      console.log("Failed to update config", error);
      return new Error_out(`Failed to update config`);
    }
  }
}

export { ConfigController };
