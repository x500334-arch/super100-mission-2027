# Super 100 Mission 2027 — Android APK

This is the **optional Android WebView wrapper** for the existing installable PWA.

- Public website and PWA: https://x500334-arch.github.io/super100-mission-2027/
- App opens the **live HTTPS website**, so chapter and admin updates deploy from GitHub Pages without repackaging this APK.
- Supabase authentication, login, tests and progress remain hosted by their existing services, **not embedded in the app**.
- The 14 public PDF notes open in the phone browser/PDF viewer.
- Android JavaScript and DOM storage are required for the existing web app. The WebView does not use a JavaScript bridge, ignores unsafe file access, and blocks HTTP mixed content.
- This project contains no Supabase service-role secrets and no private keystore.

## Build and download installable debug APK

1. Open the repository's **Actions** tab and select **Build Android APK**.
2. On the latest successful run, scroll to **Artifacts** and download **Super100-Mission2027-Android-Debug-APK**.
3. Extract that ZIP. Install `app-debug.apk` on Android (Android may ask to allow installs from your browser or file manager). Download APKs only from this repo's own Actions build.
4. Open **Super 100 Mission 2027**, sign in with your existing user account.

**GitHub Actions creates the APK**; you do not need Android Studio on your own PC. This is a debug-signed test build, not a Play Store release. Each clean GitHub runner may generate a different debug signing key, so a future APK could require uninstall/reinstall; that clears app-local data. Synced Supabase records remain server-side. For safely upgradable release APKs, create a private production signing keystore and configure GitHub encrypted secrets outside of this repository. Never commit the keystore or its password.

## Build locally (optional)

With JDK 17, Android SDK platform 36, Android Build Tools 36.0.0 and Gradle 8.13:

```bash
gradle -p android-app :app:assembleDebug
```

The output is `android-app/app/build/outputs/apk/debug/app-debug.apk`.

## Android vs PWA

Use the existing PWA when you want home-screen installation without an APK. This native shell is a second delivery option and requires internet. It is not yet independently tested on every Android version/device. Some WebView and external link behavior may vary by installed Android System WebView version. Neither the APK nor PWA promises offline Supabase access, tests or downloaded PDFs. The GitHub website, service worker, notes, and admin code are unchanged.

## Release signing and publishing

**Not included:** production signing, Play Store listing, digital asset links, Play App Signing, privacy policy, and official app distribution. Do not upload the debug APK to Play Store. Keep a release keystore private and plan version-code increments before distributing updates.
