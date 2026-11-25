import { getConfigUrls } from './configUrls';
import { findHostedAssembly } from './hostedAssembly';
/**
 * Core-describeAssemblies: the assembly config and gene track adapter the
 * hosted config of each named genome holds, read without connecting it. A
 * name another plugin already described, or one no hosted config could hold,
 * is left alone
 */
export async function describeAssemblies(described, assemblyNames) {
    const answers = await Promise.all(assemblyNames
        .filter(name => !Object.hasOwn(described, name) && getConfigUrls(name).length > 0)
        .map(async (name) => [name, await findHostedAssembly(name)]));
    return {
        ...described,
        ...Object.fromEntries(answers.flatMap(([name, hosted]) => hosted
            ? [
                [
                    name,
                    { assembly: hosted.assembly, geneAdapter: hosted.geneAdapter },
                ],
            ]
            : [])),
    };
}
//# sourceMappingURL=describeAssemblies.js.map