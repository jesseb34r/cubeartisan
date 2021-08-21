#!/bin/sh
export TEMP=tmp/data
export OUTPUT_DIR=data/
export OUTPUT_FILE=$OUTPUT_DIR/$(date +"%Y%m%d").tar.xz
# Just in case it already exists.
rm -rf $TEMP $OUTPUT_DIR
mkdir -p $TEMP
mkdir -p $OUTPUT_DIR
node `yarn --silent node-options` exports/export_drafts.js $TEMP
node `yarn --silent node-options` exports/export_cubes.js  $TEMP
node `yarn --silent node-options` exports/export_decks.js  $TEMP
tar -cJf $OUTPUT_FILE $TEMP
gsutil cp $OUTPUT_FILE gs://cubeartisan/exports/$OUTPUT_FILE
rm -rf $TEMP $OUTPUT_DIR