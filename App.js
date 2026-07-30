import "react-native-gesture-handler";
import AppNavigator from "./src/navigation/AppNavigator";

import { BibleProvider } from "./src/context/BibleContext";
import { BookmarkProvider } from "./src/context/BookmarkContext";
import { ReadingProvider } from "./src/context/ReadingContext";
import { NoteProvider } from "./src/context/NoteContext";
import { HighlightProvider } from "./src/context/HighlightContext";
import { SermonProvider } from "./src/context/SermonContext";

export default function App() {
  return (
    <BibleProvider>
      <BookmarkProvider>
        <SermonProvider>  
        <ReadingProvider>
          <NoteProvider>
            <HighlightProvider>

              <AppNavigator />

            </HighlightProvider>
          </NoteProvider>
        </ReadingProvider>
      </SermonProvider>
      </BookmarkProvider>
    </BibleProvider>
  );
}