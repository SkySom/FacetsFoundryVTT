

import { HooksFacets } from "@scripts/hooks/index.ts";
import "./styles/facets.scss";
import {ActorType} from "./module/enums.ts";

console.log("Facets | Starting System.")
HooksFacets.listen();

Hooks.once("init", () => {
    console.log(`Facets | Initializing System. ${ActorType.PLAYER}`)
})