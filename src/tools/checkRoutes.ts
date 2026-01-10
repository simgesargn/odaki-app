/**
 * Usage:
 *  node ./src/tools/checkRoutes.js          # shows issues
 *  node ./src/tools/checkRoutes.js --fix    # replaces Routes.Settings -> Routes.ProfileSettings (safe auto-fix)
 *
 * This script is plain JS to run with node (no ts-node required).
 */
const fs = require("fs");
const path = require("path");
const glob = require("glob");

const ROOT = path.resolve(__dirname, "..", "..");
const ROUTES_FILE = path.join(ROOT, "src", "navigation", "routes.ts");

function loadRoutesKeys() {
	const txt = fs.readFileSync(ROUTES_FILE, "utf8");
	// crude parse: find lines like Key: "Value",
	const re = /(\w+)\s*:\s*["']([^"']+)["']/g;
	const keys = {};
	let m;
	while ((m = re.exec(txt))) {
		keys[m[1]] = m[2];
	}
	return keys; // map key -> value
}

function scanFiles() {
	return glob.sync("src/**/*.ts*").map((p) => path.join(ROOT, p));
}

function findRouteUsages(file) {
	const txt = fs.readFileSync(file, "utf8");
	const usages = [];
	// match Routes.X
	const re = /Routes\.(\w+)/g;
	let m;
	while ((m = re.exec(txt))) {
		usages.push({ match: m[0], key: m[1], index: m.index });
	}
	// match navigation.navigate({ ... }) occurrences
	const navObjRe = /navigate\(\s*{([^}]+)}\s*\)/g;
	let n;
	while ((n = navObjRe.exec(txt))) {
		usages.push({ match: n[0], navObject: n[1], index: n.index, type: "navigateObject" });
	}
	return { usages, text: txt };
}

function report() {
	const keys = loadRoutesKeys();
	const files = scanFiles();
	const issues = [];
	for (const f of files) {
		const r = findRouteUsages(f);
		for (const u of r.usages) {
			if (u.type === "navigateObject") {
				issues.push({ file: path.relative(ROOT, f), type: "navigateObject", snippet: u.match });
			} else {
				if (!keys[u.key]) {
					issues.push({ file: path.relative(ROOT, f), type: "unknownRouteKey", key: u.key, snippet: u.match });
				}
			}
		}
	}
	return issues;
}

function fixSettings() {
	const files = scanFiles();
	for (const f of files) {
		let txt = fs.readFileSync(f, "utf8");
		if (txt.includes("Routes.Settings")) {
			const updated = txt.split("Routes.Settings").join("Routes.ProfileSettings");
			fs.writeFileSync(f, updated, "utf8");
			console.log("Fixed Routes.Settings -> Routes.ProfileSettings in", path.relative(ROOT, f));
		}
	}
}

// Run
const args = process.argv.slice(2);
const issues = report();
if (issues.length === 0) {
	console.log("No route issues found.");
} else {
	console.log("Found route usages that may be problematic:");
	issues.forEach((it) => {
		console.log(`${it.type} in ${it.file} — ${it.key ?? ""} ${it.snippet}`);
	});
	if (args.includes("--fix")) {
		console.log("Applying auto-fix: Routes.Settings -> Routes.ProfileSettings");
		fixSettings();
		console.log("Auto-fix completed. Re-run to verify.");
	}
}
