const https = require('https');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const os = require('os');

const isWindows = os.platform() === 'win32';
const isMac = os.platform() === 'darwin';

async function selectOption(message, options) {
    const readline = require('readline');
    let selectedIndex = 0;

    return new Promise((resolve) => {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        if (process.stdin.isTTY) {
            process.stdin.setRawMode(true);
        }
        process.stdin.resume();

        const renderMenu = () => {
            console.clear();
            console.log(message + '\n');
            options.forEach((option, index) => {
                if (index === selectedIndex) {
                    console.log(`  > ${option.label}`);
                } else {
                    console.log(`    ${option.label}`);
                }
            });
            console.log('\n(Use arrow keys to navigate, Enter to select, Esc to cancel)');
        };

        renderMenu();

        process.stdin.on('keypress', (str, key) => {
            if (key) {
                if (key.name === 'up') {
                    selectedIndex = selectedIndex > 0 ? selectedIndex - 1 : options.length - 1;
                    renderMenu();
                } else if (key.name === 'down') {
                    selectedIndex = selectedIndex < options.length - 1 ? selectedIndex + 1 : 0;
                    renderMenu();
                } else if (key.name === 'return') {
                    if (process.stdin.isTTY) {
                        process.stdin.setRawMode(false);
                    }
                    process.stdin.pause();
                    rl.close();
                    resolve(options[selectedIndex]);
                } else if (key.name === 'escape' || (key.ctrl && key.name === 'c')) {
                    if (process.stdin.isTTY) {
                        process.stdin.setRawMode(false);
                    }
                    process.stdin.pause();
                    rl.close();
                    resolve(null);
                }
            }
        });
    });
}

async function promptForTestExecution() {
    console.log('\n' + '='.repeat(50));
    console.log('🧪 Test Execution\n');

    const runTest = await askQuestion('Would you like to run an example test? (y/n): ');

    if (runTest === 'y' || runTest === 'yes') {
        const testOptions = [
            { label: '🌐 Web Test (Edge Browser)', value: 'wdio:web:edge' },
            { label: '🤖 Android Native App Test', value: 'wdio:android:native' },
            { label: '🤖 Android Web Browser Test', value: 'wdio:android:web' },
            { label: '🍏 iOS Native App Test', value: 'wdio:ios:native' },
            { label: '🍏 iOS Safari Browser Test', value: 'wdio:ios:web' }
        ];

        const selected = await selectOption('Select a test to run:', testOptions);

        if (selected) {
            console.log(`\n🚀 Running: npm run ${selected.value}\n`);
            console.log('=' + '='.repeat(49) + '\n');

            runCommand(`npm run ${selected.value}`, { cwd: path.join(__dirname, '..') });
        } else {
            console.log('\n❌ Test execution cancelled\n');
            displayTestCommands();
        }
    } else {
        displayTestCommands();
    }
}

function displayTestCommands() {
    console.log('\n📚 Available Test Commands:\n');
    console.log('  Web Tests:');
    console.log('    npm run wdio:web:edge        - Run tests in Edge browser\n');
    console.log('  Android Tests:');
    console.log('    npm run wdio:android:native  - Run tests in native Wikipedia app');
    console.log('    npm run wdio:android:web     - Run tests in Chrome browser\n');
    console.log('  iOS Tests (macOS only):');
    console.log('    npm run wdio:ios:native      - Run tests in native Wikipedia app');
    console.log('    npm run wdio:ios:web         - Run tests in Safari browser\n');
    console.log('  For more information, check the README.md file.');
}

async function askQuestion(question) {
    const readline = require('readline');
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            rl.close();
            resolve(answer.toLowerCase().trim());
        });
    });
}

async function downloadFile(url, dest) {
    const file = fs.createWriteStream(dest);

    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        const options = {
            hostname: urlObj.hostname,
            path: urlObj.pathname + urlObj.search,
            headers: {
                'User-Agent': 'Wikipedia-Test-Setup-Script/1.0 (WebdriverIO Testing Framework; https://github.com/cloudflightio/cross-platform-test-framework)'
            }
        };

        https.get(options, (response) => {
            if (response.statusCode === 302 || response.statusCode === 301) {
                const redirectUrl = response.headers.location;
                downloadFile(redirectUrl, dest).then(resolve).catch(reject);
            } else if (response.statusCode === 200) {
                response.pipe(file);
                file.on('finish', () => {
                    file.close();
                    resolve();
                });
            } else {
                file.close();
                fs.unlinkSync(dest);
                reject(new Error(`Failed to download: HTTP ${response.statusCode}`));
            }
        }).on('error', (err) => {
            file.close();
            fs.unlinkSync(dest);
            reject(err);
        });
    });
}

function runCommand(command, options = {}) {
    try {
        console.log(`  Running: ${command}`);
        execSync(command, { stdio: 'inherit', shell: true, ...options });
        return true;
    } catch (error) {
        console.error(`  ❌ Command failed: ${error.message}`);
        return false;
    }
}

function checkCommand(command, commandName) {
    try {
        const checkCmd = isWindows ? `where ${command}` : `which ${command}`;
        execSync(checkCmd, { stdio: 'ignore', shell: true });
        console.log(`  ✅ ${commandName} found`);
        return true;
    } catch {
        console.log(`  ❌ ${commandName} not found`);
        return false;
    }
}

function copyDirectory(src, dest) {
    try {
        if (fs.existsSync(dest)) {
            fs.rmSync(dest, { recursive: true, force: true });
        }
        fs.cpSync(src, dest, { recursive: true });
        return true;
    } catch (error) {
        console.error(`  ❌ Failed to copy directory: ${error.message}`);
        return false;
    }
}

function removeDirectory(dirPath) {
    try {
        if (fs.existsSync(dirPath)) {
            fs.rmSync(dirPath, { recursive: true, force: true });
            return true;
        }
        return false;
    } catch (error) {
        console.error(`  ❌ Failed to remove directory: ${error.message}`);
        return false;
    }
}

function createZipArchive(sourceDir, zipPath) {
    if (!isMac) {
        console.log('  ⚠️  Zip creation only supported on macOS');
        return false;
    }

    try {
        const appName = path.basename(sourceDir);
        const iosDir = path.dirname(sourceDir);
        const zipName = path.basename(zipPath);

        // Use native zip command on macOS
        const zipCommand = `cd "${iosDir}" && zip -qr "${zipName}" "${appName}"`;
        const success = runCommand(zipCommand);

        if (success) {
            console.log(`  ✅ Created: ${zipPath}`);
            return true;
        }
        return false;
    } catch (error) {
        console.error(`  ❌ Failed to create zip: ${error.message}`);
        return false;
    }
}

function findApp(baseDir, appName) {
    const possiblePaths = [
        path.join(baseDir, 'DerivedData', 'Build', 'Products', 'Debug-iphonesimulator', appName),
        path.join(baseDir, 'wikipedia-ios-source', 'DerivedData', 'Build', 'Products', 'Debug-iphonesimulator', appName),
        path.join(baseDir, 'wikipedia-ios-source', 'build', 'Debug-iphonesimulator', appName),
        path.join(baseDir, 'wikipedia-ios-source', 'Build', 'Products', 'Debug-iphonesimulator', appName),
    ];

    for (const appPath of possiblePaths) {
        if (fs.existsSync(appPath)) {
            console.log(`  ✅ Found app at: ${appPath}`);
            return appPath;
        }
    }

    console.log('  🔍 Searching for built app...');
    try {
        const searchBase = path.join(baseDir, 'wikipedia-ios-source');

        function searchDirectory(dir, targetName) {
            if (!fs.existsSync(dir)) return null;

            const items = fs.readdirSync(dir);
            for (const item of items) {
                const fullPath = path.join(dir, item);
                try {
                    const stat = fs.statSync(fullPath);
                    if (stat.isDirectory()) {
                        if (item === targetName) {
                            return fullPath;
                        }
                        const found = searchDirectory(fullPath, targetName);
                        if (found) return found;
                    }
                } catch (e) {
                    // continue
                }
            }
            return null;
        }

        const result = searchDirectory(searchBase, appName);
        if (result && fs.existsSync(result)) {
            console.log(`  ✅ Found app at: ${result}`);
            return result;
        }
    } catch (e) {
        console.log(`  ⚠️ Search failed: ${e.message}`);
    }

    return null;
}

async function setupAndroidApp() {
    console.log('\n📱 Setting up Android App...');

    const androidDir = path.join(__dirname, '..', 'apps', 'android');
    if (!fs.existsSync(androidDir)) {
        fs.mkdirSync(androidDir, { recursive: true });
    }

    console.log('  Downloading Wikipedia Android APK...');
    const apkUrl = 'https://releases.wikimedia.org/mobile/android/wikipedia/stable/wikipedia-2.7.50552-r-2025-10-15.apk';
    const apkDest = path.join(androidDir, 'wikipedia.apk');

    try {
        await downloadFile(apkUrl, apkDest);
        console.log('  ✅ Android APK downloaded successfully!');
        console.log(`  📍 Location: ${apkDest}`);
        return true;
    } catch (error) {
        console.error('  ❌ Failed to download Android APK:', error.message);
        console.log('  Please download manually from: https://releases.wikimedia.org/mobile/android/wikipedia/stable/');
        return false;
    }
}

async function setupIOSApp() {
    console.log('\n📱 Setting up iOS App...');

    if (!isMac) {
        console.log('  ⚠️  iOS app building requires macOS.');
        console.log('  📝 For iOS testing on non-macOS systems:');
        console.log('     1. Build the app on a Mac');
        console.log('     2. Copy Wikipedia.app to apps/ios/');
        return false;
    }

    console.log('  Checking prerequisites...');
    const hasXcode = checkCommand('xcodebuild', 'Xcode');
    const hasGit = checkCommand('git', 'Git');

    if (!hasXcode) {
        console.log('  ⚠️  Please install Xcode from the Mac App Store');
        console.log('  Then run: xcode-select --install');
        return false;
    }

    if (!hasGit) {
        console.log('  ⚠️  Git is required. Please install Git first.');
        return false;
    }

    const iosDir = path.join(__dirname, '..', 'apps', 'ios');
    const wikiRepoDir = path.join(iosDir, 'wikipedia-ios-source');

    if (!fs.existsSync(iosDir)) {
        fs.mkdirSync(iosDir, { recursive: true });
    }

    if (fs.existsSync(wikiRepoDir)) {
        console.log('  Updating existing Wikipedia iOS repository...');
        runCommand('git pull', { cwd: wikiRepoDir });
    } else {
        console.log('  Cloning Wikipedia iOS repository (this may take a minute)...');
        const cloned = runCommand(
            'git clone --depth 1 https://github.com/wikimedia/wikipedia-ios.git wikipedia-ios-source',
            { cwd: iosDir }
        );
        if (!cloned) {
            console.log('  ❌ Failed to clone repository');
            return false;
        }
    }

    console.log('  Running Wikipedia iOS setup script...');
    console.log('  This will install SwiftLint, ClangFormat, and other dependencies...');
    const setupSuccess = runCommand('./scripts/setup', { cwd: wikiRepoDir });

    if (!setupSuccess) {
        console.log('  ❌ Setup script failed');
        console.log('  Try running manually:');
        console.log(`    cd ${wikiRepoDir}`);
        console.log('    ./scripts/setup');
        return false;
    }

    console.log('  Building Wikipedia app for iOS Simulator...');
    console.log('  ⏳ This will take several minutes on first build...');

    const buildCommand = `xcodebuild -project Wikipedia.xcodeproj -scheme Wikipedia -configuration Debug -sdk iphonesimulator -destination "platform=iphonesimulator,OS=18.5,name=iPhone 16 Pro" build`;

    const built = runCommand(buildCommand, { cwd: wikiRepoDir });

    if (built) {
        console.log('  ✅ iOS app built successfully!');

        const appPath = findApp(iosDir, 'Wikipedia.app');

        if (appPath) {
            const destAppPath = path.join(iosDir, 'Wikipedia.app');
            console.log(`  📦 Copying app to standardized location...`);

            const copied = copyDirectory(appPath, destAppPath);
            if (copied) {
                console.log(`  ✅ App copied to: ${destAppPath}`);
            } else {
                console.log(`  ❌ Failed to copy app`);
                return false;
            }

            console.log('  Creating Wikipedia.app.zip for distribution...');
            const zipPath = path.join(iosDir, 'Wikipedia.app.zip');
            const zipCreated = await createZipArchive(destAppPath, zipPath);

            if (zipCreated) {
                console.log(`  ✅ Created: ${zipPath}`);

                console.log('\n  🧹 Cleanup Options:');
                console.log('     The following can be removed to save disk space:');
                console.log(`     • Wikipedia.app (unzipped) - ~500MB`);
                console.log(`     • wikipedia-ios-source directory - ~2GB`);
                console.log('     Note: You can always rebuild or extract from .zip later\n');

                const removeApp = await askQuestion('  Remove Wikipedia.app and keep only .zip? (y/n): ');
                if (removeApp === 'y' || removeApp === 'yes') {
                    removeDirectory(destAppPath);
                    console.log('     ✅ Removed Wikipedia.app (kept .zip)');
                } else {
                    console.log('     ℹ️  Keeping Wikipedia.app');
                }

                const removeSource = await askQuestion('  Remove wikipedia-ios-source directory? (y/n): ');
                if (removeSource === 'y' || removeSource === 'yes') {
                    removeDirectory(wikiRepoDir);
                    console.log('     ✅ Removed wikipedia-ios-source directory');
                    console.log('     💾 Saved ~2GB of disk space!');
                } else {
                    console.log('     ℹ️  Keeping wikipedia-ios-source directory');
                    console.log('     🔄 You can rebuild the app later without re-downloading');
                }

                return true;
            } else {
                console.log('  ❌ Failed to create zip file');
                return false;
            }
        } else {
            console.log('  ❌ Could not find built app');
            console.log('  The build succeeded but the app location is unexpected.');
        }
    }

    console.log('  ❌ Build or post-processing failed.');
    console.log('  Manual build instructions:');
    console.log(`    1. cd ${wikiRepoDir}`);
    console.log('    2. open Wikipedia.xcodeproj');
    console.log('    3. Select Wikipedia scheme and iPhone simulator');
    console.log('    4. Build in Xcode (Cmd+B)');
    console.log(`    5. Find the built app (usually in DerivedData/Build/Products/Debug-iphonesimulator/)`);
    console.log(`    6. Copy Wikipedia.app to ${iosDir}/Wikipedia.app`);

    return false;
}

async function main() {
    console.log('🚀 Setting up test applications for WebdriverIO tests\n');
    console.log(`   Platform: ${os.platform()} (${os.arch()})\n`);

    const args = process.argv.slice(2);
    const androidOnly = args.includes('--android-only');
    const iosOnly = args.includes('--ios-only');

    let androidSuccess = true;
    let iosSuccess = true;

    if (!iosOnly) {
        androidSuccess = await setupAndroidApp();
    }

    if (!androidOnly) {
        iosSuccess = await setupIOSApp();
    }

    console.log('\n' + '='.repeat(50));
    console.log('📊 Setup Summary:');
    if (!iosOnly) {
        console.log('  Android:', androidSuccess ? '✅ Ready' : '⚠️  Needs manual setup');
    }
    if (!androidOnly) {
        console.log('  iOS:', iosSuccess ? '✅ Ready' : '⚠️  Needs manual setup');
    }

    const allSuccess = (!iosOnly || iosSuccess) && (!androidOnly || androidSuccess);

    if (allSuccess) {
        console.log('\n✨ All requested apps are ready for testing!');
        console.log('\n📍 App locations:');
        if (!iosOnly) console.log('  Android: apps/android/wikipedia.apk');
        if (!androidOnly) {
            if (fs.existsSync(path.join(__dirname, '..', 'apps', 'ios', 'Wikipedia.app'))) {
                console.log('  iOS: apps/ios/Wikipedia.app');
            } else {
                console.log('  iOS: apps/ios/Wikipedia.app.zip (extract before use)');
            }
        }
    } else {
        console.log('\n⚠️  Some apps need manual setup. Check the messages above.');
    }

    const gitignorePath = path.join(__dirname, '..', '.gitignore');
    const gitignoreContent = fs.existsSync(gitignorePath)
        ? fs.readFileSync(gitignorePath, 'utf8')
        : '';

    if (!gitignoreContent.includes('apps/')) {
        console.log('\n📝 Adding apps/ to .gitignore...');
        const gitignoreAddition = '\n# Test Applications\napps/\n*.apk\n*.ipa\n*.app\n*.app.zip\nDerivedData/\n';
        fs.appendFileSync(gitignorePath, gitignoreAddition);
        console.log('  ✅ Updated .gitignore');
    }

    await promptForTestExecution();
}

main().catch(console.error);
