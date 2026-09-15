#!/bin/bash
cd "$(dirname "$0")/.." || exit 1
npm install
pip3 install -r py/requirements.txt
