Chat en temps réel - Martin S
Lancer le serveur en premier, puis lancer le client.

# Serveur
`npm run start` pour démarrer le serveur. 

Le serveur se met en place sur localhost sur le port 3000, pour changer cela, il faut modifier le fichier server/src/main.ts, ligne 13.

# Client
`npm run dev` pour démarrer le client.

Le client écoute un serveur sur ws://localhost:3000. Pour changer ça, il faut modifier le fichier client/src/socket.ts, ligne 3.

## Mode admin
Pour se connecter en tant qu'admin il faut mettre le mot de passe "Password". Le mode admin permet l'accès au salon support ainsi que de supprimer et ajouter des rooms.