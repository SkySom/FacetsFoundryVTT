import { HooksFacets } from "@scripts/hooks/index.ts";
import { Logger } from "./module/util/logger";
import "./styles/facets.scss";

Logger.info("Starting System.");
new HooksFacets().listen();
