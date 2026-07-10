import { setGlobalOptions } from "firebase-functions";
import { createCompany } from "./modules/company/functions/createCompany";
import { initUserDocument } from "./modules/auth/functions/initUserDocument";
import { getUserCompanies } from "./modules/company/functions/getUserCompanies";

setGlobalOptions({ maxInstances: 10, region: "southamerica-east1" });

export { createCompany, initUserDocument, getUserCompanies };
