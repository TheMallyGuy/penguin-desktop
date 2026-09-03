import { modifyEditor } from "./domModifier.ts"
import { getAddonsConfig } from "./twaddons/addons.ts"
import { setupAddonsOverwrite } from "./twaddons/addonsOverwrite.ts"

(function () {
    setupAddonsOverwrite()
    modifyEditor()

    const twcfg = getAddonsConfig()
    console.log(twcfg)
})();