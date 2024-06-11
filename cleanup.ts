/// <reference types="bun-types" />

import { Glob } from "bun";
import { JSDOM } from "jsdom";

const glob = new Glob("**/*.html");

let cleansedLinks = 0;
let filesProcessed = 0;

// Scans the current working directory and each of its sub-directories recursively
for await (const file of glob.scan(".")) {
	filesProcessed++;
	const text = await Bun.file(file).text();
	const dom = new JSDOM(text);

	dom.window.document.querySelectorAll("a").forEach((a) => {
		if (!a.href.startsWith("https://www.google.com/url")) {
			return;
		}

		// we only need the "q" parameter of the URL
		// https://www.google.com/url?q=https%3A%2F%2Fdeveloper.kaiostech.com%2F&sa=D&sntz=1&usg=AFQjCNHArVvVtoSTv4aMDRMOZhjdr7j02Q
		const link = new URL(a.href).searchParams.get("q");

		if (link) {
			cleansedLinks++;
			a.setAttribute("href", link);
		}
	});

	// write the modified HTML back to the file
	Bun.write(file, dom.serialize());
	console.log(`Cleansed ${cleansedLinks} links in ${filesProcessed} files`);
}
