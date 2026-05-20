Voici ma cle API de Nylas ; nyk_v0_hXlOGTOUj2hlnJ6fIFQ8we00aBqjM2R3fNvZLYJeLHzhg7jKtYE7Hzx31JEdXJDg +Account added!
Use the following Grant ID to access data from when using our APIs:
63917b1a-d25e-44f5-a637-e48b276d5412

 le client ID est d12165a7-6c3b-4efc-a754-e9fdb60833fe et recrée la section de la premiere image fournie  avec la 2e image avec ces instructions que tu vas prendre (Voici un guide de spécifications techniques et d'intégration extrêmement complet, formaté en Markdown (`.md`), prêt à être copié-collé dans votre documentation (par exemple, un fichier `UI_GUIDELINES.md` ou `README.md`).

```markdown
# 📘 Guide d'Intégration UI/UX : Clone d'Interface SaaS

Ce document détaille les instructions complètes pour recréer au pixel près les deux composants principaux de l'interface : la **Barre d'Annonce (Announcement Bar)** et la **Barre Latérale (Sidebar)**. 

Le stack technique utilisé repose sur **HTML5** et **Tailwind CSS**.

---

## 1. La Barre d'Annonce (Announcement Bar)

### 🎯 Objectif
Afficher une bannière d'alerte non intrusive en haut de l'écran, signalant la fin de la période d'essai, avec un appel à l'action (CTA) clair.

### 📐 Anatomie et Structure
1.  **Conteneur Principal :** Occupe 100% de la largeur, collé en haut. Utilise Flexbox pour centrer le contenu.
2.  **Arrière-plan (Background) :** Combine une couleur unie, un motif (pattern) de points subtils, et un calque d'opacité (overlay) pour adoucir le contraste.
3.  **Contenu :** Une icône vectorielle (SVG), un texte explicatif, et un lien cliquable.

### 🎨 Spécifications Tailwind CSS
* **Hauteur & Espacement :** `py-2 px-4` (padding vertical léger pour ne pas surcharger le haut de page).
* **Couleurs :** * Bordure inférieure : `border-b border-orange-100`
    * Texte : `text-orange-600`
    * Lien au survol : `hover:text-orange-700`
* **Typographie :** `text-sm`, `font-medium`. Le lien est `font-semibold` et `underline`.

### ⚙️ Le CSS Personnalisé (Pattern)
Tailwind ne gérant pas les motifs complexes nativement, ajoutez cette classe dans votre CSS global pour recréer l'effet "grille de points" visible sur la maquette originale :

```css
.bg-pattern {
    background-color: #fffaf5;
    background-image: radial-gradient(#f97316 0.5px, transparent 0.5px);
    background-size: 8px 8px;
    background-position: 0 0;
}

```

### 💻 Code HTML de la Barre d'Annonce

```html
<div class="relative w-full border-b border-orange-100 flex items-center justify-center py-2 px-4 z-10 bg-pattern">
    <div class="absolute inset-0 bg-white/60"></div>
    
    <div class="relative flex items-center gap-2 text-orange-600 font-medium text-sm">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <span>Your Starter trial is over. Upgrade to keep finding candidates, exporting collections, and sharing with your team.</span>
        <a href="#" class="font-semibold underline hover:text-orange-700 ml-1 transition-colors">Explore plans</a>
    </div>
</div>

```

---

## 2. La Barre Latérale (Sidebar)

### 🎯 Objectif

Fournir la navigation principale de l'application, un accès rapide aux recherches, et afficher le statut du compte. Elle doit être fixe à gauche et scroller indépendamment du contenu principal.

### 📐 Anatomie et Structure

La sidebar est divisée en 3 zones distinctes gérées via Flexbox (`flex-col`, `justify-between`) :

1. **Zone Supérieure (Top) :** Sélecteur de Workspace et inputs de recherche.
2. **Zone Centrale (Scrollable) :** Liens de navigation et module "Collections".
3. **Zone Inférieure (Bottom) :** Carte d'abonnement (Upgrade) et liens de paramètres.

### 🎨 Spécifications Tailwind CSS (Global)

* **Largeur :** Fixe à `w-[260px]`. Ne doit pas rétrécir (`flex-shrink-0`).
* **Couleur de fond :** Gris extrêmement clair, presque blanc (`bg-[#FBFBFC]`).
* **Bordure :** Séparation subtile avec le contenu (`border-r border-gray-200`).

### 🧩 Composants Détaillés de la Sidebar

#### A. Sélecteur de Workspace et Recherche

* **Bouton Workspace :** Doit ressembler à un menu déroulant. Au survol : `hover:bg-gray-100`. Avatar généré avec un carré (`w-5 h-5 bg-green-500 rounded text-white`).
* **Champs de recherche :** Imitation de champs d'entrée (inputs). Fond blanc (`bg-white`), bordure grise (`border border-gray-200`), et ombre très légère (`shadow-sm`).
* **Raccourcis clavier (Kbd) :** Petit badge stylisé pour indiquer `⌘ K`. Classes : `bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded text-[10px] font-medium border border-gray-200`.

#### B. Navigation Principale (Menu Items)

* **État par défaut (Inactif) :** Texte gris (`text-gray-600`), fond transparent, transition au survol (`hover:bg-gray-100`).
* **État Actif (Sélectionné) :** Fond gris assombri pour marquer la sélection (`bg-gray-200/60`), texte noir (`text-gray-900`), icône plus sombre (`text-gray-600`).
* **Interaction Micro-UX (Collections) :** Le bouton "+" pour ajouter une collection n'apparaît qu'au survol de la ligne entière.
* *Implémentation :* Placer la classe `group` sur le conteneur parent, et `opacity-0 group-hover:opacity-100 transition-opacity` sur le bouton "+".



#### C. Carte d'Abonnement (Upgrade Card)

* **Structure :** Conteneur avec `relative overflow-hidden` pour contenir le dégradé et le motif.
* **Design :** Bordure orange très claire (`border-orange-100`), fond blanc.
* **Barre de progression :** Construite avec deux divs superposées. La div parente représente le fond de la jauge (`bg-gray-100 rounded-full`), la div enfant représente la progression avec un dégradé (`bg-gradient-to-r from-orange-400 to-orange-500`).

### 💻 Code HTML de la Sidebar

```html
<aside class="w-[260px] bg-[#FBFBFC] border-r border-gray-200 flex flex-col h-full flex-shrink-0 text-sm">
    
    <div class="p-3">
        <div class="flex items-center justify-between mb-3">
            <button class="flex items-center gap-2 hover:bg-gray-100 px-2 py-1.5 rounded-md w-full text-left font-medium transition-colors">
                <div class="w-5 h-5 bg-green-500 rounded text-white flex items-center justify-center text-xs">Q</div>
                <span class="flex-1 truncate text-gray-900">QuebecSaaS</span>
                <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
            </button>
            <button class="text-gray-400 hover:text-gray-600 ml-1 p-1 transition-colors">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7"></path></svg>
            </button>
        </div>

        <div class="flex gap-1">
            <button class="flex-1 flex items-center justify-between bg-white border border-gray-200 rounded-md px-2.5 py-1.5 text-gray-500 hover:border-gray-300 shadow-sm text-xs transition-colors">
                <div class="flex items-center gap-2">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    <span>New search</span>
                </div>
                <span class="bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded text-[10px] font-medium border border-gray-200 shadow-sm">⌘ K</span>
            </button>
            <button class="flex items-center justify-center bg-white border border-gray-200 rounded-md w-8 h-8 text-gray-500 hover:border-gray-300 shadow-sm transition-colors">
                <span class="bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded text-[10px] font-medium border border-gray-200 shadow-sm">⌘ /</span>
            </button>
        </div>
    </div>

    <nav class="flex-1 overflow-y-auto py-2 px-3 space-y-0.5">
        <a href="#" class="flex items-center gap-3 px-2 py-1.5 bg-gray-200/60 rounded-md font-medium text-gray-900 transition-colors">
            <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
            Dashboard
        </a>
        <a href="#" class="flex items-center gap-3 px-2 py-1.5 hover:bg-gray-100 rounded-md text-gray-600 transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
            Sourcing
        </a>
        
        <div class="pt-6 pb-2">
            <div class="flex items-center justify-between px-2 group cursor-pointer">
                <button class="flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-gray-700 transition-colors">
                    Collections
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                </button>
                <button class="text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                </button>
            </div>
            <div class="px-2 mt-2 text-xs text-gray-400">
                No collections added yet.
            </div>
        </div>
    </nav>

    <div class="p-3 mt-auto border-t border-gray-200/60 space-y-1">
        
        <div class="relative overflow-hidden mb-3 p-3 rounded-lg border border-orange-100 shadow-sm bg-white">
            <div class="absolute inset-0 bg-pattern opacity-30 pointer-events-none"></div>
            <div class="absolute top-0 left-0 w-full h-8 bg-gradient-to-b from-green-50/50 to-transparent pointer-events-none"></div>
            
            <div class="relative z-10">
                <h4 class="font-medium text-gray-900 mb-1 text-xs">Your Starter trial is complete</h4>
                <p class="text-gray-500 text-[11px] leading-tight mb-3">You've used all 7 days of your trial, upgrade to continue using all features.</p>
                
                <div class="w-full bg-gray-100 rounded-full h-1.5 mb-1 overflow-hidden border border-gray-200/50">
                    <div class="bg-gradient-to-r from-orange-400 to-orange-500 h-1.5 rounded-full w-full"></div>
                </div>
            </div>
        </div>

        <a href="#" class="flex items-center gap-3 px-2 py-1.5 hover:bg-gray-100 rounded-md text-gray-600 transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
            Invite team
        </a>
    </div>
</aside>

```

---

## 🏗️ Structure Globale de la Page (Layout)

Pour que l'Announcement Bar reste en haut et que la Sidebar prenne la hauteur de l'écran sans déborder (afin que seul le contenu de la page scrolle), voici la structure Flexbox parente à utiliser sur votre `<body>` ou composant App principal :

```html
<div class="h-screen flex flex-col overflow-hidden bg-white text-gray-700 font-sans">
    
    <div class="relative w-full...">...</div>

    <div class="flex flex-1 overflow-hidden">
        
        <aside class="w-[260px] h-full flex flex-col...">...</aside>

        <main class="flex-1 overflow-y-auto p-8">
            </main>
        
    </div>
</div>

```

```

```) et planifier avant de l'appliquer a l'application et recrée la hero page de la landing page avec ; Voici un guide d'intégration complet en Markdown (`.md`) pour reproduire la **Hero Section** de la landing page (Wrangle).

L'un des éléments les plus distinctifs de cette interface est le **fond avec un dégradé flou (mesh gradient)** encapsulé dans un grand conteneur aux bords arrondis.

```markdown
# 📘 Guide d'Intégration UI/UX : Hero Section Landing Page

Ce document fournit les instructions et le code pour recréer au pixel près la section "Hero" de la maquette fournie, incluant la barre de navigation, les effets de flou en arrière-plan (Mesh Gradient), et la disposition de l'image de présentation.

Le stack technique utilisé repose sur **HTML5** et **Tailwind CSS**.

---

## 📐 Anatomie et Structure

La section est divisée en plusieurs parties clés :
1.  **Le Conteneur Global (Hero Card) :** Contrairement à un fond classique prenant 100% de la largeur, le fond coloré ici est contenu dans une grande "carte" avec de larges bords arrondis (`rounded-[2rem]`).
2.  **L'Arrière-plan (Mesh Gradient) :** Créé en utilisant des div avec des couleurs pastel (cyan et rose/violet), positionnées en absolu et extrêmement floutées (`blur-[120px]`).
3.  **La Navigation (Header) :** Centrée, transparente, avec des menus déroulants implicites et des Call-to-Action (CTA) discrets.
4.  **Le Contenu Principal :** Un badge de mise à jour, un titre imposant (H1), un sous-titre lisible, et le bouton d'action principal.
5.  **Le Mockup de l'Application :** Une image (ou un conteneur) qui dépasse légèrement de la zone de texte, avec une ombre portée douce.
6.  **La Section Logos (Social Proof) :** Sous la carte principale, une ligne de logos partenaires en niveaux de gris.

---

## 🎨 Spécifications Tailwind CSS

* **Typographie :** La police principale est une Sans-Serif géométrique (Tailwind par défaut `font-sans` ou idéalement 'Inter').
* **Couleurs du dégradé :** * Gauche (Bleu/Cyan) : `bg-[#E0F2FE]` ou similaire.
    * Droite (Rose/Violet) : `bg-[#FAE8FF]` ou similaire.
* **Boutons :** Les boutons ont un fond blanc, une bordure très fine (`border-gray-200`) et une ombre extrêmement subtile (`shadow-sm`).
* **Titres :** Le H1 utilise un interlettrage réduit (`tracking-tight`) pour un aspect plus premium.

---

## 💻 Code HTML / Tailwind Complet

Vous pouvez copier-coller ce code dans un fichier HTML. J'ai inclus le CDN Tailwind pour un test direct.

```html
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Landing Page Hero Clone</title>
    <script src="[https://cdn.tailwindcss.com](https://cdn.tailwindcss.com)"></script>
    <link href="[https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap](https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap)" rel="stylesheet">
    <style>
        body { font-family: 'Inter', sans-serif; }
    </style>
</head>
<body class="bg-white text-gray-900 antialiased selection:bg-purple-100 selection:text-purple-900">

    <div class="max-w-[1440px] mx-auto p-4 md:p-6 lg:p-8 pt-4">
        
        <div class="relative bg-[#FAFBFC] rounded-[2rem] overflow-hidden border border-gray-100/50 pb-20">
            
            <div class="absolute top-[-10%] left-[-10%] w-[50%] h-[60%] bg-[#E0F2FE] rounded-full mix-blend-multiply filter blur-[100px] opacity-80 pointer-events-none"></div>
            <div class="absolute top-[10%] right-[-10%] w-[45%] h-[70%] bg-[#FAE8FF] rounded-full mix-blend-multiply filter blur-[120px] opacity-80 pointer-events-none"></div>

            <header class="relative z-10 flex items-center justify-between px-6 py-5 md:px-10 max-w-7xl mx-auto w-full">
                <div class="flex items-center gap-2">
                    <svg class="w-6 h-6 text-emerald-500" viewBox="0 0 24 24" fill="currentColor">
                        <rect x="3" y="3" width="8" height="8" rx="2" />
                        <rect x="13" y="3" width="8" height="8" rx="2" fill-opacity="0.5" />
                        <rect x="3" y="13" width="8" height="8" rx="2" fill-opacity="0.5" />
                    </svg>
                    <span class="text-xl font-bold tracking-tight">Wrangle</span>
                </div>

                <nav class="hidden md:flex items-center gap-8 text-[15px] font-medium text-gray-700">
                    <button class="flex items-center gap-1 hover:text-gray-900 transition-colors">
                        Product
                        <svg class="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                    </button>
                    <button class="flex items-center gap-1 hover:text-gray-900 transition-colors">
                        Solutions
                        <svg class="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                    </button>
                    <a href="#" class="hover:text-gray-900 transition-colors">Pricing</a>
                </nav>

                <div class="flex items-center gap-5 text-[15px] font-medium">
                    <a href="#" class="hidden lg:block text-gray-700 hover:text-gray-900">Get a Demo</a>
                    <a href="#" class="text-gray-700 hover:text-gray-900">Log In</a>
                    <a href="#" class="flex items-center gap-1 px-4 py-2 bg-white border border-gray-200 rounded-full shadow-sm hover:bg-gray-50 transition-colors text-gray-900">
                        Get started
                        <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                    </a>
                </div>
            </header>

            <main class="relative z-10 pt-20 pb-16 px-4 text-center max-w-4xl mx-auto">
                
                <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-gray-200 shadow-sm text-xs font-medium text-gray-600 mb-8 hover:bg-gray-50 cursor-pointer transition-colors">
                    <span class="text-lg leading-none">📢</span> April 27: Introducing our API and MCP
                </div>

                <h1 class="text-5xl md:text-[64px] leading-tight font-semibold tracking-tight text-gray-900 mb-6">
                    From Search to Shortlist in Minutes
                </h1>

                <p class="text-lg md:text-xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
                    Wrangle lets you source in natural language, engage candidates at scale, and interview with intelligence.
                </p>

                <a href="#" class="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-200 shadow-sm text-base font-semibold rounded-full text-gray-900 hover:bg-gray-50 transition-all hover:shadow-md">
                    Get Started
                    <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                </a>
            </main>

            <div class="relative z-10 max-w-5xl mx-auto px-4 sm:px-6">
                <div class="rounded-2xl border border-gray-200/60 bg-white/40 backdrop-blur-md p-2 shadow-2xl">
                    <div class="rounded-xl overflow-hidden bg-white border border-gray-100 relative aspect-video flex items-center justify-center">
                        
                        <div class="absolute inset-0 bg-gray-50 flex items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 m-4 rounded-lg">
                            [ Insérer l'image de l'application ici ]
                        </div>

                    </div>
                </div>
            </div>

        </div> <div class="max-w-5xl mx-auto pt-16 pb-8 px-4 flex flex-wrap justify-center items-center gap-x-12 gap-y-8 opacity-60 grayscale">
            <div class="text-xl font-bold tracking-tighter">chime</div>
            <div class="text-xl font-bold flex items-center gap-1">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 22h20L12 2z"/></svg>
                Serval
            </div>
            <div class="text-xl font-bold">Lightspeed</div>
            <div class="text-xl font-bold tracking-widest">SULLY.AI</div>
        </div>

    </div>

</body>
</html>

```

### 💡 Points d'attention pour un résultat parfait :

1. **L'image de l'application (Mockup) :** Dans le code HTML ci-dessus, j'ai créé un espace réservé (placeholder). Pour obtenir le rendu final, vous devez exporter l'image de l'interface (la grande fenêtre avec la liste des candidats) avec un fond transparent, et remplacer la zone `[ Insérer l'image de l'application ici ]` par une balise `<img src="..." class="w-full h-auto object-cover" alt="App interface">`.
2. **Effet Glassmorphism (Subtil) :** Autour de l'image de l'application, j'ai ajouté une bordure avec un effet `backdrop-blur-md` et `bg-white/40`. Cela crée cette légère aura blanche et semi-transparente qui fait ressortir la capture d'écran par rapport au fond coloré.
3. **Réactivité (Responsive) :** Le code utilise des classes comme `hidden md:flex` pour cacher la navigation complète sur mobile au profit d'un menu plus simple, et ajuste la taille du texte H1 (`text-5xl md:text-[64px]`) selon l'écran.
Voici ma cle API de Nylas ; nyk_v0_hXlOGTOUj2hlnJ6fIFQ8we00aBqjM2R3fNvZLYJeLHzhg7jKtYE7Hzx31JEdXJDg +Account added!
Use the following Grant ID to access data from when using our APIs:
63917b1a-d25e-44f5-a637-e48b276d5412

 le client ID est d12165a7-6c3b-4efc-a754-e9fdb60833fe et recrée la section de la premiere image fournie  avec la 2e image avec ces instructions que tu vas prendre (Voici un guide de spécifications techniques et d'intégration extrêmement complet, formaté en Markdown (`.md`), prêt à être copié-collé dans votre documentation (par exemple, un fichier `UI_GUIDELINES.md` ou `README.md`).

```markdown
# 📘 Guide d'Intégration UI/UX : Clone d'Interface SaaS

Ce document détaille les instructions complètes pour recréer au pixel près les deux composants principaux de l'interface : la **Barre d'Annonce (Announcement Bar)** et la **Barre Latérale (Sidebar)**. 

Le stack technique utilisé repose sur **HTML5** et **Tailwind CSS**.

---

## 1. La Barre d'Annonce (Announcement Bar)

### 🎯 Objectif
Afficher une bannière d'alerte non intrusive en haut de l'écran, signalant la fin de la période d'essai, avec un appel à l'action (CTA) clair.

### 📐 Anatomie et Structure
1.  **Conteneur Principal :** Occupe 100% de la largeur, collé en haut. Utilise Flexbox pour centrer le contenu.
2.  **Arrière-plan (Background) :** Combine une couleur unie, un motif (pattern) de points subtils, et un calque d'opacité (overlay) pour adoucir le contraste.
3.  **Contenu :** Une icône vectorielle (SVG), un texte explicatif, et un lien cliquable.

### 🎨 Spécifications Tailwind CSS
* **Hauteur & Espacement :** `py-2 px-4` (padding vertical léger pour ne pas surcharger le haut de page).
* **Couleurs :** * Bordure inférieure : `border-b border-orange-100`
    * Texte : `text-orange-600`
    * Lien au survol : `hover:text-orange-700`
* **Typographie :** `text-sm`, `font-medium`. Le lien est `font-semibold` et `underline`.

### ⚙️ Le CSS Personnalisé (Pattern)
Tailwind ne gérant pas les motifs complexes nativement, ajoutez cette classe dans votre CSS global pour recréer l'effet "grille de points" visible sur la maquette originale :

```css
.bg-pattern {
    background-color: #fffaf5;
    background-image: radial-gradient(#f97316 0.5px, transparent 0.5px);
    background-size: 8px 8px;
    background-position: 0 0;
}

```

### 💻 Code HTML de la Barre d'Annonce

```html
<div class="relative w-full border-b border-orange-100 flex items-center justify-center py-2 px-4 z-10 bg-pattern">
    <div class="absolute inset-0 bg-white/60"></div>
    
    <div class="relative flex items-center gap-2 text-orange-600 font-medium text-sm">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <span>Your Starter trial is over. Upgrade to keep finding candidates, exporting collections, and sharing with your team.</span>
        <a href="#" class="font-semibold underline hover:text-orange-700 ml-1 transition-colors">Explore plans</a>
    </div>
</div>

```

---

## 2. La Barre Latérale (Sidebar)

### 🎯 Objectif

Fournir la navigation principale de l'application, un accès rapide aux recherches, et afficher le statut du compte. Elle doit être fixe à gauche et scroller indépendamment du contenu principal.

### 📐 Anatomie et Structure

La sidebar est divisée en 3 zones distinctes gérées via Flexbox (`flex-col`, `justify-between`) :

1. **Zone Supérieure (Top) :** Sélecteur de Workspace et inputs de recherche.
2. **Zone Centrale (Scrollable) :** Liens de navigation et module "Collections".
3. **Zone Inférieure (Bottom) :** Carte d'abonnement (Upgrade) et liens de paramètres.

### 🎨 Spécifications Tailwind CSS (Global)

* **Largeur :** Fixe à `w-[260px]`. Ne doit pas rétrécir (`flex-shrink-0`).
* **Couleur de fond :** Gris extrêmement clair, presque blanc (`bg-[#FBFBFC]`).
* **Bordure :** Séparation subtile avec le contenu (`border-r border-gray-200`).

### 🧩 Composants Détaillés de la Sidebar

#### A. Sélecteur de Workspace et Recherche

* **Bouton Workspace :** Doit ressembler à un menu déroulant. Au survol : `hover:bg-gray-100`. Avatar généré avec un carré (`w-5 h-5 bg-green-500 rounded text-white`).
* **Champs de recherche :** Imitation de champs d'entrée (inputs). Fond blanc (`bg-white`), bordure grise (`border border-gray-200`), et ombre très légère (`shadow-sm`).
* **Raccourcis clavier (Kbd) :** Petit badge stylisé pour indiquer `⌘ K`. Classes : `bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded text-[10px] font-medium border border-gray-200`.

#### B. Navigation Principale (Menu Items)

* **État par défaut (Inactif) :** Texte gris (`text-gray-600`), fond transparent, transition au survol (`hover:bg-gray-100`).
* **État Actif (Sélectionné) :** Fond gris assombri pour marquer la sélection (`bg-gray-200/60`), texte noir (`text-gray-900`), icône plus sombre (`text-gray-600`).
* **Interaction Micro-UX (Collections) :** Le bouton "+" pour ajouter une collection n'apparaît qu'au survol de la ligne entière.
* *Implémentation :* Placer la classe `group` sur le conteneur parent, et `opacity-0 group-hover:opacity-100 transition-opacity` sur le bouton "+".



#### C. Carte d'Abonnement (Upgrade Card)

* **Structure :** Conteneur avec `relative overflow-hidden` pour contenir le dégradé et le motif.
* **Design :** Bordure orange très claire (`border-orange-100`), fond blanc.
* **Barre de progression :** Construite avec deux divs superposées. La div parente représente le fond de la jauge (`bg-gray-100 rounded-full`), la div enfant représente la progression avec un dégradé (`bg-gradient-to-r from-orange-400 to-orange-500`).

### 💻 Code HTML de la Sidebar

```html
<aside class="w-[260px] bg-[#FBFBFC] border-r border-gray-200 flex flex-col h-full flex-shrink-0 text-sm">
    
    <div class="p-3">
        <div class="flex items-center justify-between mb-3">
            <button class="flex items-center gap-2 hover:bg-gray-100 px-2 py-1.5 rounded-md w-full text-left font-medium transition-colors">
                <div class="w-5 h-5 bg-green-500 rounded text-white flex items-center justify-center text-xs">Q</div>
                <span class="flex-1 truncate text-gray-900">QuebecSaaS</span>
                <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
            </button>
            <button class="text-gray-400 hover:text-gray-600 ml-1 p-1 transition-colors">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7"></path></svg>
            </button>
        </div>

        <div class="flex gap-1">
            <button class="flex-1 flex items-center justify-between bg-white border border-gray-200 rounded-md px-2.5 py-1.5 text-gray-500 hover:border-gray-300 shadow-sm text-xs transition-colors">
                <div class="flex items-center gap-2">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    <span>New search</span>
                </div>
                <span class="bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded text-[10px] font-medium border border-gray-200 shadow-sm">⌘ K</span>
            </button>
            <button class="flex items-center justify-center bg-white border border-gray-200 rounded-md w-8 h-8 text-gray-500 hover:border-gray-300 shadow-sm transition-colors">
                <span class="bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded text-[10px] font-medium border border-gray-200 shadow-sm">⌘ /</span>
            </button>
        </div>
    </div>

    <nav class="flex-1 overflow-y-auto py-2 px-3 space-y-0.5">
        <a href="#" class="flex items-center gap-3 px-2 py-1.5 bg-gray-200/60 rounded-md font-medium text-gray-900 transition-colors">
            <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
            Dashboard
        </a>
        <a href="#" class="flex items-center gap-3 px-2 py-1.5 hover:bg-gray-100 rounded-md text-gray-600 transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
            Sourcing
        </a>
        
        <div class="pt-6 pb-2">
            <div class="flex items-center justify-between px-2 group cursor-pointer">
                <button class="flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-gray-700 transition-colors">
                    Collections
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                </button>
                <button class="text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                </button>
            </div>
            <div class="px-2 mt-2 text-xs text-gray-400">
                No collections added yet.
            </div>
        </div>
    </nav>

    <div class="p-3 mt-auto border-t border-gray-200/60 space-y-1">
        
        <div class="relative overflow-hidden mb-3 p-3 rounded-lg border border-orange-100 shadow-sm bg-white">
            <div class="absolute inset-0 bg-pattern opacity-30 pointer-events-none"></div>
            <div class="absolute top-0 left-0 w-full h-8 bg-gradient-to-b from-green-50/50 to-transparent pointer-events-none"></div>
            
            <div class="relative z-10">
                <h4 class="font-medium text-gray-900 mb-1 text-xs">Your Starter trial is complete</h4>
                <p class="text-gray-500 text-[11px] leading-tight mb-3">You've used all 7 days of your trial, upgrade to continue using all features.</p>
                
                <div class="w-full bg-gray-100 rounded-full h-1.5 mb-1 overflow-hidden border border-gray-200/50">
                    <div class="bg-gradient-to-r from-orange-400 to-orange-500 h-1.5 rounded-full w-full"></div>
                </div>
            </div>
        </div>

        <a href="#" class="flex items-center gap-3 px-2 py-1.5 hover:bg-gray-100 rounded-md text-gray-600 transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
            Invite team
        </a>
    </div>
</aside>

```

---

## 🏗️ Structure Globale de la Page (Layout)

Pour que l'Announcement Bar reste en haut et que la Sidebar prenne la hauteur de l'écran sans déborder (afin que seul le contenu de la page scrolle), voici la structure Flexbox parente à utiliser sur votre `<body>` ou composant App principal :

```html
<div class="h-screen flex flex-col overflow-hidden bg-white text-gray-700 font-sans">
    
    <div class="relative w-full...">...</div>

    <div class="flex flex-1 overflow-hidden">
        
        <aside class="w-[260px] h-full flex flex-col...">...</aside>

        <main class="flex-1 overflow-y-auto p-8">
            </main>
        
    </div>
</div>

```

```

```) et planifier avant de l'appliquer a l'application et recrée la hero page de la landing page avec ; Voici un guide d'intégration complet en Markdown (`.md`) pour reproduire la **Hero Section** de la landing page (Wrangle).

L'un des éléments les plus distinctifs de cette interface est le **fond avec un dégradé flou (mesh gradient)** encapsulé dans un grand conteneur aux bords arrondis.

```markdown
# 📘 Guide d'Intégration UI/UX : Hero Section Landing Page

Ce document fournit les instructions et le code pour recréer au pixel près la section "Hero" de la maquette fournie, incluant la barre de navigation, les effets de flou en arrière-plan (Mesh Gradient), et la disposition de l'image de présentation.

Le stack technique utilisé repose sur **HTML5** et **Tailwind CSS**.

---

## 📐 Anatomie et Structure

La section est divisée en plusieurs parties clés :
1.  **Le Conteneur Global (Hero Card) :** Contrairement à un fond classique prenant 100% de la largeur, le fond coloré ici est contenu dans une grande "carte" avec de larges bords arrondis (`rounded-[2rem]`).
2.  **L'Arrière-plan (Mesh Gradient) :** Créé en utilisant des div avec des couleurs pastel (cyan et rose/violet), positionnées en absolu et extrêmement floutées (`blur-[120px]`).
3.  **La Navigation (Header) :** Centrée, transparente, avec des menus déroulants implicites et des Call-to-Action (CTA) discrets.
4.  **Le Contenu Principal :** Un badge de mise à jour, un titre imposant (H1), un sous-titre lisible, et le bouton d'action principal.
5.  **Le Mockup de l'Application :** Une image (ou un conteneur) qui dépasse légèrement de la zone de texte, avec une ombre portée douce.
6.  **La Section Logos (Social Proof) :** Sous la carte principale, une ligne de logos partenaires en niveaux de gris.

---

## 🎨 Spécifications Tailwind CSS

* **Typographie :** La police principale est une Sans-Serif géométrique (Tailwind par défaut `font-sans` ou idéalement 'Inter').
* **Couleurs du dégradé :** * Gauche (Bleu/Cyan) : `bg-[#E0F2FE]` ou similaire.
    * Droite (Rose/Violet) : `bg-[#FAE8FF]` ou similaire.
* **Boutons :** Les boutons ont un fond blanc, une bordure très fine (`border-gray-200`) et une ombre extrêmement subtile (`shadow-sm`).
* **Titres :** Le H1 utilise un interlettrage réduit (`tracking-tight`) pour un aspect plus premium.

---

## 💻 Code HTML / Tailwind Complet

Vous pouvez copier-coller ce code dans un fichier HTML. J'ai inclus le CDN Tailwind pour un test direct.

```html
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Landing Page Hero Clone</title>
    <script src="[https://cdn.tailwindcss.com](https://cdn.tailwindcss.com)"></script>
    <link href="[https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap](https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap)" rel="stylesheet">
    <style>
        body { font-family: 'Inter', sans-serif; }
    </style>
</head>
<body class="bg-white text-gray-900 antialiased selection:bg-purple-100 selection:text-purple-900">

    <div class="max-w-[1440px] mx-auto p-4 md:p-6 lg:p-8 pt-4">
        
        <div class="relative bg-[#FAFBFC] rounded-[2rem] overflow-hidden border border-gray-100/50 pb-20">
            
            <div class="absolute top-[-10%] left-[-10%] w-[50%] h-[60%] bg-[#E0F2FE] rounded-full mix-blend-multiply filter blur-[100px] opacity-80 pointer-events-none"></div>
            <div class="absolute top-[10%] right-[-10%] w-[45%] h-[70%] bg-[#FAE8FF] rounded-full mix-blend-multiply filter blur-[120px] opacity-80 pointer-events-none"></div>

            <header class="relative z-10 flex items-center justify-between px-6 py-5 md:px-10 max-w-7xl mx-auto w-full">
                <div class="flex items-center gap-2">
                    <svg class="w-6 h-6 text-emerald-500" viewBox="0 0 24 24" fill="currentColor">
                        <rect x="3" y="3" width="8" height="8" rx="2" />
                        <rect x="13" y="3" width="8" height="8" rx="2" fill-opacity="0.5" />
                        <rect x="3" y="13" width="8" height="8" rx="2" fill-opacity="0.5" />
                    </svg>
                    <span class="text-xl font-bold tracking-tight">Wrangle</span>
                </div>

                <nav class="hidden md:flex items-center gap-8 text-[15px] font-medium text-gray-700">
                    <button class="flex items-center gap-1 hover:text-gray-900 transition-colors">
                        Product
                        <svg class="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                    </button>
                    <button class="flex items-center gap-1 hover:text-gray-900 transition-colors">
                        Solutions
                        <svg class="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                    </button>
                    <a href="#" class="hover:text-gray-900 transition-colors">Pricing</a>
                </nav>

                <div class="flex items-center gap-5 text-[15px] font-medium">
                    <a href="#" class="hidden lg:block text-gray-700 hover:text-gray-900">Get a Demo</a>
                    <a href="#" class="text-gray-700 hover:text-gray-900">Log In</a>
                    <a href="#" class="flex items-center gap-1 px-4 py-2 bg-white border border-gray-200 rounded-full shadow-sm hover:bg-gray-50 transition-colors text-gray-900">
                        Get started
                        <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                    </a>
                </div>
            </header>

            <main class="relative z-10 pt-20 pb-16 px-4 text-center max-w-4xl mx-auto">
                
                <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-gray-200 shadow-sm text-xs font-medium text-gray-600 mb-8 hover:bg-gray-50 cursor-pointer transition-colors">
                    <span class="text-lg leading-none">📢</span> April 27: Introducing our API and MCP
                </div>

                <h1 class="text-5xl md:text-[64px] leading-tight font-semibold tracking-tight text-gray-900 mb-6">
                    From Search to Shortlist in Minutes
                </h1>

                <p class="text-lg md:text-xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
                    Wrangle lets you source in natural language, engage candidates at scale, and interview with intelligence.
                </p>

                <a href="#" class="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-200 shadow-sm text-base font-semibold rounded-full text-gray-900 hover:bg-gray-50 transition-all hover:shadow-md">
                    Get Started
                    <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                </a>
            </main>

            <div class="relative z-10 max-w-5xl mx-auto px-4 sm:px-6">
                <div class="rounded-2xl border border-gray-200/60 bg-white/40 backdrop-blur-md p-2 shadow-2xl">
                    <div class="rounded-xl overflow-hidden bg-white border border-gray-100 relative aspect-video flex items-center justify-center">
                        
                        <div class="absolute inset-0 bg-gray-50 flex items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 m-4 rounded-lg">
                            [ Insérer l'image de l'application ici ]
                        </div>

                    </div>
                </div>
            </div>

        </div> <div class="max-w-5xl mx-auto pt-16 pb-8 px-4 flex flex-wrap justify-center items-center gap-x-12 gap-y-8 opacity-60 grayscale">
            <div class="text-xl font-bold tracking-tighter">chime</div>
            <div class="text-xl font-bold flex items-center gap-1">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 22h20L12 2z"/></svg>
                Serval
            </div>
            <div class="text-xl font-bold">Lightspeed</div>
            <div class="text-xl font-bold tracking-widest">SULLY.AI</div>
        </div>

    </div>

</body>
</html>

```

### 💡 Points d'attention pour un résultat parfait :

1. **L'image de l'application (Mockup) :** Dans le code HTML ci-dessus, j'ai créé un espace réservé (placeholder). Pour obtenir le rendu final, vous devez exporter l'image de l'interface (la grande fenêtre avec la liste des candidats) avec un fond transparent, et remplacer la zone `[ Insérer l'image de l'application ici ]` par une balise `<img src="..." class="w-full h-auto object-cover" alt="App interface">`.
2. **Effet Glassmorphism (Subtil) :** Autour de l'image de l'application, j'ai ajouté une bordure avec un effet `backdrop-blur-md` et `bg-white/40`. Cela crée cette légère aura blanche et semi-transparente qui fait ressortir la capture d'écran par rapport au fond coloré.
3. **Réactivité (Responsive) :** Le code utilise des classes comme `hidden md:flex` pour cacher la navigation complète sur mobile au profit d'un menu plus simple, et ajuste la taille du texte H1 (`text-5xl md:text-[64px]`) selon l'écran." J
	image/png*fC:/Users/upris/.gemini/antigravity/brain/2147ffbd-752b-4024-a122-61e0cb883110/media__1779304549980.png2
PNG

   IHDR  @      Go  IDATx[le3{_vb(*A	 ;6BAiD0&5Q ^FEPTJЖKnnwvf<Sbbjf2'ߜw;dT35'1Ϳ%g񰿁7G~SIx'fyDiJHD1Ra`&cC.²FJt`4g+e5tt-!)!y-uɫ$^Oņѓ1b7@tL9gJnnFkcL%GI%o`[|Z|]|iت$AxM}X=nXcWKk--^7sh3xBSHmg%A/I;M׵t_:`%=Jm4tr]"i:v[_OW׸Zxh'h<rh+}gzfۯqGm@'IiS}{Ά/0G:-ܫ$)Ծml&!>]9C4Gwu~/smS9G>û)3-Cw[D;e2'T0z#$(2
@AeT2\^'.SS-$4
NrpgeDIyDrW%oz#ۍ/$12Ȼf+B5-Itq8Tf`DΒA  %śO )YYC]`*ؗdE@EuywFeP=^_nJMAu{Q=Q>/!e$F\/UBCΜq''/SN+%3<Kܫ(':JNY9_/QJk)^UKX֌ETnI-oK(^"˺xn7/R\Cd.'j	x*RXAב=gs:L[5Woe$.\rTPcɟ]M35dϨľll&'Cނ{([*%5IEVS0w!KkaE˶Pr+UK)Nȿ0\^?N"t:Qő"gfwBxE}PE)SEbP.E  Dq   IDAT \l    IENDB` J
	image/png*fC:/Users/upris/.gemini/antigravity/brain/2147ffbd-752b-4024-a122-61e0cb883110/media__1779304606073.png2PNG

   IHDR  @      4r5  
IDATx\r]Y{`ْ,v	((&&y=PP@9C۲`%'Nߺ:*w{:ѯ4|6fil<n-Vϻ+5듦D&mRWbly2|e]2ioϛF6rUG8//w9(i4:Om8W{ΥijEt4b{G۬424+~z|1KvSrbיl.1˧z-3z_+
\2Q&CWf<Wr1E~ػ2p=WXWE޶|/Fmsic|4ʎwyV֑~*Veԙ}]+z_^z}iZ>+/w|ewmB:=Wn?cd.ggڪUroӫ}j*yysY!̟-捴<ĩ3<Wj1[o<j36k~ӟws~AgI~,I]tiz`4)'zM$ڝߗ'L`4EW=Ծև1;ew3u%.z;|eK>bkt/sRtϽx¿gHzu9']5O|;ȵ*g2Ĝ7.:(_埁%+ :vƯ6OxC;wo<YןT~=uZ}$}
g9EGlZ	뽐^=Sy<u$}x*'ޜsxߌS>wsKb(ט:PՎ2;w.3{P\{dLmb+b'5Kf]A*9g{>S(}^eZCm7gW}*SGpHo(ϸϚ,|~U:(};*^(Nj".FK'zڵE*7l-r_\chԷ{!ex%e)}m SRqU#Y`/J%l\ţ6Q6$EICǚz)pKV?zJDzD?%kS^&Yw&^fV{Gb m]?:p;wϒGh_;O'b~qldErx-
Ľauc^ϧjFL#EE}[ &@̫::y/yt
<qu0v}.RO}jӿRk$Z?&WzZcKxI<ǿ5m=~H /sD^q_=r;JCǻ罔o3C86% ѷXCI~c@}_o$\?Γ~{{X܍Cڋ-n>18|xI{*9ӍӼ@ h$Mx38F  3Hrd+t/q$NC!;ï"7I!9`°4.q$/FIC>pu]d}ꊥo&-\6' 5Og!bY/}_gWW|\_P{4c`4Ar[ɍ;ћ; iVr}6\}~ܼ_O&K؋yv26>bYӤazd`(fWɉSէwg)lc5bƩ:bpw$gT*ٯ'c]|ꗦ_,o'?S<}7'#4/3~si3E;bͧɼ&uQQ+!9\e<7_֛[¿ܢPd3n{bgw(/9{-xoγdE{@={U,{G"w3}RA|)*	/"~8[P0vškgܥ)pKzƯ:L<甫:Y1>sƾy@uT"Չ_~- \V}} ĜPT!(=BV8]mI; EUXNɳ [0wkđ'U%'F1aZR|D_bƟݓ8Gh:<6` C#QŷcҬsk~⪭M&7h?feak;LlI{\sfa:8Aka92ZrU|xקYxw~r˸$H˰s
Lc`2pXIsYQj9@vp:G͌u181?}7z;pr3W㴉Fto-#9Fb}/1Yξ fs q`yx?[X^zOcK:M̆GP,S,wZ]jG2_eO痙)CЙQ<[ܾ_X| @$'̏Y&a}YLeC?yV\\s   b   IDAT o    IENDB` JO
	image/png*fC:/Users/upris/.gemini/antigravity/brain/2147ffbd-752b-4024-a122-61e0cb883110/media__1779305025774.png2N JFIF      ICC_PROFILE       0  mntrRGB XYZ         acsp                                  -                                                   	desc      $rXYZ     gXYZ  (   bXYZ  <   wtpt  P   rTRC  d   (gTRC  d   (bTRC  d   (cprt     <mluc          enUS       s R G BXYZ       o  8  XYZ       b    XYZ       $    XYZ            -para        ff    Y    
[        mluc          enUS        G o o g l e   I n c .   2 0 1 6 C 	

			

		
 C	  @"              	 H    !1Q"Aaq23r#$BRUbCS4%56c              2       !A1Q"a2Bq#CR   ? S{P
{P
{P
{PJqRx_9'TJAt 5jˮ$gf4lCl
&hDsGAD],x5[_v)07\csêX,ޕʝ`*ۧz[cZ/HLIGh5{QS_9L(Ңe>D ?g+RE	!A@Fw&/#h*.U>"7  v㟵)mF"vڭ`j>5܃MnnBL=<U&j E&j E&j E&j E&j (PBfR'N;#s=7oA:":ڈ=
870KL;Ľw8ղU~X]<QIO/Zڈ=Si*z|{jvg"h,Uj\TL()*uc{P
{P
7jTR`jTR`jTQHԯ3@.N^4Q^MxLW5M "|y״4IEaxҽ
B8a)60lY -|qqqD6	 ־9Kh@YqHp JBYC^uhZWH4A._Øw1jy,	BҒ%M8VAQ8O!g' nihöuGzm@ty<ƴE[h"ݽjj"D$u'd]譀8ՐӜmHҵsjkKN%[Y	Q,~P^\Jc8Z-qWB]}l(4(Ĥ+֒J6Ωp%ʁRm&I 1/;E*dOLbGo*ɽѥO7f]%'v4 Js>~8[׬웾q.)CI\CjBIJ(^j¼&؃ ߬A 	iy9/c,nH[WѦF5D6yalqWw7jv.Thڒ[0:[$C]\Yo$Jf'[\웶5ood<P:J
q	YB w"l\?}9l,)ƖN1rޠ2ܹƴI nU(ᶸw\:Х.(R
@V9k1 ?W|λ$npKJ.)h޲+	
$(ǅPF^}YxmɼǶ[8޳pmIRPB.	0~8'rh`\nrsB[m*yN4RuvM )2h@*N:ײ;׀D^LtTRuQ
ҨpX=k$a'C޽
zl/uJw&Z$R5ނL/ʼ(uhn"{R57J"ߣ,C1MC,hB-!O()SՕ|x'2̖lY9t"oez	)գĢ	h}o,ݽUffbۗTҠd :5{d/oS<VKQn[~ZAʐexFMeN8$ P|}5w])8۴I[oRiZtH$*~xz%."^\Ƹdt	6A) Q]1L@H˻Du̍^f}./G	1n{(g^?3Y)5g}UU\Z[6	q;YPRJ)˷2mlB
[F#PmhJj
3Y'AQ^]Tc 3N5Z<)̛FD7	fg%||CZ~AoEݧ"ٕ0l"ѩ))TB1R3inUY1y3et.mʵ T ЋoVnN ;
{j_5CkSjNzS1~v)B38_Z]]K'BqRP,)Rҝ ՝砮
s=<Bwa/$)ZhvfRzea2_z%fG*HG_.>S )	ߠIdgJ)G;p2_;tm]%-8QmNZ&t\;Ȉ;\EGE(] 8IvHqL%2% >tcww:S1uqpyͳ׽iW)qHS%KrNA);>a.u_T%vRt6B@*Е)E)LXXJT1M)I.
ޯu{j?4W`ԠH
u
c_RMsA^5(PHi^kۥZRE.{jP( =V=PMzV[hO!0koՖMμ.j;w3At{*|Oң'U44jzu6M=j|1G8:,d"`sʽP^Gzr˙&=橨m,8*l2S@Y]FRuJǔL튢9-Q,zzH׷:wq(A(iV.&h7UɕXKy"uR`[v爄<iW	 
mj
{bS"<:KTB6j*%uʯ eޛ7 tޫM{J UP2ZɚRnq;~<M]>;Ӂ|4׼ʂׅ m6IvڮG]TBj?D{.;{&꾉VM7Z{aCFf_f.)|GWi,ŗ?jIxz9rdtڮސ]UP0o"GE:H9pµDITj&`7=Mkl˧Z(1L[w-Bx'\X;~@69{;	NCKY[}57p,OƞWzJZ/W|ƘL{2!ZV:RHGX7{r6Z4sSWheKmwćm#H
^`HtޛR|Mx(ݨ)M
?0I7g:CCrÅv JWp@#P؞ߝ0{gM u]٧|0c{ꖠG%*sdd[֜JX
JAK/?)D?s$U(- gGԸ~4⮑nY!<>\YJOHmB=]?:=]߇Pع%<qmJ^Ǭz[RA:JGُ]m]>G~tWM)!JMx*J{h$dSNdQ4 xN)S!WE~45ں,﫨~4@2E]7ǣM+2 }i`~Ư6FJM+ͲoYm$+0'۳`gnB]qHA& ${m`c~3-nXa8(+SaGA H!ymViRn2w* nCwu5suu4ZZI;5O~t{Se鸶e-px|h[prOlh{.e5jеK)bsȫqY=h7[EVs%ޛ,Ut{]3PVeN;פbcD.wԣ¹35+R#)A^\RE_W(zGvCr=~ĥ]ґpgUQ~UCjƑ.l#Jޢ!gӡU 0סt\RQMOev4[>BZKBH:X<qaPgL9`GH	ҵ5~ Wen{*﨡aSB4g'	8PPl
SZQV͢#)$O?smw-XV~,\DB@)}(.4Y67
B'wh4뭶Y)V H"!̅]LDOKn!-*-Cbb?ɈRrIp%e0TP~	uAH{ ؕ WFIy1@ioĘ AҔ3{r{k˜om
;miH:VXF d ,q.ѵd@2b@lRT * "ỼqE%`;leI3;+G;L٫L)^Ku$-|O]i	|m8C}J~ /uL 7ۅg9SIDm1YTuc3*}sN%;;`j<w6	<'~T|sW۠i=D3R5ڕ5 H;kmrl<F蒓(]/v,8Xlni:DsoDjĽJ<PSJ6nքAb#VTB3i-7\Tc$ۋnBV`Du34]z5Ԇoy%cp[{9^ւߙO :«u*P^$Lq3]I9pv_*PR:pGm>zԓ<_"7^ʃn2[yD+N4qO:\	V *vP|vm8JINӨFg;EbB:At.+X){sOM:t4&*>?JғֽMLi%dzy<卓ifHΟm|RCҺkPsI5Ә+WUN}ZƸ]ϫW5®D	V>KyX~Á U Aۏ*%~vcm)ԧk/{u*=`Ө=kIAXVU6"oX}
W,<)Ԧ.9z|;HgjA6vʱ}).!j?FvGi=h:\9[kj8 }V`zխga%lc0ȒTv{tfA#5ߔ}!.W.1v GC4yzVBhcʾ;6ʜuJ[̆еJIwOwNd!ITNs{ǯ-2!'Si%hϮwh⊔*?>#'}M=ݿ0K)$ Cs35JLPkRDw}գ\4CmxqPI&=wޥ߸
mAI!AI>kHB 4Ȃc-۵ea0VP"I;u5Wzx^y#Ic'=ƬccjC,6B@ mT\UsAYR@)#'?uHh!nd@$j ~VmZCiZʮ$Dʗ$74@P+;ucߤ}c}2ґ2 n.:D|	/ŶjpNE;ȑSʳϩn/e($O-d|k8SY$8뙁Ϻv?sn}[JD;N>,l%`(u'sY*dn6T:[D(~r}e2t[s/>$[ґgN8c<丰A$vFn*=sh۶/:CF=zR7RS\u=@.aA!JȔ R#|Czń^V5a$v֮ūƭҋ>Z&>5Yka/_6[h6J.vܒ"O+^dƕ Lg< ߴƹ]TtL/|ntPQ׮jgU.OzHJ[T5T:[.)d
ʋ,)M\z^V]KjѦOJ(ӄ5+!1]v=R9<E9j&=v5}\)[#}ώZ*z[+
A;T[5ևj8TπˊI}6\+ZƤnsUīR	q|CsdR׵xft<a|J73P[[6V W:I>;BWIx){	[IR W`_<vT"jȻfݥ7k	uWM
l=}\!),_k߳ W|ïy.HIS Өt8BVUzT&u$ 	ڭe՘[VN6V"	4h.	$c֪nMYU\$k#Q" m1U\VR즰Y\a,]-Y IR?4'sp&<71|5ק`f]!]G=};:³<FR%4JVLn-MdZq%ji;wT)
9E\ZD#ZZV@B~u[NmTGU	 {'5w?PuQq>lY5%&5) ThÙ6Z<H$zNG^@nSn 	ܩ UFUe+IJIK<KSy'Sr}ӾWX-qH3y[y S~ QL#"R10zVh,(_HG:Nix u>ځ}rIJoG-ܶ͘[	AQ $޴_5$
=|;m\Č|zۥĩB4ύ;w܄NB%bսӪA}P|"rwgro
%+ҙ 7#ޭ↕"+JPm"<ꔶ/ 杢q-Rďƹz \}5rIbxF}'zj\ҒʎC!-K UŅ0H ^[N~QJX	MIBGJR+9[S6 PrpdWX+OW𐥂P:Eqe4
R"F{YqwzmOƮVڻ8S R u;F[s]L1뉳*,//'xS>JmL_BÃeT|Ãe E"#RJR?2mO8 uL~b*>b*U(~X=ϥ9WCgrB|7/0͓L߸Sڗjkde}'ڴHm}$Okp`$W3QeIOK-}8JJ)=@F{34"`z; Z=[N'Zf]q%Z1R۵drV\N[eSl_ZRI
:tt g荇ABDJ9֜h2R(@=oJ/(j:@עU
tP6|jC`sz ##qc׶Xn4z[܃'{t#~$GO?}tj(
v%x'y׷8.>NRz￐/*J09a!l.3hbDI-4LOr)JR[5J x̏goT6y%A;g&*ի;NiTV⊗q
0KE*JOuڗnMLxuO]vUe-贁=[f$CCd\Kd8S-@	 I5x޽mȜѭ R	sd[ >UNM亣mrZujƕUBT@$Ĥ|GjqFcʮ^y8*0<Ƕ4U3
(zA Wi~݋WZA5,!눲*ŝc4ouOYl4f?_O^=1cB*{ˉ)x#6֬"k6 t)ߚqmʞ)79K~tk|Ӌm$UXOSבg-i*qIm	*R Ye%-!*~xVfɄ(t)l*ExfͪF-QE@((
(( (_?K\#ٳrMm-}e
i@OiԭB՝Oz'\4͗D;(XoJQmWMcӗ
aZS%e鑱tM+[hix%!!&%EADII*uQ@Uq_pe*O_&ݢm!#u*`wq/>xY+gmXɜSpRy%zۃ(yAHiIC-!$'o2I'hzF)ˣo&^UwKZ
J|DFJ"Q@{үZZ?yϱdݫ-\ΞIa$'3c[LZ^[iyl>6n )+IRA؂	P}8$y\=![Auޥ0 փÆ8Ƹs5m6
B.K
Rө Sv#ǁncnqO莒
v$T	@{L"R"ݥ:*! jz=Xs7]VkXIB<;ke^|[`lnd޶U$%R	:u EmE))JD% `=((
(( ((? b
juB x  d
 
read_file(*)
write_file(*)?

command(*)read_url(*)$mcp(chrome_devtools/evaluate_script)z  p: j
juB x  d
 
read_file(*)
write_file(*)?

command(*)read_url(*)$mcp(chrome_devtools/evaluate_script)z  p: