const { exec, execSync } = require('child_process')
const package = require('./package.json')
const readline = require('readline');



function parse(version) {
	return version.trim().split('.')
}

function compare(version_1, version_2) {
	for (let segment = 0; segment < Math.max(version_1.length, version_2.length); segment++) {
		if (version_1[segment] !== version_2[segment]) {
			return version_1[segment] > version_2[segment]
				? version_1
				: version_2
		}
	}
}

async function publish() {
	let output = await new Promise((resolve, reject) => {
		let commitMessage
		let exitCode

		let read = readline.createInterface({ input: process.stdin, output: process.stdout });

		read.question('Enter commit message:', (message) => {
			commitMessage = message
			read.close()

			try {
				// publish to git
				exitCode = execSync(`git add * && git commit -m "${commitMessage}"`, { stdio: "inherit" })
				if (exitCode !== 0) process.exit(exitCode)

				// exitCode = execSync('npm publish', { stdio: "inherit" })
				process.exit(exitCode)
			} catch (e) { console.log(e) }
		});


	})

	return output
}

async function start() {

	let version = parse(package.version)
	let remoteVersion

	try {
		remoteVersion = parse(execSync(`npm show ${package.name} version`, { encoding: 'UTF-8' }))

		let update = compare(version, remoteVersion) === version

		update || console.log(`Skipping due to confilcted versions. To publish increment project version over ${remoteVersion.join('.')}.`)

		!update || await publish()
	} catch (error) {
		process.exit(1)
	}

}

start()