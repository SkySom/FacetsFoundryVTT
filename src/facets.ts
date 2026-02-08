
import { HooksFacets } from "@scripts/hooks/index.ts";
import "./styles/facets.scss";
import { log } from "./module/util/logger";

log("Starting System.")
new HooksFacets().listen();