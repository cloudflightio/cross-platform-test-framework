const fs = require('fs');
const path = require('path');
const os = require('os');
const { Readable } = require('stream');
const { pipeline } = require('stream/promises');
const { execSync } = require('child_process');

const isWindows = os.platform() === 'win32';
const isMac = os.platform() === 'darwin';

const USER_AGENT =
    'Wikipedia-Test-Setup-Script/1.0 (WebdriverIO Testing Framework; https://github.com/cloudflightio/cross-platform-test-framework)';

// The Android APK is pinned on purpose: the sample tests depend on the app UI,
// so a newer release may break the selectors. Override with WIKIPEDIA_APK_URL if needed.
const ANDROID_RELEASES_URL = 'https://releases.wikimedia.org/mobile/android/wikipedia/stable/';
const ANDROID_APK_URL =
    process.env.WIKIPEDIA_APK_URL || `${ANDROID_RELEASES_URL}wikipedia-2.7.50552-r-2025-10-15.apk`;

const ROOT_DIR = path.join(__dirname, '..');
const ANDROID_DIR = path.join(ROOT_DIR, 'apps', 'android');
const ANDROID_APK = path.join(ANDROID_DIR, 'wikipedia.apk');

const IOS_DIR = path.join(ROOT_DIR, 'apps', 'ios');
const IOS_SOURCE_DIR = path.join(IOS_DIR, 'wikipedia-ios-source');
const IOS_APP_NAME = 'Wikipedia.app';
const IOS_APP = path.join(IOS_DIR, IOS_APP_NAME);
const IOS_ZIP = path.join(IOS_DIR, 'wikipedia.app.zip');

function displayTestCommands() {
    console.log('\n📚 Available Test Commands:\n');
    console.log('  Web Tests:');
    console.log('    yarn wdio:web:edge        - Run tests in Edge browser\n');
    console.log('  Android Tests:');
    console.log('    yarn wdio:android:native  - Run tests in native Wikipedia app');
    console.log('    yarn wdio:android:web     - Run tests in Chrome browser\n');
    console.log('  iOS Tests (macOS only):');
    console.log('    yarn wdio:ios:native      - Run tests in native Wikipedia app');
    console.log('    yarn wdio:ios:web         - Run tests in Safari browser\n');
    console.log('  For more information, check the README.md file.');
}

/**
 * Downloads a file (following redirects) to a temporary file first,
 * so an interrupted download never leaves a broken file at `dest`.
 */
async function downloadFile(url, dest) {
    const response = await fetch(url, {
        headers: { 'User-Agent': USER_AGENT },
        redirect: 'follow',
    });

    if (!response.ok || !response.body) {
        throw new Error(`Failed to download ${url}: HTTP ${response.status}`);
    }

    const tempDest = `${dest}.part`;
    try {
        await pipeline(Readable.fromWeb(response.body), fs.createWriteStream(tempDest));
        fs.renameSync(tempDest, dest);
    } catch (error) {
        fs.rmSync(tempDest, { force: true });
        throw error;
    }
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
        fs.rmSync(dest, { recursive: true, force: true });
        fs.cpSync(src, dest, { recursive: true });
        return true;
    } catch (error) {
        console.error(`  ❌ Failed to copy directory: ${error.message}`);
        return false;
    }
}

/**
 * Zips `appDir` into `zipPath`. Both must be in the same directory.
 */
function createZipArchive(appDir, zipPath) {
    fs.rmSync(zipPath, { force: true });

    return runCommand(`zip -qr "${path.basename(zipPath)}" "${path.basename(appDir)}"`, {
        cwd: path.dirname(appDir),
    });
}

async function setupAndroidApp() {
    console.log('\n🤖 Setting up Android App...');

    fs.mkdirSync(ANDROID_DIR, { recursive: true });

    console.log(`  Downloading Wikipedia Android APK from ${ANDROID_APK_URL}...`);

    try {
        await downloadFile(ANDROID_APK_URL, ANDROID_APK);
        console.log('  ✅ Android APK downloaded successfully!');
        console.log(`  📍 Location: ${ANDROID_APK}`);
        return true;
    } catch (error) {
        console.error('  ❌ Failed to download Android APK:', error.message);
        console.log(`  Please download it manually from: ${ANDROID_RELEASES_URL}`);
        console.log(`  and save it as: ${ANDROID_APK}`);
        console.log('  (or set WIKIPEDIA_APK_URL to a different release and run the script again)');
        return false;
    }
}

// Shared by the build and by the build-settings query, so both resolve to the same output location.
// A generic simulator destination does not depend on a specific iOS version / device name.
const IOS_BUILD_ARGS = [
    '-project Wikipedia.xcodeproj',
    '-scheme Wikipedia',
    '-configuration Debug',
    '-sdk iphonesimulator',
    '-destination "generic/platform=iOS Simulator"',
].join(' ');

/**
 * Asks xcodebuild where it puts the built app, instead of guessing the DerivedData location.
 * The location depends on the Xcode version and on the project's workspace settings
 * (e.g., newer Xcode versions may place DerivedData inside the source directory).
 * @returns {string | null} Absolute path to Wikipedia.app or null if it cannot be determined.
 */
function getBuiltAppPath() {
    try {
        const output = execSync(`xcodebuild ${IOS_BUILD_ARGS} -showBuildSettings -json`, {
            cwd: IOS_SOURCE_DIR,
            encoding: 'utf8',
            stdio: ['ignore', 'pipe', 'ignore'],
            maxBuffer: 64 * 1024 * 1024,
        });

        // The scheme contains several targets (app extensions, widgets...) - pick the main app
        const appSettings = JSON.parse(output)
            .map((entry) => entry.buildSettings)
            .find((settings) => settings?.FULL_PRODUCT_NAME === IOS_APP_NAME);

        if (!appSettings?.TARGET_BUILD_DIR) {
            return null;
        }

        return path.join(appSettings.TARGET_BUILD_DIR, appSettings.FULL_PRODUCT_NAME);
    } catch (error) {
        console.error(`  ⚠️  Could not read build settings: ${error.message}`);
        return null;
    }
}

/**
 * Returns the DerivedData root for a built product path (…/DerivedData/Build/Products/… → …/DerivedData).
 */
function getDerivedDataRoot(builtAppPath) {
    const marker = `${path.sep}Build${path.sep}Products${path.sep}`;
    const index = builtAppPath.indexOf(marker);
    return index === -1 ? null : builtAppPath.slice(0, index);
}

function printIOSManualInstructions() {
    console.log('  Manual build instructions:');
    console.log(`    1. cd "${IOS_SOURCE_DIR}"`);
    console.log('    2. ./scripts/setup');
    console.log(`    3. xcodebuild ${IOS_BUILD_ARGS} build`);
    console.log(`    4. xcodebuild ${IOS_BUILD_ARGS} -showBuildSettings | grep " TARGET_BUILD_DIR ="`);
    console.log(`    5. Copy ${IOS_APP_NAME} from that directory to "${IOS_DIR}"`);
    console.log(`    6. cd "${IOS_DIR}" && zip -qr wikipedia.app.zip ${IOS_APP_NAME}`);
}

async function setupIOSApp() {
    console.log('\n📱 Setting up iOS App...');

    if (!isMac) {
        console.log('  ⚠️  iOS app building requires macOS.');
        console.log('  📝 For iOS testing on non-macOS systems:');
        console.log('     1. Build the app on a Mac');
        console.log(`     2. Copy wikipedia.app.zip to ${IOS_DIR}`);
        return false;
    }

    console.log('  Checking prerequisites...');
    const hasXcode = checkCommand('xcodebuild', 'Xcode');
    const hasGit = checkCommand('git', 'Git');
    const hasZip = checkCommand('zip', 'zip');

    if (!hasXcode) {
        console.log('  ⚠️  Please install Xcode from the Mac App Store');
        console.log('  Then run: xcode-select --install');
        return false;
    }

    if (!hasGit || !hasZip) {
        console.log('  ⚠️  Git and zip are required. Please install the missing tools first.');
        return false;
    }

    fs.mkdirSync(IOS_DIR, { recursive: true });

    if (fs.existsSync(IOS_SOURCE_DIR)) {
        console.log('  Updating existing Wikipedia iOS repository...');
        runCommand('git pull', { cwd: IOS_SOURCE_DIR });
    } else {
        console.log('  Cloning Wikipedia iOS repository (this may take a minute)...');
        const cloned = runCommand(
            `git clone --depth 1 https://github.com/wikimedia/wikipedia-ios.git "${path.basename(IOS_SOURCE_DIR)}"`,
            { cwd: IOS_DIR }
        );
        if (!cloned) {
            console.log('  ❌ Failed to clone repository');
            return false;
        }
    }

    console.log('  Running Wikipedia iOS setup script...');
    console.log('  This will install SwiftLint, ClangFormat, and other dependencies...');
    if (!runCommand('./scripts/setup', { cwd: IOS_SOURCE_DIR })) {
        console.log('  ❌ Setup script failed');
        printIOSManualInstructions();
        return false;
    }

    console.log('  Building Wikipedia app for iOS Simulator...');
    console.log('  ⏳ This will take several minutes on first build...');

    if (!runCommand(`xcodebuild ${IOS_BUILD_ARGS} build`, { cwd: IOS_SOURCE_DIR })) {
        console.log('  ❌ Build failed.');
        printIOSManualInstructions();
        return false;
    }

    console.log('  🔎 Locating the built app...');
    const builtAppPath = getBuiltAppPath();

    if (!builtAppPath || !fs.existsSync(builtAppPath)) {
        console.log(`  ❌ Build succeeded, but the app was not found${builtAppPath ? ` at: ${builtAppPath}` : ''}`);
        printIOSManualInstructions();
        return false;
    }

    console.log('  ✅ iOS app built successfully!');
    console.log(`  📍 Build output: ${builtAppPath}`);
    console.log('  📦 Copying app to standardized location...');
    if (!copyDirectory(builtAppPath, IOS_APP)) {
        return false;
    }

    console.log('  Creating wikipedia.app.zip (required by WebdriverIO)...');
    if (!createZipArchive(IOS_APP, IOS_ZIP)) {
        console.log('  ❌ Failed to create zip file');
        return false;
    }
    console.log(`  ✅ Created: ${IOS_ZIP}`);

    console.log('\n  💡 Cleanup Information:');
    console.log('     Only wikipedia.app.zip is used by the tests. The following can be removed to save disk space:');
    console.log(`       rm -rf "${IOS_APP}"`);
    const derivedDataRoot = getDerivedDataRoot(builtAppPath);
    if (derivedDataRoot) {
        console.log(`       rm -rf "${derivedDataRoot}"`);
    }
    console.log(`       rm -rf "${IOS_SOURCE_DIR}"`);
    console.log('     (they will be recreated the next time you run this script)');

    return true;
}

async function main() {
    console.log('🚀 Setting up test applications for WebdriverIO tests\n');
    console.log(`   Platform: ${os.platform()} (${os.arch()})\n`);

    const args = process.argv.slice(2);
    const androidOnly = args.includes('--android-only');
    const iosOnly = args.includes('--ios-only');

    // Platforms that are skipped count as successful
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

    if (androidSuccess && iosSuccess) {
        console.log('\n✨ All requested apps are ready for testing!');
        console.log('\n📍 App locations:');
        if (!iosOnly) console.log(`  Android: ${path.relative(ROOT_DIR, ANDROID_APK)}`);
        if (!androidOnly) console.log(`  iOS:     ${path.relative(ROOT_DIR, IOS_ZIP)}`);
    } else {
        console.log('\n⚠️  Some apps need manual setup. Check the messages above.');
        process.exitCode = 1;
    }

    displayTestCommands();
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
