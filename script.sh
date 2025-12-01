#!/bin/bash
echo "Running script"
DATE=$(date)
echo "Date: $DATE"
echo "Listing files"
ls -la
echo "Done"
USER=$(whoami)
echo "User: $USER"
echo "Script finished successfully"
exit 0