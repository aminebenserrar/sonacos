# SONACOS PFA - Conception

Ce dossier contient:

- `cahier_des_charges_pfa_sonacos.tex`: nouveau cahier des charges V1 academique
- `plantuml/usecase_*.puml`: diagrammes de cas d'utilisation PlantUML separes par acteur
- `../diagrams/*.d2`: autres diagrammes techniques conserves au format D2

## Diagrammes fournis

- `plantuml/usecase_visiteur.puml`
- `plantuml/usecase_client.puml`
- `plantuml/usecase_gestionnaire.puml`
- `plantuml/usecase_responsable.puml`
- `plantuml/usecase_admin.puml`
- `plantuml/usecase_archiviste.puml`
- `plantuml/usecase_auditeur.puml`
- `class_v1.d2`
- `sequence_auth_v1.d2`
- `sequence_commande_v1.d2`
- `sequence_paiement_facture_v1.d2`
- `activity_traitement_commande_v1.d2`
- `sequence_validation_v1.d2`

## Compilation LaTeX

Exemple avec `pdflatex`:

```powershell
cd docs
pdflatex cahier_des_charges_pfa_sonacos.tex
```

## Rendu des diagrammes D2

Exemple avec `d2`:

```powershell
d2 diagrams/class_v1.d2 diagrams/class_v1.svg
```

## Rendu des cas d'utilisation PlantUML

```powershell
java -jar ..\tools\plantuml.jar -tpng -o "..\assets\plantuml" "plantuml\usecase_*.puml"
```
