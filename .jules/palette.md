## 2024-06-13 - Add focus restoration to search clear button
**Learning:** When users clear a search input via a button, they expect to immediately start typing a new query. If focus isn't restored, it disrupts the keyboard flow and requires a secondary mouse click.
**Action:** Always implement focus restoration (e.g., inputRef.current?.focus()) when implementing elements that clear or remove user input.
