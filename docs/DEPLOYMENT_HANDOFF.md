# Handoff applicatif à l’administrateur

Ce document décrit le produit à lancer. Aucune opération VPS, modification Docker, DNS, TLS, utilisateur Unix, permissions système ou reverse proxy n’a été réalisée par l’agent de code.

## Source et version

- Dépôt : https://github.com/mhjd/blind-typing-tutor
- Branche : `feature/french-azerty-trainer`.
- Baseline examinée : `de164448e147c8926cd1e3ec44482793807d2364`.
- Révision applicative validée : `3e2cc09e1cb8b25b1d37a97a871bb56936c7868d`. Le commit de documentation qui suit sur cette branche contient ce handoff ; le hash complet de tête à déployer est communiqué dans le compte rendu final.
- Next.js 15.5.27, React 19.3.0. Aucune fusion de code upstream après baseline.

## Construction et lancement

Node 24 LTS recommandé ; `engines.node` accepte Node 22 à 24. Yarn classic 1.22.22 déclaré dans `packageManager`. Le build local est validé sous Node 24. La machine cible doit installer ses propres dépendances natives pour son OS/architecture ; ne pas copier le `node_modules` macOS utilisé pendant les tests.

Depuis la racine du checkout :

```sh
yarn install --frozen-lockfile
yarn lint
yarn build
yarn start
```

L’installation inclut les dépendances de développement nécessaires au build. Le lancement exige le résultat `.next`, `public`, `node_modules`, `package.json` et `next.config.js` ; garder le checkout complet est possible. Il n’y a pas de sortie `standalone` configurée.

`yarn start` lance `next start` : port **3000**, adresse par défaut **0.0.0.0**. L’administrateur choisit le binding selon son architecture ; Next accepte par exemple `yarn start --hostname 127.0.0.1 --port 3000`. Ce document ne prescrit pas une architecture de déploiement.

## Configuration et secrets

Aucune variable d’environnement obligatoire, aucun fichier `.env`, secret, clé analytics, compte externe ou credential. Les scripts `dev`, `build` et `start` fixent `NEXT_TELEMETRY_DISABLED=1`. Si Next est lancé directement sans les scripts, conserver cette variable pour désactiver sa télémétrie d’outillage. `PORT` ou les arguments `--port`/`--hostname` sont facultatifs. Le mode production est géré par `next start`.

Aucune base de données, migration, stockage serveur des utilisateurs, tâche périodique, upload, API métier, envoi d’e-mail ou WebSocket applicatif.

## Stockage et permissions

Le navigateur conserve les préférences et le dernier texte Custom dans `localStorage`. Les statistiques restent en mémoire. Un changement de domaine/origine ou de navigateur n’emporte pas ces données. Le serveur ne reçoit pas le contenu d’exercice. Les logs HTTP habituels du proxy peuvent contenir des chemins de routes (langue/mode), pas le texte saisi.

Pendant l’installation/build, le checkout, `node_modules`, `.next` et les caches du gestionnaire de paquets nécessitent une écriture. En production, il n’y a aucune écriture applicative de données utilisateur. Next peut écrire ses caches sous **`.next/cache`** ; prévoir ce répertoire inscriptible si les fonctionnalités de cache Next sont utilisées. Le code, les assets et les dépendances peuvent rester en lecture seule. Aucun répertoire de stockage utilisateur ni volume de données persistant n’est requis. Les logs sont envoyés à stdout/stderr, sans fichier journal applicatif.

Le processus n’a besoin ni de root, ni de sudo, ni d’un port privilégié, ni d’accès aux données privées du serveur. L’administrateur choisit compte, service, conteneur et permissions minimales. Une sauvegarde de données serveur applicatives n’est pas nécessaire ; sauvegarder le code/configuration de déploiement et éventuellement les données navigateur selon les besoins de l’utilisateur.

## HTTP, réseau et santé

- `/` : redirection vers `/fr/fr/words`.
- `/{interfaceLang}/{studyLang}/{words|phrases|custom}` : pages de l’application.
- `/{interfaceLang}` : accueil d’une langue ; `/_next/*` : ressources/protocole de navigation Next.
- `/robots.txt` et ressources statiques `/public` servies à la racine.
- Pas d’endpoint de mutation ni de health API dédiée.

Health check utile : **GET `/fr/fr/words`**, statut attendu **200**, HTML contenant « Apprendre le clavier » ou les ressources Next. `/` répond par redirection, pas 200. Le health check confirme le rendu serveur, pas le fonctionnement du clavier physique.

L’installation nécessite le registre npm et les archives des paquets. Les tests nécessitent le téléchargement des navigateurs Playwright. Le build ne charge aucune police ni ressource métier distante. Le runtime utilise exclusivement le serveur de l’instance : aucun service tiers, aucune DB, aucun secret ni accès réseau sortant applicatif requis. Les changements de route/rechargements nécessitent l’origine ; le mode hors ligne après chargement ne remplace pas un service worker.

## Headers et responsabilités administrateur

L’application fournit `X-Content-Type-Options: nosniff`, `Referrer-Policy: no-referrer`, `Permissions-Policy` (caméra, micro, géolocalisation, paiement, USB interdits), `X-Frame-Options: DENY` et les directives CSP `frame-ancestors 'none'; object-src 'none'; base-uri 'self'; form-action 'self'; connect-src 'self'`.

Cette CSP est volontairement partielle : elle ne prétend pas imposer une politique complète de scripts avec nonce. Les scripts inline d’hydratation Next sont nécessaires. Aucune directive permissive ajoutée pour contourner une politique complète. Aucun HSTS applicatif. L’administrateur décide HTTPS/HSTS, accès privé, proxy, binding, firewall, logs, redémarrage et mises à jour. Les directives `noindex`/robots ne sécurisent pas l’accès à une instance privée.

## Validation et mises à jour

Voir `docs/VALIDATION.md` pour les résultats et limites réels. Installer avec le lockfile gelé ; vérifier lint, build, tests et audit avant chaque mise à jour. Réexaminer tout code upstream importé ultérieurement. Si un problème applicatif est rencontré, transmettre sa révision, navigateur/OS, disposition physique et reproduction à l’agent de code, sans inclure de secret.
