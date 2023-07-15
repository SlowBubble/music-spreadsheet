
# Design

- tsUi is the UI component
- textareaSpreadsheet is the spreadsheet editor
- textTable is the model of the spreadsheet table
  - It provides basical methods to modify the model.
  - It also handles serializing into a string for the textarea format
- Cell is currently just a string
  - but we make it an object in case we need metadata in the future.