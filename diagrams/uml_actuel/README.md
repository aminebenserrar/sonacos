# Diagrammes UML actuels - SONACOS

Ce dossier contient les diagrammes alignes avec l'application actuelle :

- `class_global.d2` / `class_global.svg` : classes principales du domaine.
- `sequence_commande_paiement_facture.d2` / `.svg` : parcours client commande, paiement et facture.
- `sequence_admin_roles_audit.d2` / `.svg` : administration des comptes et journalisation.
- `sequence_archivage_audit.d2` / `.svg` : archivage des factures et consultation audit.
- `activity_traitement_commande_global.d2` / `.svg` : activite globale du traitement d'une commande.

Les cas d'utilisation sont maintenus separement en PlantUML dans `docs/plantuml/usecase_*.puml`.
Les autres fichiers `.d2` restent modifiables pour les diagrammes de classes, sequence et activite.

Commande pour regenerer un SVG :

```powershell
d2 diagrams/uml_actuel/class_global.d2 diagrams/uml_actuel/class_global.svg
```
