# VIET GOLF — V1 DÉMO

Application web mobile de réservation de tee times au Vietnam (TP. Hồ Chí Minh et environs).
Interface entièrement en vietnamien, design premium noir/or, pensée d'abord pour iPhone.

---

## 1. Objectif

Permettre à un golfeur de :

1. choisir une zone, une date et un nombre de joueurs ;
2. voir les golfs disponibles et leurs tee times ;
3. consulter une fiche détaillée (photos, score, avis, carte, météo) ;
4. réserver un créneau (réservation **simulée**) et obtenir une confirmation immédiate ;
5. utiliser un assistant IA **100 % par clics** pour trouver le parcours qui lui convient.

V1 = site de réservation uniquement. Ni compte, ni paiement, ni réseau social.

---

## 2. Stack

| Domaine | Choix |
| --- | --- |
| Framework | Next.js 16.3.3 (App Router), React 19, TypeScript strict |
| Styling | Tailwind CSS v4 + variables CSS pour les tokens |
| State | Zustand + middleware `persist` (localStorage) |
| Validation | Zod |
| Icônes | Lucide React |
| Dates | date-fns avec la locale `vi`, fuseau `Asia/Ho_Chi_Minh` |
| IA | SDK officiel `openai` (Responses API), modèle configurable |
| Cartes | OpenStreetMap en `<iframe>` (sans clé) |
| Tests | Vitest |

**Aucune base externe** : ni Supabase, ni Firebase, ni Prisma, ni Drizzle, ni MongoDB.
Les données sont embarquées dans l'application ; les modifications de démonstration sont
persistées dans le navigateur.

---

## 3. Installation

```bash
npm install
```

## 4. Lancement local

```bash
npm run dev      # http://localhost:3000
```

Autres scripts :

```bash
npm run typecheck
npm run lint
npm run test
npm run build
npm start
```

---

## 5. Variables d'environnement

Copier `.env.example` vers `.env.local` :

```env
OPENAI_API_KEY=
OPENAI_MODEL=gpt-5-mini
NEXT_PUBLIC_DEMO_MODE=true
```

- `OPENAI_API_KEY` est lue **uniquement côté serveur**. Il n'existe aucune variable
  `NEXT_PUBLIC_OPENAI_API_KEY` dans le projet.
- Si la clé est vide, **tout le site fonctionne** : l'assistant utilise le fallback local.
- Ne jamais committer de vraie clé.

---

## 6. Mode démo

- 6 parcours embarqués (`data/courses.ts`).
- Les tee times sont **générés dynamiquement** à partir de la date du jour (aujourd'hui + 7 jours
  minimum), de façon déterministe : le dataset ne contient aucune date figée et reste utilisable
  dans le futur (`data/seedTeeTimes.ts`).
- Prix, avis, scores, météo et disponibilités sont fictifs et clairement identifiés comme demo.
- Les réservations et les modifications faites dans `/demo-admin` sont stockées dans
  `localStorage` sous la clé `viet-golf-demo-v1`.

### Limites de la persistance locale

La persistance est propre à chaque navigateur / appareil :

- une réservation faite sur l'iPhone reste sur cet iPhone ;
- une modification faite dans `/demo-admin` sur le PC **ne se synchronise pas** vers l'iPhone ;
- une modification faite dans `/demo-admin` sur l'iPhone est visible côté client **du même iPhone**.

C'est un choix assumé pour la V1.

---

## 7. Assistant IA

- Route : `/assistant` — 5 questions, **aucun champ de saisie**, l'utilisateur répond en cliquant.
- Le **classement est déterministe**, calculé en TypeScript (`lib/ai/recommendationScore.ts`),
  sur 100 points : niveau 20, style 20, budget 20, distance 15, priorité 25. Un critère
  « Không quan trọng » (`any`) ne pénalise jamais le score.
- OpenAI n'est appelé **qu'une seule fois**, après la 5ᵉ réponse, via `POST /api/ai/recommend`.
  Il ne produit que le mini-titre, la justification et 2–3 highlights ; il ne décide jamais du
  classement et n'invente ni prix, ni horaire, ni distance, ni note.
- Entrée et sortie de l'endpoint sont validées par Zod. Les `golfId` renvoyés par le modèle sont
  re-filtrés contre la liste envoyée.

### Fallback

Si la clé est absente, ou en cas d'erreur réseau, de timeout, de quota, d'erreur API ou de JSON
invalide, l'application continue normalement avec des justifications vietnamiennes générées
localement (`lib/ai/recommendationFallback.ts`). L'utilisateur ne voit jamais d'erreur OpenAI,
de stack trace ni de 500 brut.

---

## 8. Mini admin — `/demo-admin`

Écran interne, sans authentification, pour la démonstration côté partenaire golf :

- sélection du golf et de la date ;
- liste des tee times ;
- modification de l'heure, du prix, du prix original, de la remise et des places restantes ;
- ajout et suppression d'un tee time ;
- `Khôi phục dữ liệu demo` (reset, avec confirmation).

Les changements sont visibles immédiatement côté client **dans le même navigateur**.

---

## 9. Routes

```
/                                   accueil
/search                             résultats de recherche
/golf/[slug]                        fiche golf
/golf/[slug]/tee-times              choix du créneau
/booking/confirm                    confirmation (demo, sans paiement)
/booking/success/[bookingId]        succès + code de réservation
/assistant                          assistant IA (5 clics)
/assistant/results                  top 3
/demo-admin                         mini admin interne
/api/ai/recommend                   endpoint IA (POST)
```

---

## 10. Déploiement Vercel

Le projet est prêt pour Vercel sans adaptation manuelle. **GitHub n'est pas nécessaire.**

```bash
npm install
npm run build
npx vercel          # première fois : crée / lie le projet
npx vercel --prod   # déploiement production
```

ou :

```bash
npm install -g vercel
vercel login
vercel
vercel --prod
```

Si l'IA réelle est activée, ajouter `OPENAI_API_KEY` dans les variables d'environnement du
projet Vercel (jamais exposée au client) :

```bash
vercel env add OPENAI_API_KEY production
```

Après déploiement, vérifier au minimum `/`, `/search`, `/assistant` et `/demo-admin` en HTTPS.

---

## 11. Ajouter la web app à l'écran d'accueil iPhone

1. ouvrir l'URL HTTPS de production dans **Safari** ;
2. toucher le bouton **Partager** ;
3. choisir **Ajouter à l'écran d'accueil** ;
4. valider : l'icône `Viet Golf` apparaît sur l'écran d'accueil.

Le site reste parfaitement utilisable comme site normal, sans installation.

---

## 12. Tests

```bash
npm run test
```

Couverture minimale :

- `recommendationScore` : débutant + petit budget, expert + technique, premium + qualité,
  distance maximale, critère `any`, top 3 trié ;
- utilitaires : `formatVND`, `bookingId` ;
- booking : décrément des places, passage en `full` à zéro, refus si places insuffisantes,
  protection contre la double soumission ;
- IA : fallback local sans clé, cohérence du top 3 ;
- dataset : génération déterministe et utilisable dans le futur.

---

## 13. Limites V1 assumées

Données, météo, avis et tarifs fictifs ; pas de paiement ; pas de compte ; pas de synchronisation
multi-appareils ; pas de backend partagé ; pas de notification.

Point d'extension majeur pour la V2 : l'interface `GolfRepository`
(`repositories/GolfRepository.ts`), dont `LocalDemoRepository` est l'implémentation V1. L'UI ne
manipule jamais `localStorage` directement, une vraie API pourra donc être branchée sans réécrire
les écrans.
