# Bible Study Workspace — implementation and verification

## Implementation

Implemented in the existing local Nkwa Bible repository. The initial working tree was clean. Expo 57.0.20 and React Native 0.86.3 were retained following the user's clarification. No dependency was added or upgraded.

The reader stays mounted in one place. Study opens alongside it at 900 available points, with approximately 58% Bible and 42% tools. The minimum panel widths are 480 and 360 points. The breakpoint grows with font scale, up to 1260 points, to leave room for larger text. A 600-point height eligibility check excludes short landscape phones; the physical screen's shorter side prevents Android keyboard resizing from collapsing tablet columns.

Below the breakpoint, Study uses a full-screen native modal. The reader, selected passage, tab, note draft and sermon draft remain owned above the modal/column boundary. Both modes have their own scrolling area. Reader controls also scroll, keeping short screens usable. Safe-area handling, keyboard avoidance, existing keyboard-aware scrolling, labelled controls and selected tab states are included.

The existing canonical book ID and chapter remain the source of truth. The selected verse number is resolved against the current language dataset, and is cleared if missing. Language switches are available inside Study. The reader's scroll view remains mounted, with proportional offset restoration after width/language changes. Physical rotation and scroll accuracy still require device testing.

Notes reuse NoteContext and `notes`. A draft captures the displayed book name, chapter, language, optional verse/text and optional canonical book ID at first edit. Existing fields and unknown fields are retained. Notes save after 650 ms, on blur, close and mode change. Stable IDs make repeated saves update one record. New notes can target a chapter or selected verse. Existing notes can be opened and edited in the panel. Starting a new note keeps the original note's passage intact.

Sermons reuse SermonContext and `sermons`, preserving title, preacher, church, date, scripture, notes, ID and timestamps. Opening only reads. Shared metadata fields and a shared save hook serve Add, Edit and the workspace. Save actions are guarded while pending. Reference insertion appends; verse-text insertion requires a button press. Edit, Delete and the existing PDF export utility remain available.

Both contexts serialize functional updates after successful loading. Malformed JSON, invalid arrays and storage errors block replacement of stored records. Failed writes leave the last successful records intact and keep drafts available. No migration or new storage key was introduced. Bookmark, highlight, reading and language storage keys are unchanged. Stored schemas were inspected through the actual context producers and consumers; no live device database was available for inspection.

## Files changed

Modified tracked files:

- `app.json` — tablet and orientation configuration only.
- `package.json` — adds the workspace test script only.
- `src/components/VerseItem.js` — study selection and accessible verse controls.
- `src/context/NoteContext.js` — compatible, guarded note persistence.
- `src/context/SermonContext.js` — compatible, guarded sermon persistence.
- `src/screens/Versesscreen.js` — responsive workspace, passage selection and reading position.
- `src/screens/AddSermonScreen.js` — shared fields and guarded saving.
- `src/screens/EditSermonScreen.js` — shared fields and guarded saving.
- `src/screens/NotesScreen.js` — chapter references and save/delete failure handling.
- `src/screens/SermonDetailScreen.js` — waits for successful deletion before navigating back.

Created files:

- `src/components/study/StudyWorkspace.js`
- `src/components/study/StudyControls.js`
- `src/components/study/QuickNoteEditor.js`
- `src/components/study/SermonWorkspace.js`
- `src/components/study/SermonFields.js`
- `src/components/study/useStudyNote.js`
- `src/components/study/useSermonSave.js`
- `src/services/storedCollection.js`
- `src/utils/studyWorkspace.js`
- `scripts/testStudyWorkspace.js`
- `docs/study-workspace-verification.md`

Modified generated native files, already ignored by Git:

- `ios/NkwaBible/Info.plist` — adds landscape orientations.
- `ios/NkwaBible.xcodeproj/project.pbxproj` — device family becomes iPhone and iPad.
- `android/app/src/main/AndroidManifest.xml` — removes the portrait lock by using unspecified orientation.

The native edits were compared with temporary backups. Only those settings changed. Backups are `/tmp/nkwa-study-Info.plist.before`, `/tmp/nkwa-study-project.pbxproj.before`, and `/tmp/nkwa-study-AndroidManifest.xml.before`. The tracked `app.json` also supplies these settings for future native generation. No app identifiers, version/build numbers, signing settings, Bible JSON, lockfile or `eas.json` were changed. No commit, push, release build or publication occurred.

## Commands and results

Inspection used `pwd`, `cat`, `rg --files`, `rg`, `sed`, `ls -d`, `git remote -v`, `git status --short`, `git ls-files`, `git diff --stat`, `git diff --numstat`, and targeted `git diff` commands. These established the repository, clean initial state, existing components, persisted record formats, available scripts, installed packages and generated native settings. The `node -p 'require("expo/package.json").version'` check returned `57.0.20`. Source edits used `apply_patch` and targeted Python file edits; native backups and comparison used Python. No installation command modified project dependencies.

| Command/check | Actual result |
| --- | --- |
| `git status --short` before editing | Clean |
| `git remote -v` | Existing `Gideon-Mensah/nkwa-bible` origin |
| `git diff --check` | Passed throughout final verification |
| `npm run validate:bible` | Passed: 66 canonical books across both datasets |
| `npm run test:bible-study` | Passed: existing request, cache and privacy checks |
| `npm run test:study-workspace` | Passed; initial harness lacked JSX transformation, fixed before rerun |
| `npm --prefix server test` | Initially 10/14 due to sandbox localhost EPERM; rerun with localhost access passed 14/14 |
| `npm --prefix server run lint` | Passed |
| `npm --prefix server run validate:data` | Passed |
| `npx expo-doctor` | Initial network lookup blocked; network-enabled rerun completed with 20/21 checks passing |
| `npx expo export --platform ios` | Passed |
| `npx expo export --platform android` | Passed |
| `npx expo export --platform ios --output-dir dist/study-ios` | Final source passed, 1081 modules; earlier follow-up caught a missing JSX closing tag, fixed before final rerun |
| `npx expo export --platform android --output-dir dist/study-android` | Final source passed, 1077 modules; same intermediate JSX issue fixed |
| `xcrun simctl list devices booted` | Sandbox failed to access service; unrestricted check succeeded, no booted devices |
| `plutil -lint ios/NkwaBible/Info.plist ios/NkwaBible.xcodeproj/project.pbxproj` | Both passed |
| Inline Node assertions comparing `git show HEAD:app.json` and `HEAD:package.json` | Passed: only intended app config fields changed; dependencies unchanged |
| `git diff --name-only -- eas.json src/data package-lock.json` | Empty: protected files unchanged |
| Python native-file comparison against pre-edit backups | Only orientation and target device family changed |

There is no root lint script. All existing test, validation and lint scripts were run, including those under `server`. The new tests use the existing Node/Babel setup and mocked storage/context hooks; they are logic tests, not rendered native UI tests. They cover malformed storage protection, failed writes, serialized updates, stable IDs, old fields, Twi, deletion, layout thresholds, reference appending, sermon validation, PDF HTML escaping and tablet configuration.

### Outstanding warning

Expo Doctor reports pre-existing patch mismatches:

| Package | Installed | Expected |
| --- | --- | --- |
| expo | 57.0.20 | ~57.0.26 |
| expo-constants | 57.0.17 | ~57.0.20 |
| expo-dev-client | 57.0.18 | ~57.0.19 |
| expo-file-system | 57.0.6 | ~57.0.7 |
| expo-font | 57.0.3 | ~57.0.4 |
| expo-print | 57.0.1 | ~57.0.2 |
| expo-sharing | 57.0.18 | ~57.0.22 |
| expo-splash-screen | 57.0.8 | ~57.0.9 |

Exports also emit the environment's `NO_COLOR`/`FORCE_COLOR` warning. The server suite logs an expected simulated generation failure while its error-handling test passes.

## Required manual device checks

Native UI was not exercised on a simulator or physical device. These checks remain:

1. Rebuild a local development client to apply tablet/orientation settings. Open a chapter on iPad landscape; confirm simultaneous columns and independent scrolling.
2. Rotate between portrait and landscape, including while typing. Check wide/narrow transitions, draft retention, selected verse and approximate reading position.
3. On small iPhone and Pro Max, open Study, switch Notes/Sermon, close and reopen. Confirm the single-column reader and retained chapter/language/offset. Repeat in landscape.
4. Type `ɛ ɔ Ɛ Ɔ`, wait for Saved, edit again, then reopen the app. Confirm one note, correct language/reference, and intact older notes. Exercise chapter notes and selected-verse insertion.
5. Open an existing sermon, verify that merely opening changes nothing, then create/edit/save another sermon. Tap Save repeatedly. Verify original ID/createdAt and one new record.
6. Append references to existing scripture, insert verse text only by tapping the insertion action, and verify both language choices.
7. Exercise existing standalone sermon Edit/Delete and workspace Edit/Delete. Export a PDF and verify native sharing, multiple pages and Twi glyphs.
8. Test the keyboard with the lowest fields and long multiline text. Check safe areas, larger Dynamic Type and VoiceOver focus/labels/tab selection.
9. Verify bookmarks, highlights, sharing, AI passage selection and Continue Reading against existing device data. Relaunch to confirm retained storage.
10. Test unsaved sermon navigation warnings and note save failures on a development fixture; retry without losing stored records.

No claim is made for verified Stage Manager, system Split View or multiple windows.

## Start locally

From `/Users/gideonowusu/my-js-app`:

```sh
npm start -- --dev-client
```

Rebuild/install the local development app when testing the changed native configuration:

```sh
npm run ios -- --device
# or
npm run android
```

Then open Bible → a book → a chapter → Study. These start/build commands are instructions for local testing and were not executed during this task.

## Official documentation consulted

- [Expo SDK 56 reference](https://docs.expo.dev/versions/v56.0.0/)
- [Expo SDK 56 application configuration](https://docs.expo.dev/versions/v56.0.0/config/app/)
- [Expo SDK 56 safe area context](https://docs.expo.dev/versions/v56.0.0/sdk/safe-area-context/)
- [Expo SDK 57 application configuration](https://docs.expo.dev/versions/v57.0.0/config/app/)
- [React Native 0.85 useWindowDimensions](https://reactnative.dev/docs/0.85/usewindowdimensions)
- [React Native 0.85 KeyboardAvoidingView](https://reactnative.dev/docs/0.85/keyboardavoidingview)
- [React Native 0.85 Modal](https://reactnative.dev/docs/0.85/modal)
- [React Native 0.86 useWindowDimensions](https://reactnative.dev/docs/0.86/usewindowdimensions)
