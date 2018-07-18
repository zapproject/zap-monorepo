#npm install @compodoc/compodoc
rm -fr documentation
#./node_modules/documentation/bin/documentation.js build packages/**/lib/src/*.js -f html -o docs
../node_modules/.bin/compodoc -p docstsconfig.json --hideGenerator --disableCoverage

