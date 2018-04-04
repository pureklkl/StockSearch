#!/usr/bin/env bash
echo "Creating mongo users..."
mongo admin --host ROOT -u root -p PASSWORD --eval "db = db.getSiblingDB('mydb');db.createUser({user: 'username', pwd: 'password', roles: [{role: 'dbOwner', db: 'mydb'}]});"
echo "Mongo users created."
