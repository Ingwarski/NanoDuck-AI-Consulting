import Foundation
import Speech

// Capability query only: no recording, permission request, or recognition task.
let locales = SFSpeechRecognizer.supportedLocales().map { $0.identifier }.sorted()
print("Ukrainian locales:", locales.filter { $0.hasPrefix("uk") })
for identifier in ["uk-UA", "en-US"] {
    let recognizer = SFSpeechRecognizer(locale: Locale(identifier: identifier))
    print(identifier,
          "created:", recognizer != nil,
          "resolved:", recognizer?.locale.identifier ?? "nil",
          "available:", recognizer?.isAvailable ?? false,
          "onDevice:", recognizer?.supportsOnDeviceRecognition ?? false)
}
