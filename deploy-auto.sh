#!/bin/bash
###############################################################################
# Automated Deployment Script for DocSignals
# Deploys to /docsignals/ subdirectory on christophbauer.dev
###############################################################################

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}DocSignals Auto-Deploy${NC}"
echo -e "${BLUE}========================================${NC}"

# Check credentials
if [ ! -f ".deploy-credentials" ]; then
    echo -e "${RED}Error: .deploy-credentials not found!${NC}"
    exit 1
fi

source .deploy-credentials

if [ -z "$SSH_USER" ] || [ -z "$SSH_HOST" ] || [ -z "$SSH_PASSPHRASE" ]; then
    echo -e "${RED}Error: Missing credentials!${NC}"
    exit 1
fi

# Configuration
REMOTE_PATH="/var/www/docsignals"

# Build
echo -e "${YELLOW}Building...${NC}"
npm run build

if [ ! -d "dist" ]; then
    echo -e "${RED}Error: dist/ not found!${NC}"
    exit 1
fi
echo -e "${GREEN}Build complete${NC}"

# Deploy
echo -e "${YELLOW}Deploying to ${SSH_HOST}:${REMOTE_PATH}...${NC}"

expect << EOF
set timeout 300
spawn rsync -rltvz --delete --no-perms --no-owner --no-group --omit-dir-times dist/ ${SSH_USER}@${SSH_HOST}:${REMOTE_PATH}/
expect {
    "Enter passphrase for key" {
        send "${SSH_PASSPHRASE}\r"
        exp_continue
    }
    eof
}
catch wait result
exit [lindex \$result 3]
EOF

if [ $? -ne 0 ]; then
    echo -e "${RED}Deployment failed!${NC}"
    exit 1
fi

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Deployed to https://christophbauer.dev/docsignals/${NC}"
echo -e "${GREEN}========================================${NC}"
