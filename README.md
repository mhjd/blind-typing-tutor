# Apprendre le clavier

Variante de [Blind Typing Tutor](https://github.com/stanhatk/blind-typing-tutor), destinée en priorité aux débutants francophones sur clavier français AZERTY. Apprenez les positions des touches à votre rythme, sans objectif de vitesse, compte ni télémétrie.

## Utilisation

L’ouverture de `/` mène à `/fr/fr/custom` : interface française, disposition **Français (AZERTY)**, clavier visible et aide **Guidé** au premier lancement. Les autres langues et dispositions restent disponibles. Choisissez la disposition correspondant au clavier physique de votre ordinateur : l’application ne change pas le clavier configuré dans votre système.

- **Débutant** : un mot à la fois.
- **Pratique** : une suite de mots.
- **Personnalisé** : bibliothèque d’exercices français ou n’importe quel texte saisi/collé. Cliquez sur « Saisir mon texte » pour le modifier.

L’écran principal propose trois exercices, directement sélectionnables : accents/circonflexes/cédille et le ë de Noël, caractères courants avec une attention particulière à @, puis long texte varié avec toutes les lettres et une révision générale. Le niveau d’aide reste visible. Le bouton « Saisir mon texte » permet de coller un texte libre, tandis que les modes historiques, les langues, les dispositions et les options secondaires restent dans « Réglages ». Les statistiques se trouvent dans un volet séparé. Les exercices ne contiennent ni ä/ï/ö/ü, ni €/% ni point-virgule. Le moteur conserve le support de ces caractères pour les textes libres. Elle est directement modifiable dans [`src/config/exercises.ts`](src/config/exercises.ts). Le texte se répète automatiquement à la fin, sans menu. Les statistiques restent cumulées pendant l’entraînement, puis repartent à zéro lors d’un changement d’exercice ou de mode.

Les quatre aides sont mémorisées dans le navigateur :

| Aide | Avant la frappe | Après réussite | Après erreur |
| --- | --- | --- | --- |
| Guidé | Touche et modificateurs indiqués | Prochaine étape | Cible conservée |
| Confirmation | Aucune réponse | Combinaison réussie révélée 350 ms | Touche pressée et bonne combinaison |
| Erreurs seulement | Aucune réponse | Aucune réponse | Bonne combinaison |
| Sans aide | Aucune réponse | Aucune réponse | Aucune réponse |

Avec la correction activée, une erreur ne fait pas avancer le texte ; l’aide après erreur reste jusqu’à la réussite. Sans correction, une erreur fait avancer et l’aide disparaît après 350 ms. Les modificateurs et les touches mortes ne sont pas des tentatives de caractère à eux seuls.

**Maj (Shift)** : le clavier indique la touche et le Shift opposé à la main utilisée. **AltGr** : par exemple `@` indique AltGr et la touche `à`. **Touches mortes** : pour `î`, tapez `^`, relâchez, puis `i` ; pour `ë`, tapez Maj + `^` (tréma), relâchez, puis `e`. Pour un `~` ou un accent grave isolé, tapez AltGr + la touche indiquée puis Espace. Les majuscules composées sont aussi prises en charge. Les textes et sorties sont normalisés en NFC.

Cliquez sur le texte à taper pour reprendre la frappe après avoir utilisé un contrôle. Les thèmes, sons locaux, couleurs, mains, affichage du clavier et correction restent disponibles.

## Vie privée

Le choix d’exercice, le texte personnalisé et les préférences sont conservés uniquement dans `localStorage`, pour cette origine et ce navigateur. Aucune donnée de frappe, statistique ou texte n’est envoyée au serveur ou à un tiers. Les statistiques sont en mémoire, sans historique serveur. Effacer les données du site efface les préférences et le texte. Si le stockage navigateur est indisponible, l’entraînement reste utilisable mais la persistance ne peut pas être garantie.

Aucun Analytics, Google Fonts ou autre service de télémétrie. Polices système uniquement. Les scripts Yarn désactivent aussi la télémétrie de l’outil Next.js. L’utilisation normale peut continuer sans réseau une fois les ressources de la page chargées ; recharger ou changer de route nécessite le serveur. Il n’y a pas de service worker ni de garantie d’installation hors ligne.

## Développement et production locale

Node **24 LTS** recommandé (versions 22 à 24 acceptées), **Yarn classic 1.22.22**. `yarn.lock` est la seule source de vérité du projet actif. `legacy_v1/` est une archive non utilisée, dont les artefacts ne participent pas à l’installation ou au build.

```sh
yarn install --frozen-lockfile
yarn dev                 # http://localhost:3000
yarn lint
yarn build               # inclut TypeScript
yarn start               # build de production, port 3000
```

```sh
yarn playwright install chromium firefox
yarn test:e2e --project=chromium
PLAYWRIGHT_PRODUCTION=1 yarn test:e2e --project=chromium
PLAYWRIGHT_PRODUCTION=1 yarn test:e2e --project=firefox
yarn audit
```

Les tests incluent les régressions upstream, les plans physiques français, les quatre aides, les événements Dead/composition, NFC, les modificateurs, la répétition, la persistance, les headers et l’absence de trafic tiers. L’automatisation simule le contrat des événements de composition ; elle ne change pas la disposition OS. Une vérification manuelle avec un clavier AZERTY réel reste utile, notamment pour les variantes de système/navigateur. L’enseignement détaillé des séquences de touches mortes cible `fr-fr` ; les autres dispositions conservent leurs mappings explicites, sans généralisation des règles françaises.

## Architecture

Next.js 15 App Router, React 19, TypeScript et Tailwind 4. Aucun backend métier, base de données, compte ni secret. Le moteur se trouve dans `src/hooks/useTypingEngine.ts` ; les plans caractère → touches dans `src/utils/inputPlan.ts` ; le clavier dans `src/components/Keyboard.tsx` ; les préférences dans `src/hooks/useAppSettings.ts`.

Le SEO public upstream, ses évaluations artificielles, son sitemap, ses URL canoniques, l’écran promotionnel et les liens WordMemo/Buy Me a Coffee ont été retirés. Les pages portent `noindex` et `robots.txt` interdit l’exploration. Ce n’est pas un contrôle d’accès : la protection d’une instance privée relève de son administrateur.

Voir le [handoff administrateur](docs/DEPLOYMENT_HANDOFF.md) et le [rapport de validation](docs/VALIDATION.md). Ce dépôt ne déploie pas automatiquement cette variante.

## Licence et attribution

MIT, voir [LICENSE](LICENSE). Projet original : Stanislav Khatko ; les notices de copyright originales sont conservées. Fork : <https://github.com/mhjd/blind-typing-tutor>.
