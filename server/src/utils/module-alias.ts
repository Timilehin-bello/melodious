import moduleAlias from "module-alias";
import path from "path";

const baseUrl = path.resolve(__dirname, "../../");

moduleAlias.addAliases({
  "@": baseUrl,
  "@configs": path.join(baseUrl, "src/configs"),
  "@helpers": path.join(baseUrl, "src/helpers"),
  "@controllers": path.join(baseUrl, "src/controllers"),
  "@routes": path.join(baseUrl, "src/routes"),
  "@utils": path.join(baseUrl, "src/utils"),
  "@middlewares": path.join(baseUrl, "src/middlewares"),
  "@services": path.join(baseUrl, "src/services"),
  "@dao": path.join(baseUrl, "src/dao"),
  "@models": path.join(baseUrl, "src/models"),
  "@validators": path.join(baseUrl, "src/validators"),
  "@types": path.join(baseUrl, "src/types"),
});
