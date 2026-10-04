# Transfert de responsabilité à l’agent VPS et handoff de publication

Ce document décrit le produit à lancer. Aucune opération VPS, modification Docker, DNS, TLS, utilisateur Unix, permissions système ou reverse proxy n’a été réalisée par l’agent de code.

## Responsabilité à compter du 4 octobre 2026

À la demande du propriétaire, **l’agent présent sur le VPS prend désormais la responsabilité du projet et de sa mise en ligne**, en coordination avec l’administrateur VPS. La mission du premier agent de code est terminée : le produit est prêt à être déployé, mais aucune publication sur le VPS n’a été effectuée. Ce document constitue le transfert dans le dépôt ; il ne confirme pas une prise en charge ni une intervention effective de l’agent distant.

L’agent VPS pilote la reprise, les vérifications applicatives sur Linux, la coordination du déploiement et la recette du site publié. Il s’organise avec l’administrateur avant toute modification d’infrastructure. L’administrateur décide de la méthode de lancement, du compte Unix, des permissions, de l’emplacement, du binding, du reverse proxy, du domaine, de HTTPS, du firewall, des logs et du redémarrage automatique. Aucune architecture ni configuration Docker n’est imposée par ce handoff.

Les informations propres au VPS et ses credentials restent hors du dépôt. Si une correction applicative est nécessaire, l’agent VPS la traite sur une branche dédiée ou la transmet à un agent de code, avec une reproduction précise. Ne pas fusionner automatiquement l’upstream : tout nouveau code doit être examiné.

## Reprise et coordination attendues

1. Lire ce document et [VALIDATION.md](VALIDATION.md), puis récupérer la branche indiquée ci-dessous. Noter le hash exact du checkout retenu. La tête contenant ce transfert ne change que la documentation par rapport à la version produit déjà validée.
2. Examiner l’environnement existant avec l’administrateur : mode de lancement disponible, domaine souhaité, accès public ou privé, port interne, reverse proxy et responsabilités respectives. Ne pas remplacer une configuration existante sans cet accord.
3. Installer et construire pour Linux avec Node et Yarn indiqués ci-dessous. Refaire lint/build et un audit de dépendances : l’audit précédent est daté du 3 octobre 2026. Si une vulnérabilité applicable apparaît, la traiter sans mise à jour aveugle ni `--force`.
4. Vérifier le build de production avant publication. Dans un environnement de test adapté, installer les navigateurs avec `yarn playwright install chromium firefox`, puis lancer `CI=1 PLAYWRIGHT_PRODUCTION=1 yarn test:e2e --project=chromium --project=firefox` (port 3000 disponible, aucun autre serveur de test). Les dépendances système des navigateurs relèvent de l’environnement choisi avec l’administrateur.
5. Faire mettre en place le lancement et l’exposition du service selon les décisions de l’administrateur. Consigner le commit déployé, les commandes réellement utilisées et la procédure de retour à la version précédente, sans secret.
6. Effectuer la recette ci-dessous sur l’URL finale, vérifier les logs et le redémarrage avec l’administrateur, puis informer le propriétaire de l’URL, du commit publié et des éventuelles limites. La mise en ligne reste à faire tant que ces vérifications ne sont pas terminées.

## Produit livré et recette de publication

L’interface par défaut est française AZERTY, avec clavier visible et aide Guidé. Quatre exercices sont disponibles : accents en mots/phrases, signes courants avec adresses e-mail, long texte varié, et repérage ciblé uniquement composé d’accents et de signes. Les grands tours sont générés localement, changent de départ et se renouvellent sans menu. Le texte libre reste disponible.

Conserver les choix métier : `é è à ù ç â ê î ô û ë`, le ë de Noël, les signes `@ . , ' " ( ) - _ ! ? : / + =`, et beaucoup de @. Les exercices excluent ä/ï/ö/ü, €/% et le point-virgule, ainsi que les signes rares précédemment écartés ; leur saisie reste prise en charge dans les textes libres lorsque la disposition la permet. L’objectif est le repérage physique des touches, avec une navigation simple, sans compte ni priorité à la vitesse.

Sur le site publié, vérifier : ouverture de `/`, sélection des quatre exercices, passage Guidé → Confirmation → Erreurs seulement → Sans aide, absence de cible avant tentative dans les trois derniers modes, confirmation après réussite en Confirmation et révélation après erreur selon le mode. Essayer un vrai clavier AZERTY : `î` par touche morte puis `i`, `ë`, `@` par AltGr, ponctuation avec Shift, correction sans double comptage. Vérifier renouvellement, texte libre, statistiques, thème et conservation des préférences au rechargement. Dans les outils réseau du navigateur, confirmer l’absence de trafic tiers, de Google Analytics/Fonts et d’envoi du texte. Vérifier le statut HTTP et les headers sur l’origine publique.

Validation locale acquise le 4 octobre : lint et build/TypeScript réussis, **206 tests réussis dans Chromium et Firefox**. La gestion des touches mortes physiques sous l’OS cible reste à essayer : les tests automatisés simulent les événements correspondants.

## Source et version

- Dépôt : https://github.com/mhjd/blind-typing-tutor
- Branche : `feature/french-azerty-trainer`.
- Baseline examinée : `de164448e147c8926cd1e3ec44482793807d2364`.
- Révision applicative validée : `9e35f8e96a815b8e7900f90abf4dcab5d598bb2e`. Checkout produit et documentation précédant ce transfert : `88b462f555c680e7cc690cf4a4adcd7a5c1d686d`. Utiliser la tête de `feature/french-azerty-trainer` contenant ce transfert et consigner son hash avec `git rev-parse HEAD` ; les commits suivants du présent transfert ne modifient pas le code applicatif.
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

Le navigateur conserve le choix parmi les quatre exercices, leur dernier premier mot (pour varier le départ), les préférences et le dernier texte libre Custom dans `localStorage`. Les statistiques restent en mémoire. Les grands tours sont générés et mélangés localement dans le navigateur, puis renouvelés en boucle, sans stockage serveur. Un changement de domaine/origine ou de navigateur n’emporte pas ces données. Le serveur ne reçoit pas le contenu d’exercice. Les logs HTTP habituels du proxy peuvent contenir des chemins de routes (langue/mode), pas le texte saisi.

Pendant l’installation/build, le checkout, `node_modules`, `.next` et les caches du gestionnaire de paquets nécessitent une écriture. En production, il n’y a aucune écriture applicative de données utilisateur. Next peut écrire ses caches sous **`.next/cache`** ; prévoir ce répertoire inscriptible si les fonctionnalités de cache Next sont utilisées. Le code, les assets et les dépendances peuvent rester en lecture seule. Aucun répertoire de stockage utilisateur ni volume de données persistant n’est requis. Les logs sont envoyés à stdout/stderr, sans fichier journal applicatif.

Le processus n’a besoin ni de root, ni de sudo, ni d’un port privilégié, ni d’accès aux données privées du serveur. L’administrateur choisit compte, service, conteneur et permissions minimales. Une sauvegarde de données serveur applicatives n’est pas nécessaire ; sauvegarder le code/configuration de déploiement et éventuellement les données navigateur selon les besoins de l’utilisateur.

## HTTP, réseau et santé

- `/` : redirection vers `/fr/fr/custom`, exercice des accents au premier lancement.
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
