# Saint-Epvre en 3D : rapport de fabrication du nuage de points

Date : 17 novembre 2026. Page : `/basilique-3d/`. Fichiers : `assets/3d/basilique.laz`, `assets/3d/basilique.ply`, `assets/js/basilique-3d.js`.

## La page

`/basilique-3d/` est une balade au défilement, plein écran, fond marine et points blancs : la scène three.js reste collée à l’écran pendant 10,5 hauteurs de page et la caméra suit une courbe de Catmull-Rom à dix étapes (place, pied de la tour, ascension, flèche, nef, transept, chevet, contour par l’est, recul, verticale), avec un léger roulis dans les virages façon drone. Dix chapitres sourcés (monographie de 1890) s’affichent en bas à gauche, des étiquettes suivent les repères mesurés dans le nuage, une jauge de progression à droite. En fin de balade, « Prendre les commandes » passe en orbite libre (souris ou tactile). Sur téléphone : champ élargi à 72°, canvas sans capture du geste de défilement, aucun débordement horizontal (vérifié à 375 px). Les photos trouvées sur Internet n’ont pas été utilisées pour « densifier » le nuage : droits non vérifiables et images non calibrées, donc impossibles à recaler.

## Sources exactes et licences

| Source | Détail | Licence |
|---|---|---|
| IGN, LiDAR HD, nuage de points classé | Dalles `LHD_FXX_0933_6849_PTS_LAMB93_IGN69.copc.laz` et `LHD_FXX_0934_6849_PTS_LAMB93_IGN69.copc.laz`, édition NUALHD 1.0 du 29 janvier 2025, mission 23LHD1PE, acquisition du 3 décembre 2023 au 8 mars 2024, capteur Riegl VQ-1560 II, classement automatique IGN_AUTO_V5. Téléchargées sur `data.geopf.fr/telechargement/download/LiDARHD-NUALID/`. | Licence ouverte Etalab 2.0 |
| IGN, BD TOPO v3, couche `batiment` | Quatre polygones `nature = Eglise` (identifiants 5213975 à 5213978) qui forment l’emprise de la basilique, 2 425,5 m² au total. Lus par le WFS de la Géoplateforme. | Licence ouverte Etalab 2.0 |
| Monographie de 1890 | Dimensions de référence déjà citées sur la page Architecture (longueur 84 m, tour 84 m, nef 24 m sous voûte, transept 40 × 27 m). | Domaine public |
| three.js 0.160 (CDN unpkg) | Visionneuse WebGL : OrbitControls, nuage de points, couleurs par sommet. | MIT |

Aucune donnée de Google Maps ni d’Apple Plans n’a été utilisée. Leurs conditions d’utilisation interdisent d’extraire, de copier ou de réutiliser les maillages 3D (Google Maps Platform Terms, § 3.2.3 ; Apple Maps : conditions de l’app et de MapKit), et le site étant public, la violation serait visible. Leurs modèles sont en outre issus de photogrammétrie aérienne, moins précise en altimétrie que le laser.

## Méthode

1. Localisation : la basilique est à cheval sur la limite X = 934 000 du Lambert-93 (emprise bâtie X 933 950 à 934 010, Y 6 848 639 à 6 848 722), d’où deux dalles.
2. Lecture par requête COPC sur l’emprise de travail X 933 915 à 934 045, Y 6 848 600 à 6 848 760 : 310 896 points bruts (classes 1, 2, 3, 4, 5, 6, 66).
3. Bâti : points dans l’emprise BD TOPO élargie de 1,5 m, non sol, non végétation, non artefact, à plus de 0,30 m au-dessus du sol médian de la place (200,99 m IGN69). 36 643 points, dont 28 213 classés « bâtiment » et 7 904 « non classés » par l’IGN (essentiellement la flèche et les parties hautes, que le classement automatique ne reconnaît pas).
4. Nettoyage statistique : distance moyenne aux 10 plus proches voisins, seuil moyenne + 2,5 σ ; les points au-dessus de 55 m sont exemptés pour ne pas rogner la flèche. 867 points retirés.
5. Contexte : sol de classe 2 sous-échantillonné à un point tous les 30 cm (86 982 points).
6. Exports : LAZ 1.4 format 6 (Lambert-93, IGN69, classes IGN d’origine, `user_data` = 6 basilique / 2 sol), 567 Ko ; PLY binaire (x est, y nord, z hauteur au-dessus de la place, classe, intensité normalisée), 1,7 Mo, origine locale X 933 981,22 Y 6 848 679,12.

Script : `traite_lidar.py` (laspy, numpy, scipy, pyproj), conservé dans le dossier de session, pas dans le dépôt. `pdal` et CloudCompare n’ont pas été nécessaires.

## Résultats et contrôle

| Mesure dans le nuage | Valeur | Monographie 1890 |
|---|---|---|
| Points sur la basilique après nettoyage | 35 822 | |
| Densité par m² d’emprise au sol | 14,8 | |
| Longueur le long de l’axe | 83,4 m | 84 m |
| Largeur du transept | 40,2 m | 40 m |
| Largeur de la nef hors œuvre | 26,1 m | 24 m sous voûte (dans œuvre) |
| Point le plus haut au-dessus de la place | 81,6 m | 84 m (tour) |

L’écart de 2,4 m au sommet s’explique par la croix de fer, trop fine pour renvoyer le laser, et par la référence altimétrique (la monographie compte probablement depuis le seuil ou les fondations). Précision annoncée par l’IGN : 10 cm en altimétrie, 50 cm en planimétrie.

## Limites

- Laser aéroporté : les façades verticales, les portails et les sculptures sont très peu échantillonnés ; seules les toitures, la flèche, les clochetons et les arcs-boutants sont bien décrits.
- La densité (15 pts/m² sur l’emprise) est celle du vol de 2023-2024 ; on ne peut pas faire mieux avec cette source.
- Rien de l’intérieur.
- Photogrammétrie : impossible sur les photos du dépôt. Les 80 images de `assets/img/site` font 1 400 px au plus, sans EXIF (donc sans focale), et montrent presque toutes des vitraux ou des documents ; trois vues extérieures isolées ne suffisent pas. Les cartes postales ne sont pas calibrées. COLMAP et Meshroom n’ont donc pas été installés.

## Pour aller plus loin

1. Campagne photo au sol : un tour complet de l’édifice en s’arrêtant tous les 5 m, chaque photo recouvrant la précédente à 60 % au moins, à hauteur d’œil puis en contre-plongée, par temps couvert, sans changer de focale ; ajouter des vues intérieures (nef, transept, chœur, tribune d’orgue). Environ 300 à 500 photos. Traitement avec COLMAP ou Meshroom, puis recalage sur le nuage LiDAR qui sert d’échelle et de squelette. Résultat attendu : façades et portails au centimètre.
2. Scanner laser terrestre (prestation) pour l’intérieur, si l’on veut les 24 m sous voûte en vrai.
3. Dans la visionneuse : passer à un format Potree ou à un nuage par niveaux de détail si le nuage dépasse 5 à 10 millions de points après photogrammétrie.
