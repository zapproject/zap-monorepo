sudo rm -r docs
lerna run build
./node_modules/documentation/bin/documentation.js build packages/**/lib/src/index.js -f html -o docs
