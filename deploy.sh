#!/bin/bash
###############################################################################
# Automated Deployment Script for DocSignals
# Purpose: Deploy to /docsignals/ subdirectory with automatic credential handling
# Note: Requires .deploy-credentials file (not committed to git)
###############################################################################

set -e  # Exit on error

# Color codes for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}DocSignals Deployment Script${NC}"
echo -e "${BLUE}========================================${NC}"

# Check if credentials file exists
if [ ! -f ".deploy-credentials" ]; then
    echo -e "${RED}Error: .deploy-credentials file not found!${NC}"
    echo -e "${YELLOW}Please create .deploy-credentials with the following content:${NC}"
    echo -e "SSH_USER=\"your_username\""
    echo -e "SSH_HOST=\"your_server_ip\""
    echo -e "SSH_PASSPHRASE=\"your_ssh_passphrase\""
    exit 1
fi

# Load credentials
source .deploy-credentials

# Validate credentials
if [ -z "$SSH_USER" ] || [ -z "$SSH_HOST" ]; then
    echo -e "${RED}Error: Missing SSH_USER or SSH_HOST in .deploy-credentials file!${NC}"
    exit 1
fi

echo -e "${GREEN}Credentials loaded${NC}"

# Check if expect is installed (only needed if using passphrase)
if [ -n "$SSH_PASSPHRASE" ] && ! command -v expect &> /dev/null; then
    echo -e "${RED}Error: 'expect' is not installed!${NC}"
    echo -e "${YELLOW}Please install it with:${NC}"
    echo -e "  sudo apt-get install expect"
    exit 1
fi

# Configuration
REMOTE_PATH="/var/www/html/docsignals"

# Build the project
echo -e "\n${YELLOW}Building project...${NC}"
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}Build failed!${NC}"
    exit 1
fi

echo -e "${GREEN}Build successful${NC}"

# Check if dist directory exists
if [ ! -d "dist" ]; then
    echo -e "${RED}Error: dist/ directory not found after build.${NC}"
    exit 1
fi

# Show deployment configuration
echo -e "\n${YELLOW}Deployment Configuration:${NC}"
echo -e "Source:      ${GREEN}dist/${NC}"
echo -e "Destination: ${GREEN}${SSH_USER}@${SSH_HOST}:${REMOTE_PATH}${NC}"
echo -e ""
read -p "Continue with deployment? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${RED}Deployment cancelled.${NC}"
    exit 1
fi

# Function to run commands with or without expect
run_cmd() {
    if [ -n "$SSH_PASSPHRASE" ]; then
        expect -c "
            set timeout 300
            spawn $@
            expect {
                \"Enter passphrase for key\" {
                    send \"$SSH_PASSPHRASE\r\"
                    exp_continue
                }
                eof
            }
            catch wait result
            exit [lindex \$result 3]
        "
    else
        "$@"
    fi
}

# Deploy with rsync
echo -e "\n${YELLOW}Deploying files...${NC}"

run_cmd rsync -rltvz --delete --no-perms --no-owner --no-group --omit-dir-times \
    dist/ ${SSH_USER}@${SSH_HOST}:${REMOTE_PATH}/

if [ $? -ne 0 ]; then
    echo -e "\n${RED}Deployment failed!${NC}"
    exit 1
fi

echo -e "\n${BLUE}========================================${NC}"
echo -e "${GREEN}Deployment Successful!${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "Files deployed to: ${GREEN}${SSH_USER}@${SSH_HOST}:${REMOTE_PATH}${NC}\n"
