# Déploiement Docker sur VPS

## Pré-requis

- Docker Engine avec le plugin Docker Compose
- Un fichier `.env` créé à partir de `.env.example`
- Le frontend présent dans le dossier voisin `../capadmisfront`
- Les DNS et le reverse proxy HTTPS configurés sur le VPS

## Configuration

Depuis le dossier de l'API :

```sh
cp .env.example .env
```

Définir au minimum :

- `POSTGRES_PASSWORD`
- `DATABASE_URL` avec l'hôte `db`
- `JWT_SECRET`
- `REFRESH_SECRET`
- Les identifiants SMTP et R2 utilisés par l'application

La valeur de `DATABASE_URL` doit correspondre aux identifiants PostgreSQL :

```dotenv
POSTGRES_DB=capadmis
POSTGRES_USER=capadmis
POSTGRES_PASSWORD=un_mot_de_passe_long_et_aleatoire
DATABASE_URL=postgresql://capadmis:un_mot_de_passe_long_et_aleatoire@db:5432/capadmis?schema=public
```

Ne jamais committer `.env` ni exposer le port PostgreSQL sur Internet.

## Démarrage

```sh
docker compose up -d --build
```

Les migrations Prisma sont appliquées automatiquement au démarrage de l'API. Le frontend est disponible sur `http://IP_DU_VPS:8080` en local ou sur le port défini par `FRONT_PORT`. Nginx transmet `/api`, `/socket.io` et `/health` au service API. Le port `3000` reste disponible pour le diagnostic local; sur le VPS, il est préférable de n'autoriser publiquement que le port du frontend et les ports HTTPS.

Pour utiliser un domaine unique, définir les variables de build avant le lancement :

```dotenv
VITE_API_URL=
VITE_WS_URL=
FRONT_PORT=80
```

Avec ces valeurs, le frontend utilise `/api` et Socket.IO sur le même domaine.

## Vérification et logs

```sh
docker compose ps
docker compose logs -f api
curl http://127.0.0.1:8080/health
curl http://127.0.0.1:3000/health
```

## Mise à jour

```sh
git pull
docker compose up -d --build
```

## Sauvegarde et restauration PostgreSQL

```sh
docker compose exec -T db pg_dump -U capadmis -d capadmis > backup.sql
cat backup.sql | docker compose exec -T db psql -U capadmis -d capadmis
```

Le volume `postgres_data` contient les données persistantes. Il ne faut pas lancer `docker compose down -v` en production, car cela supprime la base de données.
