# Validation de la variante AZERTY

Révision applicative : `791ee763cfc39cff7ab51c9906dc0b4a46cad01e`.

Validation locale du 3 octobre 2026, à partir de la baseline `de164448e147c8926cd1e3ec44482793807d2364`, sans fusion upstream et sans déploiement.

## Résultats

- Node **24.21.0**, Yarn **1.22.22**.
- `yarn lint` : réussi, sans erreur.
- `yarn build` : compilation, TypeScript et production réussis ; Next **15.5.27**, React **19.3.0**.
- `PLAYWRIGHT_PRODUCTION=1 yarn test:e2e --project=chromium --project=firefox` : **184 tests réussis**, 92 par navigateur, contre `next start` et le build de production.
- Chaque projet comprend 56 tests indépendants sur les plans de saisie et le contenu des exercices, et 36 tests navigateur, dont les 13 régressions existantes.
- `yarn audit --json` : **0 info, 0 faible, 0 modérée, 0 élevée, 0 critique**, sur le graphe complet de 255 dépendances signalé par Yarn. Aucune vulnérabilité connue volontairement laissée. Ce résultat est daté, pas une garantie permanente.
- `git diff --check` : propre.
- Capture complète de l’interface française inspectée visuellement pendant la validation.

## Couverture

Les plans français couvrent `é è à ç ù`, les dix chiffres avec Shift, `? . /`, espaces, majuscules, `@ # { [ | \\ ] } € ^ ¤`, ainsi que les accents isolés `~`, accent grave et tréma suivis d’Espace. Les séquences `â ê î ô û ä ë ï ö ü` et leurs majuscules sont vérifiées en NFC et NFD. Des mappings anglais et allemands sont également vérifiés.

La bibliothèque comprend trois exercices : accents (é è à ù ç â ê î ô û ë), caractères courants avec répétitions de @, puis long texte varié. Elle exclut ä/ï/ö/ü, €/% et le point-virgule, tandis que leur support dans le moteur est conservé. Tous les caractères des exercices ont un plan physique français, et le texte long couvre tout l’alphabet. La navigation permet le choix direct et le conserve au rechargement ; la saisie libre reste accessible, les réglages et statistiques sont repliés.

Les tests navigateur vérifient les quatre aides avant tentative, après réussite et après erreur, la touche pressée, l’aide persistante avec correction, l’aide temporaire sans correction, la confirmation 350 ms, la frappe rapide sans perte, la répétition et les statistiques cumulées. Ils vérifient la bibliothèque, le collage libre, le texte contenant `<script>` rendu comme texte, les retours à la ligne, tabulations et espaces insécables français.

Les événements `Dead` avec `code` font progresser la séquence physique sans valider le texte ni incrémenter les erreurs. La composition finale est validée une fois, y compris lorsque Firefox délivre ensuite un événement input supplémentaire. Une erreur intermédiaire et la reprise correcte sont couvertes. AltGr et Shift seuls ne sont pas des caractères ni des erreurs.

Le scénario intégré parcourt Guidé → Confirmation (sans réponse avant tentative, confirmation après réussite, révélation après erreur) → Erreurs seulement → Sans aide, avec `î`, `@`, répétition, coupure réseau après chargement et rechargement conservant le niveau choisi. Les régressions vérifient Débutant/Pratique/Custom, thème, statistiques, correction, couleurs, mains et visibilité du clavier. Le test réseau active également les sons locaux.

## Réseau et sécurité

Pendant le chargement et la saisie normale/custom, les erreurs, le changement d’aide, les statistiques et les sons : aucune requête hors de l’origine de l’application ; aucune requête POST/PUT ou corps de requête envoyant le texte. Aucune erreur console/page observée dans le test de production. Le mode hors ligne est testé après le chargement des ressources.

Le scan du code applicatif actif ne retrouve ni Analytics/gtag/Google Fonts, ni fetch/XHR/WebSocket métier, ni child_process/eval applicatif. Les textes sont rendus par React, pas injectés comme HTML. Les headers sont vérifiés dans le navigateur. Aucun secret ni accès micro/caméra/presse-papiers ajouté.

L’audit initial après mise à jour de Next signalait des versions anciennes de PostCSS, nanoid, brace-expansion, js-yaml et braces. Les mises à jour compatibles des dépendances ont corrigé les paquets transitifs ; `next/postcss` est résolu sur une version 8.5 corrigée (8.5.28 dans le lockfile). La dépendance `eslint-config-next`, non utilisée par la configuration ESLint, a été retirée, éliminant notamment sa chaîne fast-glob/micromatch/braces. Aucun `--force` utilisé. Yarn reste l’unique gestionnaire actif ; `package-lock.json` racine a été retiré.

Next 15.5.27 est une version de sécurité publiée par le mainteneur : https://github.com/vercel/next.js/releases/tag/v15.5.27. Aucun code applicatif upstream récent n’a été fusionné ; seuls les paquets ont été actualisés.

## Limites et décisions

- Les séquences OS de touches mortes sont simulées via les événements navigateur de test ; l’automatisation ne reconfigure pas le clavier physique du système. Un essai sur un vrai AZERTY français sous les OS cibles reste utile. Les sorties finales et la déduplication Firefox sont réellement exercées dans les deux moteurs.
- Les séquences composées enseignées concernent `fr-fr`. Les autres dispositions gardent leurs mappings explicites. Un caractère absent d’une disposition est accepté comme sortie correcte, mais ne reçoit pas une indication physique inventée.
- Les nouveaux libellés d’aide et la bibliothèque sont français ; les traductions historiques des autres contrôles restent disponibles.
- Le navigateur doit avoir chargé les ressources pour continuer sans réseau. Aucun service worker ; un rechargement hors ligne n’est pas garanti.
- Stockage local uniquement, sans synchronisation ni chiffrement applicatif. Les statistiques ne survivent pas au rechargement. L’indisponibilité de localStorage empêche la persistance, pas la pratique.
- Le retrait du SEO, sitemap public, overlay promotionnel, liens de soutien et branding upstream est volontaire pour cette instance. Licence MIT et notices originales conservées. `legacy_v1/` reste une archive ignorée.
- Build : avertissement non bloquant indiquant l’absence du plugin ESLint Next dans la configuration maison. Le lint réel et TypeScript passent. ESLint 9 a été conservé pour éviter une migration majeure sans nécessité fonctionnelle ; son registre signale une fin de support, à réexaminer lors de la prochaine maintenance. Aucune alerte de vulnérabilité dans l’audit final.
- CSP partielle compatible avec l’hydratation Next ; pas de politique complète script-src avec nonce. Pas de HSTS applicatif, de protection d’accès privé ni de configuration d’infrastructure.
