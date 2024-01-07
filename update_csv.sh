#!/bin/bash

# Check if at least one argument (folder path) is provided
if [ $# -lt 1 ]; then
    echo "Usage: $0 <folder_path>"
    exit 1
fi

# Iterate over each CSV file in the specified folder
for file in "$1"/*.csv; do
    # Check if the file is a regular file
    if [ -f "$file" ]; then
        # Get the total number of lines in the file
        total_lines=$(wc -l < "$file")

        # Calculate the step size for the 'distance' column
        step_size=$(awk -v total_lines="$total_lines" 'BEGIN{print 1 / total_lines}')

        # Process the file and create a temporary file
        awk -v step="$step_size" 'BEGIN{FS=OFS=","}{if(NR==1){print $0,"distance"}else{print $0, (NR-2)*step}}' "$file" > "${file}.tmp"

        # Replace the original file with the modified one
        mv "${file}.tmp" "$file"
        echo "Updated file: $file"
    fi
done
