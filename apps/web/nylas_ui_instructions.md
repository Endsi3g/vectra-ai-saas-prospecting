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
3. **Réactivité (Responsive) :** Le code utilise des classes comme `hidden md:flex` pour cacher la navigation complète sur mobile au profit d'un menu plus simple, et ajuste la taille du texte H1 (`text-5xl md:text-[64px]`) selon l'écran.�
�Voici ma cle API de Nylas ; nyk_v0_hXlOGTOUj2hlnJ6fIFQ8we00aBqjM2R3fNvZLYJeLHzhg7jKtYE7Hzx31JEdXJDg +Account added!
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
    backgro