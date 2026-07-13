import { setGlobalOptions } from "firebase-functions";
import { createCompany } from "./modules/company/presentation/createCompany";
import { initUserDocument } from "./modules/auth/presentation/initUserDocument";
import { getUserCompanies } from "./modules/company/presentation/getUserCompanies";

setGlobalOptions({ maxInstances: 10, region: "southamerica-east1" });

export { createCompany, initUserDocument, getUserCompanies };
