# Translato

Translato is a javascript library that helps to translate a html page into different languages with a previous defined JSON dictionary.

---

## Installation

Install via NodeJS and NPM:

```bash
npm install translato --save
```

## Usage

### Example

```html
<body>

    <h1 data-tl="start.headline"></h1>
    
    <div id="container"></div>

    <script src="translato.js"></script> 

    <script>

        translato.setDictionary({
            start: {
                headline: {
                    en: "Hello World",
                    de: "Hallo Welt"
                },
                content: {
                    en: "Here is awesome content.",
                    de: "Hier ist unglaublicher Inhalt."
                }
            }
        });

        translato.setLocale("en");
        
        let element = document.getElementById("container");

        element.innerHTML = translato.translateKeys("content");

    </script>
</body>
```

## API

* `translato.on({string} eventName, {function} callback)` - listen for events in translato
* `translato.translateKeys({strings} keys...)` - translate keys, returns an array if multiple keys are given
* `translato.translatePage()` - translate the whole page
* `translato.translateHTML({string} html)` - translate the given HTML string
* `translato.setLocale({string} languageKey, {boolean} translatePage?)` - language identifier, depends on dictionary
* `translato.setDictionary({object} dictionary)` - set the whole dictionary for the translations

## Events

* `translato.on("languageChanged", function)` - is fired when setLocale is executed
