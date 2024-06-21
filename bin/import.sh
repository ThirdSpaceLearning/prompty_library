#!/bin/bash

# Check if the argument is provided
if [ "$#" -ne 1 ]; then
    echo "Usage: $0 <id>"
    exit 1
fi

ID="$1"
URL="https://beta-curriculum-cms-api.thirdspacelearning.com/api/public/learning_objectives/${ID}/slides?fields=id,ai_tutor_notes&active=1"

# Fetch data
DATA=$(curl -s "$URL")

# Check if jq is installed
if ! command -v jq &> /dev/null; then
    echo "jq could not be found. Installing jq."
    # exit 1
    brew install jq
fi

mkdir -p ./education/learning-objectives/${ID}
rm -rf ./education/learning-objectives/${ID}/*

# Parse JSON and create files
echo "$DATA" | jq -r '.[] | @base64' | while read -r OBJ; do
    # Decode the base64 encoded string
    DECODED=$(echo "$OBJ" | base64 --decode)

    SLIDE_ID=$(echo "$DECODED" | jq -r '.id')
    TUTOR_NOTES=$(echo "$DECODED" | jq -r '.ai_tutor_notes')

    # Save to a file
    echo "$TUTOR_NOTES" > "./education/learning-objectives/${ID}/${SLIDE_ID}.md"
done

echo "Process completed."
