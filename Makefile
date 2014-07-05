test: minify
	grover src/tests/unit/testrunner.html

minify:
	uglifyjs --no-mangle --no-squeeze src/js/ns5.js >build/ns5.min.js

.PHONY: test minify
