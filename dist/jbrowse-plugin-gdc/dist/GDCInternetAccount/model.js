import { ConfigurationReference, getConf } from '@jbrowse/core/configuration';
import { InternetAccount } from '@jbrowse/core/pluggableElementTypes/models';
import { types } from '@jbrowse/mobx-state-tree';
import { getSession } from '@jbrowse/core/util';
import LoginDialogue from './LoginDialogue';
const stateModelFactory = (configSchema) => {
    return types
        .compose('GDCInternetAccount', InternetAccount, types.model({
        id: 'GDCToken',
        type: types.literal('GDCInternetAccount'),
        configuration: ConfigurationReference(configSchema),
    }))
        .volatile(() => ({
        needsToken: false,
    }))
        .views(self => ({
        get authHeader() {
            return getConf(self, 'authHeader');
        },
        get customEndpoint() {
            return getConf(self, 'customEndpoint');
        },
        get internetAccountType() {
            return 'GDCInternetAccount';
        },
    }))
        .actions(self => ({
        setNeedsToken(bool) {
            self.needsToken = bool;
        },
    }))
        .actions(self => ({
        getTokenFromUser(resolve, reject) {
            getSession(self).queueDialog(doneCallback => [
                LoginDialogue,
                {
                    handleClose: (token) => {
                        if (token) {
                            resolve(token);
                        }
                        else {
                            reject(new Error('failed to add track: this is a controlled resource that requires an authenticated token to access. Please verify your credentials and try again.'));
                        }
                        doneCallback();
                    },
                },
            ]);
        },
        getFetcher(location) {
            return async (input, init) => {
                const authToken = await self.getToken(location);
                let newInit = init;
                if (authToken !== 'none') {
                    newInit = self.addAuthHeaderToInit(init, authToken);
                }
                let query = String(input);
                if (query.includes('files/')) {
                    query = `${self.customEndpoint}/data/${query.split('/')[4]}`;
                }
                return fetch(query, newInit);
            };
        },
    }))
        .actions(self => {
        const superGetToken = self.getToken;
        const needsToken = new Map();
        return {
            /**
             * uses the location of the resource to fetch the 'metadata' of the
             * file, which contains the index files (if applicable) and the
             * property 'controlled' which determines whether the user needs a
             * token to be checked against the resource or not. if controlled =
             * false, then the user will not be prompted with a token dialogue
             *
             * @param location the uri location of the resource to be fetched
             */
            async getToken(location) {
                if (location && needsToken.has(location.uri)) {
                    return needsToken.get(location.uri)
                        ? superGetToken(location)
                        : 'none';
                }
                // determine if the resource requires a token
                const query = location === null || location === void 0 ? void 0 : location.uri.split('/').pop();
                const response = await fetch(`${self.customEndpoint}/data/${query}`);
                if (response.status === 403) {
                    needsToken.set(location === null || location === void 0 ? void 0 : location.uri, true);
                    return superGetToken(location);
                }
                else {
                    if (!response.ok) {
                        throw new Error(`HTTP ${response.status} (${await response.text()})`);
                    }
                }
                needsToken.set(location === null || location === void 0 ? void 0 : location.uri, false);
                return 'none';
            },
        };
    });
};
export default stateModelFactory;
//# sourceMappingURL=model.js.map