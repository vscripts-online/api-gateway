#!/bin/bash
DELAY=25
mongosh <<EOF
rs.initiate({
    "_id": "rs0",
    "version": 1,
    "members": [
        {
            "_id": 1,
            "host": "host.docker.internal:30001",
            "priority": 2
        },
        {
            "_id": 2,
            "host": "host.docker.internal:30002",
            "priority": 1
        },
        {
            "_id": 3,
            "host": "host.docker.internal:30003",
            "priority": 1
        }
    ]
}, { force: true });
EOF
echo "****** Waiting for ${DELAY} seconds for replicaset configuration to be applied ******"
sleep $DELAY
