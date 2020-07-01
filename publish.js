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
		let read = readline.createInterface({ input: process.stdin, output: process.stdout });

		read.question('Enter commit message:\n', (commitMessage) => {
			read.close()

			let exitCode
			let commands = [
				'git add *',
				`git commit -m "${commitMessage}`,
				'git push origin master'
			]

			try {
				commands.forEach( cmd => {
					console.log( cmd )
					exitCode = execSync(cmd, { stdio: "inherit" })
				})
				// exitCode = execSync('npm publish', { stdio: "inherit" })
				process.exit(0)
			} catch (e) {
				console.log(e) 
				process.exit(1)
			}
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